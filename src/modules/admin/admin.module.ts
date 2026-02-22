import { SongsModule } from '@modules/songs/songs.module';
import { Module } from '@nestjs/common';
import { RecalculateEmotionAnalysisUseCase } from './application/use-cases/recalculate-emotion-analysis.usecase';
import { RecalculateTransitionScoringUseCase } from './application/use-cases/recalculate-transition-scoring.usecase';
import { SeedFromLocalUseCase } from './application/use-cases/seed-from-local.usecase';
import { SeedFromSpotifyIdUseCase } from './application/use-cases/seed-from-spotify-id.usecase';
import { AdminController } from './presentation/controllers/admin.controller';

@Module({
  imports: [SongsModule],
  providers: [
    SeedFromSpotifyIdUseCase,
    SeedFromLocalUseCase,
    RecalculateEmotionAnalysisUseCase,
    RecalculateTransitionScoringUseCase,
  ],
  controllers: [AdminController],
})
export class AdminModule {}
