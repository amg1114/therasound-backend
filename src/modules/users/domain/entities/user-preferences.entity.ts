import { SongSummaryVO } from '@modules/songs/domain/value-objects/song-summary.vo';
import { NotFoundException } from '@nestjs/common';
import { HistorySongVO } from '../value-objects/history-song.vo';

export interface UserPreferencesProps {
  id?: string;
  userId: string;
  likedSongs: SongSummaryVO[];
  dislikedSongs: SongSummaryVO[];
  likedGenres: string[];
  dislikedGenres: string[];
  dislikedArtists: string[];
  likedArtists: string[];
  listenedHistory: HistorySongVO[];
}

export class UserPreferencesEntity implements UserPreferencesProps {
  id?: string;
  userId: string;
  listenedHistory: HistorySongVO[];

  likedSongs: SongSummaryVO[];
  dislikedSongs: SongSummaryVO[];

  likedGenres: string[];
  dislikedGenres: string[];

  likedArtists: string[];
  dislikedArtists: string[];

  private constructor({
    id,
    userId,
    likedSongs,
    dislikedSongs,
    dislikedGenres,
    dislikedArtists,
    likedGenres,
    likedArtists,
    listenedHistory,
  }: UserPreferencesProps) {
    this.id = id;
    this.userId = userId;
    this.likedSongs = likedSongs;
    this.dislikedSongs = dislikedSongs;
    this.dislikedGenres = dislikedGenres;
    this.dislikedArtists = dislikedArtists;
    this.likedGenres = likedGenres;
    this.likedArtists = likedArtists;
    this.listenedHistory = listenedHistory;
  }

  static create(userId: UserPreferencesProps['userId']): UserPreferencesEntity {
    return new UserPreferencesEntity({
      userId,
      likedSongs: [],
      dislikedSongs: [],
      dislikedGenres: [],
      dislikedArtists: [],
      likedGenres: [],
      likedArtists: [],
      listenedHistory: [],
    });
  }

  static reconstruct(props: UserPreferencesProps): UserPreferencesEntity {
    return new UserPreferencesEntity(props);
  }

  hasDislikedSong(songId: string): boolean {
    return this.dislikedSongs.some((song) => song.id === songId);
  }

  hasLikedSong(songId: string): boolean {
    return this.likedSongs.some((song) => song.id === songId);
  }

  hasLikedArtist(artist: string): boolean {
    return this.likedArtists.includes(artist);
  }

  hasDislikedArtist(artist: string): boolean {
    return this.dislikedArtists.includes(artist);
  }

  hasListenedSong(songId: string): boolean {
    return this.listenedHistory.some((entry) => entry.song.id === songId);
  }

  removeLikedSong(songId: string): void {
    if (!this.hasLikedSong(songId)) {
      throw new NotFoundException(
        `La canción con ID ${songId} no está en las canciones que le gustan`,
      );
    }

    this.likedSongs = this.likedSongs.filter((song) => song.id !== songId);
  }

  removeDislikedSong(songId: string): void {
    if (!this.hasDislikedSong(songId)) {
      throw new NotFoundException(
        `La canción con ID ${songId} no está en las canciones que no le gustan`,
      );
    }

    this.dislikedSongs = this.dislikedSongs.filter(
      (song) => song.id !== songId,
    );
  }

  toggleLikedSong(song: SongSummaryVO): void {
    if (this.hasLikedSong(song.id)) {
      this.removeLikedSong(song.id);
    } else {
      this.likedSongs.push(song);
    }
  }

  toggleDislikedSong(song: SongSummaryVO): void {
    if (this.hasDislikedSong(song.id)) {
      this.removeDislikedSong(song.id);
    } else {
      this.dislikedSongs.push(song);
    }
  }

  getRecentHistory(limit: number): HistorySongVO[] {
    return this.listenedHistory
      .slice()
      .sort((a, b) => b.listenedAt.getTime() - a.listenedAt.getTime())
      .slice(0, limit);
  }

  getCompletionRateForSong(songId: string): number {
    const historyEntry = this.listenedHistory.find(
      (entry) => entry.song.id === songId,
    );
    return historyEntry ? historyEntry.completionRate : 0;
  }

  getValues(): UserPreferencesProps {
    return {
      id: this.id,
      userId: this.userId,
      likedSongs: this.likedSongs,
      dislikedSongs: this.dislikedSongs,
      dislikedGenres: this.dislikedGenres,
      dislikedArtists: this.dislikedArtists,
      likedGenres: this.likedGenres,
      likedArtists: this.likedArtists,
      listenedHistory: this.listenedHistory,
    };
  }

  /**
   * Calcula peso de preferencia por género basado en canciones liked
   * Retorna Map<género, peso entre 0-1>
   */
  calculateGenreWeights(): Map<string, number> {
    const genreCounts = new Map<string, number>();
    const totalSongs = this.likedSongs.length;

    if (totalSongs === 0) {
      // Si no hay canciones liked, usa los géneros seleccionados
      return this.calculateGenreWeightsFromSelection();
    }

    // Cuenta cuántas canciones liked tiene cada género
    for (const song of this.likedSongs) {
      for (const genre of song.genres) {
        genreCounts.set(genre, (genreCounts.get(genre) || 0) + 1);
      }
    }

    // Convierte conteos a pesos (0-1)
    const weights = new Map<string, number>();
    const maxCount = Math.max(...genreCounts.values());

    for (const [genre, count] of genreCounts) {
      weights.set(genre, count / maxCount); // Normaliza al género más popular
    }

    return weights;
  }

  private calculateGenreWeightsFromSelection(): Map<string, number> {
    const weights = new Map<string, number>();

    // Géneros explícitamente liked tienen peso máximo
    for (const genre of this.likedGenres) {
      weights.set(genre, 1.0);
    }

    // Géneros disliked tienen peso mínimo
    for (const genre of this.dislikedGenres) {
      weights.set(genre, 0.0);
    }

    return weights;
  }
}
