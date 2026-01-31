import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import {
  SONG_REPOSITORY,
  type ISongRepository,
} from '@modules/songs/domain/repositories/song-repository.interface';
import { SongEntity } from '@modules/songs/domain/entities/song.entity';
import { SongProcessingService } from '../services/song-processing.service';

@Injectable()
export class RegisterSongBySpotifyIdUseCase {
  private readonly logger = new Logger(RegisterSongBySpotifyIdUseCase.name);

  constructor(
    @Inject(SONG_REPOSITORY)
    private readonly songRepository: ISongRepository,
    private readonly songProcessingService: SongProcessingService,
  ) {}

  /**
   * Registers a single song by Spotify ID
   * @param spotifyId - Spotify ID of the song to register
   * @param emotion - The emotion to assign to the song
   * @returns Registered song entity
   */
  async execute(spotifyId: string, emotion: string): Promise<SongEntity> {
    this.logger.log(`Registering song with Spotify ID: ${spotifyId}`);

    // Check if song already exists
    const existingSong = await this.songRepository.findBySpotifyId(spotifyId);
    if (existingSong) {
      this.logger.log(`Song ${spotifyId} already exists, returning existing`);
      return existingSong;
    }

    // Process the song with emotion analysis and metadata
    const processedSong = await this.songProcessingService.processBySpotifyId(
      spotifyId,
      emotion,
    );

    if (!processedSong) {
      throw new NotFoundException(
        `Could not process song with Spotify ID: ${spotifyId}. Song may be sad or metadata unavailable.`,
      );
    }

    // Register the song
    const registeredSong = await this.songRepository.create(processedSong);

    this.logger.log(`Successfully registered song: ${registeredSong.title}`);

    return registeredSong;
  }
}
