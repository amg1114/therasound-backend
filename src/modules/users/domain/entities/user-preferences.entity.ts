import { SongEntity } from '@modules/songs/domain/entities/song.entity';
import { HistorySongVO } from '../value-objects/history-song.vo';

interface UserPreferencesProps {
  id?: string;
  user: string;
  likedSongs: SongEntity[];
  dislikedSongs: SongEntity[];
  likedGenres: string[];
  dislikedGenres: string[];
  dislikedArtists: string[];
  likedArtists: string[];
  listenedHistory: HistorySongVO[];
}

export class UserPreferencesEntity implements UserPreferencesProps {
  id?: string;
  user: string;
  likedSongs: SongEntity[];
  dislikedSongs: SongEntity[];
  dislikedGenres: string[];
  dislikedArtists: string[];
  likedGenres: string[];
  likedArtists: string[];
  listenedHistory: HistorySongVO[];

  private constructor({
    id,
    user,
    likedSongs,
    dislikedSongs,
    dislikedGenres,
    dislikedArtists,
    likedGenres,
    likedArtists,
    listenedHistory,
  }: UserPreferencesProps) {
    this.id = id;
    this.user = user;
    this.likedSongs = likedSongs;
    this.dislikedSongs = dislikedSongs;
    this.dislikedGenres = dislikedGenres;
    this.dislikedArtists = dislikedArtists;
    this.likedGenres = likedGenres;
    this.likedArtists = likedArtists;
    this.listenedHistory = listenedHistory;
  }

  static create(userId: UserPreferencesProps['user']): UserPreferencesEntity {
    return new UserPreferencesEntity({
      user: userId,
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
