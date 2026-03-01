import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ARTIST_REPOSITORY } from './domain/repositories';
import {
  ArtistSchema,
  MongoArtistEntity,
} from './infrastructure/mongo/entities';
import { MongoArtistRepository } from './infrastructure/mongo/repositories/mongo.artist.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: MongoArtistEntity.name,
        schema: ArtistSchema,
      },
    ]),
  ],
  providers: [
    {
      provide: ARTIST_REPOSITORY,
      useClass: MongoArtistRepository,
    },
  ],
  exports: [ARTIST_REPOSITORY],
})
export class ArtistsModule {}
