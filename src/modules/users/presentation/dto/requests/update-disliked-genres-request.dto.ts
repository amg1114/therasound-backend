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
  @IsString({ message: 'El ID del género debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El ID del género es requerido' })
  genreId: string;

  @ApiProperty({
    description:
      'Action to perform: add genre to disliked list or remove from it',
    enum: ['add', 'remove'],
    example: 'add',
  })
  @IsEnum(['add', 'remove'], { message: 'La acción debe ser "add" o "remove"' })
  @IsNotEmpty({ message: 'La acción es requerida' })
  action: 'add' | 'remove';
}
