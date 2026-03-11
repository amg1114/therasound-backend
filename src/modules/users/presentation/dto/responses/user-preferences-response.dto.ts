import type { ContentPreferences } from '@modules/users/domain/entities/types/content-preference.type';
import { HistorySongVO } from '@modules/users/domain/value-objects/history-song.vo';
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
    description: 'Content preferences for liked items',
  })
  likes: ContentPreferences;

  @ApiProperty({
    description: 'Content preferences for disliked items',
  })
  dislikes: ContentPreferences;

  @ApiProperty({
    description:
      'List of songs that the user has listened to, in order of most recent',
  })
  listenedHistory: HistorySongVO[];
}
