import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  SongEntityORM,
  SongSchema,
} from './infrastructure/orm/entities/song-entity.orm';
import { SONG_REPOSITORY } from './domain/repositories/song-repository.interface';
import { SongRepositoryImpl } from './infrastructure/orm/repositories/song.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: SongEntityORM.name,
        schema: SongSchema,
      },
    ]),
  ],
  providers: [
    {
      provide: SONG_REPOSITORY,
      useClass: SongRepositoryImpl,
    },
  ],
  exports: [SONG_REPOSITORY],
})
export class SongsModule {}
