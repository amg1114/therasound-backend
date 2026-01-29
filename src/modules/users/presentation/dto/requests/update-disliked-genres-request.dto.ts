import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

/**
 * DTO for updating disliked genres preferences
 * Allows adding or removing a genre from the user's disliked genres list
 */
export class UpdateDislikedGenresRequestDto {
  @ApiProperty({
    description:
      'ID or name of the genre to add or remove from disliked genres',
    example: 'rock',
  })
  @IsString()
  @IsNotEmpty()
  genreId: string;

  @ApiProperty({
    description:
      'Action to perform: add genre to disliked list or remove from it',
    enum: ['add', 'remove'],
    example: 'add',
  })
  @IsEnum(['add', 'remove'])
  @IsNotEmpty()
  action: 'add' | 'remove';
}
