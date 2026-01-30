import { SongEmotionVO } from '../value-objects/song-emotion.vo';

export class SongEntity {
  id: string;
  spotifyId: string;
  title: string;
  artist: string;
  emotion: SongEmotionVO;
  durationMs: number;
  spotifyUrl: string;
  genres: string[];
  imageUrl: string;
  releaseDate: Date;
}
