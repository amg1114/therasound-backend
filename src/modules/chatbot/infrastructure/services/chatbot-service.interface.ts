import { IsString, IsIn } from 'class-validator';

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

  getEmotionAnalysis(text: IHistoryMessage[]): Promise<string>;
}
