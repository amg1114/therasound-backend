import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PlaylistSummaryResponseDto {
  @ApiProperty({
    description: 'ID de la lista de reproducción',
    example: '507f1f77bcf86cd799439011',
  })
  id: string;

  @ApiPropertyOptional({
    description: 'Título de la lista de reproducción',
    example: 'Playlist #abc123',
  })
  title?: string;

  @ApiProperty({
    description: 'Emoción inicial de la lista de reproducción',
    example: 'sad',
    enum: ['happy', 'sad', 'energetic', 'calm'],
  })
  initialEmotion: string;

  @ApiProperty({
    description: 'Emoción objetivo de la lista de reproducción',
    example: 'happy',
    enum: ['happy', 'sad', 'energetic', 'calm'],
  })
  targetEmotion: string;

  @ApiProperty({
    description: 'Número de canciones en la lista',
    example: 10,
  })
  songCount: number;

  @ApiProperty({
    description: 'Fecha de creación',
    example: '2026-02-01T10:30:00.000Z',
  })
  createdAt: Date;
}
