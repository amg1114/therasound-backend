import { EmotionType } from '@common/domain/value-objects/emotion.vo';

export interface IPlaylistSummary {
  id: string;
  titulo?: string;
  initialEmotion: EmotionType;
  targetEmotion: EmotionType;
  songCount: number;
}
