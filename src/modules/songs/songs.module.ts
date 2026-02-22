import { GenresModule } from '@modules/genres/genres.module';
import {
  FailedSpotifyTrackOrmEntity,
  FailedSpotifyTrackSchema,
} from '@modules/songs/infrastructure/orm/entities/failed-spotify-entity.orm';
import { UsersModule } from '@modules/users/users.module';
import { HttpModule } from '@nestjs/axios';
import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SongCreatedListener } from './application/listeners/song-created.listener';
import { GetSongByIdUseCase } from './application/use-cases/get-song-by-id.usecase';
import { SONG_REPOSITORY } from './domain/repositories/song-repository.interface';
import {
  SongEntityORM,
  SongSchema,
} from './infrastructure/orm/entities/song-entity.orm';
import { FailedSpotifyTrackRepository } from './infrastructure/orm/repositories/failed-spotify.repository';
import { SongRepositoryImpl } from './infrastructure/orm/repositories/song.repository';

import {
  AudioProcessingService,
  ExternalMusicApiService,
  SongEmotionService,
  SongProcessingService,
  SongScoringService,
} from './application/services';
import { SongsController } from './presentation/controllers/songs.controller';

@Module({
  imports: [
    HttpModule,
    MongooseModule.forFeature([
      {
        name: SongEntityORM.name,
        schema: SongSchema,
      },
      {
        name: FailedSpotifyTrackOrmEntity.name,
        schema: FailedSpotifyTrackSchema,
      },
    ]),
    GenresModule,
    forwardRef(() => UsersModule),
  ],
  controllers: [SongsController],
  providers: [
    {
      provide: SONG_REPOSITORY,
      useClass: SongRepositoryImpl,
    },

    ExternalMusicApiService,

    AudioProcessingService,
    SongEmotionService,
    SongProcessingService,
    SongScoringService,

    GetSongByIdUseCase,
    SongCreatedListener,
    FailedSpotifyTrackRepository,
  ],
  exports: [
    SONG_REPOSITORY,
    ExternalMusicApiService,
    AudioProcessingService,
    SongProcessingService,
    SongScoringService,
    SongEmotionService,
  ],
})
export class SongsModule {}
