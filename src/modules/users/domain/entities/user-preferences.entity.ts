import { SongEntity } from '@modules/songs/domain/entities/song.entity';

export class UserPreferencesEntity {
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
  }: {
    id?: string;
    user: string;
    likedSongs: SongEntity[];
    dislikedSongs: SongEntity[];
    dislikedGenres: string[];
    dislikedArtists: string[];
  }) {
    this.id = id;
    this.user = user;
    this.likedSongs = likedSongs;
    this.dislikedSongs = dislikedSongs;
    this.dislikedGenres = dislikedGenres;
    this.dislikedArtists = dislikedArtists;
  }

  static create(props: {
    user: string;
    likedSongs: SongEntity[];
    dislikedSongs: SongEntity[];
    dislikedGenres: string[];
    dislikedArtists: string[];
  }): UserPreferencesEntity {
    return new UserPreferencesEntity({
      user: props.user,
      likedSongs: props.likedSongs,
      dislikedSongs: props.dislikedSongs,
      dislikedGenres: props.dislikedGenres,
      dislikedArtists: props.dislikedArtists,
    });
  }

  static reconstruct(props: {
    id: string;
    user: string;
    likedSongs: SongEntity[];
    dislikedSongs: SongEntity[];
    dislikedGenres: string[];
    dislikedArtists: string[];
  }): UserPreferencesEntity {
    return new UserPreferencesEntity({
      id: props.id,
      user: props.user,
      likedSongs: props.likedSongs,
      dislikedSongs: props.dislikedSongs,
      dislikedGenres: props.dislikedGenres,
      dislikedArtists: props.dislikedArtists,
    });
  }
}
