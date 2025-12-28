import React, { useState, useEffect } from "react";
import { Layout, Card, Button, LoadingSpinner } from "../components/common";
import { walletService } from "../services/walletService";
import type { WalletBalance, Transaction } from "../services/walletService";

const Wallet: React.FC = () => {
  const [balance, setBalance] = useState<WalletBalance | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [depositAmount, setDepositAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("ecocash");

  useEffect(() => {
    loadWalletData();
  }, []);

  const loadWalletData = async () => {
    try {
      setLoading(true);
      const [balanceData, transactionsData] = await Promise.all([
        walletService.getBalance(),
        walletService.getTransactions(),
      ]);
      setBalance(balanceData);
      setTransactions(transactionsData.transactions);
    } catch (error) {
      console.error("Failed to load wallet data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await walletService.deposit(parseFloat(depositAmount), paymentMethod);
      setShowDepositModal(false);
      setDepositAmount("");
      loadWalletData(); // Refresh
      alert("Funds deposited successfully!");
    } catch (error: any) {
      alert(error.response?.data?.message || "Deposit failed");
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <LoadingSpinner />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Wallet</h1>
          <p className="text-gray-600 mt-2">
            Manage your funds and view transaction history
          </p>
        </div>

        {/* Balance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-green-500 to-green-700 text-white">
            <h3 className="text-lg font-semibold mb-2 opacity-90">
              Total Balance
            </h3>
            <p className="text-4xl font-bold">
              ${balance?.balance.toLocaleString()}
            </p>
            <p className="text-sm mt-2 opacity-75">{balance?.currency}</p>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-500 to-orange-600 text-white">
            <h3 className="text-lg font-semibold mb-2 opacity-90">In Escrow</h3>
            <p className="text-4xl font-bold">
              ${balance?.escrowBalance.toLocaleString()}
            </p>
            <p className="text-sm mt-2 opacity-75">Funds held in orders</p>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500 to-blue-700 text-white">
            <h3 className="text-lg font-semibold mb-2 opacity-90">Available</h3>
            <p className="text-4xl font-bold">
              ${balance?.availableBalance.toLocaleString()}
            </p>
            <p className="text-sm mt-2 opacity-75">Ready to spend</p>
          </Card>
        </div>

        {/* Actions */}
        <div className="flex gap-4 mb-8">
          <Button onClick={() => setShowDepositModal(true)}>
            <span className="mr-2">💰</span> Deposit Funds
          </Button>
          <Button variant="outline">
            <span className="mr-2">💸</span> Withdraw
          </Button>
        </div>

        {/* Transaction History */}
        <Card>
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Transaction History
            </h2>
            <p className="text-gray-600 mt-1">
              View all your wallet transactions
            </p>
          </div>

          {transactions.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p className="text-lg">No transactions yet</p>
              <p className="text-sm mt-2">Deposit funds to get started</p>
            </div>
          ) : (
            <div className="space-y-4">
              {transactions.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                >
                  <div className="flex items-center space-x-4">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        tx.type === "deposit"
                          ? "bg-green-100 text-green-600"
                          : tx.type === "payment"
                          ? "bg-blue-100 text-blue-600"
                          : tx.type === "escrow_hold"
                          ? "bg-yellow-100 text-yellow-600"
                          : tx.type === "escrow_release"
                          ? "bg-purple-100 text-purple-600"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {tx.type === "deposit" && "💰"}
                      {tx.type === "payment" && "💵"}
                      {tx.type === "escrow_hold" && "🔒"}
                      {tx.type === "escrow_release" && "🔓"}
                      {tx.type === "withdrawal" && "💸"}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">
                        {tx.description}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(tx.createdAt).toLocaleDateString()} at{" "}
                        {new Date(tx.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className={`text-lg font-bold ${
                        tx.type === "deposit" || tx.type === "payment"
                          ? "text-green-600"
                          : tx.type === "withdrawal"
                          ? "text-red-600"
                          : "text-gray-900"
                      }`}
                    >
                      {tx.type === "deposit" || tx.type === "payment"
                        ? "+"
                        : tx.type === "withdrawal"
                        ? "-"
                        : ""}
                      ${parseFloat(tx.amount).toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-500">
                      Balance: ${parseFloat(tx.balanceAfter).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Deposit Modal */}
        {showDepositModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900">
                  Deposit Funds
                </h3>
                <button
                  onClick={() => setShowDepositModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleDeposit}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Amount (USD)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Enter amount"
                    required
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Method
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="ecocash">EcoCash</option>
                    <option value="zipit">ZIPIT</option>
                    <option value="usd_wallet">USD Wallet</option>
                    <option value="bank_transfer">Bank Transfer</option>
                  </select>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                  <p className="text-sm text-yellow-800">
                    <strong>Test Mode:</strong> This is a sandbox deposit. In
                    production, you'll be redirected to the payment gateway.
                  </p>
                </div>

                <div className="flex gap-4">
                  <Button type="submit" className="flex-1">
                    Deposit ${depositAmount || "0"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowDepositModal(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Wallet;
