import {
  type ISongRepository,
  SONG_REPOSITORY,
} from '@modules/songs/domain/repositories/song-repository.interface';
import { SongEmotionService } from '@modules/songs/infrastructure/services';
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
            const emotionDistances =
              this.songEmotionService.calculateSongEmotionDistances(song);

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
