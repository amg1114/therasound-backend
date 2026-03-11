import { ApiProperty } from '@nestjs/swagger';

export class GenreResponseDto {
  @ApiProperty({
    description: 'Genre ID',
    example: '507f1f77bcf86cd799439011',
  })
  id: string;

  @ApiProperty({
    description: 'Genre name',
    example: 'Pop',
  })
  name: string;

  @ApiProperty({
    description: 'Number of songs in this genre',
    example: 42,
  })
  songsCount: number;
}
