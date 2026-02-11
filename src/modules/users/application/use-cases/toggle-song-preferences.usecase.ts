import {
  SONG_REPOSITORY,
  type ISongRepository,
} from '@modules/songs/domain/repositories/song-repository.interface';
import { SongMapper } from '@modules/songs/infrastructure/mappers/song.mapper';
import { UserPreferencesEntity } from '@modules/users/domain/entities/user-preferences.entity';
import {
  USER_PREFERENCES_REPOSITORY,
  type IUserPreferencesRepository,
} from '@modules/users/domain/repositories/user-preferences-repository.interface';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class ToggleSongPreferencesUseCase {
  constructor(
    @Inject(USER_PREFERENCES_REPOSITORY)
    private readonly userPreferencesRepository: IUserPreferencesRepository,
    @Inject(SONG_REPOSITORY)
    private readonly songRepository: ISongRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(
    userId: string,
    songId: string,
    preference: 'likedSongs' | 'dislikedSongs',
  ): Promise<UserPreferencesEntity> {
    const userPreferences =
      await this.userPreferencesRepository.findByUserId(userId);

    if (!userPreferences) {
      throw new NotFoundException(
        `Preferencias de usuario no encontradas para el usuario ${userId}`,
      );
    }

    const song = await this.songRepository.findById(songId);
    if (!song) {
      throw new NotFoundException(`Canción no encontrada con ID ${songId}`);
    }

    const songSummary = SongMapper.toSummaryVO(song);

    if (preference === 'likedSongs') {
      userPreferences.toggleLikedSong(songSummary);

      if (userPreferences.hasLikedSong(songSummary.id)) {
        this.eventEmitter.emit('song.liked', songId);
      } else {
        this.eventEmitter.emit('song.disliked', songId);
      }
    } else {
      userPreferences.toggleDislikedSong(songSummary);
    }

    await this.userPreferencesRepository.update(userPreferences);
    return userPreferences;
  }
}
