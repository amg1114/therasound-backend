import { EmotionVO } from '@common/domain/value-objects/emotion.vo';
import { ISeedTrack } from '@modules/admin/application/use-cases/seed-from-local.usecase';
import { ArtistEntity, ArtistSummary } from '@modules/artists/domain/entities';
import {
  ARTIST_REPOSITORY,
  type ArtistRepository,
} from '@modules/artists/domain/repositories';
import { ArtistMapper } from '@modules/artists/infrastructure/mappers';
import { SongEntity } from '@modules/songs/domain/entities/song.entity';
import {
  type ISongRepository,
  SONG_REPOSITORY,
} from '@modules/songs/domain/repositories/song-repository.interface';
import { AudioFeaturesVO } from '@modules/songs/domain/value-objects/audio-features.vo';
import { AudioFeaturesMapper } from '@modules/songs/infrastructure/mappers/audio-features.mapper';
import { FailedSpotifyTrackRepository } from '@modules/songs/infrastructure/orm/repositories/failed-spotify.repository';
import { AcrCloudMusicService } from '@modules/songs/infrastructure/services/acr-cloud';
import { SpotifyService } from '@modules/songs/infrastructure/services/spotify';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { extractSpotifyId } from 'src/utils/extractSpotifyID';
import { SongEmotionService } from './song-emotion.service';
import {
  ArtistExternalDetails,
  SongExternalDetails,
} from './song-processing.types';

@Injectable()
export class SongProcessingService {
  private readonly logger = new Logger(SongProcessingService.name);

  constructor(
    @Inject(SONG_REPOSITORY)
    private readonly songRepository: ISongRepository,
    @Inject(ARTIST_REPOSITORY)
    private readonly artistRepository: ArtistRepository,

    private readonly externalMusicService: AcrCloudMusicService,
    private readonly spotifyService: SpotifyService,
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

    let trackDetails: SongExternalDetails | null = null;

    try {
      trackDetails =
        await this.externalMusicService.fetchSongDetails(spotifyId);
    } catch (error) {
      this.logger.error(
        `Error fetching song details for Spotify ID ${spotifyId}: ${error}`,
      );

      await this.registerFailedTrack(spotifyId, 'details_error');
      return null;
    }

    if (!trackDetails) {
      this.logger.warn(
        `Could not fetch details for seed track: ${track.uri}, skipping`,
      );

      await this.registerFailedTrack(spotifyId, 'details_error');

      return null;
    }

    const artistDetails: ArtistExternalDetails[] = [];

    for (const artistId of trackDetails.artistSpotifyIds) {
      try {
        const details = await this.spotifyService.getArtistDetails(artistId);
        artistDetails.push(details);
      } catch (error) {
        this.logger.error(
          `Error fetching artist details for Spotify ID ${artistId}: ${error}`,
        );
      }
    }

    return this.buildProcessedTrack(
      spotifyId,
      audioFeatures,
      trackDetails,
      artistDetails,
    );
  }

  private async buildProcessedTrack(
    spotifyId: string,
    audioFeatures: AudioFeaturesVO,
    details: SongExternalDetails,
    artistDetails: ArtistExternalDetails[],
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

    const processedArtistDetails = await Promise.all(
      artistDetails.map((details) => this.processArtistDetails(details)),
    );

    const newSong = SongEntity.create({
      spotifyId: spotifyId,
      title: details.title,
      artists: processedArtistDetails,
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

  private async processArtistDetails(
    details: ArtistExternalDetails,
  ): Promise<ArtistSummary> {
    const artist = await this.artistRepository.findBySpotifyId(
      details.spotifyId,
    );

    if (!artist) {
      const newArtist = await this.artistRepository.create(
        ArtistEntity.create({
          name: details.name,
          avatarUrl: details.imageUrl,
          spotifyId: details.spotifyId,
        }),
      );

      return ArtistMapper.toSummary(newArtist);
    }

    return ArtistMapper.toSummary(artist);
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
