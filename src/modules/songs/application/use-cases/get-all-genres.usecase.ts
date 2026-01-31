import { Inject, Injectable, Logger } from '@nestjs/common';
import {
  GENRE_REPOSITORY,
  type IGenreRepository,
} from '@modules/songs/domain/repositories/genre-repository.interface';
import { GenreEntity } from '@modules/songs/domain/entities/genre.entity';

@Injectable()
export class GetAllGenresUseCase {
  private readonly logger = new Logger(GetAllGenresUseCase.name);

  constructor(
    @Inject(GENRE_REPOSITORY)
    private readonly genreRepository: IGenreRepository,
  ) {}

  /**
   * Retrieves all genres
   * @returns Array of all genre entities
   */
  async execute(): Promise<GenreEntity[]> {
    this.logger.log('Fetching all genres');
    const genres = await this.genreRepository.findAll();
    this.logger.log(`Found ${genres.length} genres`);
    return genres;
  }
}
