import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class RegisterSongRequestDto {
  @ApiProperty({
    description: 'Spotify ID of the song to register',
    example: '3n3Ppam7vgaVa1iaRUc9Lp',
  })
  @IsString()
  @IsNotEmpty()
  spotifyId: string;

  @ApiProperty({
    description: 'Emotion to assign to the song',
    example: 'happy',
    enum: ['happy', 'calm', 'energetic', 'sad'],
  })
  @IsString()
  @IsNotEmpty()
  emotion: string;
}
