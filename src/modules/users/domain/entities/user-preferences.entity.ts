import { SongSummaryVO } from '@modules/songs/domain/value-objects/song-summary.vo';
import { HistorySongVO } from '../value-objects/history-song.vo';
import {
  ContentPreferences,
  PreferenceType,
} from './types/content-preference.type';

export type CreateUserPreferencesProps = Omit<UserPreferencesProps, 'id'>;

export interface UserPreferencesProps {
  id: string;

  userId: string;

  likes: ContentPreferences;

  dislikes: ContentPreferences;

  listenedHistory: HistorySongVO[];
}

export class UserPreferencesEntity implements UserPreferencesProps {
  id: string;
  userId: string;
  listenedHistory: HistorySongVO[];

  likes: ContentPreferences;

  dislikes: ContentPreferences;

  private constructor({
    id,
    userId,
    likes,
    dislikes,
    listenedHistory,
  }: UserPreferencesProps) {
    this.id = id;
    this.userId = userId;
    this.likes = likes;
    this.dislikes = dislikes;
    this.listenedHistory = listenedHistory;
  }

  static create(
    userId: UserPreferencesProps['userId'],
  ): CreateUserPreferencesProps {
    return {
      userId,
      likes: {
        songs: [],
        genres: [],
        artists: [],
      },
      dislikes: {
        songs: [],
        genres: [],
        artists: [],
      },
      listenedHistory: [],
    };
  }

  static reconstruct(props: UserPreferencesProps): UserPreferencesEntity {
    return new UserPreferencesEntity(props);
  }

  toggleSongPreference(
    song: SongSummaryVO,
    preferenceType: PreferenceType,
  ): void {
    const preferences = this[preferenceType].songs;
    const exists = preferences.some((s) => s.id === song.id);

    if (exists) {
      this[preferenceType].songs = preferences.filter((s) => s.id !== song.id);
    } else {
      this[preferenceType].songs.push(song);

      if (preferenceType === 'likes') {
        // Si se está liking una canción, asegurarse de eliminarla de dislikes
        this.dislikes.songs = this.dislikes.songs.filter(
          (s) => s.id !== song.id,
        );
      } else {
        // Si se está disliking una canción, asegurarse de eliminarla de likes
        this.likes.songs = this.likes.songs.filter((s) => s.id !== song.id);
      }
    }
  }

  toggleArtistPreference(
    artistId: string,
    preferenceType: PreferenceType,
  ): void {
    const preferences = this[preferenceType].artists;
    const exists = preferences.some((a) => a === artistId);

    if (exists) {
      this[preferenceType].artists = preferences.filter((a) => a !== artistId);
    } else {
      this[preferenceType].artists.push(artistId);

      if (preferenceType === 'likes') {
        // Si se está liking un artista, asegurarse de eliminarlo de dislikes
        this.dislikes.artists = this.dislikes.artists.filter(
          (a) => a !== artistId,
        );
      } else {
        // Si se está disliking un artista, asegurarse de eliminarlo de likes
        this.likes.artists = this.likes.artists.filter((a) => a !== artistId);
      }
    }
  }

  toggleGenrePreference(genreId: string, preferenceType: PreferenceType): void {
    const preferences = this[preferenceType].genres;
    const exists = preferences.some((a) => a === genreId);

    if (exists) {
      this[preferenceType].genres = preferences.filter((a) => a !== genreId);
    } else {
      this[preferenceType].genres.push(genreId);

      if (preferenceType === 'likes') {
        // Si se está liking un género, asegurarse de eliminarlo de dislikes
        this.dislikes.genres = this.dislikes.genres.filter(
          (a) => a !== genreId,
        );
      } else {
        // Si se está disliking un género, asegurarse de eliminarlo de likes
        this.likes.genres = this.likes.genres.filter((a) => a !== genreId);
      }
    }
  }

  hasLikedSong(songId: string): boolean {
    return this.likes.songs.some((s) => s.id === songId);
  }

  hasDislikedSong(songId: string): boolean {
    return this.dislikes.songs.some((s) => s.id === songId);
  }

  hasLikedArtist(artistId: string): boolean {
    return this.likes.artists.some((a) => a === artistId);
  }

  hasDislikedArtist(artistId: string): boolean {
    return this.dislikes.artists.some((a) => a === artistId);
  }

  hasLikedGenre(genreId: string): boolean {
    return this.likes.genres.some((g) => g === genreId);
  }

  hasDislikedGenre(genreId: string): boolean {
    return this.dislikes.genres.some((g) => g === genreId);
  }

  hasListenedSong(songId: string): boolean {
    return this.listenedHistory.some((entry) => entry.song.id === songId);
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
      likes: this.likes,
      dislikes: this.dislikes,
      listenedHistory: this.listenedHistory,
    };
  }

  /**
   * Calcula peso de preferencia por género basado en canciones liked
   * Retorna Map<género, peso entre 0-1>
   */
  calculateGenreWeights(): Map<string, number> {
    const genreCounts = new Map<string, number>();
    const totalSongs = this.likes.songs.length;

    if (totalSongs === 0) {
      // Si no hay canciones liked, usa los géneros seleccionados
      return this.calculateGenreWeightsFromSelection();
    }

    // Cuenta cuántas canciones liked tiene cada género
    for (const song of this.likes.songs) {
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
    for (const genre of this.likes.genres) {
      weights.set(genre, 1.0);
    }

    // Géneros disliked tienen peso mínimo
    for (const genre of this.dislikes.genres) {
      weights.set(genre, 0.0);
    }

    return weights;
  }
}
