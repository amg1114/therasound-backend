import { SongEntity } from '../entities/song.entity';

export const SONG_REPOSITORY = 'SONG_REPOSITORY';

export interface SongFilters {
  excludedSongIds?: string[];
  excludedArtistIds?: string[];
  excludedGenres?: string[];
}

export interface ISongRepository {
  findByEmotion(emotion: string): Promise<SongEntity[]>;

  findByEmotionWithFilters(
    emotion: string,
    filters: SongFilters,
  ): Promise<SongEntity[]>;

  findById(id: string): Promise<SongEntity | null>;

  findBySpotifyId(spotifyId: string): Promise<SongEntity | null>;

  findBySpotifyIds(spotifyIds: string[]): Promise<SongEntity[]>;

  findMany(ids: string[]): Promise<SongEntity[]>;

  findManyByEmotion(ids: string[], emotion: string): Promise<SongEntity[]>;

  create(song: Partial<SongEntity>): Promise<SongEntity>;

  createMany(songs: Partial<SongEntity>[]): Promise<SongEntity[]>;
}
