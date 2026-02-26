import { ApiProperty, ApiSchema } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, Max, Min } from 'class-validator';

@ApiSchema({
  description: 'DTO for registering a listened song in user statistics',
})
export class RegisterListenedSongDto {
  @ApiProperty({
    description: 'The ID of the song that was listened to',
    example: '60d21b4667d0d8992e610c85',
  })
  @IsString()
  @IsNotEmpty()
  songId: string;

  @ApiProperty({
    description:
      'How much of the song was listened to, represented as a value between 0 and 1',
    example: 1,
  })
  @IsNumber()
  @Min(0)
  @Max(1)
  completionRate: number;
}
