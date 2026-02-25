import { ApiProperty, ApiSchema } from '@nestjs/swagger';

@ApiSchema({
  description: 'Response DTO for user statistics',
})
export class UserStatisticsResponseDto {
  @ApiProperty({
    description: 'Unique identifier of the user statistics (same as user ID)',
    example: '507f1f77bcf86cd799439011',
  })
  id: string;

  @ApiProperty({
    description: 'Unique identifier of the user (same as user ID)',
    example: '507f1f77bcf86cd799439011',
  })
  userId: string;

  @ApiProperty({
    description: 'Total number of playlists created by the user',
    example: 10,
  })
  totalPlaylists: number;

  @ApiProperty({
    description: 'Total listening time in milliseconds',
    example: 3600000, // 1 hour in milliseconds
  })
  totalListeningTimeMs: number;

  @ApiProperty({
    description: 'Date of the last listening activity',
    example: '2024-06-01T12:00:00Z',
    nullable: true,
  })
  lastListeningDate: Date | null;

  @ApiProperty({
    description: 'Date when the user activated their current listening streak',
    example: '2024-06-01T12:00:00Z',
    nullable: true,
  })
  streakActivationDate: Date | null;
}
