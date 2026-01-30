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
    const emotionMap: Record<string, string> = {
      // Happy mappings
      feliz: 'happy',
      alegre: 'happy',
      contento: 'happy',
      happy: 'happy',
      joy: 'happy',
      excited: 'happy',
      optimista: 'happy',
      positivo: 'happy',

      // Sad mappings
      triste: 'sad',
      melancólico: 'sad',
      deprimido: 'sad',
      sad: 'sad',
      depressed: 'sad',
      down: 'sad',
      nostálgico: 'sad',
      solo: 'sad',

      // Energetic mappings
      energético: 'energetic',
      activo: 'energetic',
      motivado: 'energetic',
      energetic: 'energetic',
      motivated: 'energetic',
      enérgico: 'energetic',
      dinámico: 'energetic',
      vigoroso: 'energetic',

      // Calm mappings
      calmado: 'calm',
      tranquilo: 'calm',
      relajado: 'calm',
      calm: 'calm',
      relaxed: 'calm',
      peaceful: 'calm',
      sereno: 'calm',
      pacífico: 'calm',
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
