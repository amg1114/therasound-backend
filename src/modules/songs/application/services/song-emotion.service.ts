import { EmotionType } from '@common/domain/value-objects/emotion.vo';
import { SongEntity } from '@modules/songs/domain/entities/song.entity';
import { AudioFeaturesVO } from '@modules/songs/domain/value-objects/audio-features.vo';
import { EmotionDistancesVO } from '@modules/songs/domain/value-objects/emotion-distances.vo';
import { EmotionProbabilitiesVO } from '@modules/songs/domain/value-objects/emotion-probabilities.vo';
import { ISongEmotionAnalysis } from '@modules/songs/infrastructure/interfaces/song-emotion-analysis.interface';
import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EmotionFeatureValues } from 'src/config/app.config';
import { AudioProcessingService } from './audio-processing.service';

@Injectable()
export class SongEmotionService {
  private readonly emotionTargets: EmotionFeatureValues;
  private readonly emotionWeights: EmotionFeatureValues;

  constructor(
    configService: ConfigService,
    private readonly audioProcessingService: AudioProcessingService,
  ) {
    this.emotionTargets = configService.getOrThrow<EmotionFeatureValues>(
      'emotion_analysis.targets',
    );
    this.emotionWeights = configService.getOrThrow<EmotionFeatureValues>(
      'emotion_analysis.weights',
    );
  }

  /**
   * Calculates the weighted distance between audio features and target emotion features.
   *
   * @param audioFeatures - The audio features to compare against the target emotion
   * @param targetEmotion - The target emotion type to calculate distance for
   * @returns The normalized weighted distance between the current and target features.
   *          Returns 0 if total weight is 0 or if features are invalid.
   * @throws {BadRequestException} If the target emotion type is invalid or features cannot be normalized
   *
   * @example
   * const distance = emotionService.calculateFeaturesEmotionDistance(
   *   audioFeatures,
   *   EmotionType.Happy
   * );
   */
  calculateFeaturesEmotionDistance(
    audioFeatures: AudioFeaturesVO,
    targetEmotion: EmotionType,
  ): number {
    const emotionWeight = this.emotionWeights[targetEmotion];
    const targetFeatures = this.emotionTargets[targetEmotion];
    const currentFeatures =
      this.audioProcessingService.normalizeSongFeatures(audioFeatures);

    if (!targetFeatures || !currentFeatures) {
      throw new BadRequestException(`Invalid emotion type: ${targetEmotion}`);
    }

    let weightedDistance = 0;
    let totalWeight = 0;

    for (const [featureName, targetValue] of Object.entries(targetFeatures)) {
      const songValue = currentFeatures[featureName] as number | undefined;
      const weight = (emotionWeight[featureName] as number | undefined) || 0;

      if (songValue !== undefined && weight > 0) {
        weightedDistance += Math.abs(songValue - targetValue) * weight;
        totalWeight += weight;
      }
    }

    return totalWeight > 0 ? weightedDistance / totalWeight : 0;
  }

  /**
   * Calculates the emotional distance between a song's audio features and a target emotion.
   * @param song - The song entity containing audio features to analyze
   * @param targetEmotion - The target emotion type to compare against
   * @returns The calculated emotional distance as a number
   * @throws {BadRequestException} When the song is missing audio features
   */
  calculateSongEmotionDistance(
    song: SongEntity,
    targetEmotion: EmotionType,
  ): number {
    const audioFeatures = song.audioFeatures;

    if (!audioFeatures) {
      throw new BadRequestException(
        `Song ${song.spotifyId} is missing audio features`,
      );
    }

    return this.calculateFeaturesEmotionDistance(audioFeatures, targetEmotion);
  }

  /**
   * Calculates the emotional distance between audio features and each emotion target.
   * @param audioFeatures - The audio features to analyze
   * @returns An object containing the calculated distances for each emotion type
   */
  calculateFeaturesEmotionDistances(
    audioFeatures: AudioFeaturesVO,
  ): EmotionDistancesVO {
    const distances = {} as EmotionDistancesVO;
    for (const emotion of Object.keys(this.emotionTargets) as EmotionType[]) {
      distances[emotion] = this.calculateFeaturesEmotionDistance(
        audioFeatures,
        emotion,
      );
    }
    return distances;
  }

  /**
   * Calculates emotion distances for a given song based on its audio features.
   * @param song - The song entity containing audio features to analyze
   * @returns An object containing emotion distance values derived from the song's audio features
   * @throws {BadRequestException} When the song is missing audio features data
   */
  calculateSongEmotionDistances(song: SongEntity): EmotionDistancesVO {
    const audioFeatures = song.audioFeatures;

    if (!audioFeatures) {
      throw new BadRequestException(
        `Song ${song.spotifyId} is missing audio features`,
      );
    }

    return this.calculateFeaturesEmotionDistances(audioFeatures);
  }

  /**
   * Calculates emotion probabilities from emotion distances using inverse distance weighting.
   *
   * Converts raw distances to normalized probabilities by inverting each distance
   * and dividing by the sum of all inverted distances. This ensures probabilities
   * sum to 1 and emotions with smaller distances receive higher probabilities.
   *
   * @param distances - Object mapping emotion types to their distance values (0-1)
   * @returns Normalized emotion probabilities where each value represents the likelihood
   *          of each emotion, summing to 1 (or 0 if all distances equal 1)
   *
   * @example
   * const distances = { joy: 0.2, sadness: 0.8 };
   * const probs = calculateEmotionProbabilities(distances);
   * // Returns: { joy: 0.8, sadness: 0.2 }
   */
  calculateEmotionProbabilities(
    distances: EmotionDistancesVO,
  ): EmotionProbabilitiesVO {
    const totalInverseDistance = Object.values(distances).reduce(
      (sum, distance) => sum + (1 - distance),
      0,
    );

    const probabilities = {} as EmotionDistancesVO;
    for (const [emotion, distance] of Object.entries(distances)) {
      probabilities[emotion as EmotionType] =
        totalInverseDistance > 0 ? (1 - distance) / totalInverseDistance : 0;
    }

    return probabilities;
  }

  /**
   * Determines the emotion with the highest probability from the given probabilities object.
   * @param probabilities - An object containing emotion types mapped to their probability values
   * @returns The emotion type with the highest probability, or null if no valid probabilities are found
   */
  getDominantEmotion(
    probabilities: EmotionProbabilitiesVO,
  ): EmotionType | null {
    return Object.entries(probabilities).reduce(
      (dominant, [emotion, prob]) => {
        if (
          prob !== undefined &&
          (dominant.prob === undefined || prob > dominant.prob)
        ) {
          return { emotion: emotion as EmotionType, prob };
        }
        return dominant;
      },
      { emotion: null, prob: undefined },
    ).emotion;
  }

  /**
   * Calculates emotion analysis based on audio features.
   *
   * This method performs a comprehensive emotion analysis by:
   * 1. Computing distances between the provided audio features and emotion profiles
   * 2. Converting distances into normalized emotion probabilities
   * 3. Identifying the dominant emotion from the probability distribution
   *
   * @param features - The audio features to analyze
   * @returns An object containing emotion distances, probabilities, and the dominant emotion
   */
  calculateFeaturesEmotionAnalysis(
    features: AudioFeaturesVO,
  ): ISongEmotionAnalysis {
    const distances = this.calculateFeaturesEmotionDistances(features);
    const probabilities = this.calculateEmotionProbabilities(distances);
    const dominantEmotion = this.getDominantEmotion(probabilities);

    return {
      emotionDistances: distances,
      emotionProbabilities: probabilities,
      dominantEmotion,
    };
  }

  /**
   * Calculates the emotion analysis for a song based on its audio features.
   * @param song - The song entity containing audio features data
   * @returns The analyzed emotion metrics for the song
   * @throws {BadRequestException} If the song is missing audio features required for emotion analysis
   */
  calculateSongEmotionAnalysis(song: SongEntity): ISongEmotionAnalysis {
    const features = song.audioFeatures;

    if (!features) {
      throw new BadRequestException(
        `Song ${song.spotifyId} is missing audio features for emotion analysis`,
      );
    }

    return this.calculateFeaturesEmotionAnalysis(features);
  }
}
