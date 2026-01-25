import { IHistoryMessage } from '@modules/chatbot/infrastructure/services/chatbot-service.interface';
import { ApiProperty, ApiSchema } from '@nestjs/swagger';
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

@ApiSchema({
  description:
    'Emotional conversation request DTO containing the user message, conversation history, and remaining turns.',
})
export class GetChatbotResponseDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description:
      'The current message from the user to the chatbot (in Spanish).',
    example: 'Hoy me siento un poco triste y necesito hablar con alguien.',
  })
  message: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => IHistoryMessage)
  @ApiProperty({
    description:
      'An array of previous messages in the conversation history (in Spanish).',
    type: [IHistoryMessage],
    example: [
      { role: 'user', content: 'Hola, ¿cómo estás?' },
      {
        role: 'assistant',
        content: '¡Hola! Estoy bien, gracias por preguntar. ¿Y tú?',
      },
    ],
  })
  history: IHistoryMessage[];

  @IsNumber()
  @Min(0)
  @Max(4)
  @ApiProperty({
    description:
      'The number of remaining conversational turns allowed with the chatbot.',
    example: 3,
  })
  remainingTurns: number;
}
