import {
  EmotionType,
  EmotionVO,
} from '@common/domain/value-objects/emotion.vo';

/**
 * Service to map emotion analysis results to song emotions
 * Maps the output from chatbot emotion analysis to valid song emotion values
 */
export class EmotionMapper {
  static analysisToCurrent(analyzedEmotion: string): EmotionVO {
    const normalized = analyzedEmotion.toLowerCase().trim();

    const currentMap: Record<string, EmotionType> = {
      joy: 'happy',
      calm: 'calm',
      sadness: 'sad',
      anxiety: 'energetic',
      stress: 'energetic',
      anger: 'energetic',
      fatigue: 'sad',
    };

    return EmotionVO.create(currentMap[normalized] ?? 'calm');
  }

  static analysisToTarget(analyzedEmotion: string): EmotionVO {
    const normalized = analyzedEmotion.toLowerCase().trim();

    const targetMap: Record<string, EmotionType> = {
      anxiety: 'calm',
      stress: 'calm',
      fatigue: 'calm',
      sadness: 'happy',
      anger: 'calm',
      joy: 'happy',
      calm: 'happy', // leve uplift
    };

    return EmotionVO.create(targetMap[normalized] ?? 'calm');
  }
}
