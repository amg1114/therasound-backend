import { EmotionVO } from '@common/domain/value-objects/emotion.vo';
import { SongEntity } from '@modules/songs/domain/entities/song.entity';
import {
  SONG_REPOSITORY,
  type ISongRepository,
} from '@modules/songs/domain/repositories/song-repository.interface';
import {
  BadGatewayException,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EmotionAnalysisResponseDto } from '../dto/emotion-analysis-response.dto';
import {
  ReccoBeatsResponseDto,
  ReccoBeatsTrackDto,
} from '../dto/reccobeats-response.dto';
import { SoundchartsResponseDto } from '../dto/soundcharts-response.dto';
import { SongMapper } from '../mappers/song.mapper';

export interface IReccoBeatsAudioFeaturesQueries {
  danceability?: number;
  energy?: number;
  instrumentalness?: number;
  key?: number;
  liveness?: number;
  loudness?: number;
  mode?: number;
  speechiness?: number;
  tempo?: number;
  valence?: number;
  popularity?: number;
  featureWeight?: number;
}

@Injectable()
export class ExternalMusicApiService {
  private readonly logger = new Logger(ExternalMusicApiService.name);
  private readonly reccobeatsBaseUrl = 'https://api.reccobeats.com/v1';
  private readonly soundchartsBaseUrl =
    'https://customer.api.soundcharts.com/api/v2.25';

  constructor(
    private readonly configService: ConfigService,
    @Inject(SONG_REPOSITORY)
    private readonly songRepository: ISongRepository,
  ) {}

  async fetchRecommendationsAndProcess(
    seeds: string[],
    negativeSeeds: string[],
    size = 50,
    audioFeatures?: IReccoBeatsAudioFeaturesQueries,
  ) {
    this.logger.log(
      `Fetching recommendations with seeds: ${seeds.join(', ')} and negative seeds: ${negativeSeeds.join(', ')}`,
    );

    const recommendations = await this.getRecommendations(
      seeds,
      negativeSeeds,
      size,
      audioFeatures,
    );

    this.logger.log(
      `Fetched ${recommendations.length} recommendations, processing tracks...`,
    );

    const processedSongs = await this.processTracks(recommendations);

    this.logger.log(
      `Processed ${processedSongs.length} songs after enrichment and filtering`,
    );

    return processedSongs;
  }

  /**
   * Fetches song recommendations from ReccoBeats API
   * @param seeds - List of Spotify IDs for liked songs (max 5)
   * @param negativeSeeds - List of Spotify IDs for disliked songs (max 5)
   * @param size - Number of recommendations to fetch
   */
  private async getRecommendations(
    seeds: string[],
    negativeSeeds: string[],
    size: number = 50,
    audioFeatures?: IReccoBeatsAudioFeaturesQueries,
  ): Promise<ReccoBeatsTrackDto[]> {
    try {
      const params = new URLSearchParams();
      params.append('size', size.toString());

      // Add seeds (liked songs)
      if (seeds.length > 0) {
        params.append('seeds', seeds.slice(0, 5).join(','));
      }

      // Add negative seeds (disliked songs)
      if (negativeSeeds.length > 0) {
        params.append('negativeSeeds', negativeSeeds.slice(0, 5).join(','));
      }

      if (audioFeatures) {
        Object.entries(audioFeatures).forEach(
          ([key, value]: [string, number]) => {
            if (value !== undefined) {
              params.append(key, value.toString());
            }
          },
        );
      }

      const url = `${this.reccobeatsBaseUrl}/track/recommendation?${params.toString()}`;

      this.logger.log(`Fetching recommendations from ReccoBeats: ${url}`);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new BadGatewayException(
          `Error en API de ReccoBeats: ${response.status} ${response.statusText} \n Response: ${await response.text()}`,
        );
      }

      const data = (await response.json()) as ReccoBeatsResponseDto;
      this.logger.log(
        `Received ${data.content.length} recommendations from ReccoBeats`,
      );

      return data.content;
    } catch (error) {
      this.logger.error(
        `Failed to fetch recommendations from ReccoBeats: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Processes a list of ReccoBeats tracks and enriches them with emotion analysis
   * and Soundcharts metadata. Filters out sad songs.
   * @param tracks - List of ReccoBeats tracks to process
   * @returns Array of enriched partial song entities
   */
  async processTracks(tracks: ReccoBeatsTrackDto[]): Promise<SongEntity[]> {
    const processedSongs: SongEntity[] = [];

    for (const track of tracks) {
      try {
        const song = await this.processTrack(track);
        if (song) {
          processedSongs.push(song);
        }
      } catch (error) {
        this.logger.error(
          `Error processing song ${track.id}: ${error.message}`,
        );
        // Continue with other songs
      }
    }

    return processedSongs;
  }

  /**
   * Processes a single ReccoBeats track and enriches it with emotion analysis
   * and Soundcharts metadata. Returns null if song should be filtered out.
   * @param track - ReccoBeats track to process
   * @param targetEmotion - The emotion to assign to the song
   * @returns Enriched partial song entity or null if filtered
   */
  async processTrack(track: ReccoBeatsTrackDto): Promise<SongEntity | null> {
    const songExists = await this.songRepository.existsByReccoBeatsId(track.id);
    if (songExists) {
      this.logger.log(
        `Song with ReccoBeats ID ${track.id} already exists, skipping`,
      );
      return null;
    }

    // Fetch emotion analysis first
    const emotionAnalysis = await this.getEmotionAnalysis(track.id);

    // Skip songs with sad emotion or no analysis
    if (!emotionAnalysis) {
      this.logger.log(
        `Skipping song ${track.id} - no emotion analysis available`,
      );
      return null;
    }

    const spotifyId = SongMapper.extractSpotifyId(track.href);
    if (!spotifyId) {
      this.logger.warn(
        `Could not extract Spotify ID from track href: ${track.href}, skipping`,
      );
      return null;
    }

    // Fetch song details from Soundcharts
    const songDetails = await this.getSongDetails(spotifyId);

    if (!songDetails || !songDetails.object) {
      this.logger.warn(
        `Could not fetch details for song: ${track.id}, skipping`,
      );
      return null;
    }

    const details = songDetails.object;

    // Extract genres (flatten the genre structure)
    const genres = [
      ...new Set(details.genres.flatMap((g) => [g.root, ...(g.sub ?? [])])),
    ].filter(Boolean);

    const newSong = SongEntity.create({
      spotifyId: spotifyId,
      title: details.name,
      artist: details.artists[0]?.name || track.artists[0]?.name || 'Unknown',
      emotion: EmotionVO.create(emotionAnalysis.emotion),
      durationMs: details.duration * 1000, // Convert seconds to milliseconds
      spotifyUrl: track.href,
      genres: genres.filter(Boolean),
      imageUrl: details.imageUrl || '',
      releaseDate: new Date(details.releaseDate),
      audioFeatures: details.audio,
      emotionConfidence: emotionAnalysis.confidence,
      emotionProbabilities: emotionAnalysis.probabilities,
      reccobeatsId: emotionAnalysis.reccobeats_id,
    });

    return this.songRepository.create(newSong);
  }

  /**
   * Processes a single song by Spotify ID
   * @param spotifyId - Spotify ID of the song
   * @returns Enriched partial song entity or null if filtered
   */
  async processBySpotifyId(
    spotifyId: string,
  ): Promise<Partial<SongEntity> | null> {
    // Create a minimal track object for processing
    const track: ReccoBeatsTrackDto = {
      id: spotifyId,
      trackTitle: '', // Will be populated from Soundcharts
      artists: [],
      durationMs: 0,
      isrc: '',
      ean: '',
      upc: '',
      href: `https://open.spotify.com/track/${spotifyId}`,
      availableCountries: '',
      popularity: 0,
    };

    return this.processTrack(track);
  }

  /**
   * Fetches full song details from Soundcharts API by Spotify ID
   * @param spotifyId - The Spotify ID of the song
   */
  private async getSongDetails(
    spotifyId: string,
  ): Promise<SoundchartsResponseDto | null> {
    try {
      const appId = this.configService.get<string>('soundcharts.appId');
      const apiKey = this.configService.get<string>('soundcharts.apiKey');

      if (!appId || !apiKey) {
        throw new InternalServerErrorException(
          'Credenciales de Soundcharts no configuradas',
        );
      }

      const url = `${this.soundchartsBaseUrl}/song/by-platform/spotify/${spotifyId}`;

      this.logger.log(`Fetching song details from Soundcharts: ${spotifyId}`);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-app-id': appId,
          'x-api-key': apiKey,
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          this.logger.warn(`Song not found in Soundcharts: ${spotifyId}`);
          return null;
        }

        throw new BadGatewayException(
          `Error en API de Soundcharts: ${response.status} ${response.statusText}`,
        );
      }

      const data = (await response.json()) as SoundchartsResponseDto;

      // Check if there are errors in the response
      if (data.errors && data.errors.length > 0) {
        this.logger.warn(
          `Soundcharts returned errors for ${spotifyId}:`,
          data.errors,
        );
        return null;
      }

      this.logger.log(`Successfully fetched details for song: ${spotifyId}`);

      return data;
    } catch (error) {
      this.logger.error(
        `Failed to fetch song details from Soundcharts: ${error.message}`,
        error.stack,
      );
      return null;
    }
  }

  /**
   * Fetches emotion analysis for a song from the emotion analysis API
   * @param reccobeatsId - The ReccoBeats ID of the song
   */
  private async getEmotionAnalysis(
    reccobeatsId: string,
  ): Promise<EmotionAnalysisResponseDto | null> {
    try {
      const baseUrl = this.configService.getOrThrow<string>(
        'emotionAnalysis.apiUrl',
      );

      const url = `${baseUrl}/api/v1/analyze/${reccobeatsId}`;

      this.logger.log(
        `Fetching emotion analysis for ReccoBeats ID: ${reccobeatsId}`,
      );

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          this.logger.warn(
            `Emotion analysis not found for ReccoBeats ID: ${reccobeatsId}`,
          );
          return null;
        }

        throw new BadGatewayException(
          `Error en API de análisis de emociones: ${response.status} ${response.statusText}`,
        );
      }

      const data = (await response.json()) as EmotionAnalysisResponseDto;

      this.logger.log(
        `Successfully fetched emotion analysis for ${reccobeatsId}: ${data.emotion} (confidence: ${data.confidence})`,
      );

      return data;
    } catch (error) {
      this.logger.error(
        `Failed to fetch emotion analysis: ${error.message}`,
        error.stack,
      );
      if (error instanceof BadGatewayException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Error al obtener análisis de emociones debido a un error inesperado',
      );
    }
  }
}
