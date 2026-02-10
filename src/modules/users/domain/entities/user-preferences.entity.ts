import { SongEntity } from '@modules/songs/domain/entities/song.entity';

interface UserPreferencesProps {
  id?: string;
  user: string;
  likedSongs: SongEntity[];
  dislikedSongs: SongEntity[];
  dislikedGenres: string[];
  dislikedArtists: string[];
}

export type CreateUserPreferencesProps = Omit<UserPreferencesProps, 'id'>;

export class UserPreferencesEntity implements UserPreferencesProps {
  id?: string;
  user: string;
  likedSongs: SongEntity[];
  dislikedSongs: SongEntity[];
  dislikedGenres: string[];
  dislikedArtists: string[];

  private constructor({
    id,
    user,
    likedSongs,
    dislikedSongs,
    dislikedGenres,
    dislikedArtists,
  }: UserPreferencesProps) {
    this.id = id;
    this.user = user;
    this.likedSongs = likedSongs;
    this.dislikedSongs = dislikedSongs;
    this.dislikedGenres = dislikedGenres;
    this.dislikedArtists = dislikedArtists;
  }

  static create(props: CreateUserPreferencesProps): UserPreferencesEntity {
    return new UserPreferencesEntity({
      user: props.user,
      likedSongs: props.likedSongs,
      dislikedSongs: props.dislikedSongs,
      dislikedGenres: props.dislikedGenres,
      dislikedArtists: props.dislikedArtists,
    });
  }

  static reconstruct(props: UserPreferencesProps): UserPreferencesEntity {
    return new UserPreferencesEntity(props);
  }
}
