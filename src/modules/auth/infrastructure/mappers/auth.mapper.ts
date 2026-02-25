import {
  IAuthUseCaseResult,
  IUserProfileUseCaseResult,
} from '@modules/auth/application/use-cases/interfaces';
import { AuthResponseDto } from '@modules/auth/presentation/dto/responses/auth-response.dto';
import { ProfileResponseDto } from '@modules/auth/presentation/dto/responses/profile-response.dto';
import { PlaylistMapper } from '@modules/playlists/infrastructure/mappers/playlist.mapper';
import {
  UserMapper,
  UserPreferencesMapper,
} from '@modules/users/infrastructure/mappers';

export class AuthMapper {
  static toAuthResponse(result: IAuthUseCaseResult): AuthResponseDto {
    const response = new AuthResponseDto();

    response.accessToken = result.accessToken;

    return response;
  }

  static toUserProfileResponse(
    result: IUserProfileUseCaseResult,
  ): ProfileResponseDto {
    const response = new ProfileResponseDto();

    response.user = UserMapper.toResponseDto(result.user);
    response.preferences = UserPreferencesMapper.toResponseDto(
      result.preferences,
    );
    response.statistics = result.statistics;
    response.recentPlaylists = result.recentPlaylists.map((p) =>
      PlaylistMapper.toSummary(p),
    );

    return response;
  }
}
