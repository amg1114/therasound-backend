import {
  CHATBOT_SERVICE_TOKEN,
  IConversationMessage,
  type IChatbotService,
} from '@modules/chatbot/infrastructure/services/chatbot-service.interface';
import { GetChatbotResponseDto } from '@modules/chatbot/presentation/dto/requests/conversation-request.dto';
import { Inject, Injectable } from '@nestjs/common';
import { emotionConversationSystemPrompt } from '../prompts/emotion-conversation.system';

@Injectable()
export class GetChatbotResponseUseCase {
  constructor(
    @Inject(CHATBOT_SERVICE_TOKEN)
    private readonly chatbotService: IChatbotService,
  ) {}

  async execute(dto: GetChatbotResponseDto): Promise<string> {
    const messages: IConversationMessage[] = [
      { role: 'system', content: emotionConversationSystemPrompt },
      ...dto.history,
      {
        role: 'system',
        content:
          dto.remainingTurns === 1
            ? 'Recuerda que este es el último turno de la conversación.'
            : `Quedan ${dto.remainingTurns} turnos en esta conversación.`,
      },
      { role: 'user', content: dto.message },
    ];

    const response = await this.chatbotService.getResponse(messages);

    return response;
  }
}
