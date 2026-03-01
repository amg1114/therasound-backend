import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  ArtistSchema,
  MongoArtistEntity,
} from './infrastructure/mongo/entities';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: MongoArtistEntity.name,
        schema: ArtistSchema,
      },
    ]),
  ],
})
export class ArtistsModule {}
