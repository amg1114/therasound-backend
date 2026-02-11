import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

/**
 * DTO for updating preferred artists preferences
 * Allows adding or removing an artist from the user's preferred artists list
 */
export class UpdateArtistPreferencesRequestDto {
  @ApiProperty({
    description: 'Artist name(s) list to be replaced in preferred artists',
    example: ['Artist Name'],
  })
  @IsString({
    each: true,
    message: 'El nombre del artista debe ser una cadena de texto',
  })
  @IsNotEmpty({ each: true, message: 'El nombre del artista es requerido' })
  artists: string[];
}
