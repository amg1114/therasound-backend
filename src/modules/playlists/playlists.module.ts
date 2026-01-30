import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  PlaylistEntityORM,
  PlaylistSchema,
} from './infrastructure/orm/entities/playlist-entity.orm';
import { PLAYLIST_REPOSITORY } from './domain/repositories/playlist-repository.interface';
import { PlaylistRepositoryImpl } from './infrastructure/orm/repositories/playlist.repository';
import { GeneratePlaylistUseCase } from './application/use-cases/generate-playlist.usecase';
import { EmotionMappingService } from './application/services/emotion-mapping.service';
import { ChatbotModule } from '@modules/chatbot/chatbot.module';
import { SongsModule } from '@modules/songs/songs.module';
import { UsersModule } from '@modules/users/users.module';
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
    EmotionMappingService,
    GeneratePlaylistUseCase,
  ],
  exports: [PLAYLIST_REPOSITORY, GeneratePlaylistUseCase],
})
export class PlaylistsModule {}
