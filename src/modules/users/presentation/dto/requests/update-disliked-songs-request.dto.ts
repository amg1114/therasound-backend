import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsMongoId, IsNotEmpty } from 'class-validator';

/**
 * DTO for updating disliked songs preferences
 * Allows adding or removing a song from the user's disliked songs list
 */
export class UpdateDislikedSongsRequestDto {
  @ApiProperty({
    description: 'ID of the song to add or remove from disliked songs',
    example: '507f1f77bcf86cd799439011',
  })
  @IsMongoId()
  @IsNotEmpty()
  songId: string;

  @ApiProperty({
    description:
      'Action to perform: add song to disliked list or remove from it',
    enum: ['add', 'remove'],
    example: 'add',
  })
  @IsEnum(['add', 'remove'])
  @IsNotEmpty()
  action: 'add' | 'remove';
}
