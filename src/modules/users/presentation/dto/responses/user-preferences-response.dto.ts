import { ApiProperty } from '@nestjs/swagger';

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
    description: 'List of song IDs that the user has liked',
    type: [String],
    example: ['507f1f77bcf86cd799439011', '507f1f77bcf86cd799439012'],
  })
  likedSongs: string[];

  @ApiProperty({
    description: 'List of song IDs that the user has disliked',
    type: [String],
    example: ['507f1f77bcf86cd799439013', '507f1f77bcf86cd799439014'],
  })
  dislikedSongs: string[];

  @ApiProperty({
    description: 'List of genre IDs or names that the user has disliked',
    type: [String],
    example: ['rock', 'metal'],
  })
  dislikedGenres: string[];

  @ApiProperty({
    description: 'List of artist IDs or names that the user has disliked',
    type: [String],
    example: ['Artist 1', 'Artist 2'],
  })
  dislikedArtists: string[];
}
