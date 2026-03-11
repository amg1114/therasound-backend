import { PlaylistEntity } from '@modules/playlists/domain/entities/playlist.entity';
import { IPlaylistRepository } from '@modules/playlists/domain/repositories/playlist-repository.interface';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { PlaylistMapper } from '../../mappers/playlist.mapper';
import { PlaylistEntityORM } from '../entities/playlist-entity.orm';

/**
 * Implementation of the Playlist Repository using Mongoose ORM.
 *
 * This repository handles all database operations for Playlist entities,
 * including creation, retrieval, update, and deletion (CRUD operations).
 * It maps between domain entities and ORM entities using the PlaylistMapper.
 *
 * @implements {IPlaylistRepository}
 */
@Injectable()
export class PlaylistRepositoryImpl implements IPlaylistRepository {
  constructor(
    @InjectModel(PlaylistEntityORM.name)
    private readonly model: Model<PlaylistEntityORM>,
  ) {}

  async create(playlist: Partial<PlaylistEntity>): Promise<PlaylistEntity> {
    const ormData = PlaylistMapper.toORM(playlist);

    let createdPlaylist = new this.model(ormData);
    createdPlaylist = await createdPlaylist.save();

    return PlaylistMapper.toDomain(createdPlaylist);
  }

  async findById(id: string): Promise<PlaylistEntity | null> {
    const ormEntity = await this.model.findById(id);

    if (!ormEntity) {
      return null;
    }

    return PlaylistMapper.toDomain(ormEntity);
  }

  async findByUserId(userId: string): Promise<PlaylistEntity[]> {
    const ormEntities = await this.model
      .find({ userId: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 });

    return ormEntities.map((entity) => PlaylistMapper.toDomain(entity));
  }

  async findRecentByUserId(
    userId: string,
    limit: number,
  ): Promise<PlaylistEntity[]> {
    const ormEntities = await this.model
      .find({ userId: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();

    return ormEntities.map((entity) => PlaylistMapper.toDomain(entity));
  }

  async update(playlist: PlaylistEntity): Promise<PlaylistEntity> {
    const ormData = PlaylistMapper.toORM(playlist);

    const updatedOrmEntity = await this.model.findByIdAndUpdate(
      playlist.id,
      ormData,
      { new: true },
    );

    if (!updatedOrmEntity) {
      throw new NotFoundException('Lista de reproducción no encontrada');
    }

    return PlaylistMapper.toDomain(updatedOrmEntity);
  }

  async delete(id: string): Promise<void> {
    const result = await this.model.findByIdAndDelete(id);

    if (!result) {
      throw new NotFoundException('Lista de reproducción no encontrada');
    }
  }
}
