import { SeedReportResponseDto } from '@modules/admin/presentation/dto/responses/seed-report-response.dto';
import { SongEntity } from '@modules/songs/domain/entities/song.entity';
import {
  SONG_REPOSITORY,
  type ISongRepository,
} from '@modules/songs/domain/repositories/song-repository.interface';
import { SongSummaryVO } from '@modules/songs/domain/value-objects/song-summary.vo';
import { SongMapper } from '@modules/songs/infrastructure/mappers/song.mapper';
import {
  ExternalMusicApiService,
  IReccoBeatsAudioFeatures,
} from '@modules/songs/infrastructure/services/external-music-api.service';
import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';

@Injectable()
export class SeedFromSpotifyIdUseCase {
  private readonly logger = new Logger(SeedFromSpotifyIdUseCase.name);

  constructor(
    @Inject(SONG_REPOSITORY)
    private readonly songRepository: ISongRepository,
    private readonly externalMusicApiService: ExternalMusicApiService,
  ) {}

  async execute(
    spotifyIds: string[],
    negativeSeeds?: string[],
    size = 50,
    audioFeatures?: IReccoBeatsAudioFeatures,
  ): Promise<SeedReportResponseDto> {
    this.logger.log(
      `Seeding songs from Spotify IDs: ${spotifyIds.join(', ')} with size: ${size}`,
    );

    const recommendations =
      await this.externalMusicApiService.fetchRecommendationsAndProcess(
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

    this.logger.log(
      `Found ${recommendations.length} recommendations, saving to database...`,
    );

    const registeredSongs: SongEntity[] =
      await this.songRepository.createMany(recommendations);

    const groupedByEmotion: Record<
      'happy' | 'sad' | 'calm' | 'energetic',
      SongSummaryVO[]
    > = registeredSongs.reduce(
      (acc, song) => {
        if (!acc[song.emotion.getValue()]) {
          acc[song.emotion.getValue()] = [];
        }
        acc[song.emotion.getValue()].push(SongMapper.toSummaryVO(song));
        return acc;
      },
      {} as Record<'happy' | 'sad' | 'calm' | 'energetic', SongSummaryVO[]>,
    );

    const response = new SeedReportResponseDto();
    response.totalSeededSongs = registeredSongs.length;
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
