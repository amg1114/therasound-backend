export const CHATBOT_SERVICE_TOKEN = 'CHATBOT_SERVICE';
export interface IChatbotServicePayload {
  role: 'user' | 'assistant' | 'system';
  content: string;
}
export interface IChatbotService {
  getResponse(payload: IChatbotServicePayload[]): Promise<string>;
}
