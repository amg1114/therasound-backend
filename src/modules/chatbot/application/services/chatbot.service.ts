import { ConfigService } from '@nestjs/config';
import {
  IChatbotService,
  IConversationMessage,
  IHistoryMessage,
} from '../../infrastructure/services/chatbot-service.interface';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { OpenRouter } from '@openrouter/sdk';
import { emotionAnalysisSystemPrompt } from '../prompts/emotion-analysis.system';

/**
 * Service responsible for handling chatbot interactions using the OpenRouter API.
 *
 * This service provides functionality for:
 * - Generating chatbot responses based on conversation history
 * - Analyzing emotions from conversation messages
 *
 * @remarks
 * Uses the Meta Llama 3.2 3B Instruct model through OpenRouter's API.
 *
 * @throws {InternalServerErrorException} When the chatbot response is invalid or empty
 */
@Injectable()
export class ChatbotService implements IChatbotService {
  private readonly model = 'meta-llama/llama-3.2-3b-instruct:free';

  private readonly client: OpenRouter;

  constructor(configService: ConfigService) {
    this.client = new OpenRouter({
      apiKey: configService.getOrThrow<string>('openrouter.apiKey'),
    });
  }

  async getResponse(payload: IConversationMessage[]): Promise<string> {
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

  async getEmotionAnalysis(history: IHistoryMessage[]): Promise<string> {
    const conversation = history.reduce((acc, msg) => {
      return acc + `${msg.role}: ${msg.content}\n`;
    }, '');

    const res = await this.client.chat.send({
      model: this.model,
      messages: [
        { role: 'system', content: emotionAnalysisSystemPrompt },
        { role: 'user', content: conversation },
      ],
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
