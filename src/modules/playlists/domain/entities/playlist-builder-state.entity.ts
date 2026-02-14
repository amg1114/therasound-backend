import { EmotionVO } from '@common/domain/value-objects/emotion.vo';
import { SongEntity } from '@modules/songs/domain/entities/song.entity';
import { UserPreferencesEntity } from '@modules/users/domain/entities/user-preferences.entity';
import { BadRequestException, Logger } from '@nestjs/common';
import {
  ScoringContext,
  SongScoringService,
} from '../services/song-scoring.service';
import { PlaylistEntity } from './playlist.entity';

export interface BuilderConfig {
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
 * Clase que encapsula el estado de construcción de la playlist
 * Implements two safety mechanisms to prevent infinite loops:
 * 1. Total iteration limit: prevents endless main loop execution
 * 2. Consecutive failure limit: stops when too many failed attempts occur in a row
 */
export class PlaylistBuilderState {
  // Safety counters
  private totalIterations = 0;
  private consecutiveFailures = 0;

  // Build state
  private playlist: SongEntity[] = [];
  private remainingSongs: SongEntity[];
  private lastTransitionScore = 0;
  private maxStep: number;
  private readonly logger = new Logger(PlaylistBuilderState.name);

  private context: ScoringContext;

  constructor(
    availableSongs: SongEntity[],
    private readonly currentEmotion: EmotionVO,
    private readonly targetEmotion: EmotionVO,
    private readonly userPreferences: UserPreferencesEntity,
    private readonly scoringService: SongScoringService,
    private readonly config: BuilderConfig,
  ) {
    this.remainingSongs = [...availableSongs];
    this.maxStep = config.initialMaxStep;
    this.logger.debug(
      `Initializing PlaylistBuilder: ${availableSongs.length} songs, minDuration: ${config.minDurationMs}ms`,
    );
    this.context = {
      currentEmotion,
      targetEmotion,
      userPreferences,
      selectedSongs: this.playlist,
      playlistProgress: 0,
    };
  }

  build(): Partial<PlaylistEntity> {
    this.logger.log('Starting playlist build...');
    // 1. Añade primera canción
    this.addFirstSong();

    // 2. Construye el resto
    while (this.needsMoreSongs()) {
      // Safety check: prevent infinite loops
      this.checkIterationLimits();

      this.totalIterations++;
      const added = this.addNextSong();

      if (!added) {
        this.consecutiveFailures++;
        this.logger.debug(
          `No candidates found (failure ${this.consecutiveFailures}/${this.config.maxConsecutiveFailures}), relaxing constraints. maxStep: ${this.maxStep}`,
        );
        this.relaxConstraints();
      } else {
        this.consecutiveFailures = 0; // Reset on success
      }
    }

    const duration = this.calculateDuration();
    this.logger.log(
      `Playlist build complete: ${this.playlist.length} songs, ${duration}ms`,
    );

    return PlaylistEntity.create({
      userId: this.userPreferences.userId,
      songs: this.playlist,
      durationMs: duration,
      emotion: this.targetEmotion,
    });
  }

  private addFirstSong(): void {
    const sorted = this.remainingSongs
      .map((song) => ({
        song,
        score: this.scoringService.calculateTransitionScore(song, this.context),
      }))
      .sort((a, b) => a.score - b.score);

    if (sorted.length === 0) {
      throw new BadRequestException('No songs available for playlist');
    }

    this.logger.debug(
      `Added first song: ${sorted[0].song.title} (transitionScore: ${sorted[0].score.toFixed(2)})`,
    );

    this.playlist.push(sorted[0].song);
    this.lastTransitionScore = sorted[0].score;
    this.removeFromRemaining(sorted[0].song.id);
  }

  private addNextSong(): boolean {
    const candidates = this.findCandidates();

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

    this.playlist.push(best.song);
    this.lastTransitionScore = best.transitionScore;
    this.removeFromRemaining(best.song.id);
    return true;
  }

  private findCandidates(): ScoredCandidate[] {
    const progress = this.getProgress();
    this.context.playlistProgress = progress;

    const candidates: ScoredCandidate[] = [];

    for (const song of this.remainingSongs) {
      const transitionScore = this.scoringService.calculateTransitionScore(
        song,
        this.context,
      );

      this.logger.debug(
        `Evaluating song: ${song.title}, transitionScore: ${transitionScore.toFixed(2)}, lastTransitionScore: ${this.lastTransitionScore.toFixed(2)}, maxStep: ${this.maxStep.toFixed(2)}`,
      );
      const isValidTransition =
        transitionScore > this.lastTransitionScore &&
        transitionScore - this.lastTransitionScore <= this.maxStep;

      if (isValidTransition) {
        const combinedScore = this.scoringService.calculateScore(
          song,
          this.context,
        );

        candidates.push({
          song,
          transitionScore,
          combinedScore,
        });
      }
    }

    this.logger.debug(
      `Found ${candidates.length} valid candidates of ${this.remainingSongs.length} remaining songs (maxStep: ${this.maxStep.toFixed(2)})`,
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

  private needsMoreSongs(): boolean {
    return (
      this.calculateDuration() < this.config.minDurationMs &&
      this.remainingSongs.length > 0
    );
  }

  private relaxConstraints(): void {
    this.maxStep += this.config.maxStepIncrement;
    this.logger.warn(
      `Constraints relaxed. New maxStep: ${this.maxStep}, remaining songs: ${this.remainingSongs.length}`,
    );
  }

  private calculateDuration(): number {
    return this.playlist.reduce((total, song) => total + song.durationMs, 0);
  }

  private getProgress(): number {
    return Math.min(this.calculateDuration() / this.config.minDurationMs, 1);
  }

  private removeFromRemaining(songId: string): void {
    const index = this.remainingSongs.findIndex((s) => s.id === songId);
    if (index !== -1) {
      this.remainingSongs.splice(index, 1);
    }
  }

  /**
   * Checks if iteration limits have been exceeded and throws if so
   * Provides detailed error information for debugging
   */
  private checkIterationLimits(): void {
    if (this.totalIterations >= this.config.maxTotalIterations) {
      const currentDuration = this.calculateDuration();
      const progress = (currentDuration / this.config.minDurationMs) * 100;

      this.logger.error(
        `Maximum total iterations reached: ${this.totalIterations}/${this.config.maxTotalIterations}`,
      );
      this.logger.error(
        `Playlist stats: ${this.playlist.length} songs, ${currentDuration}ms (${progress.toFixed(1)}% of target), ${this.remainingSongs.length} remaining songs`,
      );

      throw new BadRequestException(
        `Unable to build playlist: exceeded maximum iterations (${this.config.maxTotalIterations}). ` +
          `Current progress: ${this.playlist.length} songs (${progress.toFixed(1)}% of target duration). ` +
          `This may indicate insufficient songs matching your preferences or incompatible constraints.`,
      );
    }

    if (this.consecutiveFailures >= this.config.maxConsecutiveFailures) {
      const currentDuration = this.calculateDuration();
      const progress = (currentDuration / this.config.minDurationMs) * 100;

      this.logger.error(
        `Maximum consecutive failures reached: ${this.consecutiveFailures}/${this.config.maxConsecutiveFailures}`,
      );
      this.logger.error(
        `Playlist stats: ${this.playlist.length} songs, ${currentDuration}ms (${progress.toFixed(1)}% of target), maxStep: ${this.maxStep}`,
      );

      throw new BadRequestException(
        `Unable to build playlist: ${this.consecutiveFailures} consecutive failures. ` +
          `Current progress: ${this.playlist.length} songs (${progress.toFixed(1)}% of target duration). ` +
          `No valid song transitions found even after relaxing constraints. ` +
          `Try adjusting your preferences or selecting a different emotion.`,
      );
    }
  }
}
