import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  type IUserPreferencesRepository,
  USER_PREFERENCES_REPOSITORY,
} from '@modules/users/domain/repositories/user-preferences-repository.interface';
import { UserPreferencesEntity } from '@modules/users/domain/entities/user-preferences.entity';
import { UpdateDislikedGenresRequestDto } from '@modules/users/presentation/dto/requests/update-disliked-genres-request.dto';

@Injectable()
export class UpdateDislikedGenresUseCase {
  constructor(
    @Inject(USER_PREFERENCES_REPOSITORY)
    private readonly userPreferencesRepository: IUserPreferencesRepository,
  ) {}

  async execute(
    userId: string,
    dto: UpdateDislikedGenresRequestDto,
  ): Promise<UserPreferencesEntity> {
    const { genreId, action } = dto;

    const userPreferences =
      await this.userPreferencesRepository.findByUserId(userId);

    if (!userPreferences) {
      throw new NotFoundException(
        `Preferencias de usuario no encontradas para el usuario ${userId}`,
      );
    }

    const updatedDislikedGenres = [...userPreferences.dislikedGenres];

    if (action === 'add') {
      if (!updatedDislikedGenres.includes(genreId)) {
        updatedDislikedGenres.push(genreId);
      }
    } else if (action === 'remove') {
      const index = updatedDislikedGenres.indexOf(genreId);
      if (index > -1) {
        updatedDislikedGenres.splice(index, 1);
      }
    }

    const updatedPreferences = UserPreferencesEntity.reconstruct({
      id: userPreferences.id!,
      userId: userPreferences.userId,
      likedSongs: userPreferences.likedSongs,
      dislikedSongs: userPreferences.dislikedSongs,
      dislikedGenres: updatedDislikedGenres,
      dislikedArtists: userPreferences.dislikedArtists,
    });

    return await this.userPreferencesRepository.update(updatedPreferences);
  }
}
