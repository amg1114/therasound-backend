import { GenresModule } from '@modules/genres/genres.module';
import { UsersModule } from '@modules/users/users.module';
import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SongCreatedListener } from './application/listeners/song-created.listener';
import { GetSongByIdUseCase } from './application/use-cases/get-song-by-id.usecase';
import { SONG_REPOSITORY } from './domain/repositories/song-repository.interface';
import {
  SongEntityORM,
  SongSchema,
} from './infrastructure/orm/entities/song-entity.orm';
import { SongRepositoryImpl } from './infrastructure/orm/repositories/song.repository';
import { ExternalMusicApiService } from './infrastructure/services/external-music-api.service';
import { SongsController } from './presentation/controllers/songs.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: SongEntityORM.name,
        schema: SongSchema,
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
    GetSongByIdUseCase,
    SongCreatedListener,
  ],
  exports: [SONG_REPOSITORY, ExternalMusicApiService],
})
export class SongsModule {}
