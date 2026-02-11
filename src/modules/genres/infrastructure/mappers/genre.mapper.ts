import { GenreEntity } from '@modules/genres/domain/entities/genre.entity';
import { GenreEntityORM } from '../orm/entities/genre-entity.orm';

export class GenreMapper {
  static toEntity(raw: GenreEntityORM): GenreEntity {
    const genre = new GenreEntity();

    genre.id = raw._id.toString();
    genre.name = raw.name;
    genre.songsCount = raw.songsCount || 0;

    return genre;
  }

  static toORM(entity: Partial<GenreEntity>): Partial<GenreEntityORM> {
    return {
      name: entity.name,
      songsCount: entity.songsCount || 0,
    };
  }
}
