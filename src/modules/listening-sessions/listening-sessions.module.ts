import { PlaylistsModule } from '@modules/playlists/playlists.module';
import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UpdateListeningSessionUseCase } from './application/use-cases/update-listening-session.usecase';
import { LISTENING_SESSION_REPOSITORY } from './domain/repositories/listening-session.repository.interface';
import {
  ListeningSessionSchema,
  MongoListeningSessionEntity,
} from './infrastructure/mongo/entities';
import { MongoListeningSessionRepository } from './infrastructure/mongo/repositories';
import { ListeningSessionController } from './presentation/controllers/listening-session.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: MongoListeningSessionEntity.name,
        schema: ListeningSessionSchema,
      },
    ]),
    forwardRef(() => PlaylistsModule),
  ],
  providers: [
    {
      provide: LISTENING_SESSION_REPOSITORY,
      useClass: MongoListeningSessionRepository,
    },
    UpdateListeningSessionUseCase,
  ],
  exports: [LISTENING_SESSION_REPOSITORY],
  controllers: [ListeningSessionController],
})
export class ListeningSessionsModule {}
