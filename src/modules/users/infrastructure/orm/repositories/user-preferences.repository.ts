import { IUserPreferencesRepository } from '@modules/users/domain/repositories/user-preferences-repository.interface';
import { InjectModel } from '@nestjs/mongoose';
import { UserPreferencesEntityORM } from '../entities/user-preferences-entity.orm';
import { UserPreferencesEntity } from '@modules/users/domain/entities/user-preferences.entity';
import { Model } from 'mongoose';
import { Injectable, NotFoundException } from '@nestjs/common';
import { UserPreferencesMapper } from '../../mappers/user-preferences.mapper';

/**
 * Implementation of the User Preferences Repository using Mongoose ORM.
 *
 * This repository handles all database operations for User Preferences entities,
 * including creation, retrieval, and update operations.
 * It maps between domain entities and ORM entities using the UserPreferencesMapper.
 *
 * @implements {IUserPreferencesRepository}
 */
@Injectable()
export class UserPreferencesRepositoryImpl implements IUserPreferencesRepository {
  constructor(
    @InjectModel(UserPreferencesEntityORM.name)
    private readonly model: Model<UserPreferencesEntityORM>,
  ) {}

  async create(
    userPreferences: UserPreferencesEntity,
  ): Promise<UserPreferencesEntity> {
    const ormData = UserPreferencesMapper.toORM(userPreferences);

    let createdPreferences = new this.model(ormData);

    createdPreferences = await createdPreferences.save();

    return UserPreferencesMapper.toDomain(createdPreferences);
  }

  async findById(id: string): Promise<UserPreferencesEntity | null> {
    const ormEntity = await this.model
      .findById(id)
      .populate('likedSongs')
      .populate('dislikedSongs');

    if (!ormEntity) {
      return null;
    }

    return UserPreferencesMapper.toDomain(ormEntity);
  }

  async findByUserId(userId: string): Promise<UserPreferencesEntity | null> {
    const ormEntity = await this.model
      .findOne({ user: userId })
      .populate('likedSongs')
      .populate('dislikedSongs');

    if (!ormEntity) {
      return null;
    }

    return UserPreferencesMapper.toDomain(ormEntity);
  }

  async update(
    userPreferences: UserPreferencesEntity,
  ): Promise<UserPreferencesEntity> {
    const ormData = UserPreferencesMapper.toORM(userPreferences);

    const updatedOrmEntity = await this.model.findByIdAndUpdate(
      userPreferences.id,
      ormData,
      { new: true },
    );

    if (!updatedOrmEntity) {
      throw new NotFoundException('Preferencias de usuario no encontradas');
    }

    return UserPreferencesMapper.toDomain(updatedOrmEntity);
  }
}
