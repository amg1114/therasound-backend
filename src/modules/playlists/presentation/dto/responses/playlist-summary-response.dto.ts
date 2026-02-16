import { ApiProperty } from '@nestjs/swagger';

export class PlaylistSummaryResponseDto {
  @ApiProperty({
    description: 'ID de la lista de reproducción',
    example: '507f1f77bcf86cd799439011',
  })
  id: string;

  @ApiProperty({
    description: 'Título de la lista de reproducción',
    example: 'Playlist #abc123',
  })
  title: string;

  @ApiProperty({
    description: 'Emoción de la lista de reproducción',
    example: 'happy',
    enum: ['happy', 'sad', 'energetic', 'calm', 'romantic', 'angry'],
  })
  emotion: string;

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
