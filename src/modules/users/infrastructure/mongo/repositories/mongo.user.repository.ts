import { UserEntity } from '@modules/users/domain/entities';
import { UserRepository } from '@modules/users/domain/repositories/user.repository.interface';
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserMapper } from '../../mappers/user.mapper';
import { MongoUserEntity } from '../entities/mongo.user.entity';

/**
 * Implementation of the User Repository using Mongoose ORM.
 *
 * This repository handles all database operations for User entities,
 * including creation, retrieval, update, and deletion (CRUD operations).
 * It maps between domain entities and ORM entities using the UserMapper.
 *
 * @implements {UserRepository}
 */
@Injectable()
export class MongoUserRepository implements UserRepository {
  constructor(
    @InjectModel(MongoUserEntity.name)
    private readonly model: Model<MongoUserEntity>,
  ) {}

  async create(user: UserEntity): Promise<UserEntity> {
    const ormData = UserMapper.toMongo(user);

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
        throw new ConflictException('El usuario con este email ya existe');
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

  async save(user: UserEntity): Promise<UserEntity> {
    const ormData = UserMapper.toMongo(user);

    if (ormData.email) {
      const existingUser = await this.model.exists({
        email: ormData.email,
        _id: { $ne: user.id },
      });

      if (existingUser) {
        throw new ConflictException('El usuario con este email ya existe');
      }
    }

    const updatedOrmEntity = await this.model.findByIdAndUpdate(
      user.id,
      ormData,
      { new: true },
    );

    if (!updatedOrmEntity) {
      throw new NotFoundException('Usuario no encontrado');
    }

    return UserMapper.toDomain(updatedOrmEntity);
  }

  async delete(id: string): Promise<void> {
    const result = await this.model.findByIdAndDelete(id);

    if (!result) {
      throw new NotFoundException('Usuario no encontrado');
    }
  }
}
