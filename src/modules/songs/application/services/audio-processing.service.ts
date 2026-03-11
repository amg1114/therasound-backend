import { AudioFeaturesVO } from '@modules/songs/domain/value-objects/audio-features.vo';

export class AudioProcessingService {
  constructor() {}

  normalizeSongFeatures(features: AudioFeaturesVO): AudioFeaturesVO {
    const normalized: AudioFeaturesVO = {} as AudioFeaturesVO;

    for (const [feature, value] of Object.entries(features)) {
      // Normalizar según rangos típicos de Spotify
      switch (feature) {
        case 'danceability':
        case 'energy':
        case 'speechiness':
        case 'acousticness':
        case 'instrumentalness':
        case 'liveness':
        case 'valence':
          normalized[feature] = value; // Ya están entre 0 y 1
          break;
        case 'tempo':
          normalized[feature] = this.normalize(value, 50, 200); // Normalizar tempo entre 50 y 200 BPM
          break;
        case 'loudness':
          normalized[feature] = this.normalize(value, -60, 0); // Normalizar loudness entre -60 dB y 0 dB
          break;
        default:
          normalized[feature] = value; // Otros features se dejan igual
      }
    }

    return normalized;
  }

  private normalize(value: number, min: number, max: number): number {
    return (value - min) / (max - min);
  }
}
