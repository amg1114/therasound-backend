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
  USER_PREFERENCES_REPOSITORY,
  type IUserPreferencesRepository,
} from '@modules/users/domain/repositories/user-preferences-repository.interface';
import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { EmotionMapper } from '../../infrastructure/mappers/emotion.mapper';
import { PlaylistBuilderService } from '../services/playlist-builder.service';

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
    private readonly userPreferencesRepository: IUserPreferencesRepository,
  ) {}

  async execute(
    userId: string,
    { conversationHistory }: GeneratePlaylistRequestDto,
  ): Promise<PlaylistEntity> {
    // 1. Analyze emotion from conversation history
    const emotionAnalysis =
      await this.chatbotService.getEmotionAnalysis(conversationHistory);

    // 2. Map analyzed emotion to song emotion
    const targetEmotion = EmotionMapper.mapToSongEmotion(emotionAnalysis);

    // 3. Get user preferences to apply filtering
    const userPreferences =
      await this.userPreferencesRepository.findByUserId(userId);

    if (!userPreferences) {
      throw new NotFoundException(
        `User preferences not found for user ID: ${userId}`,
      );
    }

    const availableSongs = await this.songRepository.findAll();

    const playlist = this.playlistBuilderService.buildPlaylist(
      availableSongs,
      targetEmotion,
      targetEmotion, // For simplicity, using the same emotion as current and target
      userPreferences,
    );

    return await this.playlistRepository.create(playlist);
  }
}
