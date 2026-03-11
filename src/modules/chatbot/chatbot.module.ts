import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ChatbotService } from './application/services/chatbot.service';
import { GetChatbotResponseUseCase } from './application/use-cases/get-chatbot-response.usecase';
import { CHATBOT_SERVICE_TOKEN } from './infrastructure/services/chatbot-service.interface';
import { ChatbotController } from './presentation/controllers/chatbot.controller';

@Module({
  imports: [HttpModule],
  providers: [
    {
      provide: CHATBOT_SERVICE_TOKEN,
      useClass: ChatbotService,
    },

    GetChatbotResponseUseCase,
  ],
  exports: [CHATBOT_SERVICE_TOKEN],
  controllers: [ChatbotController],
})
export class ChatbotModule {}
