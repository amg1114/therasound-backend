import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  type IUserPreferencesRepository,
  USER_PREFERENCES_REPOSITORY,
} from '@modules/users/domain/repositories/user-preferences-repository.interface';
import { UserPreferencesEntity } from '@modules/users/domain/entities/user-preferences.entity';
import { UpdateDislikedSongsRequestDto } from '@modules/users/presentation/dto/requests/update-disliked-songs-request.dto';

@Injectable()
export class UpdateDislikedSongsUseCase {
  constructor(
    @Inject(USER_PREFERENCES_REPOSITORY)
    private readonly userPreferencesRepository: IUserPreferencesRepository,
  ) {}

  async execute(
    userId: string,
    dto: UpdateDislikedSongsRequestDto,
  ): Promise<UserPreferencesEntity> {
    const { songId, action } = dto;

    const userPreferences =
      await this.userPreferencesRepository.findByUserId(userId);

    if (!userPreferences) {
      throw new NotFoundException(
        `User preferences not found for user ${userId}`,
      );
    }

    const updatedDislikedSongs = [...userPreferences.dislikedSongs];

    if (action === 'add') {
      if (!updatedDislikedSongs.includes(songId)) {
        updatedDislikedSongs.push(songId);
      }
    } else if (action === 'remove') {
      const index = updatedDislikedSongs.indexOf(songId);
      if (index > -1) {
        updatedDislikedSongs.splice(index, 1);
      }
    }

    const updatedPreferences = UserPreferencesEntity.reconstruct({
      id: userPreferences.id!,
      user: userPreferences.user,
      likedSongs: userPreferences.likedSongs,
      dislikedSongs: updatedDislikedSongs,
      dislikedGenres: userPreferences.dislikedGenres,
      dislikedArtists: userPreferences.dislikedArtists,
    });

    return await this.userPreferencesRepository.update(updatedPreferences);
  }
}
