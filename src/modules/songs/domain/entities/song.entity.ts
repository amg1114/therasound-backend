import { EmotionType } from '@common/domain/value-objects/emotion.vo';
import { EmotionVO } from '../../../../common/domain/value-objects/emotion.vo';
import { AudioFeaturesVO } from '../value-objects/audio-features.vo';
import { EmotionDistancesVO } from '../value-objects/emotion-distances.vo';
import { EmotionProbabilitiesVO } from '../value-objects/emotion-probabilities.vo';
export class SongEntity {
  id: string;

  // External metadata
  reccobeatsId?: string;
  spotifyId: string;
  spotifyUrl: string;

  title: string;
  artist: string;
  durationMs: number;
  genres: string[];
  imageUrl: string;
  releaseDate: Date;
  audioFeatures: AudioFeaturesVO;

  // Emotion analysis data
  emotion: EmotionVO;
  emotionProbabilities: EmotionProbabilitiesVO;
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
    emotionProbabilities: EmotionProbabilitiesVO,
    emotionDistances: EmotionDistancesVO,
  ) {
    this.emotion = emotion;
    this.emotionProbabilities = emotionProbabilities;
    this.emotionDistances = emotionDistances;
  }

  getEmotionDistance(targetEmotion: EmotionVO | EmotionType): number {
    const targetEmotionValue =
      targetEmotion instanceof EmotionVO
        ? targetEmotion.getValue()
        : targetEmotion;

    return this.emotionDistances[targetEmotionValue];
  }
}
