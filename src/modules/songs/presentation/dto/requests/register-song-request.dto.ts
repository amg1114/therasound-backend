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
  @IsString()
  @IsNotEmpty()
  spotifyId: string;

  @ApiProperty({
    description: 'Number of recommendations to fetch',
    example: 50,
    required: false,
    default: 50,
  })
  @IsNumber()
  @IsOptional()
  @Min(1)
  targetCount?: number;
}
