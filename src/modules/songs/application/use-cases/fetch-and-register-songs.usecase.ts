import { Inject, Injectable, Logger } from '@nestjs/common';
import {
  SONG_REPOSITORY,
  type ISongRepository,
} from '@modules/songs/domain/repositories/song-repository.interface';
import {
  USER_PREFERENCES_REPOSITORY,
  type IUserPreferencesRepository,
} from '@modules/users/domain/repositories/user-preferences-repository.interface';
import { ExternalMusicApiService } from '@modules/songs/infrastructure/services/external-music-api.service';
import { SongEntity } from '@modules/songs/domain/entities/song.entity';
import { SongProcessingService } from '../services/song-processing.service';

@Injectable()
export class FetchAndRegisterSongsUseCase {
  private readonly logger = new Logger(FetchAndRegisterSongsUseCase.name);

  constructor(
    @Inject(SONG_REPOSITORY)
    private readonly songRepository: ISongRepository,
    @Inject(USER_PREFERENCES_REPOSITORY)
    private readonly userPreferencesRepository: IUserPreferencesRepository,
    private readonly externalMusicApiService: ExternalMusicApiService,
    private readonly songProcessingService: SongProcessingService,
  ) {}

  /**
   * Fetches new songs from external APIs and registers them in the database
   * @param userId - The user ID to get preferences from
   * @param emotion - The emotion to assign to the songs
   * @param targetCount - Target number of new songs to fetch
   */
  async execute(
    userId: string,
    emotion: string,
    targetCount: number = 50,
  ): Promise<SongEntity[]> {
    this.logger.log(
      `Fetching ${targetCount} new songs for emotion: ${emotion}`,
    );

    // 1. Get user preferences to use as seeds
    const userPreferences =
      await this.userPreferencesRepository.findByUserId(userId);

    // 2. Get last 5 liked and disliked songs filtered by emotion
    const likedSongs = userPreferences
      ? userPreferences.likedSongs.filter(
          (song) => song.emotion.getValue() === emotion,
        )
      : [];

    const dislikedSongs = userPreferences
      ? userPreferences.dislikedSongs.filter(
          (song) => song.emotion.getValue() === emotion,
        )
      : [];

    const seeds = likedSongs
      .map((song) => song.spotifyId)
      .filter(Boolean)
      .slice(0, 5);

    const negativeSeeds = dislikedSongs
      .map((song) => song.spotifyId)
      .filter(Boolean)
      .slice(0, 5);

    this.logger.log(
      `Using ${seeds.length} seeds and ${negativeSeeds.length} negative seeds`,
    );

    // 3. Fetch recommendations from ReccoBeats
    const recommendations =
      await this.externalMusicApiService.getRecommendations(
        seeds,
        negativeSeeds,
        targetCount,
      );

    if (recommendations.length === 0) {
      this.logger.warn('No recommendations received from ReccoBeats');
      return [];
    }

    // 4. Filter out songs that are already registered
    const spotifyIds = recommendations.map((track) => track.id);
    const existingSongs =
      await this.songRepository.findBySpotifyIds(spotifyIds);
    const existingSpotifyIds = new Set(
      existingSongs.map((song) => song.spotifyId),
    );

    const newRecommendations = recommendations.filter(
      (track) => !existingSpotifyIds.has(track.id),
    );

    this.logger.log(
      `${newRecommendations.length} new songs to register (${existingSongs.length} already exist)`,
    );

    if (newRecommendations.length === 0) {
      return [];
    }

    // 5. Process tracks with emotion analysis and metadata
    const processedSongs = await this.songProcessingService.processTracks(
      newRecommendations,
      emotion,
    );

    if (processedSongs.length === 0) {
      this.logger.warn('No songs could be processed successfully');
      return [];
    }

    // 6. Register all new songs in batch
    this.logger.log(`Registering ${processedSongs.length} new songs`);
    const registeredSongs =
      await this.songRepository.createMany(processedSongs);

    this.logger.log(
      `Successfully registered ${registeredSongs.length} new songs`,
    );

    return registeredSongs;
  }
}
