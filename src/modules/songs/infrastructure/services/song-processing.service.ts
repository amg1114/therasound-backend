import { EmotionVO } from '@common/domain/value-objects/emotion.vo';
import { ISeedTrack } from '@modules/admin/application/use-cases/seed-from-local.usecase';
import { SongEntity } from '@modules/songs/domain/entities/song.entity';
import {
  type ISongRepository,
  SONG_REPOSITORY,
} from '@modules/songs/domain/repositories/song-repository.interface';
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

    const songExists = await this.songRepository.existsBySpotifyId(spotifyId);

    if (songExists) {
      this.logger.log(
        `Song with Spotify ID ${spotifyId} already exists, skipping`,
      );
      return null;
    }

    // Fetch song details from Soundcharts
    const details =
      await this.externalMusicApiService.getExternalSongDetails(spotifyId);

    if (!details) {
      this.logger.warn(
        `Could not fetch details for song: ${spotifyId}, skipping`,
      );
      return null;
    }

    // Fetch emotion analysis first
    const emotionAnalysis =
      await this.externalMusicApiService.getEmotionDataForReccoBeats(track.id);
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

    const exists = await this.songRepository.existsBySpotifyId(spotifyId);
    if (exists) {
      this.logger.log(
        `Song with Spotify ID ${spotifyId} already exists, skipping`,
      );
      return null;
    }

    const emotionAnalysis =
      await this.externalMusicApiService.getEmotionDataFromFeatures(
        SongMapper.seedAudioFeaturesToKeyFeatures(track),
      );

    if (!emotionAnalysis) {
      this.logger.warn(
        `Could not fetch emotion analysis for seed track: ${track.uri}, skipping`,
      );
      return null;
    }

    const details =
      await this.externalMusicApiService.getExternalSongDetails(spotifyId);

    if (!details) {
      this.logger.warn(
        `Could not fetch details from ACRCloud for seed track: ${track.uri}, skipping`,
      );
      return null;
    }

    const processedTrack = await this.buildProcessedTrack(
      spotifyId,
      emotionAnalysis,
      details,
    );

    if (
      SongMapper.mapEmotionToKey(processedTrack.emotion.getValue()) !==
      track.labels
    ) {
      this.logger.warn(
        `Emotion mismatch for seed track: ${track.uri}, expected: ${track.labels}, got: ${SongMapper.mapEmotionToKey(processedTrack.emotion.getValue())}`,
      );
    }

    return processedTrack;
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
}
