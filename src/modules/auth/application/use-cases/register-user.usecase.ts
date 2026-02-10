import { IJwtPayload } from '@modules/auth/infrastructure/interfaces/jwt-payload.interface';
import { RegisterRequestDto } from '@modules/auth/presentation/dto/requests/register-request.dto';
import { AuthResponseDto } from '@modules/auth/presentation/dto/responses/auth-response.dto';
import { UserEntity } from '@modules/users/domain/entities/user.entity';
import {
  type IUserRepository,
  USER_REPOSITORY,
} from '@modules/users/domain/repositories/user-repository.interface';
import {
  PLAYLIST_REPOSITORY,
  type IPlaylistRepository,
} from '@modules/playlists/domain/repositories/playlist-repository.interface';
import { UserMapper } from '@modules/users/infrastructure/mappers/user.mapper';
import { UserPreferencesMapper } from '@modules/users/infrastructure/mappers/user-preferences.mapper';
import { ConflictException, Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { CreateUserPreferencesUseCase } from '@modules/users/application/use-cases/create-user-preferences.usecase';

@Injectable()
export class RegisterUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    @Inject(PLAYLIST_REPOSITORY)
    private readonly playlistRepository: IPlaylistRepository,
    private readonly jwtService: JwtService,
    private readonly createUserPreferencesUseCase: CreateUserPreferencesUseCase,
  ) {}

  async execute(dto: RegisterRequestDto): Promise<AuthResponseDto> {
    const userExists = await this.userRepository.findByEmail(dto.email);

    if (userExists) {
      throw new ConflictException('El usuario con este email ya existe');
    }

    dto.password = await bcrypt.hash(dto.password, 10);

    const userData = UserEntity.create({
      name: dto.name,
      email: dto.email,
      password: dto.password,
      bornAt: dto.bornAt,
    });

    const user = await this.userRepository.create(userData);

    // Create default user preferences
    const userPreferences = await this.createUserPreferencesUseCase.execute(
      user.id!,
    );

    const payload: IJwtPayload = {
      sub: user.id!,
      email: user.email,
      name: user.name,
      userPreferences: userPreferences.getValues(),
    };

    return {
      accessToken: this.jwtService.sign(payload),
      user: UserMapper.toResponseDto(user),
      userPreferences: UserPreferencesMapper.toResponseDto(userPreferences),
      recentPlaylists: [],
    };
  }
}
