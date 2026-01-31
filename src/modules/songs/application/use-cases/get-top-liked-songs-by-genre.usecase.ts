import { Inject, Injectable, Logger } from '@nestjs/common';
import {
  SONG_REPOSITORY,
  type ISongRepository,
} from '@modules/songs/domain/repositories/song-repository.interface';
import { SongEntity } from '@modules/songs/domain/entities/song.entity';

@Injectable()
export class GetTopLikedSongsByGenreUseCase {
  private readonly logger = new Logger(GetTopLikedSongsByGenreUseCase.name);

  constructor(
    @Inject(SONG_REPOSITORY)
    private readonly songRepository: ISongRepository,
  ) {}

  /**
   * Retrieves top liked songs by genre
   * @param genre - Genre to filter by (optional, if not provided returns all genres)
   * @param limit - Number of songs to return (default: 5)
   * @returns Array of top liked song entities
   */
  async execute(genre?: string, limit: number = 5): Promise<SongEntity[]> {
    this.logger.log(
      `Fetching top ${limit} liked songs${genre ? ` for genre: ${genre}` : ' across all genres'}`,
    );

    if (genre) {
      const songs = await this.songRepository.findTopLikedByGenre(genre, limit);
      this.logger.log(`Found ${songs.length} songs for genre ${genre}`);
      return songs;
    }

    // If no genre specified, get all genres - implement in repository
    const songs = await this.songRepository.findTopLikedByGenre('', limit);
    this.logger.log(`Found ${songs.length} top liked songs`);
    return songs;
  }
}
