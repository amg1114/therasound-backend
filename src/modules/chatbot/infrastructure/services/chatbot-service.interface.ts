import { IsIn, IsString } from 'class-validator';
import { IChatbotAnalysisResponse } from '../interfaces/chatbot-analysis-reponse.interface';

export const CHATBOT_SERVICE_TOKEN = Symbol('CHATBOT_SERVICE');
export enum ChatbotRole {
  USER = 'user',
  ASSISTANT = 'assistant',
  SYSTEM = 'system',
}

export interface IConversationMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export class IHistoryMessage {
  @IsIn(['user', 'assistant'])
  role: 'user' | 'assistant';

  @IsString()
  content: string;
}

export interface IChatbotService {
  getResponse(payload: IConversationMessage[]): Promise<string>;

  getEmotionAnalysis(
    history: IHistoryMessage[],
  ): Promise<IChatbotAnalysisResponse>;
}
