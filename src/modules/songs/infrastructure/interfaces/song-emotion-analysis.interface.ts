import { EmotionType } from '@common/domain/value-objects/emotion.vo';
import { EmotionDistancesVO } from '@modules/songs/domain/value-objects/emotion-distances.vo';
import { EmotionProbabilitiesVO } from '@modules/songs/domain/value-objects/emotion-probabilities.vo';

export interface ISongEmotionAnalysis {
  emotionDistances: EmotionDistancesVO;
  emotionProbabilities: EmotionProbabilitiesVO;
  dominantEmotion: EmotionType | null;
}
