import { EmotionVO } from '@common/domain/value-objects/emotion.vo';
import { ISeedTrack } from '@modules/admin/application/use-cases/seed-from-local.usecase';
import { SongEntity } from '@modules/songs/domain/entities/song.entity';
import {
  type ISongRepository,
  SONG_REPOSITORY,
} from '@modules/songs/domain/repositories/song-repository.interface';
import { AudioFeaturesVO } from '@modules/songs/domain/value-objects/audio-features.vo';
import { AudioFeaturesMapper } from '@modules/songs/infrastructure/mappers/audio-features.mapper';
import { FailedSpotifyTrackRepository } from '@modules/songs/infrastructure/orm/repositories/failed-spotify.repository';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { extractSpotifyId } from 'src/utils/extractSpotifyID';
import {
  ExternalMusicApiService,
  IExternalDetails,
} from '../../infrastructure/services/external-music-api.service';
import { SongEmotionService } from './song-emotion.service';

@Injectable()
export class SongProcessingService {
  private readonly logger = new Logger(SongProcessingService.name);

  constructor(
    @Inject(SONG_REPOSITORY)
    private readonly songRepository: ISongRepository,
    private readonly externalMusicApiService: ExternalMusicApiService,
    private readonly failedSpotifyTrackRepository: FailedSpotifyTrackRepository,
    private readonly songEmotionService: SongEmotionService,
  ) {}

  async processSeedTrack(track: ISeedTrack): Promise<SongEntity | null> {
    const spotifyId = extractSpotifyId(track.uri);
    if (!spotifyId) {
      this.logger.warn(
        `Could not extract Spotify ID from track URI: ${track.uri}`,
      );
      return null;
    }

    const skip = await this.checkIfExistsOrFailed(spotifyId);
    if (skip) {
      return null;
    }

    const audioFeatures =
      AudioFeaturesMapper.mapSeedTrackToAudioFeatures(track);

    const details =
      await this.externalMusicApiService.getExternalSongDetails(spotifyId);

    if (!details) {
      this.logger.warn(
        `Could not fetch details for seed track: ${track.uri}, skipping`,
      );

      await this.registerFailedTrack(spotifyId, 'details_error');

      return null;
    }

    return this.buildProcessedTrack(spotifyId, audioFeatures, details);
  }

  private async buildProcessedTrack(
    spotifyId: string,
    audioFeatures: AudioFeaturesVO,
    details: IExternalDetails,
    reccobeatsId?: string,
  ) {
    const { dominantEmotion, emotionDistances, emotionProbabilities } =
      this.songEmotionService.calculateFeaturesEmotionAnalysis(audioFeatures);

    if (!dominantEmotion) {
      this.logger.warn(
        `Could not determine dominant emotion for song: ${spotifyId}`,
      );
      await this.registerFailedTrack(spotifyId, 'emotion_error');
      return null;
    }

    const newSong = SongEntity.create({
      spotifyId: spotifyId,
      title: details.title,
      artist: details.artist,
      emotion: EmotionVO.create(dominantEmotion),
      durationMs: details.durationMs,
      spotifyUrl: details.spotifyUrl,
      genres: details.genres,
      imageUrl: details.imageUrl || '',
      releaseDate: details.releaseDate,
      audioFeatures: audioFeatures,
      emotionDistances: emotionDistances,
      emotionProbabilities: emotionProbabilities,
      reccobeatsId: reccobeatsId,
    });

    return this.songRepository.create(newSong);
  }

  private async checkIfExistsOrFailed(spotifyId: string): Promise<boolean> {
    const [exists, failed] = await Promise.all([
      this.songRepository.existsBySpotifyId(spotifyId),
      this.failedSpotifyTrackRepository.findBySpotifyId(spotifyId),
    ]);

    if (exists) {
      this.logger.log(
        `Song with Spotify ID ${spotifyId} already exists, skipping`,
      );
      return true;
    }

    if (failed) {
      this.logger.warn(
        `Previous processing attempt for Spotify ID ${spotifyId} failed with reason: ${failed.reason}, skipping`,
      );
      return true;
    }

    return false;
  }

  private registerFailedTrack(
    spotifyId: string,
    reason: 'not_found' | 'emotion_error' | 'details_error',
  ) {
    this.logger.warn(
      `Registering failed track. Spotify ID: ${spotifyId}, Reason: ${reason}`,
    );
    return this.failedSpotifyTrackRepository.create({
      spotifyId,
      reason,
      createdAt: new Date(),
    });
  }
}
