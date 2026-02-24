import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { IJwtPayload } from '@modules/auth/infrastructure/interfaces/jwt-payload.interface';
import { LoginRequestDto } from '@modules/auth/presentation/dto/requests/login-request.dto';
import { AuthResponseDto } from '@modules/auth/presentation/dto/responses/auth-response.dto';
import {
  PLAYLIST_REPOSITORY,
  type IPlaylistRepository,
} from '@modules/playlists/domain/repositories/playlist-repository.interface';
import { PlaylistMapper } from '@modules/playlists/infrastructure/mappers/playlist.mapper';
import { UserPreferencesEntity } from '@modules/users/domain/entities';
import {
  USER_PREFERENCES_REPOSITORY,
  type IUserPreferencesRepository,
} from '@modules/users/domain/repositories/user-preferences-repository.interface';
import {
  USER_REPOSITORY,
  type IUserRepository,
} from '@modules/users/domain/repositories/user-repository.interface';
import { UserPreferencesMapper } from '@modules/users/infrastructure/mappers/user-preferences.mapper';
import { UserMapper } from 'src/modules/users/infrastructure/mappers/user.mapper';

@Injectable()
export class LoginUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    @Inject(USER_PREFERENCES_REPOSITORY)
    private readonly userPreferencesRepository: IUserPreferencesRepository,
    @Inject(PLAYLIST_REPOSITORY)
    private readonly playlistRepository: IPlaylistRepository,
    private readonly jwtService: JwtService,
  ) {}

  async execute(dto: LoginRequestDto): Promise<AuthResponseDto> {
    const { email, password } = dto;

    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    let userPreferences = await this.userPreferencesRepository.findByUserId(
      user.id!,
    );

    if (!userPreferences) {
      userPreferences = UserPreferencesEntity.create(user.id!);
      userPreferences =
        await this.userPreferencesRepository.create(userPreferences);
    }

    const recentPlaylists = await this.playlistRepository.findRecentByUserId(
      user.id!,
      5,
    );

    const payload: IJwtPayload = {
      sub: user.id!,
      email: user.email,
      name: user.name,
    };

    return {
      accessToken: this.jwtService.sign(payload),
      user: UserMapper.toResponseDto(user),
      userPreferences: UserPreferencesMapper.toResponseDto(userPreferences),
      recentPlaylists: recentPlaylists.map((playlist) =>
        PlaylistMapper.toSummaryDto(playlist),
      ),
    };
  }
}
