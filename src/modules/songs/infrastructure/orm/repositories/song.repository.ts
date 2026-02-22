import { SongCreatedEvent } from '@modules/songs/application/events/song-created.event';
import { SongEntity } from '@modules/songs/domain/entities/song.entity';
import {
  ISongRepository,
  SongFilters,
} from '@modules/songs/domain/repositories/song-repository.interface';
import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectModel } from '@nestjs/mongoose';
import { Model, QueryFilter, Types } from 'mongoose';
import { SongMapper } from '../../mappers/song.mapper';
import { SongEntityORM } from '../entities/song-entity.orm';

@Injectable()
export class SongRepositoryImpl implements ISongRepository {
  constructor(
    @InjectModel(SongEntityORM.name)
    private readonly model: Model<SongEntityORM>,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async findById(id: string): Promise<SongEntity | null> {
    const song = await this.model.findById(id);
    if (!song) return null;
    return SongMapper.toEntity(song);
  }

  async findAll(): Promise<SongEntity[]> {
    const songs = await this.model.find();
    return songs.map((song) => SongMapper.toEntity(song));
  }

  async findPaginated(skip: number, limit: number): Promise<SongEntity[]> {
    const songs = await this.model.find().skip(skip).limit(limit);
    return songs.map((song) => SongMapper.toEntity(song));
  }

  async findManyBySpotifyIds(spotifyIds: string[]): Promise<SongEntity[]> {
    const songs = await this.model.find({
      spotifyId: { $in: spotifyIds },
    });
    return songs.map((song) => SongMapper.toEntity(song));
  }

  async findPopular(
    limit: number,
    filters?: SongFilters,
  ): Promise<SongEntity[]> {
    const query = this.buildQueryFilters(filters);

    const songs = await this.model
      .find(query)
      .sort({ likesCount: -1 })
      .limit(limit);

    return songs.map((song) => SongMapper.toEntity(song));
  }

  async findManyByReccoBeatsIds(
    reccoBeatsIds: string[],
  ): Promise<SongEntity[]> {
    const songs = await this.model.find({
      reccoBeatsId: { $in: reccoBeatsIds },
    });
    return songs.map((song) => SongMapper.toEntity(song));
  }

  async create(song: Partial<SongEntity>): Promise<SongEntity> {
    const ormData = SongMapper.toORM(song);
    const createdSong = await this.model.create(ormData);
    const songEntity = SongMapper.toEntity(createdSong);

    // Emit song created event
    this.eventEmitter.emit(
      'song.created',
      new SongCreatedEvent(songEntity.id, songEntity.genres),
    );

    return songEntity;
  }

  save(song: SongEntity): Promise<SongEntity> {
    const ormData = SongMapper.toORM(song);
    return this.model
      .findByIdAndUpdate(song.id, ormData, { new: true })
      .then((updated) => {
        if (!updated) {
          throw new Error(`Song with id ${song.id} not found for update`);
        }
        return SongMapper.toEntity(updated);
      });
  }

  async createMany(songs: Partial<SongEntity>[]): Promise<SongEntity[]> {
    const createdSongs: SongEntity[] = [];
    for (const song of songs) {
      createdSongs.push(await this.create(song));
    }
    return createdSongs;
  }

  async incrementLikesCount(songId: string): Promise<void> {
    await this.model.updateOne({ _id: songId }, { $inc: { likesCount: 1 } });
  }

  async decrementLikesCount(songId: string): Promise<void> {
    await this.model.updateOne({ _id: songId }, { $inc: { likesCount: -1 } });
  }

  async existsByReccoBeatsId(reccoBeatsId: string): Promise<boolean> {
    const count = await this.model.countDocuments({ reccoBeatsId });
    return count > 0;
  }

  async existsBySpotifyId(spotifyId: string): Promise<boolean> {
    const count = await this.model.countDocuments({ spotifyId });
    return count > 0;
  }

  private buildQueryFilters(filters?: SongFilters): QueryFilter<SongEntityORM> {
    const query: QueryFilter<SongEntityORM> = {};

    if (filters?.excludedSongIds) {
      query._id = {
        $nin: filters.excludedSongIds.map((id) => new Types.ObjectId(id)),
      };
    }

    if (filters?.excludedArtists) {
      query.artist = { $nin: filters.excludedArtists };
    }

    if (filters?.deseableArtists) {
      query.artist = { $in: filters.deseableArtists };
    }

    if (filters?.excludedGenres) {
      query.genres = { $nin: filters.excludedGenres };
    }

    if (filters?.deseableGenres) {
      query.genres = { $in: filters.deseableGenres };
    }

    return query;
  }
}
