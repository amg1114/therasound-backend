import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

/**
 * DTO for updating disliked artists preferences
 * Allows adding or removing an artist from the user's disliked artists list
 */
export class UpdateDislikedArtistsRequestDto {
  @ApiProperty({
    description:
      'ID or name of the artist to add or remove from disliked artists',
    example: 'Artist Name',
  })
  @IsString({ message: 'El ID del artista debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El ID del artista es requerido' })
  artistId: string;

  @ApiProperty({
    description:
      'Action to perform: add artist to disliked list or remove from it',
    enum: ['add', 'remove'],
    example: 'add',
  })
  @IsEnum(['add', 'remove'], { message: 'La acción debe ser "add" o "remove"' })
  @IsNotEmpty({ message: 'La acción es requerida' })
  action: 'add' | 'remove';
}
