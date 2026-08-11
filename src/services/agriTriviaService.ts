import api from "./api";

export interface TriviaItem {
  id: string;
  factId: string;
  title: string;
  body: string;
  category: string | null;
  sentAt: string;
}

export interface TriviaHistoryResponse {
  success: boolean;
  data: {
    items: TriviaItem[];
    total: number;
  };
}

class AgriTriviaService {
  async getHistory(limit = 50): Promise<TriviaHistoryResponse> {
    const response = await api.get("/agri-trivia", { params: { limit } });
    return response.data;
  }
}

export const agriTriviaService = new AgriTriviaService();
export default agriTriviaService;
