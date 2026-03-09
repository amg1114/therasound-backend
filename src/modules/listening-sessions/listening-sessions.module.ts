import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  ListeningSessionSchema,
  MongoListeningSessionEntity,
} from './infrastructure/mongo/entities';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: MongoListeningSessionEntity.name,
        schema: ListeningSessionSchema,
      },
    ]),
  ],
})
export class ListeningSessionsModule {}
