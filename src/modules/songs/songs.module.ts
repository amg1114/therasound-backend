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

import { ArtistsModule } from '@modules/artists/artists.module';
import { SongReactionListener } from './application/listeners/song-reaction.listener';
import {
  AudioProcessingService,
  SongEmotionService,
  SongProcessingService,
  SongScoringService,
} from './application/services';
import { AcrCloudMusicService } from './infrastructure/services/acr-cloud';
import { SpotifyService } from './infrastructure/services/spotify';
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
    ArtistsModule,
    forwardRef(() => UsersModule),
  ],
  controllers: [SongsController],
  providers: [
    {
      provide: SONG_REPOSITORY,
      useClass: SongRepositoryImpl,
    },

    AcrCloudMusicService,
    SpotifyService,

    AudioProcessingService,
    SongEmotionService,
    SongProcessingService,
    SongScoringService,

    SongCreatedListener,
    SongReactionListener,

    GetSongByIdUseCase,
    FailedSpotifyTrackRepository,
  ],
  exports: [
    SONG_REPOSITORY,
    SpotifyService,
    AcrCloudMusicService,
    AudioProcessingService,
    SongProcessingService,
    SongScoringService,
    SongEmotionService,
  ],
})
export class SongsModule {}
