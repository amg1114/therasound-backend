import { ApiEndpoint } from '@common/decorators';
import { SeedFromLocalUseCase } from '@modules/admin/application/use-cases/seed-from-local.usecase';
import { SeedFromSpotifyIdUseCase } from '@modules/admin/application/use-cases/seed-from-spotify-id.usecase';
import { PublicRoute } from '@modules/auth/infrastructure/decorators/public-route.decorator';
import { type IReccoBeatsAudioFeaturesQueries } from '@modules/songs/infrastructure/services/external-music-api.service';
import {
  Body,
  Controller,
  ParseArrayPipe,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBody } from '@nestjs/swagger';

@Controller('admin')
export class AdminController {
  constructor(
    private readonly seedFromSpotifyIdUseCase: SeedFromSpotifyIdUseCase,
    private readonly seedFromLocalUseCase: SeedFromLocalUseCase,
  ) {}

  @ApiEndpoint({
    summary: 'Seed songs from Spotify IDs',
    description:
      'Seeds songs into the database based on provided Spotify track IDs. Optionally specify the number of recommendations to fetch for each seed ID.',

    queries: [
      {
        name: 'positiveSeeds',
        description: 'Array of Spotify track IDs to seed from',
      },
      {
        name: 'negativeSeeds',
        description: 'Array of Spotify track IDs to avoid in recommendations',
        required: false,
      },

      {
        name: 'size',
        description:
          'Number of recommendations to fetch for each seed ID (default is 50)',
        required: false,
      },
    ],

    responses: [
      {
        status: 201,
        description: 'Songs successfully seeded',
      },
      {
        status: 404,
        description: 'No recommendations found for the provided Spotify IDs',
      },
    ],
  })
  @Post('/seed')
  @ApiBody({
    description: 'Optional audio features to filter recommendations',
    required: false,
    schema: {
      type: 'object',
      properties: {
        danceability: { type: 'number', example: 0.8 },
        energy: { type: 'number', example: 0.6 },
        instrumentalness: { type: 'number', example: 0.0 },
        key: { type: 'number', example: 5 },
        liveness: { type: 'number', example: 0.1 },
        loudness: { type: 'number', example: -5.0 },
        mode: { type: 'number', example: 1 },
        speechiness: { type: 'number', example: 0.05 },
        tempo: { type: 'number', example: 120.0 },
        valence: { type: 'number', example: 0.9 },
        popularity: { type: 'number', example: 80 },
        featureWeight: { type: 'number', example: 0.7 },
      },
    },
  })
  @PublicRoute()
  async seedFromSpotifyId(
    @Query(
      'positiveSeeds',
      new ParseArrayPipe({ items: String, separator: ',', optional: true }),
    )
    positiveSeeds: string[],
    @Query(
      'negativeSeeds',
      new ParseArrayPipe({ items: String, separator: ',', optional: true }),
    )
    negativeSeeds?: string[],
    @Query(
      'size',
      new ParseIntPipe({
        optional: true,
      }),
    )
    size?: number,
    @Body() audioFeatures?: IReccoBeatsAudioFeaturesQueries,
  ) {
    return this.seedFromSpotifyIdUseCase.execute(
      positiveSeeds,
      negativeSeeds,
      size,
      audioFeatures,
    );
  }

  @ApiEndpoint({
    summary: 'Seed songs from local CSV file',
    description:
      'Reads and processes songs from the local CSV file (278k_labelled_uri.csv). Optionally limit the number of records to process.',

    queries: [
      {
        name: 'limit',
        description: 'Maximum number of records to process from the CSV',
        required: false,
      },
      {
        name: 'label',
        description:
          'Optional label to filter records by (e.g., "0" = Sad, "1" = Happy, "2" = Energetic, "3" = Calm). If provided, only records with the matching label will be processed.',
        required: false,
      },
    ],

    responses: [
      {
        status: 201,
        description: 'CSV processing completed',
      },
      {
        status: 500,
        description: 'Error reading or processing CSV file',
      },
    ],
  })
  @Post('/seed/local')
  @PublicRoute()
  async seedFromLocal(
    @Query(
      'limit',
      new ParseIntPipe({
        optional: true,
      }),
    )
    limit?: number,
    @Query('label') label?: string,
  ) {
    return this.seedFromLocalUseCase.execute(limit, label);
  }
}
