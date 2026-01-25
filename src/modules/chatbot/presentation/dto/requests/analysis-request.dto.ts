import { IHistoryMessage } from '@modules/chatbot/infrastructure/services/chatbot-service.interface';
import { ApiProperty, ApiSchema } from '@nestjs/swagger';
import { IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

@ApiSchema({
  description: 'Emotional analysis request DTO.',
})
export class GetChatbotAnalysisDto {
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
}
