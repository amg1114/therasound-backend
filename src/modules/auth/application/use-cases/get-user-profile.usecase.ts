import { UserProfileService } from '@modules/users/application/services/user-profile.service';
import {
  type UserRepository,
  USER_REPOSITORY,
} from '@modules/users/domain/repositories/user.repository.interface';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IUserProfileUseCaseResult } from './interfaces';

@Injectable()
export class GetUserProfile {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
    private readonly profileService: UserProfileService,
  ) {}

  async execute(userId: string): Promise<IUserProfileUseCaseResult> {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const { preferences, statistics, recentPlaylists } =
      await this.profileService.getUserProfile(userId);

    if (!preferences || !statistics) {
      throw new NotFoundException('Perfil de usuario no encontrado');
    }

    return {
      user,
      preferences,
      statistics,
      recentPlaylists,
    };
  }
}
