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

  findMany(ids: string[]): Promise<SongEntity[]>;
}
