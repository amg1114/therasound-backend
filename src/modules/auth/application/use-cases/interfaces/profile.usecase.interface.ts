import { PlaylistEntity } from '@modules/playlists/domain/entities/playlist.entity';
import {
  UserEntity,
  UserPreferencesEntity,
  UserStatisticsEntity,
} from '@modules/users/domain/entities';

export interface IUserProfileUseCaseResult {
  user: UserEntity;
  preferences: UserPreferencesEntity;
  statistics: UserStatisticsEntity;
  recentPlaylists: PlaylistEntity[];
}
