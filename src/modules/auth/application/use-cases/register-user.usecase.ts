import { IJwtPayload } from '@modules/auth/infrastructure/interfaces/jwt-payload.interface';
import { RegisterRequestDto } from '@modules/auth/presentation/dto/requests/register-request.dto';
import { UserProfileService } from '@modules/users/application/services/user-profile.service';
import { UserEntity } from '@modules/users/domain/entities';
import {
  USER_REPOSITORY,
  type IUserRepository,
} from '@modules/users/domain/repositories/user-repository.interface';
import { ConflictException, Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { IAuthUseCaseResult } from './interfaces';

@Injectable()
export class RegisterUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    private readonly jwtService: JwtService,
    private readonly profileService: UserProfileService,
  ) {}

  async execute(dto: RegisterRequestDto): Promise<IAuthUseCaseResult> {
    const userExists = await this.userRepository.findByEmail(dto.email);

    if (userExists) {
      throw new ConflictException('El usuario con este email ya existe');
    }

    const userData = UserEntity.create({
      name: dto.name,
      email: dto.email,
      password: await bcrypt.hash(dto.password, 10),
      bornAt: dto.bornAt,
    });

    const user = await this.userRepository.create(userData);

    const payload: IJwtPayload = {
      sub: user.id!,
      email: user.email,
      name: user.name,
    };

    await this.profileService.createUserProfile(user.id!);

    return {
      accessToken: this.jwtService.sign(payload),
    };
  }
}
