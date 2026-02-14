import { EmotionVO } from '@common/domain/value-objects/emotion.vo';
import { PlaylistEntity } from '@modules/playlists/domain/entities/playlist.entity';
import { SongEntity } from '@modules/songs/domain/entities/song.entity';
import { UserPreferencesEntity } from '@modules/users/domain/entities/user-preferences.entity';
import { BadRequestException, Injectable } from '@nestjs/common';
import {
  ScoringContext,
  SongScoringService,
} from '../../domain/services/song-scoring.service';

interface BuilderConfig {
  minDurationMs: number;
  maxStepIncrement: number;
  initialMaxStep: number;
}

interface ScoredCandidate {
  song: SongEntity;
  transitionScore: number;
  combinedScore: number;
}

@Injectable()
export class PlaylistBuilderService {
  private readonly config: BuilderConfig = {
    minDurationMs: 15 * 60 * 1000, // 15 min
    maxStepIncrement: 0.05,
    initialMaxStep: 0.15,
  };

  constructor(private readonly scoringService: SongScoringService) {}

  buildPlaylist(
    availableSongs: SongEntity[],
    currentEmotion: EmotionVO,
    targetEmotion: EmotionVO,
    userPreferences: UserPreferencesEntity,
  ): Partial<PlaylistEntity> {
    const builder = new PlaylistBuilderState(
      availableSongs,
      currentEmotion,
      targetEmotion,
      userPreferences,
      this.scoringService,
      this.config,
    );

    return builder.build();
  }
}

/**
 * Clase que encapsula el estado de construcción de la playlist
 */
class PlaylistBuilderState {
  private playlist: SongEntity[] = [];
  private remainingSongs: SongEntity[];
  private lastTransitionScore = 0;
  private maxStep: number;

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
  }

  build(): Partial<PlaylistEntity> {
    // 1. Añade primera canción
    this.addFirstSong();

    // 2. Construye el resto
    while (this.needsMoreSongs()) {
      const added = this.addNextSong();

      if (!added) {
        this.relaxConstraints();
      }
    }

    return PlaylistEntity.create({
      userId: this.userPreferences.userId,
      songs: this.playlist,
      durationMs: this.calculateDuration(),
      emotion: this.targetEmotion,
    });
  }

  private addFirstSong(): void {
    // Ordena por score de transición (más cercano a emoción actual)
    const sorted = this.remainingSongs
      .map((song) => ({
        song,
        score: this.calculateTransitionScore(song),
      }))
      .sort((a, b) => a.score - b.score);

    if (sorted.length === 0) {
      throw new BadRequestException('No songs available for playlist');
    }

    this.playlist.push(sorted[0].song);
    this.lastTransitionScore = sorted[0].score;
    this.removeFromRemaining(sorted[0].song.id);
  }

  private addNextSong(): boolean {
    const candidates = this.findCandidates();

    if (candidates.length === 0) {
      return false;
    }

    const best = this.selectBestCandidate(candidates);

    if (!best) {
      return false;
    }

    this.playlist.push(best.song);
    this.lastTransitionScore = best.transitionScore;
    this.removeFromRemaining(best.song.id);

    return true;
  }

  private findCandidates(): ScoredCandidate[] {
    const progress = this.getProgress();
    const context: ScoringContext = {
      currentEmotion: this.currentEmotion,
      targetEmotion: this.targetEmotion,
      userPreferences: this.userPreferences,
      selectedSongs: this.playlist,
      playlistProgress: progress,
    };

    const candidates: ScoredCandidate[] = [];

    for (const song of this.remainingSongs) {
      const transitionScore = this.calculateTransitionScore(song);

      // Solo considera canciones que avanzan gradualmente
      const isValidTransition =
        transitionScore > this.lastTransitionScore &&
        transitionScore - this.lastTransitionScore <= this.maxStep;

      if (isValidTransition) {
        const combinedScore = this.scoringService.calculateScore(song, context);

        candidates.push({
          song,
          transitionScore,
          combinedScore,
        });
      }
    }

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

  private calculateTransitionScore(song: SongEntity): number {
    return this.scoringService['calculateTransitionScore'](
      song,
      this.currentEmotion,
      this.targetEmotion,
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
    console.log(
      `🔧 Relaxing constraints: maxStep = ${this.maxStep.toFixed(2)}`,
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
}
