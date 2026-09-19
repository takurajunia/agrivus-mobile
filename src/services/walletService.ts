import api from "./api";
import type {
  WalletBalance,
  Transaction,
  TransactionHistory,
  WithdrawalRequest,
} from "../types";

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

  async getMyWithdrawals(): Promise<WithdrawalRequest[]> {
    const response = await api.get("/wallet/withdrawals");
    return response.data.data.requests;
  },

  // Get transaction history
  async getTransactions(
    page = 1,
    limit = 20,
    type?: string
  ): Promise<TransactionHistory> {
    const params: Record<string, string> = {
      page: page.toString(),
      limit: limit.toString(),
    };

    if (type) {
      params.type = type;
    }

    const response = await api.get("/wallet/transactions", { params });
    return response.data.data;
  },
};

export default walletService;
