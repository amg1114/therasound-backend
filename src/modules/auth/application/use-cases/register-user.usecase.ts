import { IJwtPayload } from '@modules/auth/infrastructure/interfaces/jwt-payload.interface';
import { RegisterRequestDto } from '@modules/auth/presentation/dto/requests/register-request.dto';
import { AuthResponseDto } from '@modules/auth/presentation/dto/responses/auth-response.dto';
import { CreateUserPreferencesUseCase } from '@modules/users/application/use-cases/preferences';
import { UserEntity } from '@modules/users/domain/entities';
import {
  USER_REPOSITORY,
  type IUserRepository,
} from '@modules/users/domain/repositories/user-repository.interface';
import { UserPreferencesMapper } from '@modules/users/infrastructure/mappers/user-preferences.mapper';
import { UserMapper } from '@modules/users/infrastructure/mappers/user.mapper';
import { ConflictException, Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class RegisterUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
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
    };

    return {
      accessToken: this.jwtService.sign(payload),
      user: UserMapper.toResponseDto(user),
      userPreferences: UserPreferencesMapper.toResponseDto(userPreferences),
      recentPlaylists: [],
    };
  }
}
