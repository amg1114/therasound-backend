import { UserNotFoundException } from '@modules/users/domain/exceptions/user.exceptions';
import {
  USER_PREFERENCES_REPOSITORY,
  USER_REPOSITORY,
  USER_STATISTICS_REPOSITORY,
  type UserPreferencesRepository,
  type UserRepository,
  type UserStatisticsRepository,
} from '@modules/users/domain/repositories';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class DeleteAccountUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
    @Inject(USER_PREFERENCES_REPOSITORY)
    private readonly userPreferencesRepository: UserPreferencesRepository,
    @Inject(USER_STATISTICS_REPOSITORY)
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
