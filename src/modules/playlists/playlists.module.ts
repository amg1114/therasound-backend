import { ChatbotModule } from '@modules/chatbot/chatbot.module';
import { SongsModule } from '@modules/songs/songs.module';
import { UsersModule } from '@modules/users/users.module';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SongScoringService } from '../songs/application/services/song-scoring.service';
import { PlaylistBuilderService } from './application/services/playlist-builder.service';
import { GeneratePlaylistUseCase } from './application/use-cases/generate-playlist.usecase';
import { GetPlaylistByIdUseCase } from './application/use-cases/get-playlist-by-id.usecase';
import { GetUserPlaylistsUseCase } from './application/use-cases/get-user-playlists.usecase';
import { PLAYLIST_REPOSITORY } from './domain/repositories/playlist-repository.interface';
import {
  PlaylistEntityORM,
  PlaylistSchema,
} from './infrastructure/orm/entities/playlist-entity.orm';
import { PlaylistRepositoryImpl } from './infrastructure/orm/repositories/playlist.repository';
import { PlaylistsController } from './presentation/controllers/playlists.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: PlaylistEntityORM.name,
        schema: PlaylistSchema,
      },
    ]),
    ChatbotModule,
    SongsModule,
    UsersModule,
  ],
  controllers: [PlaylistsController],
  providers: [
    {
      provide: PLAYLIST_REPOSITORY,
      useClass: PlaylistRepositoryImpl,
    },

    SongScoringService,
    PlaylistBuilderService,

    GeneratePlaylistUseCase,
    GetPlaylistByIdUseCase,
    GetUserPlaylistsUseCase,
  ],
  exports: [PLAYLIST_REPOSITORY, GeneratePlaylistUseCase],
})
export class PlaylistsModule {}
