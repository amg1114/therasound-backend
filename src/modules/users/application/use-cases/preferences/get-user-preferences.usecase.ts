import { UserPreferencesEntity } from '@modules/users/domain/entities';
import {
  type UserPreferencesRepository,
  USER_PREFERENCES_REPOSITORY,
} from '@modules/users/domain/repositories/user-preferences.repository.interface';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class GetUserPreferencesUseCase {
  constructor(
    @Inject(USER_PREFERENCES_REPOSITORY)
    private readonly userPreferencesRepository: UserPreferencesRepository,
  ) {}

  async execute(userId: string): Promise<UserPreferencesEntity> {
    const userPreferences =
      await this.userPreferencesRepository.findByUserId(userId);

    if (!userPreferences) {
      throw new NotFoundException(
        `Preferencias de usuario no encontradas para el usuario ${userId}`,
      );
    }

    return userPreferences;
  }
}
