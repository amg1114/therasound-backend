import { SongEntity } from '../entities/song.entity';

export const SONG_REPOSITORY = 'SONG_REPOSITORY';

export interface SongFilters {
  excludedSongIds?: string[];
  excludedArtistIds?: string[];
  excludedGenres?: string[];
}

export interface ISongRepository {
  findById(id: string): Promise<SongEntity | null>;

  findManyBySpotifyIds(spotifyIds: string[]): Promise<SongEntity[]>;

  findManyByReccoBeatsIds(reccoBeatsIds: string[]): Promise<SongEntity[]>;

  findAll(): Promise<SongEntity[]>;

  create(song: Partial<SongEntity>): Promise<SongEntity>;

  createMany(songs: Partial<SongEntity>[]): Promise<SongEntity[]>;

  incrementLikesCount(songId: string): Promise<void>;

  decrementLikesCount(songId: string): Promise<void>;

  existsByReccoBeatsId(reccoBeatsId: string): Promise<boolean>;
}
