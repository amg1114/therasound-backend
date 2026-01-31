import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { SongCreatedEvent } from '../events/song-created.event';
import { Inject } from '@nestjs/common';
import {
  GENRE_REPOSITORY,
  type IGenreRepository,
} from '@modules/songs/domain/repositories/genre-repository.interface';

@Injectable()
export class SongCreatedListener {
  private readonly logger = new Logger(SongCreatedListener.name);

  constructor(
    @Inject(GENRE_REPOSITORY)
    private readonly genreRepository: IGenreRepository,
  ) {}

  @OnEvent('song.created')
  async handleSongCreated(event: SongCreatedEvent) {
    this.logger.log(
      `Song created event received for song ${event.songId} with ${event.genres.length} genres`,
    );

    for (const genreName of event.genres) {
      try {
        // Check if genre exists
        const existingGenre = await this.genreRepository.findByName(genreName);

        if (existingGenre) {
          // Increment songs count
          await this.genreRepository.incrementSongsCount(genreName);
          this.logger.log(`Incremented songs count for genre: ${genreName}`);
        } else {
          // Create new genre with count = 1
          await this.genreRepository.create({
            name: genreName,
            songsCount: 1,
          });
          this.logger.log(`Created new genre: ${genreName}`);
        }
      } catch (error) {
        this.logger.error(
          `Error processing genre ${genreName}: ${error.message}`,
        );
        // Continue with other genres
      }
    }
  }
}
