import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LISTENING_SESSION_REPOSITORY } from './domain/repositories/listening-session.repository.interface';
import {
  ListeningSessionSchema,
  MongoListeningSessionEntity,
} from './infrastructure/mongo/entities';
import { MongoListeningSessionRepository } from './infrastructure/mongo/repositories';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: MongoListeningSessionEntity.name,
        schema: ListeningSessionSchema,
      },
    ]),
  ],
  providers: [
    {
      provide: LISTENING_SESSION_REPOSITORY,
      useClass: MongoListeningSessionRepository,
    },
  ],
  exports: [LISTENING_SESSION_REPOSITORY],
})
export class ListeningSessionsModule {}
