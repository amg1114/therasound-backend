import { ChangePasswordRequestDto } from '@modules/auth/presentation/dto/requests';
import {
  UserNotFoundException,
  UserPasswordMismatchException,
} from '@modules/users/domain/exceptions/user.exceptions';
import {
  type UserRepository,
  USER_REPOSITORY,
} from '@modules/users/domain/repositories';
import { Inject, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

@Injectable()
export class ChangePasswordUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
  ) {}

  async execute(
    userId: string,
    { oldPassword, newPassword }: ChangePasswordRequestDto,
  ) {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new UserNotFoundException(userId);
    }

    const isOldPasswordValid = await bcrypt.compare(oldPassword, user.password);

    if (!isOldPasswordValid) {
      throw new UserPasswordMismatchException();
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedNewPassword;

    await this.userRepository.save(user);
  }
}
