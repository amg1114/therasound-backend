import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { IJwtPayload } from '@modules/auth/infrastructure/interfaces/jwt-payload.interface';
import { LoginRequestDto } from '@modules/auth/presentation/dto/requests/login-request.dto';
import {
  USER_REPOSITORY,
  type IUserRepository,
} from '@modules/users/domain/repositories/user-repository.interface';
import { IAuthUseCaseResult } from './interfaces';

@Injectable()
export class LoginUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    private readonly jwtService: JwtService,
  ) {}

  async execute(dto: LoginRequestDto): Promise<IAuthUseCaseResult> {
    const { email, password } = dto;

    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const payload: IJwtPayload = {
      sub: user.id!,
      email: user.email,
      name: user.name,
    };

    return {
      accessToken: this.jwtService.sign(payload),
    };
  }
}
