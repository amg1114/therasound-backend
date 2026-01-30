import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsNotEmpty, ValidateNested } from 'class-validator';

class ConversationMessage {
  @ApiProperty({
    description: 'Role of the message sender',
    enum: ['user', 'assistant'],
    example: 'user',
  })
  @IsNotEmpty()
  role: 'user' | 'assistant';

  @ApiProperty({
    description: 'Content of the message',
    example: 'Hola, estoy muy feliz hoy',
  })
  @IsNotEmpty()
  content: string;
}

/**
 * DTO for generating a playlist based on conversation analysis
 */
export class GeneratePlaylistRequestDto {
  @ApiProperty({
    description: 'Conversation history to analyze for emotion detection',
    type: [ConversationMessage],
    example: [
      { role: 'user', content: 'Hola, estoy muy feliz hoy' },
      { role: 'assistant', content: '¡Qué bueno! ¿Qué te hace feliz?' },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ConversationMessage)
  conversationHistory: ConversationMessage[];
}
