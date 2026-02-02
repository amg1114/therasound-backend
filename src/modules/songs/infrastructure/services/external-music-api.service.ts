import {
  Injectable,
  Logger,
  BadGatewayException,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ReccoBeatsResponseDto,
  ReccoBeatsTrackDto,
} from '../dto/reccobeats-response.dto';
import { SoundchartsResponseDto } from '../dto/soundcharts-response.dto';
import { EmotionAnalysisResponseDto } from '../dto/emotion-analysis-response.dto';

@Injectable()
export class ExternalMusicApiService {
  private readonly logger = new Logger(ExternalMusicApiService.name);
  private readonly reccobeatsBaseUrl = 'https://api.reccobeats.com/v1';
  private readonly soundchartsBaseUrl =
    'https://customer.api.soundcharts.com/api/v2.25';

  constructor(private readonly configService: ConfigService) {}

  /**
   * Fetches song recommendations from ReccoBeats API
   * @param seeds - List of Spotify IDs for liked songs (max 5)
   * @param negativeSeeds - List of Spotify IDs for disliked songs (max 5)
   * @param size - Number of recommendations to fetch
   */
  async getRecommendations(
    seeds: string[],
    negativeSeeds: string[],
    size: number = 50,
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
          `Error en API de ReccoBeats: ${response.status} ${response.statusText}`,
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
   * Fetches full song details from Soundcharts API by Spotify ID
   * @param spotifyId - The Spotify ID of the song
   */
  async getSongDetails(
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
  async getEmotionAnalysis(
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
