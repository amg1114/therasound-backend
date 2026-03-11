import { GetChatbotResponseUseCase } from '@modules/chatbot/application/use-cases/get-chatbot-response.usecase';
import { Body, Controller, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { GetChatbotResponseDto } from '../dto/requests/conversation-request.dto';

@Controller('chatbot')
@ApiBearerAuth()
export class ChatbotController {
  constructor(
    private readonly getChatbotResponseUseCase: GetChatbotResponseUseCase,
  ) {}

  @ApiOperation({ summary: 'Get Chatbot Response' })
  @Post('response')
  getResponse(@Body() dto: GetChatbotResponseDto) {
    return this.getChatbotResponseUseCase.execute(dto);
  }
}
