import { Body, Controller, Post } from '@nestjs/common';
import { GetChatbotResponseDto } from '../dto/requests/conversation-request.dto';
import { GetChatbotResponseUseCase } from '@modules/chatbot/application/use-cases/get-chatbot-response.usecase';
import { GetChatbotAnalysisDto } from '../dto/requests/analysis-request.dto';
import { GetChatbotAnalysisUseCase } from '@modules/chatbot/application/use-cases/get-chatbot-analysis.usecase';

@Controller('chatbot')
export class ChatbotController {
  constructor(
    private readonly getChatbotResponseUseCase: GetChatbotResponseUseCase,
    private readonly getChatbotAnalysisUseCase: GetChatbotAnalysisUseCase,
  ) {}

  @Post('response')
  getResponse(@Body() dto: GetChatbotResponseDto) {
    return this.getChatbotResponseUseCase.execute(dto);
  }

  @Post('emotion-analysis')
  getEmotionAnalysis(@Body() dto: GetChatbotAnalysisDto) {
    return this.getChatbotAnalysisUseCase.execute(dto);
  }
}
