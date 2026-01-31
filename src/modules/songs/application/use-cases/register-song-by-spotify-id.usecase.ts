import { Inject, Injectable, Logger } from '@nestjs/common';

import { SongEntity } from '@modules/songs/domain/entities/song.entity';
import { SongProcessingService } from '../services/song-processing.service';
import { ExternalMusicApiService } from '@modules/songs/infrastructure/services/external-music-api.service';
import {
  type ISongRepository,
  SONG_REPOSITORY,
} from '@modules/songs/domain/repositories/song-repository.interface';

@Injectable()
export class RegisterSongBySpotifyIdUseCase {
  private readonly logger = new Logger(RegisterSongBySpotifyIdUseCase.name);

  constructor(
    @Inject(SONG_REPOSITORY)
    private readonly songRepository: ISongRepository,
    private readonly songProcessingService: SongProcessingService,
    private readonly externalMusicApiService: ExternalMusicApiService,
  ) {}

  /**
   * Fetches recommendations from ReccoBeats based on a Spotify ID and registers them
   * @param spotifyId - Spotify ID to use as seed for recommendations
   * @param emotion - The emotion to assign to the songs
   * @param targetCount - Number of recommendations to fetch (default: 50)
   * @returns Array of registered song entities
   */
  async execute(
    spotifyId: string,
    targetCount: number = 50,
  ): Promise<SongEntity[]> {
    this.logger.log(
      `Fetching ${targetCount} recommendations based on Spotify ID: ${spotifyId}`,
    );

    // Fetch recommendations from ReccoBeats using the Spotify ID as seed
    const recommendations =
      await this.externalMusicApiService.getRecommendations(
        [spotifyId],
        [],
        targetCount,
      );

    if (recommendations.length === 0) {
      this.logger.warn(`No recommendations found for Spotify ID: ${spotifyId}`);
      return [];
    }

    this.logger.log(`Found ${recommendations.length} recommendations`);

    // Process and register the recommended tracks
    const processedSongs =
      await this.songProcessingService.processTracks(recommendations);

    this.logger.log(
      `Successfully processed ${processedSongs.length} songs (filtered sad songs)`,
    );

    const registeredSongs: SongEntity[] =
      await this.songRepository.createMany(processedSongs);

    return registeredSongs;
  }
}
