import { EmotionType } from '@common/domain/value-objects/emotion.vo';

export interface IPlaylistSummary {
  id: string;
  title?: string;
  initialEmotion: EmotionType;
  targetEmotion: EmotionType;
  songCount: number;
  durationMs: number;
  createdAt: Date;
}
