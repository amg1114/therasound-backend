import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  type IUserRepository,
  USER_REPOSITORY,
} from '@modules/users/domain/repositories/user-repository.interface';
import {
  type IUserPreferencesRepository,
  USER_PREFERENCES_REPOSITORY,
} from '@modules/users/domain/repositories/user-preferences-repository.interface';
import { AuthResponseDto } from '@modules/auth/presentation/dto/responses/auth-response.dto';
import { UserMapper } from '@modules/users/infrastructure/mappers/user.mapper';
import { UserPreferencesMapper } from '@modules/users/infrastructure/mappers/user-preferences.mapper';

@Injectable()
export class GetCurrentUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    @Inject(USER_PREFERENCES_REPOSITORY)
    private readonly userPreferencesRepository: IUserPreferencesRepository,
  ) {}

  async execute(userId: string): Promise<Omit<AuthResponseDto, 'accessToken'>> {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const userPreferences =
      await this.userPreferencesRepository.findByUserId(userId);

    return {
      user: UserMapper.toResponseDto(user),
      userPreferences: userPreferences
        ? UserPreferencesMapper.toResponseDto(userPreferences)
        : {
            id: userId,
            likedSongs: [],
            dislikedSongs: [],
            dislikedGenres: [],
            dislikedArtists: [],
          },
    };
  }
}
