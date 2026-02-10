import { UserPreferencesProps } from '@modules/users/domain/entities/user-preferences.entity';

export interface IJwtPayload {
  sub: string;
  email: string;
  name: string;
  userPreferences: UserPreferencesProps;
  iat?: number;
  exp?: number;
}
