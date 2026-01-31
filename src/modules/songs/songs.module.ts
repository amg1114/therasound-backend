import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  SongEntityORM,
  SongSchema,
} from './infrastructure/orm/entities/song-entity.orm';
import {
  GenreEntityORM,
  GenreSchema,
} from './infrastructure/orm/entities/genre-entity.orm';
import { SONG_REPOSITORY } from './domain/repositories/song-repository.interface';
import { GENRE_REPOSITORY } from './domain/repositories/genre-repository.interface';
import { SongRepositoryImpl } from './infrastructure/orm/repositories/song.repository';
import { GenreRepositoryImpl } from './infrastructure/orm/repositories/genre.repository';
import { ExternalMusicApiService } from './infrastructure/services/external-music-api.service';
import { FetchAndRegisterSongsUseCase } from './application/use-cases/fetch-and-register-songs.usecase';
import { RegisterSongBySpotifyIdUseCase } from './application/use-cases/register-song-by-spotify-id.usecase';
import { GetSongByIdUseCase } from './application/use-cases/get-song-by-id.usecase';
import { GetAllGenresUseCase } from './application/use-cases/get-all-genres.usecase';
import { GetGenreByIdUseCase } from './application/use-cases/get-genre-by-id.usecase';
import { SongProcessingService } from './application/services/song-processing.service';
import { SongsController } from './presentation/controllers/songs.controller';
import { GenresController } from './presentation/controllers/genres.controller';
import { UsersModule } from '@modules/users/users.module';
import { SongCreatedListener } from './application/listeners/song-created.listener';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: SongEntityORM.name,
        schema: SongSchema,
      },
      {
        name: GenreEntityORM.name,
        schema: GenreSchema,
      },
    ]),
    forwardRef(() => UsersModule),
  ],
  controllers: [SongsController, GenresController],
  providers: [
    {
      provide: SONG_REPOSITORY,
      useClass: SongRepositoryImpl,
    },
    {
      provide: GENRE_REPOSITORY,
      useClass: GenreRepositoryImpl,
    },
    ExternalMusicApiService,
    SongProcessingService,
    FetchAndRegisterSongsUseCase,
    GetSongByIdUseCase,
    RegisterSongBySpotifyIdUseCase,
    GetAllGenresUseCase,
    GetGenreByIdUseCase,
    SongCreatedListener,
  ],
  exports: [SONG_REPOSITORY, FetchAndRegisterSongsUseCase],
})
export class SongsModule {}
