import { ApiEndpoint } from '@common/infrastructure/decorators';
import { UpdateArtistsDetails } from '@modules/admin/application/use-cases';
import { RecalculateSongEmotionUseCase } from '@modules/admin/application/use-cases/recalculate-transition-scoring.usecase';
import { SeedFromLocalUseCase } from '@modules/admin/application/use-cases/seed-from-local.usecase';
import { RebuildGenresAndArtistsUseCase } from '@modules/admin/application/use-cases/rebuild-genres-and-artists.usecase';
import { PublicRoute } from '@modules/auth/infrastructure/decorators/public-route.decorator';
import { Controller, Patch, Post, Query } from '@nestjs/common';
import { SeedLocalQueryDto } from '../dto/queries/seed-queries.dto';

@Controller('admin')
export class AdminController {
  constructor(
    private readonly seedFromLocalUseCase: SeedFromLocalUseCase,
    private readonly recalculateSongEmotionUseCase: RecalculateSongEmotionUseCase,
    private readonly updateArtistsDetailsUseCase: UpdateArtistsDetails,
    private readonly rebuildGenresAndArtistsUseCase: RebuildGenresAndArtistsUseCase,
  ) {}

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
    @Query()
    queries: SeedLocalQueryDto,
  ) {
    return this.seedFromLocalUseCase.execute(queries.limit, queries.label);
  }

  @ApiEndpoint({
    summary: 'Recalculate song emotion scores',
    description:
      'Triggers a recalculation of emotion scores for all songs in the database. This is useful if the scoring algorithm has been updated or if there are new songs that need to be scored.',
    responses: [
      {
        status: 200,
        description: 'Recalculation completed successfully',
      },
      {
        status: 500,
        description: 'Error during recalculation process',
      },
    ],
  })
  @Patch('/recalculate-song-emotion')
  @PublicRoute()
  async recalculateSongEmotion() {
    return this.recalculateSongEmotionUseCase.execute();
  }

  @ApiEndpoint({
    summary: 'Update artists details',
    description:
      'Updates the details of all artists in the database with fresh data from Spotify.',
    responses: [
      {
        status: 200,
        description: 'Artists details updated successfully',
      },
      {
        status: 500,
        description: 'Error during artists details update process',
      },
    ],
  })
  @Patch('/update-artists-details')
  @PublicRoute()
  async updateArtistsDetails() {
    return this.updateArtistsDetailsUseCase.execute();
  }

  @ApiEndpoint({
    summary: 'Rebuild genres and artists documents',
    description:
      'Rebuilds the genres and artists documents by scanning all songs in the database. Extracts all genres and artists, deduplicates them (case-insensitive), and creates or updates their corresponding records with accurate song counts.',
    responses: [
      {
        status: 200,
        description: 'Rebuild completed successfully',
      },
      {
        status: 500,
        description: 'Error during rebuild process',
      },
    ],
  })
  @Patch('/rebuild-genres-and-artists')
  @PublicRoute()
  async rebuildGenresAndArtists() {
    return this.rebuildGenresAndArtistsUseCase.execute();
  }
}
