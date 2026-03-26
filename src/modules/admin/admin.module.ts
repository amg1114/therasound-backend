import { SongsModule } from '@modules/songs/songs.module';
import { GenresModule } from '@modules/genres/genres.module';
import { ArtistsModule } from '@modules/artists/artists.module';
import { Module } from '@nestjs/common';
import { UpdateArtistsDetails } from './application/use-cases';
import { RecalculateSongEmotionUseCase } from './application/use-cases/recalculate-transition-scoring.usecase';
import { SeedFromLocalUseCase } from './application/use-cases/seed-from-local.usecase';
import { RebuildGenresAndArtistsUseCase } from './application/use-cases/rebuild-genres-and-artists.usecase';
import { AdminController } from './presentation/controllers/admin.controller';

@Module({
  imports: [SongsModule, GenresModule, ArtistsModule],
  providers: [
    SeedFromLocalUseCase,
    RecalculateSongEmotionUseCase,
    UpdateArtistsDetails,
    RebuildGenresAndArtistsUseCase,
  ],
  controllers: [AdminController],
})
export class AdminModule {}
