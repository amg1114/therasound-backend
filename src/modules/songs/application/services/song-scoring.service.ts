import { EmotionVO } from '@common/domain/value-objects/emotion.vo';
import { SongEntity } from '@modules/songs/domain/entities/song.entity';
import { AudioFeaturesVO } from '@modules/songs/domain/value-objects/audio-features.vo';
import { UserPreferencesEntity } from '@modules/users/domain/entities';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EmotionFeatureValues } from 'src/config/app.config';
import { AudioProcessingService } from './audio-processing.service';

export interface SongScoringWeights {
  emotion: number;
  preference: number;
  quality: number;
  diversity: number;
}

export interface ScoringContext {
  currentEmotion: EmotionVO;
  targetEmotion: EmotionVO;
  userPreferences: UserPreferencesEntity;
  selectedSongs: SongEntity[];
  playlistProgress: number; // 0-1
}

@Injectable()
export class SongScoringService {
  private readonly logger = new Logger(SongScoringService.name);
  static MIN_FEATURE_IMPORTANCE = 0.15;
  constructor(
    private readonly configService: ConfigService,
    private readonly audioProcessingService: AudioProcessingService,
  ) {}

  /**
   * Calcula score combinado de una canción
   */
  calculateScore(song: SongEntity, context: ScoringContext): number {
    // El peso cambia según el progreso de la playlist
    const weights = this.getAdaptiveWeights(context.playlistProgress);

    const transitionScore = this.calculateTransitionScore(song, context);

    const preferenceScore = this.calculatePreferenceScore(
      song,
      context.userPreferences,
    );

    const qualityScore = this.calculateQualityScore(song);

    const diversityScore = this.calculateDiversityScore(
      song,
      context.selectedSongs,
      context.userPreferences,
    );

    return (
      transitionScore * weights.emotion +
      preferenceScore * weights.preference +
      qualityScore * weights.quality +
      diversityScore * weights.diversity
    );
  }

  /**
   * Calcula la puntuación de transición entre emociones
   */
  calculateTransitionScore(
    song: SongEntity,
    context: ScoringContext,
    disableInterpolation: boolean = false,
  ): number {
    const emotionFeatureWeights = this.configService.get<EmotionFeatureValues>(
      'emotion_analysis.weights',
    )!;

    const targetEmotionKey = context.targetEmotion.getValue();
    const weights = emotionFeatureWeights[targetEmotionKey];

    // Punto ideal interpolado según progreso
    let idealFeatures: Record<string, number>;

    if (disableInterpolation) {
      idealFeatures = this.configService.get<EmotionFeatureValues>(
        'emotion_analysis.targets',
      )![targetEmotionKey];
    } else {
      idealFeatures = this.interpolateFeatures(
        context.currentEmotion,
        context.targetEmotion,
        context.playlistProgress,
      );
    }

    const songFeatures = this.audioProcessingService.normalizeSongFeatures(
      song.audioFeatures,
    );

    let totalWeightedDistance = 0;
    let totalWeight = 0;

    for (const [feature, idealValue] of Object.entries(idealFeatures)) {
      const weight = (weights[feature] ?? 0) as number;
      if (weight < SongScoringService.MIN_FEATURE_IMPORTANCE) continue;

      const songValue = songFeatures[feature as keyof AudioFeaturesVO];

      totalWeightedDistance += Math.abs(songValue - idealValue) * weight;
      totalWeight += weight;
    }

    if (totalWeight === 0) return 0.5;

    const normalizedDistance = totalWeightedDistance / totalWeight;
    const transitionScore = 1 - Math.min(normalizedDistance, 1);

    return transitionScore;
  }

  private interpolateFeatures(
    current: EmotionVO,
    target: EmotionVO,
    progress: number,
  ): Record<string, number> {
    const emotionTargets = this.configService.get<EmotionFeatureValues>(
      'emotion_analysis.targets',
    )!;

    const currentTargets = emotionTargets[current.getValue()];
    const targetTargets = emotionTargets[target.getValue()];

    const result: Record<string, number> = {};
    for (const feature of Object.keys(targetTargets)) {
      const currentValue = (currentTargets[feature] ?? 0) as number;
      const targetValue = (targetTargets[feature] ?? 0) as number;
      result[feature] = currentValue * (1 - progress) + targetValue * progress;
    }
    return result;
  }

  /**
   * Pesos adaptativos: al inicio prioriza transición, al final preferencias
   */
  private getAdaptiveWeights(progress: number): SongScoringWeights {
    const emotionWeight = 1 - progress; // Decrece con el tiempo
    const preferenceWeight = progress; // Aumenta con el tiempo

    return {
      emotion: emotionWeight * 0.5, // Max 50%
      preference: preferenceWeight * 0.3, // Max 30%
      quality: 0.15, // Constante
      diversity: 0.05, // Constante
    };
  }

  private calculatePreferenceScore(
    song: SongEntity,
    preferences: UserPreferencesEntity,
  ): number {
    const songArtists = song.artists.map((a) => a.id);
    // Señales fuertes (early return)
    if (preferences.hasLikedSong(song.id)) return 1.0;
    if (preferences.hasDislikedSong(song.id)) return 0.0;
    if (preferences.hasDislikedArtist(songArtists)) return 0.1;

    let score = 0.5; // Baseline neutral

    // Artist (+30%)
    if (preferences.hasLikedArtist(songArtists)) {
      score += 0.3;
    }

    // Genre (+25%)
    const genreScore = this.calculateGenreScore(song, preferences);
    score += genreScore * 0.25;

    // Implicit feedback (+25%)
    if (preferences.hasListenedSong(song.id)) {
      const completionRate = preferences.getCompletionRateForSong(song.id);
      score += completionRate * 0.25;
    }

    return Math.min(score, 1.0);
  }

  private calculateGenreScore(
    song: SongEntity,
    preferences: UserPreferencesEntity,
  ): number {
    if (song.genres.length === 0) return 0.5; // Neutral si no hay géneros

    const genreWeights = preferences.calculateGenreWeights();

    let totalWeight = 0;
    for (const genre of song.genres) {
      totalWeight += genreWeights.get(genre) ?? 0.5; // ✅ Usa Map.get()
    }

    return totalWeight / song.genres.length;
  }

  private calculateQualityScore(song: SongEntity): number {
    const totalInteractions = song.likesCount + song.skipCount;
    const popularityScore =
      totalInteractions > 0 ? song.likesCount / totalInteractions : 0.5;

    const engagementScore = song.averageCompletionRate ?? 0.5;
    const reachScore = Math.min(song.playCount / 1000, 1.0);

    return popularityScore * 0.4 + engagementScore * 0.4 + reachScore * 0.2;
  }

  private calculateDiversityScore(
    song: SongEntity,
    selectedSongs: SongEntity[],
    preferences: UserPreferencesEntity,
  ): number {
    // No repetir en la misma playlist
    if (selectedSongs.some((s) => s.id === song.id)) {
      return 0.0;
    }

    let score = 1.0;

    // Penalizar si se escuchó recientemente (últimas 50 canciones)
    const recentHistory = preferences.getRecentHistory(50);
    if (recentHistory.some((h) => h.song.id === song.id)) {
      score -= 0.4;
    }

    // Penalizar si el mismo artista ya está en la playlist
    const artistCount = selectedSongs.filter((s) =>
      s.artists.some((a) => song.artists.map((sa) => sa.id).includes(a.id)),
    ).length;

    if (artistCount > 0) {
      score -= 0.3 * Math.min(artistCount, 3); // Penaliza más si hay varios
    }

    return Math.max(score, 0);
  }
}
