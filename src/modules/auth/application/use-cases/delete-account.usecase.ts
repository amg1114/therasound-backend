import { UserNotFoundException } from '@modules/users/domain/exceptions/user.exceptions';
import {
  type UserPreferencesRepository,
  type UserRepository,
  type UserStatisticsRepository,
} from '@modules/users/domain/repositories';
import { Injectable } from '@nestjs/common';

@Injectable()
export class DeleteAccountUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly userPreferencesRepository: UserPreferencesRepository,
    private readonly userStatisticsRepository: UserStatisticsRepository,
  ) {}

  async execute(userId: string): Promise<void> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new UserNotFoundException(userId);
    }

    await this.userPreferencesRepository.deleteByUserId(userId);
    await this.userStatisticsRepository.deleteByUserId(userId);
    await this.userRepository.delete(userId);
  }
}
