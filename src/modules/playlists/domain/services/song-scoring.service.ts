import { SongEntity } from '@modules/songs/domain/entities/song.entity';
import { SongEmotionVO } from '@modules/songs/domain/value-objects/song-emotion.vo';
import { UserPreferencesEntity } from '@modules/users/domain/entities/user-preferences.entity';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppConfig } from 'src/config/app.config';

export interface SongScoringWeights {
  emotion: number;
  preference: number;
  quality: number;
  diversity: number;
}

export interface ScoringContext {
  currentEmotion: SongEmotionVO;
  targetEmotion: SongEmotionVO;
  userPreferences: UserPreferencesEntity;
  selectedSongs: SongEntity[];
  playlistProgress: number; // 0-1
}

@Injectable()
export class SongScoringService {
  constructor(private readonly configService: ConfigService) {}

  /**
   * Calcula score combinado de una canción
   */
  calculateScore(song: SongEntity, context: ScoringContext): number {
    // El peso cambia según el progreso de la playlist
    const weights = this.getAdaptiveWeights(context.playlistProgress);

    const transitionScore = this.calculateTransitionScore(
      song,
      context.currentEmotion,
      context.targetEmotion,
    );

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

  private calculateTransitionScore(
    song: SongEntity,
    currentEmotion: SongEmotionVO,
    targetEmotion: SongEmotionVO,
  ): number {
    const emotionWeights =
      this.configService.get<AppConfig['emotionWeights']>('emotionWeights')!;

    let score = 0;

    for (const [feature, value] of Object.entries(song.audioFeatures)) {
      const targetWeight = emotionWeights[targetEmotion.getValue()][
        feature
      ] as number;

      const currentWeight = emotionWeights[currentEmotion.getValue()][
        feature
      ] as number;
      const direction = targetWeight - currentWeight;

      score += direction * value;
    }

    // Normaliza a 0-1 (ajusta según tu rango real)
    return this.normalize(score, -10, 10);
  }

  private calculatePreferenceScore(
    song: SongEntity,
    preferences: UserPreferencesEntity,
  ): number {
    // Señales fuertes (early return)
    if (preferences.hasLikedSong(song.id)) return 1.0;
    if (preferences.hasDislikedSong(song.id)) return 0.0;
    if (preferences.hasDislikedArtist(song.artist)) return 0.1;

    let score = 0.5; // Baseline neutral

    // Artist (+30%)
    if (preferences.hasLikedArtist(song.artist)) {
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
    const artistCount = selectedSongs.filter(
      (s) => s.artist === song.artist,
    ).length;

    if (artistCount > 0) {
      score -= 0.3 * Math.min(artistCount, 3); // Penaliza más si hay varios
    }

    return Math.max(score, 0);
  }

  private normalize(value: number, min: number, max: number): number {
    return (value - min) / (max - min);
  }
}
