import { Body, Controller, Post } from '@nestjs/common';
import { GetChatbotResponseDto } from '../dto/requests/conversation-request.dto';
import { GetChatbotResponseUseCase } from '@modules/chatbot/application/use-cases/get-chatbot-response.usecase';
import { GetChatbotAnalysisDto } from '../dto/requests/analysis-request.dto';
import { GetChatbotAnalysisUseCase } from '@modules/chatbot/application/use-cases/get-chatbot-analysis.usecase';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@Controller('chatbot')
@ApiBearerAuth()
export class ChatbotController {
  constructor(
    private readonly getChatbotResponseUseCase: GetChatbotResponseUseCase,
    private readonly getChatbotAnalysisUseCase: GetChatbotAnalysisUseCase,
  ) {}

  @ApiOperation({ summary: 'Get Chatbot Response' })
  @Post('response')
  getResponse(@Body() dto: GetChatbotResponseDto) {
    return this.getChatbotResponseUseCase.execute(dto);
  }

  @ApiOperation({ summary: 'Get Emotion Analysis' })
  @Post('emotion-analysis')
  getEmotionAnalysis(@Body() dto: GetChatbotAnalysisDto) {
    return this.getChatbotAnalysisUseCase.execute(dto);
  }
}
