import {
  UserPreferencesEntity,
  UserStatisticsEntity,
} from '@modules/users/domain/entities';

export interface ICreateUserProfileResult {
  preferences: UserPreferencesEntity;
  statistics: UserStatisticsEntity;
}
export interface IGetUserProfileResult {
  preferences: UserPreferencesEntity | null;
  statistics: UserStatisticsEntity | null;
}
