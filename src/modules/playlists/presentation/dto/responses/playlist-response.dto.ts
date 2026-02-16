import { SongResponseDto } from '@modules/songs/presentation/dto/responses/song-response.dto';
import { ApiProperty } from '@nestjs/swagger';

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

  @ApiProperty({
    description: 'Playlist title',
    example: 'Playlist #abc123',
  })
  title: string;

  @ApiProperty({
    description: 'List of songs in the playlist',
    type: [SongResponseDto],
  })
  songs: SongResponseDto[];

  @ApiProperty({
    description: 'Playlist emotion',
    example: 'happy',
  })
  emotion: string;

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
