import { ConfigService } from '@nestjs/config';
import {
  IChatbotService,
  IChatbotServicePayload,
} from '../../infrastructure/services/chatbot-service.interface';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { OpenRouter } from '@openrouter/sdk';

@Injectable()
export class ChatbotService implements IChatbotService {
  private readonly model = 'meta-llama/llama-3.2-3b-instruct:free';

  private readonly client: OpenRouter;

  constructor(
    configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    this.client = new OpenRouter({
      apiKey: configService.getOrThrow<string>('openrouter.apiKey'),
    });
  }

  async getResponse(payload: IChatbotServicePayload[]): Promise<string> {
    const res = await this.client.chat.send({
      model: this.model,
      messages: payload,
    });

    const content = res.choices[0].message.content;

    if (typeof content !== 'string') {
      throw new InternalServerErrorException(
        'Invalid response from chatbot: content is not a string',
      );
    }

    if (content.trim().length === 0) {
      throw new InternalServerErrorException(
        'Invalid response from chatbot: content is empty',
      );
    }

    return content;
  }
}
