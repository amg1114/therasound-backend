import { SongsModule } from '@modules/songs/songs.module';
import { Module } from '@nestjs/common';
import { SeedFromSpotifyIdUseCase } from './application/use-cases/seed-from-spotify-id.usecase';
import { AdminController } from './presentation/controllers/admin.controller';

@Module({
  imports: [SongsModule],
  providers: [SeedFromSpotifyIdUseCase],
  controllers: [AdminController],
})
export class AdminModule {}
