import { IPlaylistRepository } from '@modules/playlists/domain/repositories/playlist-repository.interface';
import { InjectModel } from '@nestjs/mongoose';
import { PlaylistEntityORM } from '../entities/playlist-entity.orm';
import { PlaylistEntity } from '@modules/playlists/domain/entities/playlist.entity';
import { Model } from 'mongoose';
import { Injectable, NotFoundException } from '@nestjs/common';
import { PlaylistMapper } from '../../mappers/playlist.mapper';

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
      .find({ userId })
      .sort({ createdAt: -1 });

    return ormEntities.map((entity) => PlaylistMapper.toDomain(entity));
  }

  async findLastByUserIdAndEmotion(
    userId: string,
    emotion: string,
  ): Promise<PlaylistEntity | null> {
    const ormEntity = await this.model
      .findOne({ userId, emotion })
      .sort({ createdAt: -1 });

    if (!ormEntity) {
      return null;
    }

    return PlaylistMapper.toDomain(ormEntity);
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
