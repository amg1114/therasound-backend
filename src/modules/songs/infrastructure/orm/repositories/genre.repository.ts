import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IGenreRepository } from '@modules/songs/domain/repositories/genre-repository.interface';
import { GenreEntity } from '@modules/songs/domain/entities/genre.entity';
import { GenreEntityORM } from '../entities/genre-entity.orm';
import { GenreMapper } from '../../mappers/genre.mapper';

@Injectable()
export class GenreRepositoryImpl implements IGenreRepository {
  constructor(
    @InjectModel(GenreEntityORM.name)
    private readonly model: Model<GenreEntityORM>,
  ) {}

  async findById(id: string): Promise<GenreEntity | null> {
    const genre = await this.model.findById(id);
    if (!genre) return null;
    return GenreMapper.toEntity(genre);
  }

  async findByName(name: string): Promise<GenreEntity | null> {
    const genre = await this.model.findOne({ name });
    if (!genre) return null;
    return GenreMapper.toEntity(genre);
  }

  async create(genre: Partial<GenreEntity>): Promise<GenreEntity> {
    const ormData = GenreMapper.toORM(genre);
    const createdGenre = await this.model.create(ormData);
    return GenreMapper.toEntity(createdGenre);
  }

  async incrementSongsCount(name: string): Promise<void> {
    await this.model.updateOne({ name }, { $inc: { songsCount: 1 } });
  }

  async findAll(): Promise<GenreEntity[]> {
    const genres = await this.model.find();
    return genres.map((genre) => GenreMapper.toEntity(genre));
  }
}
