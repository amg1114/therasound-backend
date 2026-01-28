import { GenreEntity } from '@modules/songs/domain/entities/genre.entity';
import { GenreEntityORM } from '../orm/entities/genre-entity.orm';

export class GenreMapper {
  static toEntity(raw: GenreEntityORM): GenreEntity {
    const genre = new GenreEntity();

    genre.id = raw._id.toString();
    genre.name = raw.name;

    return genre;
  }
}
