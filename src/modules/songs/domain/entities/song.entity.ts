import { EmotionType } from '@common/domain/value-objects/emotion.vo';
import { EmotionVO } from '../../../../common/domain/value-objects/emotion.vo';
import { AudioFeaturesVO } from '../value-objects/audio-features.vo';
import { EmotionDistancesVO } from '../value-objects/emotion-distances.vo';
import { EmotionProbabilitiesVO } from '../value-objects/emotion-probabilities.vo';
export class SongEntity {
  id: string;
  spotifyId: string;
  title: string;
  artist: string;
  durationMs: number;
  spotifyUrl: string;
  genres: string[];
  imageUrl: string;
  releaseDate: Date;
  audioFeatures: AudioFeaturesVO;

  // Emotion analysis data
  emotion: EmotionVO;
  emotionConfidence: number;
  emotionProbabilities: EmotionProbabilitiesVO;
  reccobeatsId?: string;
  emotionDistances: EmotionDistancesVO;

  // Statistics
  likesCount: number;
  skipCount: number;
  playCount: number;
  averageCompletionRate: number;

  static create(data: Partial<SongEntity>): SongEntity {
    const song = new SongEntity();
    Object.assign(song, data);
    return song;
  }

  // En SongEntity
  static groupByDominantEmotion(
    songs: SongEntity[],
  ): Record<string, SongEntity[]> {
    return EmotionVO.SONG_EMOTIONS.reduce(
      (acc, emotion) => {
        acc[emotion] = songs
          .filter((s) => {
            const minDistance = Math.min(
              ...EmotionVO.SONG_EMOTIONS.map((e) => s.getEmotionDistance(e)),
            );
            return s.getEmotionDistance(emotion) === minDistance;
          })
          .sort(
            (a, b) =>
              b.getEmotionDistance(emotion) - a.getEmotionDistance(emotion),
          );
        return acc;
      },
      {} as Record<string, SongEntity[]>,
    );
  }

  updateEmotionAnalysis(
    emotion: EmotionVO,
    confidence: number,
    probabilities: EmotionProbabilitiesVO,
    reccobeatsId?: string,
    transitionScoring?: EmotionDistancesVO,
  ) {
    this.emotion = emotion;
    this.emotionConfidence = confidence;
    this.emotionProbabilities = probabilities;
    if (reccobeatsId) {
      this.reccobeatsId = reccobeatsId;
    }
    if (transitionScoring) {
      this.emotionDistances = transitionScoring;
    }
  }

  getEmotionDistance(targetEmotion: EmotionVO | EmotionType): number {
    const targetEmotionValue =
      targetEmotion instanceof EmotionVO
        ? targetEmotion.getValue()
        : targetEmotion;

    return this.emotionDistances[targetEmotionValue];
  }
}
