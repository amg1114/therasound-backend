import { UpdateUserProfileDto } from '@modules/auth/presentation/dto/requests';
import { UserEntity } from '@modules/users/domain/entities';
import {
  type IUserRepository,
  USER_REPOSITORY,
} from '@modules/users/domain/repositories';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class UpdateUserProfileUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(
    userId: string,
    dto: UpdateUserProfileDto,
  ): Promise<UserEntity> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException(`Usuario con el ID ${userId} no encontrado`);
    }

    user.name = dto.name ?? user.name;
    user.email = dto.email ?? user.email;
    user.bornAt = dto.bornAt ? new Date(dto.bornAt) : user.bornAt;

    await this.userRepository.update(user);
    return user;
  }
}
