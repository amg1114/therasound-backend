import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  type IUserPreferencesRepository,
  USER_PREFERENCES_REPOSITORY,
} from '@modules/users/domain/repositories/user-preferences-repository.interface';
import { UserPreferencesEntity } from '@modules/users/domain/entities/user-preferences.entity';
import { UpdateLikedSongsRequestDto } from '@modules/users/presentation/dto/requests/update-liked-songs-request.dto';

@Injectable()
export class UpdateLikedSongsUseCase {
  constructor(
    @Inject(USER_PREFERENCES_REPOSITORY)
    private readonly userPreferencesRepository: IUserPreferencesRepository,
  ) {}

  async execute(
    userId: string,
    dto: UpdateLikedSongsRequestDto,
  ): Promise<UserPreferencesEntity> {
    const { songId, action } = dto;

    const userPreferences =
      await this.userPreferencesRepository.findByUserId(userId);

    if (!userPreferences) {
      throw new NotFoundException(
        `User preferences not found for user ${userId}`,
      );
    }

    const updatedLikedSongs = [...userPreferences.likedSongs];

    if (action === 'add') {
      if (!updatedLikedSongs.includes(songId)) {
        updatedLikedSongs.push(songId);
      }
    } else if (action === 'remove') {
      const index = updatedLikedSongs.indexOf(songId);
      if (index > -1) {
        updatedLikedSongs.splice(index, 1);
      }
    }

    const updatedPreferences = UserPreferencesEntity.reconstruct({
      id: userPreferences.id!,
      user: userPreferences.user,
      likedSongs: updatedLikedSongs,
      dislikedSongs: userPreferences.dislikedSongs,
      dislikedGenres: userPreferences.dislikedGenres,
      dislikedArtists: userPreferences.dislikedArtists,
    });

    return await this.userPreferencesRepository.update(updatedPreferences);
  }
}
