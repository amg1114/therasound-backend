import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

import { UserMapper } from 'src/modules/users/infrastructure/mappers/user.mapper';
import { LoginRequestDto } from '@modules/auth/presentation/dto/requests/login-request.dto';
import { AuthResponseDto } from '@modules/auth/presentation/dto/responses/auth-response.dto';
import {
  USER_REPOSITORY,
  type IUserRepository,
} from '@modules/users/domain/repositories/user-repository.interface';
import { IJwtPayload } from '@modules/auth/infrastructure/interfaces/jwt-payload.interface';

@Injectable()
export class LoginUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    private readonly jwtService: JwtService,
  ) {}

  async execute(dto: LoginRequestDto): Promise<AuthResponseDto> {
    const { email, password } = dto;

    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

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
