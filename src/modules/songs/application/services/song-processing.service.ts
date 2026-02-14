import { EmotionVO } from '@common/domain/value-objects/emotion.vo';
import { SongEntity } from '@modules/songs/domain/entities/song.entity';
import {
  type ISongRepository,
  SONG_REPOSITORY,
} from '@modules/songs/domain/repositories/song-repository.interface';
import { ReccoBeatsTrackDto } from '@modules/songs/infrastructure/dto/reccobeats-response.dto';
import { SongMapper } from '@modules/songs/infrastructure/mappers/song.mapper';
import { ExternalMusicApiService } from '@modules/songs/infrastructure/services/external-music-api.service';
import { Inject, Injectable, Logger } from '@nestjs/common';

/**
 * Service responsible for processing and enriching songs with emotion analysis
 * and metadata from external APIs
 */
@Injectable()
export class SongProcessingService {
  private readonly logger = new Logger(SongProcessingService.name);

  constructor(
    private readonly externalMusicApiService: ExternalMusicApiService,
    @Inject(SONG_REPOSITORY) private readonly songRepository: ISongRepository,
  ) {}

  /**
   * Processes a list of ReccoBeats tracks and enriches them with emotion analysis
   * and Soundcharts metadata. Filters out sad songs.
   * @param tracks - List of ReccoBeats tracks to process
   * @returns Array of enriched partial song entities
   */
  async processTracks(
    tracks: ReccoBeatsTrackDto[],
  ): Promise<Partial<SongEntity>[]> {
    const processedSongs: Partial<SongEntity>[] = [];

    for (const track of tracks) {
      try {
        const song = await this.processTrack(track);
        if (song) {
          processedSongs.push(song);
        }
      } catch (error) {
        this.logger.error(
          `Error processing song ${track.id}: ${error.message}`,
        );
        // Continue with other songs
      }
    }

    return processedSongs;
  }

  /**
   * Processes a single ReccoBeats track and enriches it with emotion analysis
   * and Soundcharts metadata. Returns null if song should be filtered out.
   * @param track - ReccoBeats track to process
   * @param targetEmotion - The emotion to assign to the song
   * @returns Enriched partial song entity or null if filtered
   */
  async processTrack(
    track: ReccoBeatsTrackDto,
  ): Promise<Partial<SongEntity> | null> {
    // Fetch emotion analysis first
    const emotionAnalysis =
      await this.externalMusicApiService.getEmotionAnalysis(track.id);

    // Skip songs with sad emotion or no analysis
    if (!emotionAnalysis) {
      this.logger.log(
        `Skipping song ${track.id} - no emotion analysis available`,
      );
      return null;
    }

    const spotifyId = SongMapper.extractSpotifyId(track.href);
    if (!spotifyId) {
      this.logger.warn(
        `Could not extract Spotify ID from track href: ${track.href}, skipping`,
      );
      return null;
    }

    // Fetch song details from Soundcharts
    const songDetails =
      await this.externalMusicApiService.getSongDetails(spotifyId);

    if (!songDetails || !songDetails.object) {
      this.logger.warn(
        `Could not fetch details for song: ${track.id}, skipping`,
      );
      return null;
    }

    const details = songDetails.object;

    // Extract genres (flatten the genre structure)
    const genres = [
      ...new Set(details.genres.flatMap((g) => [g.root, ...(g.sub ?? [])])),
    ].filter(Boolean); // Unique non-empty genres

    // Create song entity with emotion analysis data
    return {
      spotifyId: spotifyId,
      title: details.name,
      artist: details.artists[0]?.name || track.artists[0]?.name || 'Unknown',
      emotion: EmotionVO.create(emotionAnalysis.emotion),
      durationMs: details.duration * 1000, // Convert seconds to milliseconds
      spotifyUrl: track.href,
      genres: genres.filter(Boolean),
      imageUrl: details.imageUrl || '',
      releaseDate: new Date(details.releaseDate),
      audioFeatures: emotionAnalysis.audio_features,
      emotionConfidence: emotionAnalysis.confidence,
      emotionProbabilities: emotionAnalysis.probabilities,
      reccobeatsId: emotionAnalysis.reccobeats_id,
    };
  }

  /**
   * Processes a single song by Spotify ID
   * @param spotifyId - Spotify ID of the song
   * @returns Enriched partial song entity or null if filtered
   */
  async processBySpotifyId(
    spotifyId: string,
  ): Promise<Partial<SongEntity> | null> {
    // Create a minimal track object for processing
    const track: ReccoBeatsTrackDto = {
      id: spotifyId,
      trackTitle: '', // Will be populated from Soundcharts
      artists: [],
      durationMs: 0,
      isrc: '',
      ean: '',
      upc: '',
      href: `https://open.spotify.com/track/${spotifyId}`,
      availableCountries: '',
      popularity: 0,
    };

    return this.processTrack(track);
  }
}
