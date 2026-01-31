import { SongEmotionType } from '@modules/songs/domain/value-objects/song-emotion.vo';
import { Injectable } from '@nestjs/common';

/**
 * Service to map emotion analysis results to song emotions
 * Maps the output from chatbot emotion analysis to valid song emotion values
 */
@Injectable()
export class EmotionMappingService {
  /**
   * Maps an analyzed emotion string to a song emotion
   * @param analyzedEmotion - The emotion returned from chatbot analysis
   * @returns A valid song emotion: 'happy', 'sad', 'energetic', or 'calm'
   */
  mapToSongEmotion(analyzedEmotion: string): string {
    const normalized = analyzedEmotion.toLowerCase().trim();

    // Mapping patterns for different emotions
    const emotionMap: Record<string, SongEmotionType> = {
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
      return emotionMap[normalized];
    }

    // Check for partial matches
    for (const [key, value] of Object.entries(emotionMap)) {
      if (normalized.includes(key)) {
        return value;
      }
    }

    // Default to calm if no match found
    return 'calm';
  }
}
