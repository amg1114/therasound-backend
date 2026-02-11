import { NotFoundException } from '@nestjs/common';
import { HistorySongVO } from '../value-objects/history-song.vo';
import { SongSummaryVO } from '@modules/songs/domain/value-objects/song-summary.vo';

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
}
