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
  @IsString()
  @IsNotEmpty()
  artistId: string;

  @ApiProperty({
    description:
      'Action to perform: add artist to disliked list or remove from it',
    enum: ['add', 'remove'],
    example: 'add',
  })
  @IsEnum(['add', 'remove'])
  @IsNotEmpty()
  action: 'add' | 'remove';
}
