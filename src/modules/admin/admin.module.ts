import { SongsModule } from '@modules/songs/songs.module';
import { Module } from '@nestjs/common';
import { RecalculateSongEmotionUseCase } from './application/use-cases/recalculate-transition-scoring.usecase';
import { SeedFromLocalUseCase } from './application/use-cases/seed-from-local.usecase';
import { AdminController } from './presentation/controllers/admin.controller';

@Module({
  imports: [SongsModule],
  providers: [SeedFromLocalUseCase, RecalculateSongEmotionUseCase],
  controllers: [AdminController],
})
export class AdminModule {}
