import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { SongLikedEvent } from '../events/song-liked.event';
import { Inject } from '@nestjs/common';
import {
  SONG_REPOSITORY,
  ISongRepository,
} from '@modules/songs/domain/repositories/song-repository.interface';

@Injectable()
export class SongLikedListener {
  private readonly logger = new Logger(SongLikedListener.name);

  constructor(
    @Inject(SONG_REPOSITORY)
    private readonly songRepository: ISongRepository,
  ) {}

  @OnEvent('song.liked')
  async handleSongLiked(event: SongLikedEvent) {
    this.logger.log(
      `Song liked event received for song ${event.songId} with action: ${event.action}`,
    );

    try {
      if (event.action === 'add') {
        await this.songRepository.incrementLikesCount(event.songId);
        this.logger.log(`Incremented likes count for song: ${event.songId}`);
      } else if (event.action === 'remove') {
        await this.songRepository.decrementLikesCount(event.songId);
        this.logger.log(`Decremented likes count for song: ${event.songId}`);
      }
    } catch (error) {
      this.logger.error(
        `Error updating likes count for song ${event.songId}: ${error.message}`,
      );
    }
  }
}
