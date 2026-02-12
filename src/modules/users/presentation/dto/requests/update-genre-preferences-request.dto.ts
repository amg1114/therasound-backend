import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsString } from 'class-validator';

/**
 * DTO for updating disliked genres preferences
 * Allows adding or removing a genre from the user's disliked genres list
 */
export class UpdateGenrePreferencesRequestDto {
  @ApiProperty({
    description: 'Name of the genre list to be replaced',
    example: ['rock'],
    isArray: true,
    items: {
      type: 'string',
    },
  })
  @IsArray()
  @IsString({
    each: true,
    message: 'El nombre del género debe ser una cadena de texto',
  })
  @IsNotEmpty({ each: true, message: 'El nombre del género es requerido' })
  genres: string[];
}
