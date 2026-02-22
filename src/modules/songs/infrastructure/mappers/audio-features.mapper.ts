import { ISeedTrack } from '@modules/admin/application/use-cases/seed-from-local.usecase';
import { AudioFeaturesVO } from '@modules/songs/domain/value-objects/audio-features.vo';

export class AudioFeaturesMapper {
  static mapSeedTrackToAudioFeatures(entity: ISeedTrack): AudioFeaturesVO {
    return {
      acousticness: entity.acousticness,
      danceability: entity.danceability,
      energy: entity.energy,
      instrumentalness: entity.instrumentalness,
      liveness: entity.liveness,
      loudness: entity.loudness,
      speechiness: entity.speechiness,
      tempo: entity.tempo,
      valence: entity.valence,
    };
  }
}
