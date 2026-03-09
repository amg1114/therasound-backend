import {
  CreateListeningSessionProps,
  ListeningSessionEntity,
} from '@modules/listening-sessions/domain/entities';
import { ListeningSessionRepository } from '@modules/listening-sessions/domain/repositories/listening-session.repository.interface';
import { NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ListeningSessionMapper } from '../../mappers';
import { MongoListeningSessionEntity } from '../entities';

export class MongoListeningSessionRepository implements ListeningSessionRepository {
  constructor(
    @InjectModel(MongoListeningSessionEntity.name)
    private readonly model: Model<MongoListeningSessionEntity>,
  ) {}

  async create(
    data: CreateListeningSessionProps,
  ): Promise<ListeningSessionEntity> {
    const created = await this.model.create(data);
    return ListeningSessionMapper.toEntity(created);
  }

  async save(
    listeningSession: ListeningSessionEntity,
  ): Promise<ListeningSessionEntity> {
    const ormData = ListeningSessionMapper.toMongo(listeningSession);
    const updated = await this.model.findByIdAndUpdate(
      listeningSession.id,
      ormData,
      {
        new: true,
      },
    );

    if (!updated) {
      throw new NotFoundException(
        `Listening session with id ${listeningSession.id} not found`,
      );
    }

    return ListeningSessionMapper.toEntity(updated);
  }

  async findById(id: string): Promise<ListeningSessionEntity | null> {
    const found = await this.model.findById(id).exec();

    if (!found) {
      return null;
    }

    return ListeningSessionMapper.toEntity(found);
  }
}
