import { ProfileResponseDto } from '@modules/auth/presentation/dto/responses/profile-response.dto';
import {
  type IPlaylistRepository,
  PLAYLIST_REPOSITORY,
} from '@modules/playlists/domain/repositories/playlist-repository.interface';
import { PlaylistMapper } from '@modules/playlists/infrastructure/mappers/playlist.mapper';
import { UserPreferencesEntity } from '@modules/users/domain/entities';
import {
  type IUserPreferencesRepository,
  USER_PREFERENCES_REPOSITORY,
} from '@modules/users/domain/repositories/user-preferences-repository.interface';
import {
  type IUserRepository,
  USER_REPOSITORY,
} from '@modules/users/domain/repositories/user-repository.interface';
import { UserPreferencesMapper } from '@modules/users/infrastructure/mappers/user-preferences.mapper';
import { UserMapper } from '@modules/users/infrastructure/mappers/user.mapper';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class GetCurrentUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    @Inject(USER_PREFERENCES_REPOSITORY)
    private readonly userPreferencesRepository: IUserPreferencesRepository,
    @Inject(PLAYLIST_REPOSITORY)
    private readonly playlistRepository: IPlaylistRepository,
  ) {}

  async execute(userId: string): Promise<ProfileResponseDto> {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    let userPreferences =
      await this.userPreferencesRepository.findByUserId(userId);

    if (!userPreferences) {
      userPreferences = UserPreferencesEntity.create(userId);
      userPreferences =
        await this.userPreferencesRepository.create(userPreferences);
    }
    const recentPlaylists = await this.playlistRepository.findRecentByUserId(
      userId,
      5,
    );

    const response = new ProfileResponseDto();

    response.user = UserMapper.toResponseDto(user);
    response.userPreferences =
      UserPreferencesMapper.toResponseDto(userPreferences);
    response.recentPlaylists = recentPlaylists.map((playlist) =>
      PlaylistMapper.toSummaryDto(playlist),
    );

    return response;
  }
}
