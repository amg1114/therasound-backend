import { ArtistNotFoundException } from '@modules/artists/domain/artists.exceptions';
import {
  ArtistEntity,
  CreateArtistProps,
} from '@modules/artists/domain/entities';
import { ArtistRepository } from '@modules/artists/domain/repositories';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ArtistMapper } from '../../mappers';
import { MongoArtistEntity } from '../entities';

export class MongoArtistRepository implements ArtistRepository {
  constructor(
    @InjectModel(MongoArtistEntity.name)
    private readonly model: Model<MongoArtistEntity>,
  ) {}

  async create(artist: CreateArtistProps): Promise<ArtistEntity> {
    const ormData = ArtistMapper.toMongo(artist);
    const created = await this.model.create(ormData);

    return ArtistMapper.toDomain(created);
  }

  async save(artist: ArtistEntity): Promise<ArtistEntity> {
    const ormData = ArtistMapper.toMongo(artist);
    const updated = await this.model.findByIdAndUpdate(artist.id, ormData, {
      new: true,
    });

    if (!updated) {
      throw new ArtistNotFoundException(artist.id);
    }

    return ArtistMapper.toDomain(updated);
  }

  async findById(id: string): Promise<ArtistEntity | null> {
    const found = await this.model.findById(id).exec();

    if (!found) {
      return null;
    }

    return ArtistMapper.toDomain(found);
  }

  async findBySpotifyId(spotifyId: string): Promise<ArtistEntity | null> {
    const found = await this.model.findOne({ spotifyId }).exec();

    if (!found) {
      return null;
    }

    return ArtistMapper.toDomain(found);
  }

  async findByName(name: string): Promise<ArtistEntity | null> {
    const found = await this.model.findOne({ name }).exec();

    if (!found) {
      return null;
    }

    return ArtistMapper.toDomain(found);
  }

  async findAll(): Promise<ArtistEntity[]> {
    const found = await this.model.find().exec();
    return found.map((a) => ArtistMapper.toDomain(a));
  }
}
