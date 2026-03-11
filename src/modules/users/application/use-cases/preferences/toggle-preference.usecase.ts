import {
  ARTIST_REPOSITORY,
  type ArtistRepository,
} from '@modules/artists/domain/repositories';
import {
  GENRE_REPOSITORY,
  type IGenreRepository,
} from '@modules/genres/domain/repositories/genre-repository.interface';
import {
  type ISongRepository,
  SONG_REPOSITORY,
} from '@modules/songs/domain/repositories/song-repository.interface';
import { SongMapper } from '@modules/songs/infrastructure/mappers';
import {
  ContentType,
  PreferenceType,
} from '@modules/users/domain/entities/types/content-preference.type';
import {
  USER_PREFERENCES_REPOSITORY,
  type UserPreferencesRepository,
} from '@modules/users/domain/repositories';
import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class TogglePreferenceUseCase {
  constructor(
    @Inject(USER_PREFERENCES_REPOSITORY)
    private readonly userPreferencesRepository: UserPreferencesRepository,
    @Inject(SONG_REPOSITORY)
    private readonly songRepository: ISongRepository,
    @Inject(GENRE_REPOSITORY)
    private readonly genreRepository: IGenreRepository,
    @Inject(ARTIST_REPOSITORY)
    private readonly artistRepository: ArtistRepository,

    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(
    userId: string,
    contentType: ContentType,
    preferenceType: PreferenceType,
    contentId: string,
  ) {
    const userPreferences =
      await this.userPreferencesRepository.findByUserId(userId);

    if (!userPreferences) {
      throw new Error(
        `Preferencias de usuario no encontradas para el usuario ${userId}`,
      );
    }

    if (contentType === 'songs') {
      const song = await this.songRepository.findById(contentId);
      const wasLiked = userPreferences.hasLikedSong(contentId);

      if (!song) {
        throw new NotFoundException(
          `Canción con ID ${contentId} no encontrada`,
        );
      }

      userPreferences.toggleSongPreference(
        SongMapper.toSummaryVO(song),
        preferenceType,
      );

      if (userPreferences.hasLikedSong(contentId)) {
        Logger.log(`Usuario ${userId} ha dado like a la canción ${song.title}`);
        this.eventEmitter.emit('song.liked', song.id);
      } else if (wasLiked) {
        this.eventEmitter.emit('song.disliked', song.id);
      }
    }

    if (contentType === 'genres') {
      const genre = await this.genreRepository.findByName(contentId);
      if (!genre) {
        throw new NotFoundException(
          `Género con nombre ${contentId} no encontrado`,
        );
      }
      userPreferences.toggleGenrePreference(contentId, preferenceType);
    }

    if (contentType === 'artists') {
      const artist = await this.artistRepository.findByName(contentId);
      if (!artist) {
        throw new NotFoundException(
          `Artista con nombre ${contentId} no encontrado`,
        );
      }
      userPreferences.toggleArtistPreference(contentId, preferenceType);
    }

    return this.userPreferencesRepository.save(userPreferences);
  }
}
