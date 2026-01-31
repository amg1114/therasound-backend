import { SongEmotionVO } from '../value-objects/song-emotion.vo';

export interface AudioFeatures {
  acousticness?: number;
  danceability?: number;
  energy?: number;
  instrumentalness?: number;
  liveness?: number;
  loudness?: number;
  speechiness?: number;
  tempo?: number;
  valence?: number;
}

export interface EmotionProbabilities {
  calm?: number;
  energetic?: number;
  happy?: number;
  sad?: number;
}

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

  // Emotion analysis data
  audioFeatures?: AudioFeatures;
  emotionConfidence?: number;
  emotionProbabilities?: EmotionProbabilities;
  reccobeatsId?: string;
}
