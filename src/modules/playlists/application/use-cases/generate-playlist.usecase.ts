import {
  CHATBOT_SERVICE_TOKEN,
  type IChatbotService,
} from '@modules/chatbot/infrastructure/services/chatbot-service.interface';
import { PlaylistEntity } from '@modules/playlists/domain/entities/playlist.entity';
import {
  PLAYLIST_REPOSITORY,
  type IPlaylistRepository,
} from '@modules/playlists/domain/repositories/playlist-repository.interface';
import { GeneratePlaylistRequestDto } from '@modules/playlists/presentation/dto/requests/generate-playlist-request.dto';
import {
  SONG_REPOSITORY,
  type ISongRepository,
} from '@modules/songs/domain/repositories/song-repository.interface';
import {
  USER_STATISTICS_REPOSITORY,
  type UserStatisticsRepository,
} from '@modules/users/domain/repositories';
import {
  USER_PREFERENCES_REPOSITORY,
  type UserPreferencesRepository,
} from '@modules/users/domain/repositories/user-preferences.repository.interface';
import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { EmotionMapper } from '../../../../common/infrastructure/mappers/emotion.mapper';
import { PlaylistBuilderService } from '../services/playlist-builder.service';

const MIN_SONGS_THRESHOLD = 20;

@Injectable()
export class GeneratePlaylistUseCase {
  private readonly logger = new Logger(GeneratePlaylistUseCase.name);

  constructor(
    private readonly playlistBuilderService: PlaylistBuilderService,

    @Inject(CHATBOT_SERVICE_TOKEN)
    private readonly chatbotService: IChatbotService,
    @Inject(PLAYLIST_REPOSITORY)
    private readonly playlistRepository: IPlaylistRepository,
    @Inject(SONG_REPOSITORY)
    private readonly songRepository: ISongRepository,
    @Inject(USER_PREFERENCES_REPOSITORY)
    private readonly userPreferencesRepository: UserPreferencesRepository,
    @Inject(USER_STATISTICS_REPOSITORY)
    private readonly statisticsRepository: UserStatisticsRepository,
  ) {}

  async execute(
    userId: string,
    { conversationHistory }: GeneratePlaylistRequestDto,
  ): Promise<PlaylistEntity> {
    // 1. Analyze emotion from conversation history
    const { emotion: emotionAnalysis, playlistTitle } =
      await this.chatbotService.getEmotionAnalysis(conversationHistory);

    // 2. Map analyzed emotion to song emotion
    const currentEmotion = EmotionMapper.analysisToCurrent(emotionAnalysis);
    const targetEmotion = EmotionMapper.analysisToTarget(emotionAnalysis);

    // 3. Get user preferences to apply filtering
    const userPreferences =
      await this.userPreferencesRepository.findByUserId(userId);

    if (!userPreferences) {
      throw new NotFoundException(
        `User preferences not found for user ID: ${userId}`,
      );
    }

    const availableSongs = await this.songRepository.findPlaylistCandidates(
      1000,
      0.5,
    );

    if (availableSongs.length < MIN_SONGS_THRESHOLD) {
      throw new NotFoundException(
        `Not enough songs available to generate a playlist.`,
      );
    }

    const newPlaylist = this.playlistBuilderService.buildPlaylist(
      availableSongs,
      currentEmotion,
      targetEmotion,
      userPreferences,
    );

    newPlaylist.title = playlistTitle;

    const playlist = await this.playlistRepository.create(newPlaylist);
    this.logger.log(
      `Generated playlist for user ${userId} with ${playlist.songs.length} songs, from ${currentEmotion.getValue()} to ${targetEmotion.getValue()}`,
    );

    const statistics = await this.statisticsRepository.findByUserId(userId);
    if (statistics) {
      statistics.totalPlaylists += 1;
      await this.statisticsRepository.update(statistics);
    }

    return playlist;
  }
}
