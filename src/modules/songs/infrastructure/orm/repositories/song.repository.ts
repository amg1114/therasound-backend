import { EmotionVO } from '@common/domain/value-objects/emotion.vo';
import { SongEntity } from '@modules/songs/domain/entities/song.entity';
import {
  ISongRepository,
  SongFilters,
} from '@modules/songs/domain/repositories/song-repository.interface';
import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectModel } from '@nestjs/mongoose';
import { Model, QueryFilter, Types } from 'mongoose';
import { SongMapper } from '../../mappers/song.mapper';
import { SongEntityORM } from '../entities/song-entity.orm';
import { ContentPreferences } from '@modules/users/domain/entities/types/content-preference.type';

@Injectable()
export class SongRepositoryImpl implements ISongRepository {
  private readonly logger = new Logger(SongRepositoryImpl.name);

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
    // this.eventEmitter.emit('song.created', songEntity);

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

  async findPlaylistCandidates(
    limitPerEmotion = 125,
    initialMaxDistance = 0.35,
    preferences?: { likes: ContentPreferences; dislikes: ContentPreferences },
  ): Promise<SongEntity[]> {
    const emotions = EmotionVO.SONG_EMOTIONS;

    // Filtros de exclusión (dislikes)
    const excludeFilter: Record<string, any> = {};
    if (preferences?.dislikes) {
      const { songs, genres, artists } = preferences.dislikes;
      if (songs?.length)
        excludeFilter.spotifyId = { $nin: songs.map((s) => s.spotifyId) };
      if (genres?.length) excludeFilter.genres = { $nin: genres };
      if (artists?.length) excludeFilter['artists.name'] = { $nin: artists };
    }

    excludeFilter.durationMs = { $lte: 300000 }; // Asegurar que no se incluyan canciones sin duración válida

    const likedGenres = preferences?.likes?.genres ?? [];
    const likedArtists = preferences?.likes?.artists ?? [];
    const hasPreferences = likedGenres.length > 0 || likedArtists.length > 0;

    const preferenceFilter = hasPreferences
      ? {
          $or: [
            { genres: { $in: likedGenres } },
            { 'artists.name': { $in: likedArtists } },
          ],
        }
      : null;

    const preferredLimit = Math.ceil(limitPerEmotion * 0.6); // 60% preferencias
    const fillLimit = limitPerEmotion; // resto sin restricción

    const results = await Promise.all(
      emotions.map(async (emotion) => {
        let maxDistance = initialMaxDistance;
        let songs: SongEntityORM[] = [];

        while (songs.length < limitPerEmotion && maxDistance <= 1.0) {
          const emotionFilter = {
            [`emotionDistances.${emotion}`]: { $lte: maxDistance },
            ...excludeFilter,
          };

          let preferred: SongEntityORM[] = [];

          // Intentar traer canciones de preferencias
          if (preferenceFilter) {
            preferred = await this.model
              .aggregate<SongEntityORM>([
                { $match: { ...emotionFilter, ...preferenceFilter } },
                { $sample: { size: preferredLimit } },
              ])
              .exec();
          }

          // Complementar con canciones sin restricción de preferencias
          const remaining = fillLimit - preferred.length;
          const preferredIds = preferred.map(
            (s: { spotifyId: string }) => s.spotifyId,
          );

          const fill = await this.model
            .aggregate<SongEntityORM>([
              {
                $match: {
                  ...emotionFilter,
                  spotifyId: { $nin: preferredIds },
                },
              },
              { $sample: { size: remaining } },
            ])
            .exec();

          songs = [...preferred, ...fill];

          if (songs.length < limitPerEmotion) {
            maxDistance += 0.1;
            this.logger.warn(
              `Not enough songs for ${emotion} (${songs.length}/${limitPerEmotion}), relaxing to ${maxDistance.toFixed(1)}`,
            );
          }
        }

        return songs;
      }),
    );

    // Deduplicar
    const seen = new Set<string>();
    const songs: SongEntity[] = [];

    for (const batch of results) {
      for (const song of batch) {
        if (!seen.has(song.spotifyId)) {
          seen.add(song.spotifyId);
          songs.push(SongMapper.toEntity(song));
        }
      }
    }

    return songs;
  }

  async countByArtistId(artistId: string): Promise<number> {
    const count = await this.model.countDocuments({
      artists: { $elemMatch: { id: artistId } },
    });
    return count;
  }

  async countByGenre(genre: string): Promise<number> {
    const count = await this.model.countDocuments({ genres: genre });
    return count;
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
