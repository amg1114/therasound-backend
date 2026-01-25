import {
  CHATBOT_SERVICE_TOKEN,
  type IChatbotService,
} from '@modules/chatbot/infrastructure/services/chatbot-service.interface';
import { GetChatbotAnalysisDto } from '@modules/chatbot/presentation/dto/requests/analysis-request.dto';
import { Inject } from '@nestjs/common';

export class GetChatbotAnalysisUseCase {
  constructor(
    @Inject(CHATBOT_SERVICE_TOKEN)
    private readonly chatbotService: IChatbotService,
  ) {}

  async execute({ history }: GetChatbotAnalysisDto): Promise<string> {
    return this.chatbotService.getEmotionAnalysis(history);
  }
}
