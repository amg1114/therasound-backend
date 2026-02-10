import { HistorySongVO } from '../value-objects/history-song.vo';
import { SongSummaryVO } from '@modules/songs/domain/value-objects/song-summary.vo';

interface UserPreferencesProps {
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
}
