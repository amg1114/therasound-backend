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
import { UpdateLikedSongsRequestDto } from '@modules/users/presentation/dto/requests/update-liked-songs-request.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { SongLikedEvent } from '../events/song-liked.event';

@Injectable()
export class UpdateLikedSongsUseCase {
  constructor(
    @Inject(USER_PREFERENCES_REPOSITORY)
    private readonly userPreferencesRepository: IUserPreferencesRepository,
    @Inject(SONG_REPOSITORY)
    private readonly songRepository: ISongRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(
    userId: string,
    dto: UpdateLikedSongsRequestDto,
  ): Promise<UserPreferencesEntity> {
    const { songId, action } = dto;

    const userPreferences =
      await this.userPreferencesRepository.findByUserId(userId);

    if (!userPreferences) {
      throw new NotFoundException(
        `Preferencias de usuario no encontradas para el usuario ${userId}`,
      );
    }

    const updatedLikedSongs = [...userPreferences.likedSongs];

    if (action === 'add') {
      // Fetch the song entity
      const song = await this.songRepository.findById(songId);
      if (!song) {
        throw new NotFoundException(`Canción no encontrada: ${songId}`);
      }

      // Check if song is not already in the list
      if (!updatedLikedSongs.find((s) => s.id === songId)) {
        updatedLikedSongs.push(song);
      }
    } else if (action === 'remove') {
      const index = updatedLikedSongs.findIndex((s) => s.id === songId);
      if (index > -1) {
        updatedLikedSongs.splice(index, 1);
      }
    }

    const updatedPreferences = UserPreferencesEntity.reconstruct({
      id: userPreferences.id!,
      userId: userPreferences.userId,
      likedSongs: updatedLikedSongs,
      dislikedSongs: userPreferences.dislikedSongs,
      dislikedGenres: userPreferences.dislikedGenres,
      dislikedArtists: userPreferences.dislikedArtists,
    });

    const result =
      await this.userPreferencesRepository.update(updatedPreferences);

    // Emit event to update song likes count
    this.eventEmitter.emit('song.liked', new SongLikedEvent(songId, action));

    return result;
  }
}
