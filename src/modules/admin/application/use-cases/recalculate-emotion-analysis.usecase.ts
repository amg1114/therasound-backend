import {
  EmotionType,
  EmotionVO,
} from '@common/domain/value-objects/emotion.vo';
import {
  type ISongRepository,
  SONG_REPOSITORY,
} from '@modules/songs/domain/repositories/song-repository.interface';
import { EmotionAnalysisResponseDto } from '@modules/songs/infrastructure/dto/emotion-analysis-response.dto';
import { ExternalMusicApiService } from '@modules/songs/infrastructure/services/external-music-api.service';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class RecalculateEmotionAnalysisUseCase {
  constructor(
    @Inject(SONG_REPOSITORY)
    private readonly songRepository: ISongRepository,
    private readonly externalMusicApiService: ExternalMusicApiService,
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
      let emotionAnalysis: EmotionAnalysisResponseDto | null = null;

      if (song.reccobeatsId) {
        emotionAnalysis =
          await this.externalMusicApiService.getEmotionDataForReccoBeats(
            song.reccobeatsId,
          );
      } else if (song.spotifyId) {
        emotionAnalysis =
          await this.externalMusicApiService.getEmotionDataFromFeatures(
            song.audioFeatures,
          );
      }

      if (
        emotionAnalysis &&
        emotionAnalysis.emotion !== song.emotion.getValue()
      ) {
        const oldEmotion = song.emotion.getValue();
        const newEmotion = EmotionVO.create(emotionAnalysis.emotion);

        song.updateEmotionAnalysis(
          newEmotion,
          emotionAnalysis.confidence,
          emotionAnalysis.probabilities,
          song.reccobeatsId, // Keep existing ReccoBeats ID if present
        );

        if (!updatedReport[oldEmotion]) {
          updatedReport[oldEmotion] = {} as (typeof updatedReport)[EmotionType];
        }

        updatedReport[oldEmotion][newEmotion.getValue()] =
          (updatedReport[oldEmotion][newEmotion.getValue()] || 0) + 1;

        await this.songRepository.save(song);
      }
    }
    return { processed: processedCount, updatedReport };
  }
}
