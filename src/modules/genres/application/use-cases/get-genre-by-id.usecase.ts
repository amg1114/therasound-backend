import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import {
  GENRE_REPOSITORY,
  type IGenreRepository,
} from '@modules/genres/domain/repositories/genre-repository.interface';
import { GenreEntity } from '@modules/genres/domain/entities/genre.entity';

@Injectable()
export class GetGenreByIdUseCase {
  private readonly logger = new Logger(GetGenreByIdUseCase.name);

  constructor(
    @Inject(GENRE_REPOSITORY)
    private readonly genreRepository: IGenreRepository,
  ) {}

  /**
   * Retrieves a genre by its ID
   * @param id - The genre ID
   * @returns Genre entity
   */
  async execute(id: string): Promise<GenreEntity> {
    this.logger.log(`Fetching genre with ID: ${id}`);
    const genre = await this.genreRepository.findById(id);

    if (!genre) {
      throw new NotFoundException(`Género con ID ${id} no encontrado`);
    }

    return genre;
  }
}
