import { IKeyAudioFeatures } from '@modules/songs/domain/value-objects/audio-features.vo';
import { HttpService } from '@nestjs/axios';
import {
  BadGatewayException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { AcrCloudResponseDto } from '../dto/acr-cloud-response.dto';
import { EmotionAnalysisResponseDto } from '../dto/emotion-analysis-response.dto';
import { ReccoBeatsResponseDto } from '../dto/reccobeats-response.dto';

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

export interface IExternalDetails {
  title: string;
  artist: string;
  genres: string[];
  releaseDate: Date;
  imageUrl: string;
  durationMs: number;
  spotifyUrl: string;
}

@Injectable()
export class ExternalMusicApiService {
  private readonly logger = new Logger(ExternalMusicApiService.name);

  private readonly reccobeatsBaseUrl = 'https://api.reccobeats.com/v1';
  private readonly acrCloudBaseUrl = 'https://eu-api-v2.acrcloud.com/api';

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {}

  async fetchRecommendations(
    seeds: string[],
    negativeSeeds: string[],
    size = 50,
    audioFeatures?: IReccoBeatsAudioFeaturesQueries,
  ) {
    this.logger.log(
      `Fetching recommendations with seeds: ${seeds.join(', ')} and negative seeds: ${negativeSeeds.join(', ')}`,
    );

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

      const response = await firstValueFrom(
        this.httpService.get<ReccoBeatsResponseDto>(url, {
          headers: {
            'Content-Type': 'application/json',
          },
        }),
      );

      this.logger.log(
        `Received ${response.data.content.length} recommendations from ReccoBeats`,
      );

      return response.data.content;
    } catch (error) {
      this.logger.error(
        `Failed to fetch recommendations from ReccoBeats: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async getExternalSongDetails(spotifyId: string): Promise<IExternalDetails> {
    try {
      const accessKey = this.configService.get<string>('acrCloud.accessKey');
      if (!accessKey) {
        throw new InternalServerErrorException(
          'ACRCloud access key not configured',
        );
      }

      const url = `${this.acrCloudBaseUrl}/external-metadata/tracks?source_url=https://open.spotify.com/track/${spotifyId}`;

      this.logger.log(`Fetching song details from ACRCloud: ${spotifyId}`);
      const response = await firstValueFrom(
        this.httpService.get<AcrCloudResponseDto>(url, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessKey}`,
          },
        }),
      );

      const track = response.data.data[0];
      if (!track) {
        this.logger.warn(
          `No track data found in ACRCloud response for: ${spotifyId}`,
        );
        throw new NotFoundException(
          `No se encontraron datos para la canción en ACRCloud: ${spotifyId}`,
        );
      }
      this.logger.log(
        `Successfully fetched details from ACRCloud for: ${spotifyId}`,
      );

      const details: IExternalDetails = {
        title: track.name,
        artist: track.artists[0].name,
        genres: track.genres,
        releaseDate: new Date(track.release_date || track.album.release_date),
        imageUrl: track.album.cover,
        durationMs: track.duration_ms,
        spotifyUrl: `https://open.spotify.com/track/${spotifyId}`,
      };

      return details;
    } catch (error) {
      this.logger.error(
        `Failed to fetch song details from ACRCloud: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async getEmotionDataForReccoBeats(
    reccobeatsId: string,
  ): Promise<EmotionAnalysisResponseDto> {
    try {
      const baseUrl = this.configService.getOrThrow<string>(
        'emotionAnalysis.apiUrl',
      );

      const url = `${baseUrl}/api/v1/analyze/${reccobeatsId}`;

      this.logger.log(
        `Fetching emotion analysis for ReccoBeats ID: ${reccobeatsId}`,
      );

      const response = await firstValueFrom(
        this.httpService.get<EmotionAnalysisResponseDto>(url, {
          headers: {
            'Content-Type': 'application/json',
          },
        }),
      );

      this.logger.log(
        `Successfully fetched emotion analysis for ${reccobeatsId}: ${response.data.emotion} (confidence: ${response.data.confidence})`,
      );

      return response.data;
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

  async getEmotionDataFromFeatures(features: IKeyAudioFeatures) {
    try {
      const baseUrl = this.configService.getOrThrow<string>(
        'emotionAnalysis.apiUrl',
      );

      const url = `${baseUrl}/api/v1/analyze`;

      this.logger.log(
        `Fetching emotion analysis from audio features: ${JSON.stringify(features)}`,
      );

      const response = await firstValueFrom(
        this.httpService.post<EmotionAnalysisResponseDto>(url, features, {
          headers: {
            'Content-Type': 'application/json',
          },
        }),
      );

      this.logger.log(
        `Successfully fetched emotion analysis from features: ${response.data.emotion} (confidence: ${response.data.confidence})`,
      );

      return response.data;
    } catch (error) {
      this.logger.error(
        `Failed to fetch emotion analysis from features: ${error.message}`,
        error.stack,
      );
      if (error instanceof BadGatewayException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Error al obtener análisis de emociones por características debido a un error inesperado',
      );
    }
  }
}
