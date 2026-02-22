import { HttpService } from '@nestjs/axios';
import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { AcrCloudResponseDto } from '../dto/acr-cloud-response.dto';

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

  private readonly acrCloudBaseUrl: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    this.acrCloudBaseUrl = this.configService.getOrThrow<string>(
      'external_apis.urls.acr_cloud',
    );
  }

  async getExternalSongDetails(spotifyId: string): Promise<IExternalDetails> {
    try {
      const accessKey = this.configService.get<string>(
        'external_apis.keys.acr_cloud',
      );
      if (!accessKey) {
        throw new InternalServerErrorException(
          'ACRCloud access key not configured',
        );
      }

      const url = `${this.acrCloudBaseUrl}/external-metadata/tracks?source_url=https://open.spotify.com/track/${spotifyId}`;

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
}
