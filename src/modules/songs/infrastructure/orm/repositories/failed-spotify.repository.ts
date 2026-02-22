import { FailedSpotifyTrackEntity } from '@modules/songs/domain/entities/failed-spotify-track.entity';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { FailedSpotifyTrackOrmEntity } from '../entities/failed-spotify-entity.orm';

@Injectable()
export class FailedSpotifyTrackRepository {
  constructor(
    @InjectModel(FailedSpotifyTrackOrmEntity.name)
    private readonly model: Model<FailedSpotifyTrackOrmEntity>,
  ) {}

  async create(
    data: FailedSpotifyTrackEntity,
  ): Promise<FailedSpotifyTrackEntity> {
    const created = new this.model(data);
    const saved = await created.save();

    return new FailedSpotifyTrackEntity(
      saved.spotifyId,
      saved.reason as 'not_found' | 'emotion_error' | 'details_error',
      saved.createdAt,
    );
  }

  async findBySpotifyId(
    spotifyId: string,
  ): Promise<FailedSpotifyTrackEntity | null> {
    const found = await this.model.findOne({ spotifyId });

    if (!found) {
      return null;
    }

    return new FailedSpotifyTrackEntity(
      found.spotifyId,
      found.reason as 'not_found' | 'emotion_error' | 'details_error',
      found.createdAt,
    );
  }
}
