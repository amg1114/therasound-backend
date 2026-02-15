import { SeedReportResponseDto } from '@modules/admin/presentation/dto/responses/seed-report-response.dto';
import { SongEntity } from '@modules/songs/domain/entities/song.entity';
import { SongSummaryVO } from '@modules/songs/domain/value-objects/song-summary.vo';
import { SongMapper } from '@modules/songs/infrastructure/mappers/song.mapper';
import {
  ExternalMusicApiService,
  IReccoBeatsAudioFeaturesQueries,
} from '@modules/songs/infrastructure/services/external-music-api.service';
import { SongProcessingService } from '@modules/songs/infrastructure/services/song-processing.service';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';

@Injectable()
export class SeedFromSpotifyIdUseCase {
  private readonly logger = new Logger(SeedFromSpotifyIdUseCase.name);

  constructor(
    private readonly externalMusicApiService: ExternalMusicApiService,
    private readonly songProcessingService: SongProcessingService,
  ) {}

  async execute(
    spotifyIds: string[],
    negativeSeeds?: string[],
    size = 50,
    audioFeatures?: IReccoBeatsAudioFeaturesQueries,
  ): Promise<SeedReportResponseDto> {
    this.logger.log(
      `Seeding songs from Spotify IDs: ${spotifyIds.join(', ')} with size: ${size}`,
    );

    const recommendations =
      await this.externalMusicApiService.fetchRecommendations(
        spotifyIds,
        negativeSeeds || [],
        size,
        audioFeatures,
      );

    if (recommendations.length === 0) {
      throw new NotFoundException(
        `No recommendations found for Spotify IDs: ${spotifyIds.join(', ')}`,
      );
    }

    this.logger.log(`Found ${recommendations.length} recommendations.`);

    const processedSongs: SongEntity[] = [];

    for (const rec of recommendations) {
      try {
        const processedSong =
          await this.songProcessingService.processTrackRecommendation(rec);
        if (processedSong) {
          processedSongs.push(processedSong);
        }
      } catch (error) {
        this.logger.error(
          `Error processing recommendation: ${rec.href}`,
          error instanceof Error ? error.stack : undefined,
        );
      }
    }

    this.logger.log(
      `Successfully stored ${processedSongs.length} songs in the database.`,
    );
    const groupedByEmotion: Record<
      'happy' | 'sad' | 'calm' | 'energetic',
      SongSummaryVO[]
    > = processedSongs.reduce(
      (acc, song) => {
        const emotion = song.emotion.getValue();
        if (!acc[emotion]) {
          acc[emotion] = [];
        }
        acc[emotion].push(SongMapper.toSummaryVO(song));
        return acc;
      },
      {} as Record<'happy' | 'sad' | 'calm' | 'energetic', SongSummaryVO[]>,
    );

    const response = new SeedReportResponseDto();
    response.totalSeededSongs = recommendations.length;
    response.happySongs = {
      emotion: 'happy',
      count: groupedByEmotion['happy']?.length || 0,
      songs: groupedByEmotion['happy'] || [],
    };
    response.sadSongs = {
      emotion: 'sad',
      count: groupedByEmotion['sad']?.length || 0,
      songs: groupedByEmotion['sad'] || [],
    };
    response.calmSongs = {
      emotion: 'calm',
      count: groupedByEmotion['calm']?.length || 0,
      songs: groupedByEmotion['calm'] || [],
    };
    response.energeticSongs = {
      emotion: 'energetic',
      count: groupedByEmotion['energetic']?.length || 0,
      songs: groupedByEmotion['energetic'] || [],
    };

    return response;
  }
}
