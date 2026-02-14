import { EmotionVO } from '../../../../common/domain/value-objects/emotion.vo';
import { AudioFeaturesVO } from '../value-objects/audio-features.vo';
import { EmotionProbabilitiesVO } from '../value-objects/emotion-probabilities.vo';

export class SongEntity {
  id: string;
  spotifyId: string;
  title: string;
  artist: string;
  emotion: EmotionVO;
  durationMs: number;
  spotifyUrl: string;
  genres: string[];
  imageUrl: string;
  releaseDate: Date;

  // Emotion analysis data
  audioFeatures: AudioFeaturesVO;
  emotionConfidence: number;
  emotionProbabilities: EmotionProbabilitiesVO;
  reccobeatsId: string;

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
}
