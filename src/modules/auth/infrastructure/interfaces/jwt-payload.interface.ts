import { UserPreferencesProps } from '@modules/users/domain/entities';

export interface IJwtPayload {
  sub: string;
  email: string;
  name: string;
  userPreferences: UserPreferencesProps;
  iat?: number;
  exp?: number;
}
