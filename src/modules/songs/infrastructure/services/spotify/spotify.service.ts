import { ArtistExternalDetails } from '@modules/songs/application/services';
import {
  Injectable,
  InternalServerErrorException,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SpotifyAccessTokenResponse, SpotifyArtist } from './spotify.types';

@Injectable()
export class SpotifyService implements OnModuleInit {
  private readonly logger = new Logger(SpotifyService.name);

  private baseUrl: string;

  private accessToken: string | null = null;
  private tokenExpiresAt: number | null = null;

  constructor(private readonly configService: ConfigService) {
    this.baseUrl = this.configService.getOrThrow<string>(
      'external_apis.urls.spotify',
    );

    this.logger.log(
      `SpotifyService initialized with base URL: ${this.baseUrl}`,
    );
  }

  async onModuleInit() {
    await this.authenticate();
  }

  async getArtistDetails(spotifyId: string): Promise<ArtistExternalDetails> {
    if (
      !this.accessToken ||
      (this.tokenExpiresAt && Date.now() >= this.tokenExpiresAt)
    ) {
      await this.authenticate();
    }

    const response = await this.fetchWithRetry(
      `${this.baseUrl}/artists/${spotifyId}`,
    );

    if (!response.ok) {
      this.logger.error(
        `Failed to fetch artist details from Spotify API: ${response.status} ${response.statusText}`,
      );

      throw new InternalServerErrorException(
        'Failed to fetch artist details from Spotify API',
      );
    }

    const data = (await response.json()) as SpotifyArtist;

    const largestImage =
      data.images.length > 0
        ? data.images.reduce((largest, current) => {
            return current.width > largest.width ? current : largest;
          })
        : null;

    return {
      name: data.name,
      spotifyId: data.id,
      imageUrl: largestImage ? largestImage.url : undefined,
    };
  }

  private async authenticate() {
    const clientId = this.configService.getOrThrow<string>(
      'external_apis.keys.spotify_client_id',
    );
    const clientSecret = this.configService.getOrThrow<string>(
      'external_apis.keys.spotify_client_secret',
    );

    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: clientId,
        client_secret: clientSecret,
      }),
    });

    if (!response.ok) {
      this.logger.error(
        `Failed to authenticate with Spotify API: ${response.status} ${response.statusText}`,
      );
      throw new InternalServerErrorException('Spotify authentication failed');
    }

    const data = (await response.json()) as SpotifyAccessTokenResponse;

    this.accessToken = data.access_token;
    this.tokenExpiresAt = Date.now() + (data.expires_in - 60) * 1000;

    this.logger.log('Successfully authenticated with Spotify API');
  }

  private async fetchWithRetry(url: string, retries = 3): Promise<Response> {
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${this.accessToken}` },
    });

    if (response.status === 429 && retries > 0) {
      const retryAfter = response.headers.get('Retry-After') ?? '5';
      const waitMs = parseInt(retryAfter) * 1000;
      this.logger.warn(`Spotify rate limit hit, waiting ${retryAfter}s...`);
      await new Promise((resolve) => setTimeout(resolve, waitMs));
      return this.fetchWithRetry(url, retries - 1);
    }

    return response;
  }
}
