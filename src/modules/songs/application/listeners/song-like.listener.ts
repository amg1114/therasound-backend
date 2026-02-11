import {
  type ISongRepository,
  SONG_REPOSITORY,
} from '@modules/songs/domain/repositories/song-repository.interface';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

@Injectable()
export class SongCreatedListener {
  private readonly logger = new Logger(SongCreatedListener.name);

  constructor(
    @Inject(SONG_REPOSITORY)
    private readonly songRepository: ISongRepository,
  ) {}

  @OnEvent('song.liked')
  async handleSongLiked(songId: string) {
    this.logger.log(`Song liked event received for song ${songId} `);

    const song = await this.songRepository.findById(songId);

    if (!song) {
      this.logger.error(`Song with id ${songId} not found`);
      return;
    }

    try {
      await this.songRepository.incrementLikesCount(songId);
      this.logger.log(`Incremented likes count for song: ${songId}`);
    } catch (error) {
      this.logger.error(
        `Error incrementing likes for song ${songId}: ${error.message}`,
      );
    }
  }

  @OnEvent('song.disliked')
  async handleSongDisliked(songId: string) {
    this.logger.log(`Song disliked event received for song ${songId} `);

    const song = await this.songRepository.findById(songId);

    if (!song) {
      this.logger.error(`Song with id ${songId} not found`);
      return;
    }

    try {
      await this.songRepository.decrementLikesCount(songId);
      this.logger.log(`Decremented likes count for song: ${songId}`);
    } catch (error) {
      this.logger.error(
        `Error decrementing likes for song ${songId}: ${error.message}`,
      );
    }
  }
}
