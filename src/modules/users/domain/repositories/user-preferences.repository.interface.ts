import { CreateUserPreferencesProps, UserPreferencesEntity } from '../entities';

export const USER_PREFERENCES_REPOSITORY = 'USER_PREFERENCES_REPOSITORY';

export interface UserPreferencesRepository {
  create(
    userPreferences: CreateUserPreferencesProps,
  ): Promise<UserPreferencesEntity>;

  findById(id: string): Promise<UserPreferencesEntity | null>;

  findByUserId(userId: string): Promise<UserPreferencesEntity | null>;

  save(userPreferences: UserPreferencesEntity): Promise<UserPreferencesEntity>;

  deleteByUserId(userId: string): Promise<void>;
}
