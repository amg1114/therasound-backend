import { ApiProperty, ApiSchema } from '@nestjs/swagger';
import { PlaylistResponseDto } from './playlist-response.dto';

@ApiSchema({
  description:
    'Response schema for the generated playlist based on user-chatbot conversation history',
})
export class GeneratePlaylistResponseDto {
  @ApiProperty({
    description:
      'The generated playlist based on the user-chatbot conversation history',
    type: PlaylistResponseDto,
  })
  playlist: PlaylistResponseDto;

  @ApiProperty({
    description: 'The listening session ID associated with this playlist',
    example: '507f1f77bcf86cd799439013',
  })
  sessionId: string;
}
