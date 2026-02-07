import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  type IUserRepository,
  USER_REPOSITORY,
} from '@modules/users/domain/repositories/user-repository.interface';
import {
  type IUserPreferencesRepository,
  USER_PREFERENCES_REPOSITORY,
} from '@modules/users/domain/repositories/user-preferences-repository.interface';
import {
  PLAYLIST_REPOSITORY,
  type IPlaylistRepository,
} from '@modules/playlists/domain/repositories/playlist-repository.interface';
import { AuthResponseDto } from '@modules/auth/presentation/dto/responses/auth-response.dto';
import { UserMapper } from '@modules/users/infrastructure/mappers/user.mapper';
import { UserPreferencesMapper } from '@modules/users/infrastructure/mappers/user-preferences.mapper';
import { PlaylistMapper } from '@modules/playlists/infrastructure/mappers/playlist.mapper';

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

  async execute(userId: string): Promise<Omit<AuthResponseDto, 'accessToken'>> {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const userPreferences =
      await this.userPreferencesRepository.findByUserId(userId);

    const recentPlaylists = await this.playlistRepository.findRecentByUserId(
      userId,
      5,
    );

    return {
      user: UserMapper.toResponseDto(user),
      userPreferences: userPreferences
        ? UserPreferencesMapper.toResponseDto(userPreferences)
        : {
            id: userId,
            likedSongs: [],
            dislikedSongs: [],
            dislikedGenres: [],
            dislikedArtists: [],
          },
      recentPlaylists: recentPlaylists.map((playlist) =>
        PlaylistMapper.toSummaryDto(playlist),
      ),
    };
  }
}
