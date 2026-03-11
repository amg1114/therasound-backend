import { EmotionVO } from '@common/domain/value-objects/emotion.vo';
import { PlaylistEntity } from '@modules/playlists/domain/entities/playlist.entity';
import { SongEntity } from '@modules/songs/domain/entities/song.entity';
import { SongMapper } from '@modules/songs/infrastructure/mappers/song.mapper';
import { UserPreferencesEntity } from '@modules/users/domain/entities';
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import {
  ScoringContext,
  SongScoringService,
} from '../../../songs/application/services/song-scoring.service';

interface BuilderConfig {
  minDurationMs: number;
  maxStepIncrement: number;
  initialMaxStep: number;
  maxTotalIterations: number; // Maximum total iterations in the build loop
  maxConsecutiveFailures: number; // Maximum consecutive failures before giving up
}

interface ScoredCandidate {
  song: SongEntity;
  transitionScore: number;
  combinedScore: number;
}

/**
 * Service responsible for building playlists with emotional progression
 * Implements two safety mechanisms to prevent infinite loops:
 * 1. Total iteration limit: prevents endless main loop execution
 * 2. Consecutive failure limit: stops when too many failed attempts occur in a row
 */
@Injectable()
export class PlaylistBuilderService {
  private readonly logger = new Logger(PlaylistBuilderService.name);
  private readonly config: BuilderConfig = {
    minDurationMs: 30 * 60 * 1000, // 30 min
    maxStepIncrement: 0.05,
    initialMaxStep: 0.15,
    maxTotalIterations: 1000, // Prevent runaway loops
    maxConsecutiveFailures: 50, // Stop after 50 failed attempts in a row
  };

  constructor(private readonly scoringService: SongScoringService) {}

  buildPlaylist(
    availableSongs: SongEntity[],
    currentEmotion: EmotionVO,
    targetEmotion: EmotionVO,
    userPreferences: UserPreferencesEntity,
  ): Partial<PlaylistEntity> {
    this.logger.log('Starting playlist build...');

    // Initialize build state
    const state = {
      playlist: [] as SongEntity[],
      remainingSongs: this.balanceAvailableSongs(availableSongs),
      lastTransitionScore: 0,
      maxStep: this.config.initialMaxStep,
      totalIterations: 0,
      consecutiveFailures: 0,
      context: {
        currentEmotion,
        targetEmotion,
        userPreferences,
        selectedSongs: [] as SongEntity[],
        playlistProgress: 0,
      } as ScoringContext,
    };

    this.logInitializationDetails(state.remainingSongs);

    // 1. Add first song
    this.addFirstSong(state, currentEmotion);

    // 2. Build the rest
    while (this.needsMoreSongs(state)) {
      // Safety check: prevent infinite loops
      this.checkIterationLimits(state);

      state.totalIterations++;
      const added = this.addNextSong(state);

      if (!added) {
        state.consecutiveFailures++;
        this.logger.debug(
          `No candidates found (failure ${state.consecutiveFailures}/${this.config.maxConsecutiveFailures}), relaxing constraints. maxStep: ${state.maxStep}`,
        );
        this.relaxConstraints(state);
      } else {
        state.consecutiveFailures = 0; // Reset on success
      }
    }

    const duration = this.calculateDuration(state.playlist);
    this.logger.log(
      `Playlist build complete: ${state.playlist.length} songs, ${duration}ms`,
    );

    return PlaylistEntity.create({
      userId: userPreferences.userId,
      songs: state.playlist.map((s) => SongMapper.toEmbeddedSongVO(s)),
      durationMs: duration,
      initialEmotion: currentEmotion,
      targetEmotion: targetEmotion,
    });
  }

  private addFirstSong(
    state: {
      playlist: SongEntity[];
      remainingSongs: SongEntity[];
      lastTransitionScore: number;
      context: ScoringContext;
    },
    currentEmotion: EmotionVO,
  ): void {
    const sorted = state.remainingSongs.sort(
      (a, b) =>
        a.getEmotionDistance(currentEmotion) -
        b.getEmotionDistance(currentEmotion),
    );

    if (sorted.length === 0) {
      throw new BadRequestException('No songs available for playlist');
    }

    const selected = {
      song: sorted[0],
      score: this.scoringService.calculateTransitionScore(
        sorted[0],
        state.context,
      ),
    };

    this.logger.debug(
      `Added first song: ${selected.song.title} (transitionScore: ${selected.score.toFixed(2)})`,
    );

    state.playlist.push(selected.song);
    state.lastTransitionScore = selected.score;
    this.removeFromRemaining(state.remainingSongs, selected.song.id);
  }

  private addNextSong(state: {
    playlist: SongEntity[];
    remainingSongs: SongEntity[];
    lastTransitionScore: number;
    maxStep: number;
    context: ScoringContext;
  }): boolean {
    const candidates = this.findCandidates(state);

    if (candidates.length === 0) {
      this.logger.debug('No valid candidates found');
      return false;
    }

    const best = this.selectBestCandidate(candidates);

    if (!best) {
      return false;
    }

    this.logger.debug(
      `Added song: ${best.song.title} (combinedScore: ${best.combinedScore.toFixed(2)}, transitionScore: ${best.transitionScore.toFixed(2)})`,
    );

    state.playlist.push(best.song);
    state.lastTransitionScore =
      state.lastTransitionScore * 0.7 + best.transitionScore * 0.3; // Smooth the transition score for next iteration
    this.removeFromRemaining(state.remainingSongs, best.song.id);
    return true;
  }

  private findCandidates(state: {
    playlist: SongEntity[];
    remainingSongs: SongEntity[];
    lastTransitionScore: number;
    maxStep: number;
    context: ScoringContext;
  }): ScoredCandidate[] {
    const progress = this.getProgress(state.playlist);
    state.context.playlistProgress = progress;

    const candidates: ScoredCandidate[] = [];

    for (const song of state.remainingSongs) {
      const candidateTransitionScore =
        this.scoringService.calculateTransitionScore(song, state.context);

      // Penalización por retroceder — compara con el score de la canción anterior
      const transitionDelta =
        candidateTransitionScore - state.lastTransitionScore;
      const transitionPenalty =
        transitionDelta < 0 ? Math.abs(transitionDelta) : 0;

      // Penalización suave en lugar de descarte
      if (transitionPenalty > state.maxStep) {
        continue;
      }

      const combinedScore =
        this.scoringService.calculateScore(song, state.context) -
        transitionPenalty; // Resta la penalización al score combinado

      candidates.push({
        song,
        transitionScore: candidateTransitionScore,
        combinedScore,
      });
    }

    this.logger.debug(
      `Found ${candidates.length} valid candidates of ${state.remainingSongs.length} remaining songs (maxStep: ${state.maxStep.toFixed(2)})`,
    );

    return candidates;
  }

  private selectBestCandidate(
    candidates: ScoredCandidate[],
  ): ScoredCandidate | null {
    if (candidates.length === 0) return null;

    return candidates.reduce((best, current) =>
      current.combinedScore > best.combinedScore ? current : best,
    );
  }

  private needsMoreSongs(state: {
    playlist: SongEntity[];
    remainingSongs: SongEntity[];
  }): boolean {
    return (
      this.calculateDuration(state.playlist) < this.config.minDurationMs &&
      state.remainingSongs.length > 0
    );
  }

  private relaxConstraints(state: { maxStep: number }): void {
    state.maxStep += this.config.maxStepIncrement;
    this.logger.warn(`Constraints relaxed. New maxStep: ${state.maxStep}`);
  }

  private calculateDuration(playlist: SongEntity[]): number {
    return playlist.reduce((total, song) => total + song.durationMs, 0);
  }

  private getProgress(playlist: SongEntity[]): number {
    return Math.min(
      this.calculateDuration(playlist) / this.config.minDurationMs,
      1,
    );
  }

  private removeFromRemaining(
    remainingSongs: SongEntity[],
    songId: string,
  ): void {
    const index = remainingSongs.findIndex((s) => s.id === songId);
    if (index !== -1) {
      remainingSongs.splice(index, 1);
    }
  }

  /**
   * Checks if iteration limits have been exceeded and throws if so
   * Provides detailed error information for debugging
   */
  private checkIterationLimits(state: {
    playlist: SongEntity[];
    remainingSongs: SongEntity[];
    totalIterations: number;
    consecutiveFailures: number;
    maxStep: number;
  }): void {
    if (state.totalIterations >= this.config.maxTotalIterations) {
      const currentDuration = this.calculateDuration(state.playlist);
      const progress = (currentDuration / this.config.minDurationMs) * 100;

      this.logger.error(
        `Maximum total iterations reached: ${state.totalIterations}/${this.config.maxTotalIterations}`,
      );
      this.logger.error(
        `Playlist stats: ${state.playlist.length} songs, ${currentDuration}ms (${progress.toFixed(1)}% of target), ${state.remainingSongs.length} remaining songs`,
      );

      throw new BadRequestException(
        `Unable to build playlist: exceeded maximum iterations (${this.config.maxTotalIterations}). ` +
          `Current progress: ${state.playlist.length} songs (${progress.toFixed(1)}% of target duration). ` +
          `This may indicate insufficient songs matching your preferences or incompatible constraints.`,
      );
    }

    if (state.consecutiveFailures >= this.config.maxConsecutiveFailures) {
      const currentDuration = this.calculateDuration(state.playlist);
      const progress = (currentDuration / this.config.minDurationMs) * 100;

      this.logger.error(
        `Maximum consecutive failures reached: ${state.consecutiveFailures}/${this.config.maxConsecutiveFailures}`,
      );
      this.logger.error(
        `Playlist stats: ${state.playlist.length} songs, ${currentDuration}ms (${progress.toFixed(1)}% of target), maxStep: ${state.maxStep}`,
      );

      throw new BadRequestException(
        `Unable to build playlist: ${state.consecutiveFailures} consecutive failures. ` +
          `Current progress: ${state.playlist.length} songs (${progress.toFixed(1)}% of target duration). ` +
          `No valid song transitions found even after relaxing constraints. ` +
          `Try adjusting your preferences or selecting a different emotion.`,
      );
    }
  }

  private balanceAvailableSongs(availableSongs: SongEntity[]): SongEntity[] {
    const grouped = SongEntity.groupByDominantEmotion(availableSongs);

    const counts = Object.fromEntries(
      Object.entries(grouped).map(([e, songs]) => [e, songs.length]),
    );
    const minCount = Math.min(...Object.values(counts));

    this.logger.debug(
      `Emotion distribution by distance: ${JSON.stringify(counts)}, minCount: ${minCount}`,
    );

    return EmotionVO.SONG_EMOTIONS.flatMap((emotion) =>
      grouped[emotion].slice(0, minCount),
    );
  }

  private logInitializationDetails(remainingSongs: SongEntity[]): void {
    const groupedByEmotion = SongEntity.groupByDominantEmotion(remainingSongs);
    const stats = Object.fromEntries(
      Object.entries(groupedByEmotion).map(([e, songs]) => [e, songs.length]),
    );

    this.logger.debug(
      `Initializing PlaylistBuilder: ${remainingSongs.length} songs, minDuration: ${this.config.minDurationMs}ms`,
    );
    this.logger.debug(JSON.stringify(stats, null, 2));
  }
}
