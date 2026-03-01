import { ArtistSummary } from '@modules/artists/domain/entities';
import { EmotionProbabilitiesVO } from '@modules/songs/domain/value-objects/emotion-probabilities.vo';

export type EmbeddedSongVO = {
  id: string;
  spotifyId: string;
  title: string;
  artists: ArtistSummary[];
  emotion: string;
  emotionProbabilities: EmotionProbabilitiesVO;
  durationMs: number;
  spotifyUrl: string;
  genres: string[];
  imageUrl: string;
  releaseDate: Date;
};
