import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsOptional,
  Min,
} from 'class-validator';

export class RegisterSongRequestDto {
  @ApiProperty({
    description: 'Spotify ID to use as seed for recommendations',
    example: '3n3Ppam7vgaVa1iaRUc9Lp',
  })
  @IsString({ message: 'El ID de Spotify debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El ID de Spotify es requerido' })
  spotifyId: string;

  @ApiProperty({
    description: 'Number of recommendations to fetch',
    example: 50,
    required: false,
    default: 50,
  })
  @IsNumber({}, { message: 'El número de recomendaciones debe ser un número' })
  @IsOptional()
  @Min(1, { message: 'El número de recomendaciones debe ser al menos 1' })
  targetCount?: number;
}
