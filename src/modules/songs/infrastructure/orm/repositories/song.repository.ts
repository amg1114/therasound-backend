import {
  ISongRepository,
  SongFilters,
} from '@modules/songs/domain/repositories/song-repository.interface';
import { InjectModel } from '@nestjs/mongoose';
import { SongEntityORM } from '../entities/song-entity.orm';
import { SongEntity } from '@modules/songs/domain/entities/song.entity';
import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { SongMapper } from '../../mappers/song.mapper';

@Injectable()
export class SongRepositoryImpl implements ISongRepository {
  constructor(
    @InjectModel(SongEntityORM.name)
    private readonly model: Model<SongEntityORM>,
  ) {}

  async findByEmotion(emotion: string): Promise<SongEntity[]> {
    const songs = await this.model.find({ emotion });
    return songs.map((song) => SongMapper.toEntity(song));
  }

  async findByEmotionWithFilters(
    emotion: string,
    filters: SongFilters,
  ): Promise<SongEntity[]> {
    const query: any = { emotion };

    // Exclude disliked songs
    if (filters.excludedSongIds && filters.excludedSongIds.length > 0) {
      query._id = { $nin: filters.excludedSongIds };
    }

    // Exclude disliked artists
    if (filters.excludedArtistIds && filters.excludedArtistIds.length > 0) {
      query.artist = { $nin: filters.excludedArtistIds };
    }

    // Exclude disliked genres
    if (filters.excludedGenres && filters.excludedGenres.length > 0) {
      query.genres = { $nin: filters.excludedGenres };
    }

    const songs = await this.model.find(query);
    return songs.map((song) => SongMapper.toEntity(song));
  }

  async findById(id: string): Promise<SongEntity | null> {
    const song = await this.model.findById(id);
    if (!song) return null;
    return SongMapper.toEntity(song);
  }

  async findBySpotifyId(spotifyId: string): Promise<SongEntity | null> {
    const song = await this.model.findOne({ spotifyId });
    if (!song) return null;
    return SongMapper.toEntity(song);
  }

  async findBySpotifyIds(spotifyIds: string[]): Promise<SongEntity[]> {
    const songs = await this.model.find({ spotifyId: { $in: spotifyIds } });
    return songs.map((song) => SongMapper.toEntity(song));
  }

  async findMany(ids: string[]): Promise<SongEntity[]> {
    const songs = await this.model.find({ _id: { $in: ids } });
    return songs.map((song) => SongMapper.toEntity(song));
  }

  async findManyByEmotion(
    ids: string[],
    emotion: string,
  ): Promise<SongEntity[]> {
    const songs = await this.model.find({
      _id: { $in: ids },
      emotion: emotion,
    });
    return songs.map((song) => SongMapper.toEntity(song));
  }

  async create(song: Partial<SongEntity>): Promise<SongEntity> {
    const ormData = SongMapper.toORM(song);
    const createdSong = await this.model.create(ormData);
    return SongMapper.toEntity(createdSong);
  }

  async createMany(songs: Partial<SongEntity>[]): Promise<SongEntity[]> {
    const createdSongs: SongEntity[] = [];
    for (const song of songs) {
      createdSongs.push(await this.create(song));
    }
    return createdSongs;
  }
}
