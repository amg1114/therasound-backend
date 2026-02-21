import { EmotionVO } from '@common/domain/value-objects/emotion.vo';
import {
  BuilderConfig,
  PlaylistBuilderState,
} from '@modules/playlists/domain/entities/playlist-builder-state.entity';
import { PlaylistEntity } from '@modules/playlists/domain/entities/playlist.entity';
import { SongEntity } from '@modules/songs/domain/entities/song.entity';
import { UserPreferencesEntity } from '@modules/users/domain/entities/user-preferences.entity';
import { Injectable } from '@nestjs/common';
import { SongScoringService } from '../../domain/services/song-scoring.service';

@Injectable()
export class PlaylistBuilderService {
  private readonly config: BuilderConfig = {
    minDurationMs: 30 * 60 * 1000, // 15 min
    maxStepIncrement: 0.05,
    initialMaxStep: 0.15,
    maxTotalIterations: 1000, // Prevent runaway loops
    maxConsecutiveFailures: 50, // Stop after 50 failed attempts in a row
  };

  constructor(private readonly scoringService: SongScoringService) {}

  buildPlaylist(
    availableSongs: SongEntity[],
    currentEmotion: EmotionVO,
    targetEmotion: EmotionVO,
    userPreferences: UserPreferencesEntity,
  ): Partial<PlaylistEntity> {
    const builder = new PlaylistBuilderState(
      availableSongs,
      currentEmotion,
      targetEmotion,
      userPreferences,
      this.scoringService,
      this.config,
    );

    return builder.build();
  }
}
