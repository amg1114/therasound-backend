import {
  PLAYLIST_REPOSITORY,
  type IPlaylistRepository,
} from '@modules/playlists/domain/repositories/playlist-repository.interface';
import {
  UserPreferencesEntity,
  UserStatisticsEntity,
} from '@modules/users/domain/entities';
import {
  USER_PREFERENCES_REPOSITORY,
  USER_STATISTICS_REPOSITORY,
  type IUserPreferencesRepository,
  type IUserStatisticsRepository,
} from '@modules/users/domain/repositories';
import { Inject, Injectable } from '@nestjs/common';
import {
  ICreateUserProfileResult,
  IGetUserProfileResult,
} from './interfaces/user-profile.service.interfaces';

@Injectable()
export class UserProfileService {
  constructor(
    @Inject(USER_PREFERENCES_REPOSITORY)
    private readonly preferencesRepository: IUserPreferencesRepository,
    @Inject(USER_STATISTICS_REPOSITORY)
    private readonly statisticsRepository: IUserStatisticsRepository,
    @Inject(PLAYLIST_REPOSITORY)
    private readonly playlistRepository: IPlaylistRepository,
  ) {}

  async createUserProfile(userId: string): Promise<ICreateUserProfileResult> {
    const [preferences, statistics] = await Promise.all([
      this.preferencesRepository.create(UserPreferencesEntity.create(userId)),
      this.statisticsRepository.create(UserStatisticsEntity.create(userId)),
    ]);

    return {
      preferences,
      statistics,
    };
  }

  async getUserProfile(userId: string): Promise<IGetUserProfileResult> {
    const [preferences, statistics, recentPlaylists] = await Promise.all([
      this.preferencesRepository.findByUserId(userId),
      this.statisticsRepository.findByUserId(userId),
      this.playlistRepository.findRecentByUserId(userId, 5),
    ]);

    return {
      preferences,
      statistics,
      recentPlaylists,
    };
  }
}
