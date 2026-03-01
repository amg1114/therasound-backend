import { ArtistSummary } from '@modules/artists/domain/entities';
import { EmotionType } from '../../../../common/domain/value-objects/emotion.vo';

export type SongSummaryVO = {
  id: string;
  title: string;
  artists: ArtistSummary[];
  genres: string[];
  emotion: EmotionType;
  imageUrl: string;
  spotifyId: string;
};
