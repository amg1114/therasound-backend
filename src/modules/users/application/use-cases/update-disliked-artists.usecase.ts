import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  type IUserPreferencesRepository,
  USER_PREFERENCES_REPOSITORY,
} from '@modules/users/domain/repositories/user-preferences-repository.interface';
import { UserPreferencesEntity } from '@modules/users/domain/entities/user-preferences.entity';
import { UpdateDislikedArtistsRequestDto } from '@modules/users/presentation/dto/requests/update-disliked-artists-request.dto';

@Injectable()
export class UpdateDislikedArtistsUseCase {
  constructor(
    @Inject(USER_PREFERENCES_REPOSITORY)
    private readonly userPreferencesRepository: IUserPreferencesRepository,
  ) {}

  async execute(
    userId: string,
    dto: UpdateDislikedArtistsRequestDto,
  ): Promise<UserPreferencesEntity> {
    const { artistId, action } = dto;

    const userPreferences =
      await this.userPreferencesRepository.findByUserId(userId);

    if (!userPreferences) {
      throw new NotFoundException(
        `User preferences not found for user ${userId}`,
      );
    }

    const updatedDislikedArtists = [...userPreferences.dislikedArtists];

    if (action === 'add') {
      if (!updatedDislikedArtists.includes(artistId)) {
        updatedDislikedArtists.push(artistId);
      }
    } else if (action === 'remove') {
      const index = updatedDislikedArtists.indexOf(artistId);
      if (index > -1) {
        updatedDislikedArtists.splice(index, 1);
      }
    }

    const updatedPreferences = UserPreferencesEntity.reconstruct({
      id: userPreferences.id!,
      user: userPreferences.user,
      likedSongs: userPreferences.likedSongs,
      dislikedSongs: userPreferences.dislikedSongs,
      dislikedGenres: userPreferences.dislikedGenres,
      dislikedArtists: updatedDislikedArtists,
    });

    return await this.userPreferencesRepository.update(updatedPreferences);
  }
}
