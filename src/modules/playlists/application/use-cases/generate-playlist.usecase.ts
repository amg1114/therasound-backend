import { Inject, Injectable } from '@nestjs/common';
import {
  CHATBOT_SERVICE_TOKEN,
  type IChatbotService,
} from '@modules/chatbot/infrastructure/services/chatbot-service.interface';
import {
  PLAYLIST_REPOSITORY,
  type IPlaylistRepository,
} from '@modules/playlists/domain/repositories/playlist-repository.interface';
import {
  SONG_REPOSITORY,
  type ISongRepository,
} from '@modules/songs/domain/repositories/song-repository.interface';
import {
  USER_PREFERENCES_REPOSITORY,
  type IUserPreferencesRepository,
} from '@modules/users/domain/repositories/user-preferences-repository.interface';
import { GeneratePlaylistRequestDto } from '@modules/playlists/presentation/dto/requests/generate-playlist-request.dto';
import { PlaylistEntity } from '@modules/playlists/domain/entities/playlist.entity';
import { EmotionMappingService } from '../services/emotion-mapping.service';
import { SongEmotionVO } from '@modules/songs/domain/value-objects/song-emotion.vo';
import { SongEntity } from '@modules/songs/domain/entities/song.entity';

const MIN_DURATION_MS = 10 * 60 * 1000; // 10 minutes in milliseconds

@Injectable()
export class GeneratePlaylistUseCase {
  constructor(
    @Inject(CHATBOT_SERVICE_TOKEN)
    private readonly chatbotService: IChatbotService,
    @Inject(PLAYLIST_REPOSITORY)
    private readonly playlistRepository: IPlaylistRepository,
    @Inject(SONG_REPOSITORY)
    private readonly songRepository: ISongRepository,
    @Inject(USER_PREFERENCES_REPOSITORY)
    private readonly userPreferencesRepository: IUserPreferencesRepository,
    private readonly emotionMappingService: EmotionMappingService,
  ) {}

  async execute(
    userId: string,
    dto: GeneratePlaylistRequestDto,
  ): Promise<PlaylistEntity> {
    // 1. Analyze emotion from conversation history
    const emotionAnalysis = await this.chatbotService.getEmotionAnalysis(
      dto.conversationHistory,
    );

    // 2. Map analyzed emotion to song emotion
    const songEmotion =
      this.emotionMappingService.mapToSongEmotion(emotionAnalysis);

    // 3. Get user preferences to apply filtering
    const userPreferences =
      await this.userPreferencesRepository.findByUserId(userId);

    // 4. Get available songs with filters applied
    const availableSongs = userPreferences
      ? await this.songRepository.findByEmotionWithFilters(songEmotion, {
          excludedSongIds: userPreferences.dislikedSongs,
          excludedArtistIds: userPreferences.dislikedArtists,
          excludedGenres: userPreferences.dislikedGenres,
        })
      : await this.songRepository.findByEmotion(songEmotion);

    // 5. Get last playlist for this user and emotion
    const lastPlaylist =
      await this.playlistRepository.findLastByUserIdAndEmotion(
        userId,
        songEmotion,
      );

    // 6. Get song IDs from last playlist
    const lastPlaylistSongIds = lastPlaylist
      ? lastPlaylist.songs.map((s) => s.id)
      : [];

    // 7. Select songs with constraints
    const selectedSongs = this.selectSongs(
      availableSongs,
      lastPlaylistSongIds,
      MIN_DURATION_MS,
    );

    // 8. Calculate total duration
    const totalDuration = selectedSongs.reduce(
      (sum, song) => sum + song.durationMs,
      0,
    );

    // 9. Create playlist
    const playlist = PlaylistEntity.create({
      userId,
      songs: selectedSongs,
      emotion: SongEmotionVO.create(songEmotion),
      durationMs: totalDuration,
    });

    // 10. Save and return
    return await this.playlistRepository.create(playlist);
  }

  /**
   * Selects songs for the playlist following the constraints:
   * - Total duration >= minDuration
   * - Maximum 50% of songs can be from the last playlist
   */
  private selectSongs(
    availableSongs: SongEntity[],
    lastPlaylistSongIds: string[],
    minDuration: number,
  ): SongEntity[] {
    // Shuffle available songs for randomness
    const shuffled = [...availableSongs].sort(() => Math.random() - 0.5);

    // Separate songs into used and unused
    const usedSongs = shuffled.filter((song) =>
      lastPlaylistSongIds.includes(song.id),
    );
    const unusedSongs = shuffled.filter(
      (song) => !lastPlaylistSongIds.includes(song.id),
    );

    const selected: SongEntity[] = [];
    let totalDuration = 0;
    let usedSongCount = 0;

    // Prioritize unused songs
    for (const song of unusedSongs) {
      selected.push(song);
      totalDuration += song.durationMs;

      if (totalDuration >= minDuration) {
        return selected;
      }
    }

    // If we still need more duration, add used songs (up to 50% of total)
    for (const song of usedSongs) {
      const maxUsedAllowed = Math.floor(selected.length / 2);

      if (usedSongCount < maxUsedAllowed) {
        selected.push(song);
        totalDuration += song.durationMs;
        usedSongCount++;

        if (totalDuration >= minDuration) {
          return selected;
        }
      }
    }

    // If still not enough duration, keep adding unused songs
    let idx = 0;
    while (totalDuration < minDuration && idx < unusedSongs.length) {
      const song = unusedSongs[idx % unusedSongs.length];
      if (!selected.find((s) => s.id === song.id)) {
        selected.push(song);
        totalDuration += song.durationMs;
      }
      idx++;
    }

    return selected;
  }
}
