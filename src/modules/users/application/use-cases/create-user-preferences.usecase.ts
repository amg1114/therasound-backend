import { Inject, Injectable, ConflictException } from '@nestjs/common';
import {
  type IUserPreferencesRepository,
  USER_PREFERENCES_REPOSITORY,
} from '@modules/users/domain/repositories/user-preferences-repository.interface';
import { UserPreferencesEntity } from '@modules/users/domain/entities/user-preferences.entity';

@Injectable()
export class CreateUserPreferencesUseCase {
  constructor(
    @Inject(USER_PREFERENCES_REPOSITORY)
    private readonly userPreferencesRepository: IUserPreferencesRepository,
  ) {}

  async execute(userId: string): Promise<UserPreferencesEntity> {
    const existingPreferences =
      await this.userPreferencesRepository.findByUserId(userId);

    if (existingPreferences) {
      throw new ConflictException(
        `User preferences already exist for user ${userId}`,
      );
    }

    const userPreferences = UserPreferencesEntity.create({
      user: userId,
      likedSongs: [],
      dislikedSongs: [],
      dislikedGenres: [],
      dislikedArtists: [],
    });

    return await this.userPreferencesRepository.create(userPreferences);
  }
}
