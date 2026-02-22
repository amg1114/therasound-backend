import {
  EmotionType,
  EmotionVO,
} from '@common/domain/value-objects/emotion.vo';
import {
  type ISongRepository,
  SONG_REPOSITORY,
} from '@modules/songs/domain/repositories/song-repository.interface';
import { SongEmotionService } from '@modules/songs/infrastructure/services';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class RecalculateEmotionAnalysisUseCase {
  constructor(
    @Inject(SONG_REPOSITORY)
    private readonly songRepository: ISongRepository,
    private readonly songEmotionAnalysisService: SongEmotionService,
  ) {}

  async execute() {
    const allSongs = await this.songRepository.findAll();
    let processedCount = 0;
    const updatedReport: Record<
      EmotionType,
      Record<EmotionType, number>
    > = {} as Record<EmotionType, Record<EmotionType, number>>;

    for (const song of allSongs) {
      processedCount++;
      const { dominantEmotion, emotionProbabilities, emotionDistances } =
        this.songEmotionAnalysisService.calculateSongEmotionAnalysis(song);

      if (!dominantEmotion) {
        continue; // Skip if emotion analysis fails
      }

      const oldEmotion = song.emotion.getValue();
      const newEmotion = EmotionVO.create(dominantEmotion);

      song.updateEmotionAnalysis(
        newEmotion,
        emotionProbabilities,
        emotionDistances,
      );

      if (!updatedReport[oldEmotion]) {
        updatedReport[oldEmotion] = {} as (typeof updatedReport)[EmotionType];
      }

      updatedReport[oldEmotion][newEmotion.getValue()] =
        (updatedReport[oldEmotion][newEmotion.getValue()] || 0) + 1;

      await this.songRepository.save(song);
    }
    return { processed: processedCount, updatedReport };
  }
}
