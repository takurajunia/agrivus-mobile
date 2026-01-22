import api from "./api";

export interface PaymentInitiationRequest {
  amount: number;
  paymentMethod:
    | "ecocash"
    | "onemoney"
    | "telecash"
    | "zipit"
    | "usd_bank"
    | "card";
}

export interface PaymentInitiationResponse {
  success: boolean;
  message: string;
  data: {
    paymentId: string;
    reference: string;
    amount: number;
    paymentMethod: string;
    status: string;
    paymentUrl?: string;
    pollUrl: string;
    instructions?: string;
    isMockPayment: boolean;
  };
}

export interface PaymentStatus {
  paymentId: string;
  reference: string;
  status: "pending" | "processing" | "completed" | "failed" | "cancelled";
  paid: boolean;
  amount: number;
  paidAmount?: number;
  completedAt?: string;
  paymentMethod?: string;
}

export interface PaymentHistoryItem {
  id: string;
  type: string;
  amount: string;
  currency: string;
  paymentMethod: string;
  status: string;
  reference: string;
  instructions?: string;
  createdAt: string;
  completedAt?: string;
}

export interface PaymentHistoryResponse {
  success: boolean;
  data: {
    payments: PaymentHistoryItem[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

class PaymentService {
  // Initiate wallet deposit
  async initiateDeposit(
    data: PaymentInitiationRequest,
  ): Promise<PaymentInitiationResponse> {
    const response = await api.post("/payments/deposit", data);
    return response.data;
  }

  // Check payment status (for polling)
  async checkStatus(
    paymentId: string,
  ): Promise<{ success: boolean; data: PaymentStatus }> {
    const response = await api.get(`/payments/status/${paymentId}`);
    return response.data;
  }

  // Get payment history
  async getHistory(params?: {
    page?: number;
    limit?: number;
    status?: string;
    type?: string;
  }): Promise<PaymentHistoryResponse> {
    const response = await api.get("/payments/history", { params });
    return response.data;
  }

  // Poll payment status until completion (with timeout)
  async pollPaymentStatus(
    paymentId: string,
    onStatusChange?: (status: PaymentStatus) => void,
    maxAttempts: number = 60, // 60 attempts = 5 minutes with 5-second intervals
  ): Promise<PaymentStatus> {
    let attempts = 0;

    return new Promise((resolve, reject) => {
      const interval = setInterval(async () => {
        attempts++;

        try {
          const response = await this.checkStatus(paymentId);
          const status = response.data;

          // Notify callback
          if (onStatusChange) {
            onStatusChange(status);
          }

          // Check if completed or failed
          if (status.status === "completed") {
            clearInterval(interval);
            resolve(status);
          } else if (
            status.status === "failed" ||
            status.status === "cancelled"
          ) {
            clearInterval(interval);
            reject(new Error(`Payment ${status.status}`));
          }

          // Timeout
          if (attempts >= maxAttempts) {
            clearInterval(interval);
            reject(new Error("Payment polling timeout"));
          }
        } catch (error) {
          clearInterval(interval);
          reject(error);
        }
      }, 5000); // Poll every 5 seconds
    });
  }

  // Format payment method for display
  formatPaymentMethod(method: string): string {
    const methods: Record<string, string> = {
      ecocash: "EcoCash",
      onemoney: "OneMoney",
      telecash: "Telecash",
      zipit: "ZIPIT",
      usd_bank: "USD Bank Transfer",
      card: "Debit/Credit Card",
    };
    return methods[method] || method.toUpperCase();
  }

  // Get payment method icon (emoji)
  getPaymentMethodIcon(method: string): string {
    const icons: Record<string, string> = {
      ecocash: "💳",
      onemoney: "💳",
      telecash: "💳",
      zipit: "🏦",
      usd_bank: "🏦",
      card: "💳",
    };
    return icons[method] || "💰";
  }
}

export const paymentService = new PaymentService();
export default paymentService;
