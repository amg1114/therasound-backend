import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  SongEntityORM,
  SongSchema,
} from './infrastructure/orm/entities/song-entity.orm';
import { SONG_REPOSITORY } from './domain/repositories/song-repository.interface';
import { SongRepositoryImpl } from './infrastructure/orm/repositories/song.repository';
import { ExternalMusicApiService } from './infrastructure/services/external-music-api.service';
import { FetchAndRegisterSongsUseCase } from './application/use-cases/fetch-and-register-songs.usecase';
import { RegisterSongBySpotifyIdUseCase } from './application/use-cases/register-song-by-spotify-id.usecase';
import { SongProcessingService } from './application/services/song-processing.service';
import { SongsController } from './presentation/controllers/songs.controller';
import { UsersModule } from '@modules/users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: SongEntityORM.name,
        schema: SongSchema,
      },
    ]),
    UsersModule,
  ],
  controllers: [SongsController],
  providers: [
    {
      provide: SONG_REPOSITORY,
      useClass: SongRepositoryImpl,
    },
    ExternalMusicApiService,
    SongProcessingService,
    FetchAndRegisterSongsUseCase,
    RegisterSongBySpotifyIdUseCase,
  ],
  exports: [SONG_REPOSITORY, FetchAndRegisterSongsUseCase],
})
export class SongsModule {}
