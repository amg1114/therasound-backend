import { UserPreferencesEntity } from '@modules/users/domain/entities';
import {
  type IUserPreferencesRepository,
  USER_PREFERENCES_REPOSITORY,
} from '@modules/users/domain/repositories/user-preferences-repository.interface';
import { UpdateGenrePreferencesRequestDto } from '@modules/users/presentation/dto/requests/update-genre-preferences-request.dto';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class UpdateGenresPreferencesUseCase {
  constructor(
    @Inject(USER_PREFERENCES_REPOSITORY)
    private readonly userPreferencesRepository: IUserPreferencesRepository,
  ) {}

  async execute(
    userId: string,
    preference: 'likedGenres' | 'dislikedGenres',
    dto: UpdateGenrePreferencesRequestDto,
  ): Promise<UserPreferencesEntity> {
    const genres = new Set(dto.genres);

    const userPreferences =
      await this.userPreferencesRepository.findByUserId(userId);

    if (!userPreferences) {
      throw new NotFoundException(
        `Preferencias de usuario no encontradas para el usuario ${userId}`,
      );
    }

    const updatedGenres = [...genres];

    const updatedPreferences = UserPreferencesEntity.reconstruct({
      ...userPreferences,
      [preference]: updatedGenres,
    });

    return await this.userPreferencesRepository.update(updatedPreferences);
  }
}
