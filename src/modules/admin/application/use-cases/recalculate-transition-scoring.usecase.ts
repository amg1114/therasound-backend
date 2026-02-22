import { EmotionVO } from '@common/domain/value-objects/emotion.vo';
import {
  type ISongRepository,
  SONG_REPOSITORY,
} from '@modules/songs/domain/repositories/song-repository.interface';
import { SongEmotionService } from '@modules/songs/infrastructure/services';
import { Inject, Injectable, Logger } from '@nestjs/common';
import pLimit from 'p-limit';

@Injectable()
export class RecalculateSongEmotionUseCase {
  private readonly logger = new Logger(RecalculateSongEmotionUseCase.name);

  constructor(
    @Inject(SONG_REPOSITORY)
    private readonly songRepository: ISongRepository,
    private readonly songEmotionService: SongEmotionService,
  ) {}

  async execute() {
    const limit = pLimit(20);
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
            const { dominantEmotion, emotionDistances, emotionProbabilities } =
              this.songEmotionService.calculateSongEmotionAnalysis(song);

            if (!dominantEmotion) {
              this.logger.error(
                `Emotion analysis failed for song ID: ${song.id}`,
              );
              return; // Skip if emotion analysis fails
            }

            song.emotion = EmotionVO.create(dominantEmotion);
            song.emotionDistances = emotionDistances;
            song.emotionProbabilities = emotionProbabilities;
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
