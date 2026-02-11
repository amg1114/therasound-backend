import { GenreEntity } from '../entities/genre.entity';

export const GENRE_REPOSITORY = Symbol('GENRE_REPOSITORY');

export interface IGenreRepository {
  /**
   * Find a genre by ID
   */
  findById(id: string): Promise<GenreEntity | null>;

  /**
   * Find a genre by name
   */
  findByName(name: string): Promise<GenreEntity | null>;

  /**
   * Create a new genre
   */
  create(genre: Partial<GenreEntity>): Promise<GenreEntity>;

  /**
   * Increment the songs count for a genre
   */
  incrementSongsCount(name: string): Promise<void>;

  /**
   * Find all genres
   */
  findAll(): Promise<GenreEntity[]>;
}
