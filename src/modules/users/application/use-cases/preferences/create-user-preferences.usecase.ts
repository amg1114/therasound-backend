import { UserPreferencesEntity } from '@modules/users/domain/entities';
import {
  type IUserPreferencesRepository,
  USER_PREFERENCES_REPOSITORY,
} from '@modules/users/domain/repositories/user-preferences-repository.interface';
import { ConflictException, Inject, Injectable } from '@nestjs/common';

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

    const userPreferences = UserPreferencesEntity.create(userId);

    return await this.userPreferencesRepository.create(userPreferences);
  }
}
