import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GetAllGenresUseCase } from './application/use-cases/get-all-genres.usecase';
import { GetGenreByIdUseCase } from './application/use-cases/get-genre-by-id.usecase';
import { GENRE_REPOSITORY } from './domain/repositories/genre-repository.interface';
import {
  GenreEntityORM,
  GenreSchema,
} from './infrastructure/orm/entities/genre-entity.orm';
import { GenreRepositoryImpl } from './infrastructure/orm/repositories/genre.repository';
import { GenresController } from './presentation/controllers/genres.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: GenreEntityORM.name,
        schema: GenreSchema,
      },
    ]),
  ],
  controllers: [GenresController],
  providers: [
    {
      provide: GENRE_REPOSITORY,
      useClass: GenreRepositoryImpl,
    },
    GetAllGenresUseCase,
    GetGenreByIdUseCase,
  ],
  exports: [GENRE_REPOSITORY],
})
export class GenresModule {}
