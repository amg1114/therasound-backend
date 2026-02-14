import { EmotionType } from '../../../../common/domain/value-objects/emotion.vo';

export type SongSummaryVO = {
  id: string;
  title: string;
  artist: string;
  genres: string[];
  emotion: EmotionType;
  imageUrl: string;
  spotifyId: string;
};
