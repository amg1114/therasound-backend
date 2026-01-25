import { Body, Controller, Post } from '@nestjs/common';
import { GetChatbotResponseDto } from '../dto/requests/conversation-request.dto';
import { GetChatbotResponseUseCase } from '@modules/chatbot/application/use-cases/get-chatbot-response.usecase';

@Controller('chatbot')
export class ChatbotController {
  constructor(
    private readonly getChatbotResponseUseCase: GetChatbotResponseUseCase,
  ) {}

  @Post('response')
  getResponse(@Body() dto: GetChatbotResponseDto) {
    return this.getChatbotResponseUseCase.execute(dto);
  }
}
