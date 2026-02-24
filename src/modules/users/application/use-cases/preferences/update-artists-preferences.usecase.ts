import { UserPreferencesEntity } from '@modules/users/domain/entities';
import {
  type IUserPreferencesRepository,
  USER_PREFERENCES_REPOSITORY,
} from '@modules/users/domain/repositories/user-preferences-repository.interface';
import { UpdateArtistPreferencesRequestDto } from '@modules/users/presentation/dto/requests/update-artist-preferences-request.dto';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class UpdateArtistsPreferencesUseCase {
  constructor(
    @Inject(USER_PREFERENCES_REPOSITORY)
    private readonly userPreferencesRepository: IUserPreferencesRepository,
  ) {}

  async execute(
    userId: string,
    preference: 'likedArtists' | 'dislikedArtists',
    dto: UpdateArtistPreferencesRequestDto,
  ): Promise<UserPreferencesEntity> {
    const artists = new Set(dto.artists);

    const userPreferences =
      await this.userPreferencesRepository.findByUserId(userId);

    if (!userPreferences) {
      throw new NotFoundException(
        `Preferencias de usuario no encontradas para el usuario ${userId}`,
      );
    }

    const updatedArtists = [...artists];

    const updatedPreferences = UserPreferencesEntity.reconstruct({
      ...userPreferences,
      [preference]: updatedArtists,
    });

    return await this.userPreferencesRepository.update(updatedPreferences);
  }
}
