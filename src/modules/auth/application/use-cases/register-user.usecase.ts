import { IJwtPayload } from '@modules/auth/infrastructure/interfaces/jwt-payload.interface';
import { RegisterRequestDto } from '@modules/auth/presentation/dto/requests/register-request.dto';
import { AuthResponseDto } from '@modules/auth/presentation/dto/responses/auth-response.dto';
import { UserEntity } from '@modules/users/domain/entities/user.entity';
import {
  type IUserRepository,
  USER_REPOSITORY,
} from '@modules/users/domain/repositories/user-repository.interface';
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
  ) {}

  async execute(dto: RegisterRequestDto): Promise<AuthResponseDto> {
    const userExists = await this.userRepository.findByEmail(dto.email);

    if (userExists) {
      throw new ConflictException('User with this email already exists');
    }

    dto.password = await bcrypt.hash(dto.password, 10);

    const userData = UserEntity.create({
      name: dto.name,
      email: dto.email,
      password: dto.password,
      bornAt: dto.bornAt,
    });

    const user = await this.userRepository.create(userData);

    const payload: IJwtPayload = {
      sub: user.id!,
      email: user.email,
      name: user.name,
    };

    return {
      accessToken: this.jwtService.sign(payload),
      user: UserMapper.toResponseDto(user),
    };
  }
}
