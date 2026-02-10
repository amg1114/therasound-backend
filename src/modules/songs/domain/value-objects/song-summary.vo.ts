import { SongEmotionType } from './song-emotion.vo';

export type SongSummaryVO = {
  id: string;
  title: string;
  artist: string;
  genres: string[];
  emotion: SongEmotionType;
  imageUrl: string;
  spotifyId: string;
};
