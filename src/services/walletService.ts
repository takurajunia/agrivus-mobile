import api from "./api";

export interface WalletBalance {
  balance: number;
  escrowBalance: number;
  availableBalance: number;
  currency: string;
  isLocked: boolean;
  dailyWithdrawalLimit: number;
  dailyWithdrawn: number;
}

export interface Transaction {
  id: string;
  type: string;
  amount: string;
  balanceBefore: string;
  balanceAfter: string;
  description: string;
  metadata: any;
  createdAt: string;
}

export interface TransactionHistory {
  transactions: Transaction[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const walletService = {
  // Get wallet balance
  async getBalance(): Promise<WalletBalance> {
    const response = await api.get("/wallet/balance");
    return response.data.data;
  },

  // Deposit funds
  async deposit(amount: number, paymentMethod: string) {
    const response = await api.post("/wallet/deposit", {
      amount,
      paymentMethod,
    });
    return response.data;
  },

  // Withdraw funds
  async withdraw(
    amount: number,
    withdrawalMethod: string,
    accountDetails: string
  ) {
    const response = await api.post("/wallet/withdraw", {
      amount,
      withdrawalMethod,
      accountDetails,
    });
    return response.data;
  },

  // Get transaction history
  async getTransactions(
    page = 1,
    limit = 20,
    type?: string
  ): Promise<TransactionHistory> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (type) {
      params.append("type", type);
    }

    const response = await api.get(`/wallet/transactions?${params}`);
    return response.data.data;
  },
};
