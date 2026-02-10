import { ApiProperty } from '@nestjs/swagger';
import { SongSummaryVO } from '@modules/songs/domain/value-objects/song-summary.vo';
import { HistorySongVO } from '@modules/users/domain/value-objects/history-song.vo';

/**
 * Response DTO for user preferences
 * Contains all user preference data including liked/disliked songs, genres, and artists
 */
export class UserPreferencesResponseDto {
  @ApiProperty({
    description: 'Unique identifier of the user preferences (same as user ID)',
    example: '507f1f77bcf86cd799439011',
  })
  id: string;

  @ApiProperty({
    description: 'List of songs that the user has liked',
  })
  likedSongs: SongSummaryVO[];

  @ApiProperty({
    description: 'List of songs that the user has disliked',
  })
  dislikedSongs: SongSummaryVO[];

  @ApiProperty({
    description: 'List of genre IDs or names that the user has liked',
    type: [String],
    example: ['rock', 'metal'],
  })
  likedGenres: string[];

  @ApiProperty({
    description: 'List of genre IDs or names that the user has disliked',
    type: [String],
    example: ['rock', 'metal'],
  })
  dislikedGenres: string[];

  @ApiProperty({
    description: 'List of artist IDs or names that the user has liked',
    type: [String],
    example: ['Artist 1', 'Artist 2'],
  })
  likedArtists: string[];

  @ApiProperty({
    description: 'List of artist IDs or names that the user has disliked',
    type: [String],
    example: ['Artist 1', 'Artist 2'],
  })
  dislikedArtists: string[];

  @ApiProperty({
    description:
      'List of songs that the user has listened to, in order of most recent',
  })
  listenedHistory: HistorySongVO[];
}
