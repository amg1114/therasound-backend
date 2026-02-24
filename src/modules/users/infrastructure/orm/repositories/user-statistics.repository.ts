import { UserStatisticsEntity } from '@modules/users/domain/entities';
import { IUserStatisticsRepository } from '@modules/users/domain/repositories';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { UserStatisticsMapper } from '../../mappers';
import { UserStatisticsEntityORM } from '../entities';

/**
 * Implementation of the User Statistics Repository using Mongoose ORM.
 *
 * This repository handles all database operations for User Statistics entities,
 * including creation, retrieval, and update operations.
 * It maps between domain entities and ORM entities using the UserStatisticsMapper.
 *
 * @implements {IUserStatisticsRepository}
 */
@Injectable()
export class UserStatisticsRepositoryImpl implements IUserStatisticsRepository {
  constructor(
    @InjectModel(UserStatisticsEntityORM.name)
    private readonly model: Model<UserStatisticsEntityORM>,
  ) {}

  async create(
    userStatistics: Partial<UserStatisticsEntity>,
  ): Promise<UserStatisticsEntity> {
    const ormData = UserStatisticsMapper.toORM(userStatistics);

    let createdStatistics = new this.model(ormData);

    createdStatistics = await createdStatistics.save();

    return UserStatisticsMapper.toDomain(createdStatistics);
  }

  async findById(id: string): Promise<UserStatisticsEntity | null> {
    const ormEntity = await this.model
      .findById(id)
      .populate('likedSongs')
      .populate('dislikedSongs');

    if (!ormEntity) {
      return null;
    }

    return UserStatisticsMapper.toDomain(ormEntity);
  }

  async findByUserId(userId: string): Promise<UserStatisticsEntity | null> {
    // Validate that userId is a valid ObjectId before querying
    if (!Types.ObjectId.isValid(userId)) {
      return null;
    }

    const ormEntity = await this.model
      .findOne({
        userId: new Types.ObjectId(userId),
      })
      .exec();

    if (!ormEntity) {
      return null;
    }

    return UserStatisticsMapper.toDomain(ormEntity);
  }

  async update(
    userStatistics: UserStatisticsEntity,
  ): Promise<UserStatisticsEntity> {
    const ormData = UserStatisticsMapper.toORM(userStatistics);

    const updatedOrmEntity = await this.model.findByIdAndUpdate(
      userStatistics.id,
      ormData,
      { new: true },
    );

    if (!updatedOrmEntity) {
      throw new NotFoundException('Estadísticas de usuario no encontradas');
    }

    return UserStatisticsMapper.toDomain(updatedOrmEntity);
  }
}
