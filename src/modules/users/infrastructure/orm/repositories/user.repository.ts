import { IUserRepository } from '@modules/users/domain/repositories/user-repository.interface';
import { InjectModel } from '@nestjs/mongoose';
import { UserEntityORM } from '../entities/user-entity.orm';
import { UserEntity } from '@modules/users/domain/entities/user.entity';
import { Model } from 'mongoose';
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UserMapper } from '../../mappers/user.mapper';

/**
 * Implementation of the User Repository using Mongoose ORM.
 *
 * This repository handles all database operations for User entities,
 * including creation, retrieval, update, and deletion (CRUD operations).
 * It maps between domain entities and ORM entities using the UserMapper.
 *
 * @implements {IUserRepository}
 */
@Injectable()
export class UserRepositoryImpl implements IUserRepository {
  constructor(
    @InjectModel(UserEntityORM.name)
    private readonly model: Model<UserEntityORM>,
  ) {}

  async create(user: UserEntity): Promise<UserEntity> {
    const ormData = UserMapper.toORM(user);

    let createdUser = new this.model(ormData);

    try {
      createdUser = await createdUser.save();
    } catch (error: unknown) {
      const err: any = error;

      if (
        err &&
        err.code === 11000 &&
        (err.keyPattern?.email || err.keyValue?.email)
      ) {
        throw new ConflictException('User with this email already exists');
      }

      throw error;
    }
    return UserMapper.toDomain(createdUser);
  }

  async findById(id: string): Promise<UserEntity | null> {
    const ormEntity = await this.model.findById(id);

    if (!ormEntity) {
      return null;
    }

    return UserMapper.toDomain(ormEntity);
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    const ormEntity = await this.model.findOne({ email });

    if (!ormEntity) {
      return null;
    }

    return UserMapper.toDomain(ormEntity);
  }

  async update(user: UserEntity): Promise<UserEntity> {
    const ormData = UserMapper.toORM(user);

    if (ormData.email) {
      const existingUser = await this.model.exists({
        email: ormData.email,
        _id: { $ne: user.id },
      });

      if (existingUser) {
        throw new ConflictException('User with this email already exists');
      }
    }

    const updatedOrmEntity = await this.model.findByIdAndUpdate(
      user.id,
      ormData,
      { new: true },
    );

    if (!updatedOrmEntity) {
      throw new NotFoundException('User not found');
    }

    return UserMapper.toDomain(updatedOrmEntity);
  }

  async delete(id: string): Promise<void> {
    const result = await this.model.findByIdAndDelete(id);

    if (!result) {
      throw new NotFoundException('User not found');
    }
  }
}
