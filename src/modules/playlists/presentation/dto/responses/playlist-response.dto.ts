import { EmbeddedSongVO } from '@modules/playlists/domain/value-objects/embedded-song.vo';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PlaylistResponseDto {
  @ApiProperty({
    description: 'Playlist ID',
    example: '507f1f77bcf86cd799439011',
  })
  id: string;

  @ApiProperty({
    description: 'User ID who owns the playlist',
    example: '507f1f77bcf86cd799439012',
  })
  userId: string;

  @ApiPropertyOptional({
    description: 'Playlist title',
    example: 'Playlist #abc123',
  })
  title?: string;

  @ApiProperty({
    description: 'List of songs in the playlist',
    type: [Object],
  })
  songs: EmbeddedSongVO[];

  @ApiProperty({
    description: 'Playlist target emotion',
    example: 'happy',
  })
  targetEmotion: string;

  @ApiProperty({
    description: 'Playlist initial emotion',
    example: 'sad',
  })
  initialEmotion: string;

  @ApiProperty({
    description: 'Total duration in milliseconds',
    example: 600000,
  })
  durationMs: number;

  @ApiProperty({
    description: 'Creation date',
    example: '2024-01-29T12:00:00.000Z',
  })
  createdAt: Date;
}
