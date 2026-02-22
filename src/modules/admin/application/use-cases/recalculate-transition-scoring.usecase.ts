import { EmotionVO } from '@common/domain/value-objects/emotion.vo';
import { SongScoringService } from '@modules/playlists/domain/services/song-scoring.service';
import {
  type ISongRepository,
  SONG_REPOSITORY,
} from '@modules/songs/domain/repositories/song-repository.interface';
import { EmotionDistancesVO } from '@modules/songs/domain/value-objects/emotion-distances.vo';
import { Inject, Injectable, Logger } from '@nestjs/common';
import pLimit from 'p-limit';

@Injectable()
export class RecalculateTransitionScoringUseCase {
  private readonly logger = new Logger(
    RecalculateTransitionScoringUseCase.name,
  );

  constructor(
    @Inject(SONG_REPOSITORY)
    private readonly songRepository: ISongRepository,
    private readonly scoringService: SongScoringService,
  ) {}

  async execute() {
    const limit = pLimit(20);
    const emotions = EmotionVO.SONG_EMOTIONS;
    const batchSize = 500;
    let processed = 0;
    let skip = 0;

    while (true) {
      // Traer en lotes en lugar de findAll
      const songs = await this.songRepository.findPaginated(skip, batchSize);
      if (songs.length === 0) break;

      await Promise.all(
        songs.map((song) =>
          limit(async () => {
            const emotionDistances: EmotionDistancesVO =
              {} as EmotionDistancesVO;

            for (const emotion of emotions) {
              const targetEmotion = EmotionVO.create(emotion);
              emotionDistances[emotion] =
                this.scoringService.calculateTargetDistance(
                  song,
                  targetEmotion,
                );
            }

            song.emotionDistances = emotionDistances;
            processed++;
            return this.songRepository.save(song);
          }),
        ),
      );

      this.logger.log(`Processed ${processed} songs...`);
      skip += batchSize;
    }

    this.logger.log(`Done. Total: ${processed}`);
  }
}
