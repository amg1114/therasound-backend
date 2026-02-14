import {
  EmotionType,
  EmotionVO,
} from '@common/domain/value-objects/emotion.vo';

/**
 * Service to map emotion analysis results to song emotions
 * Maps the output from chatbot emotion analysis to valid song emotion values
 */
export class EmotionMapper {
  /**
   * Maps an analyzed emotion string to a song emotion
   * @param analyzedEmotion - The emotion returned from chatbot analysis
   * @returns A valid song emotion: 'happy', 'sad', 'energetic', or 'calm'
   */
  static mapToSongEmotion(analyzedEmotion: string): EmotionVO {
    const normalized = analyzedEmotion.toLowerCase().trim();
    // Mapping patterns for different emotions
    const emotionMap: Record<string, EmotionType> = {
      joy: 'happy',
      calm: 'happy',
      anxiety: 'calm',
      stress: 'calm',
      fatigue: 'calm',
      sadness: 'happy',
      anger: 'energetic',
    };

    // Check for exact match
    if (emotionMap[normalized]) {
      return EmotionVO.create(emotionMap[normalized]);
    }

    // Check for partial matches
    for (const [key, value] of Object.entries(emotionMap)) {
      if (normalized.includes(key)) {
        return EmotionVO.create(value);
      }
    }

    // Default to calm if no match found
    return EmotionVO.create('calm');
  }
}
