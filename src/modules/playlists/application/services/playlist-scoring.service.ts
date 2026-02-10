import { SongEntity } from '@modules/songs/domain/entities/song.entity';
import { EmotionProbabilitiesVO } from '@modules/songs/domain/value-objects/emotion-probabilities.vo';
import { SongEmotionVO } from '@modules/songs/domain/value-objects/song-emotion.vo';
import { UserPreferencesEntity } from '@modules/users/domain/entities/user-preferences.entity';
import { Injectable } from '@nestjs/common';

interface ScoringContext {
  targetEmotion: SongEmotionVO;
  playlistSongIds: Set<string>; // Songs already in current playlist
  playlistArtists: Set<string>; // Artists already in current playlist
  recentlyPlayedIds: Set<string>; // Songs played recently by user
}

@Injectable()
export class PlaylistScoringService {
  /**
   * Calculate a comprehensive score for a song based on:
   * - Emotion match
   * - User preferences (collaborative filtering)
   * - Song popularity/quality
   * - Diversity/freshness
   */
  calculateSongScore(
    song: SongEntity,
    userPreferences: UserPreferencesEntity,
    context: ScoringContext,
  ): number {
    // 1. EMOTION MATCH SCORE (40% weight) - Most important
    const emotionScore = this.calculateEmotionScore(
      song,
      context.targetEmotion,
    );

    // 2. USER PREFERENCE SCORE (30% weight) - Personalization
    const preferenceScore = this.calculatePreferenceScore(
      song,
      userPreferences,
    );

    // 3. QUALITY SCORE (20% weight) - Song popularity/engagement
    const qualityScore = this.calculateQualityScore(song);

    // 4. DIVERSITY SCORE (10% weight) - Avoid repetition
    const diversityScore = this.calculateDiversityScore(
      song,
      context.playlistSongIds,
      context.recentlyPlayedIds,
      context.playlistArtists,
    );

    // Weighted sum
    const totalScore =
      emotionScore * 0.4 +
      preferenceScore * 0.3 +
      qualityScore * 0.2 +
      diversityScore * 0.1;

    return totalScore;
  }

  private calculateEmotionScore(
    song: SongEntity,
    targetEmotion: SongEmotionVO,
  ): number {
    // Exact match gets highest score
    if (song.emotion.equals(targetEmotion)) {
      return song.emotionConfidence || 0.9;
    }

    // Partial match based on emotion probabilities
    // Example: if target is "happy", songs with high happy probability score well
    const targetEmotionKey = targetEmotion
      .getValue()
      .toLowerCase() as keyof EmotionProbabilitiesVO;

    const probability = song.emotionProbabilities?.[targetEmotionKey] || 0;

    return probability * 0.8; // Scale down non-exact matches
  }

  private calculatePreferenceScore(
    song: SongEntity,
    userPreferences: UserPreferencesEntity,
  ): number {
    let score = 0.5; // Neutral baseline

    // Strong signals
    if (userPreferences.likedSongs.some((s) => s.id === song.id)) {
      return 1.0; // Maximum preference
    }
    if (userPreferences.dislikedSongs.some((s) => s.id === song.id)) {
      return 0.0; // Exclude
    }
    if (userPreferences.dislikedArtists.includes(song.artist)) {
      return 0.1; // Strong negative
    }

    // Artist preference
    if (userPreferences.likedArtists.includes(song.artist)) {
      score += 0.3;
    }

    // Genre preference (weighted by how much user likes each genre)
    let genreScore = 0;
    for (const genre of song.genres) {
      const genreWeight = userPreferences.likedGenres.includes(genre);
      genreScore += +genreWeight;
    }
    score += (genreScore / song.genres.length) * 0.3;

    // Implicit feedback from listening history
    const listenedBefore = userPreferences.listenedHistory.find(
      (h) => h.song.id === song.id,
    );
    if (listenedBefore) {
      // High completion rate = user liked it
      score += listenedBefore.completionRate * 0.2;
    }

    return Math.min(score, 1.0); // Cap at 1.0
  }

  private calculateQualityScore(song: SongEntity): number {
    // Normalize metrics to 0-1 range
    const popularityScore =
      song.likesCount / (song.likesCount + song.skipCount + 1);
    const engagementScore = song.averageCompletionRate || 0.5;
    const platformPopularity = Math.min(song.playCount / 1000, 1.0); // Normalize

    // Combine quality signals
    return (
      popularityScore * 0.4 + engagementScore * 0.4 + platformPopularity * 0.2
    );
  }

  private calculateDiversityScore(
    song: SongEntity,
    playlistSongIds: Set<string>,
    playlistArtists: Set<string>,
    recentlyPlayedIds: Set<string>,
  ): number {
    let score = 1.0;

    // Penalize if already in playlist
    if (playlistSongIds.has(song.id)) {
      return 0.0; // Don't repeat in same playlist
    }

    // Penalize if played very recently
    if (recentlyPlayedIds.has(song.id)) {
      score -= 0.4;
    }

    // Penalize if same artist is already in playlist
    const artistInPlaylist = Array.from(playlistArtists).some(
      (a) => a === song.artist,
    );
    if (artistInPlaylist) {
      score -= 0.2;
    }

    return Math.max(score, 0);
  }

  /**
   * Generate a playlist by scoring and ranking all candidate songs
   */
  generatePlaylist(
    candidateSongs: SongEntity[],
    userPreferences: UserPreferencesEntity,
    targetEmotion: SongEmotionVO,
    targetSize: number = 20,
  ): SongEntity[] {
    const context: ScoringContext = {
      targetEmotion,
      playlistSongIds: new Set(),
      playlistArtists: new Set(),
      recentlyPlayedIds: new Set(
        userPreferences.listenedHistory
          .slice(-50) // Last 50 songs
          .map((h) => h.song.id),
      ),
    };

    // Score all songs
    const scoredSongs = candidateSongs
      .map((song) => ({
        song,
        score: this.calculateSongScore(song, userPreferences, context),
      }))
      .filter((item) => item.score > 0.3) // Minimum threshold
      .sort((a, b) => b.score - a.score); // Descending

    // Build playlist iteratively for better diversity
    const playlist: SongEntity[] = [];

    for (const { song } of scoredSongs) {
      if (playlist.length >= targetSize) break;

      // Re-check diversity against current playlist
      context.playlistSongIds.add(song.id);
      context.playlistArtists.add(song.artist);
      const diversityCheck = this.calculateDiversityScore(
        song,
        context.playlistSongIds,
        context.playlistArtists,
        context.recentlyPlayedIds,
      );

      if (diversityCheck > 0.5) {
        // Accept if diverse enough
        playlist.push(song);
      } else {
        context.playlistSongIds.delete(song.id); // Remove from context
      }
    }

    return playlist;
  }
}
