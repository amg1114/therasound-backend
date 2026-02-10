import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  type IUserPreferencesRepository,
  USER_PREFERENCES_REPOSITORY,
} from '@modules/users/domain/repositories/user-preferences-repository.interface';
import {
  type ISongRepository,
  SONG_REPOSITORY,
} from '@modules/songs/domain/repositories/song-repository.interface';
import { UserPreferencesEntity } from '@modules/users/domain/entities/user-preferences.entity';
import { UpdateDislikedSongsRequestDto } from '@modules/users/presentation/dto/requests/update-disliked-songs-request.dto';
import { SongMapper } from '@modules/songs/infrastructure/mappers/song.mapper';

@Injectable()
export class UpdateDislikedSongsUseCase {
  constructor(
    @Inject(USER_PREFERENCES_REPOSITORY)
    private readonly userPreferencesRepository: IUserPreferencesRepository,
    @Inject(SONG_REPOSITORY)
    private readonly songRepository: ISongRepository,
  ) {}

  async execute(
    userId: string,
    dto: UpdateDislikedSongsRequestDto,
  ): Promise<UserPreferencesEntity> {
    const { songId, action } = dto;

    const userPreferences =
      await this.userPreferencesRepository.findByUserId(userId);

    if (!userPreferences) {
      throw new NotFoundException(
        `Preferencias de usuario no encontradas para el usuario ${userId}`,
      );
    }

    const updatedDislikedSongs = [...userPreferences.dislikedSongs];

    if (action === 'add') {
      // Fetch the song entity
      const song = await this.songRepository.findById(songId);
      if (!song) {
        throw new NotFoundException(`Canción no encontrada: ${songId}`);
      }

      // Check if song is not already in the list
      if (!updatedDislikedSongs.find((s) => s.id === songId)) {
        updatedDislikedSongs.push(SongMapper.toSummaryVO(song));
      }
    } else if (action === 'remove') {
      const index = updatedDislikedSongs.findIndex((s) => s.id === songId);
      if (index > -1) {
        updatedDislikedSongs.splice(index, 1);
      }
    }

    const updatedPreferences = UserPreferencesEntity.reconstruct({
      ...userPreferences,
      dislikedSongs: updatedDislikedSongs,
    });

    return await this.userPreferencesRepository.update(updatedPreferences);
  }
}
