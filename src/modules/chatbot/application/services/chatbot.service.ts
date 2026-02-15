import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OpenRouter } from '@openrouter/sdk';
import {
  IChatbotService,
  IConversationMessage,
  IHistoryMessage,
} from '../../infrastructure/services/chatbot-service.interface';
import { emotionAnalysisSystemPrompt } from '../prompts/emotion-analysis.system';

/**
 * Service responsible for handling chatbot interactions using the OpenRouter API.
 *
 * This service provides functionality for:
 * - Generating chatbot responses based on conversation history
 * - Analyzing emotions from conversation messages
 *
 * @remarks
 * Uses the OpenAI GPT-4o Mini model through OpenRouter's API.
 *
 * @throws {InternalServerErrorException} When the chatbot response is invalid or empty
 */
@Injectable()
export class ChatbotService implements IChatbotService {
  private readonly model = 'openai/gpt-4o-mini';

  private readonly client: OpenRouter;

  constructor(configService: ConfigService) {
    this.client = new OpenRouter({
      apiKey: configService.getOrThrow<string>(
        'external_apis.keys.open_router',
      ),
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
        'Respuesta inválida del chatbot: el contenido no es una cadena',
      );
    }

    if (content.trim().length === 0) {
      throw new InternalServerErrorException(
        'Respuesta inválida del chatbot: el contenido está vacío',
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
        'Respuesta inválida del chatbot: el contenido no es una cadena',
      );
    }

    if (content.trim().length === 0) {
      throw new InternalServerErrorException(
        'Respuesta inválida del chatbot: el contenido está vacío',
      );
    }

    return content;
  }
}
