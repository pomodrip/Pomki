export interface AskAIRequest {
  question: string;
  context?: string | null;
}

export interface AskAIResponse {
  question: string;
  answer: string;
  success: boolean;
  message: string;
  timestamp: string;
} 