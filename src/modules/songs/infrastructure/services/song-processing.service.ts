import { EmotionVO } from '@common/domain/value-objects/emotion.vo';
import { ISeedTrack } from '@modules/admin/application/use-cases/seed-from-local.usecase';
import { SongEntity } from '@modules/songs/domain/entities/song.entity';
import {
  type ISongRepository,
  SONG_REPOSITORY,
} from '@modules/songs/domain/repositories/song-repository.interface';
import { FailedSpotifyTrackRepository } from '@modules/songs/infrastructure/orm/repositories/failed-spotify.repository';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { EmotionAnalysisResponseDto } from '../dto/emotion-analysis-response.dto';
import { ReccoBeatsTrackDto } from '../dto/reccobeats-response.dto';
import { SongMapper } from '../mappers/song.mapper';
import {
  ExternalMusicApiService,
  IExternalDetails,
} from './external-music-api.service';

@Injectable()
export class SongProcessingService {
  private readonly logger = new Logger(SongProcessingService.name);

  constructor(
    @Inject(SONG_REPOSITORY)
    private readonly songRepository: ISongRepository,
    private readonly externalMusicApiService: ExternalMusicApiService,
    private readonly failedSpotifyTrackRepository: FailedSpotifyTrackRepository,
  ) {}

  /**
   * Processes a single ReccoBeats track and enriches it with emotion analysis
   * and Soundcharts metadata. Returns null if song should be filtered out.
   * @param track - ReccoBeats track to process
   * @param targetEmotion - The emotion to assign to the song
   * @returns Enriched partial song entity or null if filtered
   */
  async processTrackRecommendation(
    track: ReccoBeatsTrackDto,
  ): Promise<SongEntity | null> {
    const spotifyId = SongMapper.extractSpotifyId(track.href);

    if (!spotifyId) {
      this.logger.warn(
        `Could not extract Spotify ID from track href: ${track.href}`,
      );
      return null;
    }

    const skip = await this.checkIfExistsOrFailed(spotifyId);
    if (skip) {
      return null;
    }

    // Fetch song details from Soundcharts
    const [emotionAnalysis, details] = await Promise.all([
      this.externalMusicApiService.getEmotionDataForReccoBeats(track.id),
      this.externalMusicApiService.getExternalSongDetails(spotifyId),
    ]);

    if (!details) {
      this.logger.warn(
        `Could not fetch details for song: ${spotifyId}, skipping`,
      );

      await this.registerFailedTrack(spotifyId, 'details_error');
      return null;
    }

    if (!emotionAnalysis) {
      this.logger.warn(
        `Could not fetch emotion analysis for song: ${spotifyId}, skipping`,
      );

      await this.registerFailedTrack(spotifyId, 'emotion_error');
      return null;
    }

    return this.buildProcessedTrack(spotifyId, emotionAnalysis, details);
  }

  async processSeedTrack(track: ISeedTrack): Promise<SongEntity | null> {
    const spotifyId = SongMapper.extractSpotifyId(track.uri);
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

    const audioFeatures = SongMapper.seedAudioFeaturesToKeyFeatures(track);

    const [emotionAnalysis, details] = await Promise.all([
      this.externalMusicApiService.getEmotionDataFromFeatures(audioFeatures),
      this.externalMusicApiService.getExternalSongDetails(spotifyId),
    ]);

    if (!emotionAnalysis) {
      this.logger.warn(
        `Could not fetch emotion analysis for seed track: ${track.uri}, skipping`,
      );

      await this.registerFailedTrack(spotifyId, 'emotion_error');

      return null;
    }

    if (!details) {
      this.logger.warn(
        `Could not fetch details for seed track: ${track.uri}, skipping`,
      );

      await this.registerFailedTrack(spotifyId, 'details_error');

      return null;
    }

    return this.buildProcessedTrack(spotifyId, emotionAnalysis, details);
  }

  private async buildProcessedTrack(
    spotifyId: string,
    emotionAnalysis: EmotionAnalysisResponseDto,
    details: IExternalDetails,
  ) {
    const newSong = SongEntity.create({
      spotifyId: spotifyId,
      title: details.title,
      artist: details.artist,
      emotion: EmotionVO.create(emotionAnalysis.emotion),
      durationMs: details.durationMs,
      spotifyUrl: details.spotifyUrl,
      genres: details.genres,
      imageUrl: details.imageUrl || '',
      releaseDate: details.releaseDate,
      audioFeatures: emotionAnalysis.audio_features,
      emotionConfidence: emotionAnalysis.confidence,
      emotionProbabilities: emotionAnalysis.probabilities,
      reccobeatsId: emotionAnalysis.reccobeats_id,
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
