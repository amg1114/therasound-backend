import { SongsModule } from '@modules/songs/songs.module';
import { Module } from '@nestjs/common';
import { SeedFromLocalUseCase } from './application/use-cases/seed-from-local.usecase';
import { SeedFromSpotifyIdUseCase } from './application/use-cases/seed-from-spotify-id.usecase';
import { AdminController } from './presentation/controllers/admin.controller';

@Module({
  imports: [SongsModule],
  providers: [SeedFromSpotifyIdUseCase, SeedFromLocalUseCase],
  controllers: [AdminController],
})
export class AdminModule {}
