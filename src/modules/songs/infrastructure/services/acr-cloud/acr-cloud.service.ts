import { SongExternalDetails } from '@modules/songs/application/services';
import { HttpService } from '@nestjs/axios';
import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { AcrCloudResponseDto } from '../../dto/acr-cloud-response.dto';

@Injectable()
export class AcrCloudMusicService {
  private readonly logger = new Logger(AcrCloudMusicService.name);

  private readonly acrCloudBaseUrl: string;
  private readonly acrCloudAccessKey: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    this.acrCloudBaseUrl = this.configService.getOrThrow<string>(
      'external_apis.urls.acr_cloud',
    );
    this.acrCloudAccessKey = this.configService.getOrThrow<string>(
      'external_apis.keys.acr_cloud',
    );
  }

  async fetchSongDetails(spotifyId: string): Promise<SongExternalDetails> {
    try {
      if (!this.acrCloudAccessKey) {
        throw new InternalServerErrorException(
          'ACRCloud access key not configured',
        );
      }

      const url = `${this.acrCloudBaseUrl}/external-metadata/tracks?source_url=https://open.spotify.com/track/${spotifyId}`;

      const response = await firstValueFrom(
        this.httpService.get<AcrCloudResponseDto>(url, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.acrCloudAccessKey}`,
          },
        }),
      );

      const track = response.data.data[0];
      if (!track) {
        throw new NotFoundException(
          `No data found for song in ACRCloud: ${spotifyId}`,
        );
      }
      this.logger.log(
        `Successfully fetched details from ACRCloud for: ${spotifyId}`,
      );

      const details: SongExternalDetails = {
        title: track.name,
        artistSpotifyIds:
          track.external_metadata.spotify?.[0]?.artists?.map(
            (artist) => artist.id,
          ) || [],
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
