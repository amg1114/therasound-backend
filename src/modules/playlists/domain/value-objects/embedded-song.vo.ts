import { EmotionProbabilitiesVO } from '@modules/songs/domain/value-objects/emotion-probabilities.vo';

export type EmbeddedSongVO = {
  id: string;
  spotifyId: string;
  title: string;
  artist: string;
  emotion: string;
  emotionProbabilities: EmotionProbabilitiesVO;
  durationMs: number;
  spotifyUrl: string;
  genres: string[];
  imageUrl: string;
  releaseDate: Date;
};
