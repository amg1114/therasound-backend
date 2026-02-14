import { SongEmotionType } from '@modules/songs/domain/value-objects/song-emotion.vo';
import { SongSummaryVO } from '@modules/songs/domain/value-objects/song-summary.vo';
import { ApiProperty, ApiSchema } from '@nestjs/swagger';

export type SeededEmotionReport = {
  emotion: SongEmotionType;
  count: number;
  songs: SongSummaryVO[];
};

@ApiSchema({ description: 'Response DTO for seeding songs from Spotify IDs' })
export class SeedReportResponseDto {
  @ApiProperty({
    description: 'Total number of songs seeded',
    example: 100,
  })
  totalSeededSongs: number;

  @ApiProperty({
    description: 'Report of seeded happy songs',
    type: Object,
  })
  happySongs: SeededEmotionReport;
  @ApiProperty({
    description: 'Report of seeded sad songs',
    type: Object,
  })
  sadSongs: SeededEmotionReport;
  @ApiProperty({
    description: 'Report of seeded calm songs',
    type: Object,
  })
  calmSongs: SeededEmotionReport;
  @ApiProperty({
    description: 'Report of seeded energetic songs',
    type: Object,
  })
  energeticSongs: SeededEmotionReport;
}
