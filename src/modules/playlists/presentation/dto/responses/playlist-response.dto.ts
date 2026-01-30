import { ApiProperty } from '@nestjs/swagger';

class PlaylistSongDto {
  @ApiProperty({
    description: 'Song ID',
    example: '507f1f77bcf86cd799439011',
  })
  id: string;

  @ApiProperty({
    description: 'Song title',
    example: 'Happy Song',
  })
  title: string;

  @ApiProperty({
    description: 'Artist name',
    example: 'The Happy Band',
  })
  artist: string;

  @ApiProperty({
    description: 'Song emotion',
    example: 'happy',
  })
  emotion: string;

  @ApiProperty({
    description: 'Duration in milliseconds',
    example: 180000,
  })
  durationMs: number;

  @ApiProperty({
    description: 'Spotify URL',
    example: 'https://open.spotify.com/track/xxxxx',
  })
  spotifyUrl: string;

  @ApiProperty({
    description: 'Genres',
    type: [String],
    example: ['pop', 'rock'],
  })
  genres: string[];

  @ApiProperty({
    description: 'Image URL',
    example: 'https://i.scdn.co/image/xxxxx',
  })
  imageUrl: string;

  @ApiProperty({
    description: 'Release date',
    example: '2020-01-01',
  })
  releaseDate: Date;
}

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
    description: 'List of songs in the playlist',
    type: [PlaylistSongDto],
  })
  songs: PlaylistSongDto[];

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
