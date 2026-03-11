import { ChatbotModule } from '@modules/chatbot/chatbot.module';
import { ListeningSessionsModule } from '@modules/listening-sessions/listening-sessions.module';
import { SongsModule } from '@modules/songs/songs.module';
import { UsersModule } from '@modules/users/users.module';
import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
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
    forwardRef(() => SongsModule),
    forwardRef(() => UsersModule),
    forwardRef(() => ListeningSessionsModule),
  ],
  controllers: [PlaylistsController],
  providers: [
    {
      provide: PLAYLIST_REPOSITORY,
      useClass: PlaylistRepositoryImpl,
    },

    PlaylistBuilderService,

    GeneratePlaylistUseCase,
    GetPlaylistByIdUseCase,
    GetUserPlaylistsUseCase,
  ],
  exports: [PLAYLIST_REPOSITORY, GeneratePlaylistUseCase],
})
export class PlaylistsModule {}
