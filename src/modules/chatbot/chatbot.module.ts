import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { CHATBOT_SERVICE_TOKEN } from './infrastructure/services/chatbot-service.interface';
import { ChatbotService } from './application/services/chatbot.service';

@Module({
  imports: [HttpModule],
  providers: [
    {
      provide: CHATBOT_SERVICE_TOKEN,
      useClass: ChatbotService,
    },
  ],
  exports: [CHATBOT_SERVICE_TOKEN],
})
export class ChatbotModule {}
