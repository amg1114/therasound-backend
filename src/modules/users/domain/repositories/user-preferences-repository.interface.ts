import { UserPreferencesEntity } from '../entities/user-preferences.entity';

export const USER_PREFERENCES_REPOSITORY = 'USER_PREFERENCES_REPOSITORY';

export interface IUserPreferencesRepository {
  create(
    userPreferences: UserPreferencesEntity,
  ): Promise<UserPreferencesEntity>;

  findById(id: string): Promise<UserPreferencesEntity | null>;

  findByUserId(userId: string): Promise<UserPreferencesEntity | null>;

  update(
    userPreferences: UserPreferencesEntity,
  ): Promise<UserPreferencesEntity>;
}
