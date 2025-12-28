import { useState } from "react";
import { Link } from "react-router-dom";
import { getRevenueReport, exportData } from "../services/adminService";
import { Card, LoadingSpinner } from "../components/common";

export default function AdminReports() {
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState<any>(null);
  const [dateRange, setDateRange] = useState({
    startDate: "",
    endDate: "",
  });

  const handleGenerateReport = async () => {
    try {
      setLoading(true);
      const response = await getRevenueReport(
        dateRange.startDate,
        dateRange.endDate
      );

      if (response.success) {
        setReportData(response.data);
      }
    } catch (error) {
      console.error("Failed to generate report:", error);
      alert("Failed to generate report");
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (type: "users" | "orders" | "revenue") => {
    try {
      setLoading(true);
      const response = await exportData(
        type,
        dateRange.startDate,
        dateRange.endDate
      );

      if (response.success) {
        // Convert to CSV
        const data = response.data;
        if (data.length === 0) {
          alert("No data to export");
          return;
        }

        const headers = Object.keys(data[0]);
        const csvContent = [
          headers.join(","),
          ...data.map((row: any) =>
            headers.map((h) => `"${row[h] || ""}"`).join(",")
          ),
        ].join("\n");

        // Download
        const blob = new Blob([csvContent], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${type}-export-${
          new Date().toISOString().split("T")[0]
        }.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

        alert(`${type} data exported successfully!`);
      }
    } catch (error) {
      console.error("Failed to export data:", error);
      alert("Failed to export data");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Reports & Analytics
          </h1>
          <p className="text-gray-600">Generate reports and export data</p>
        </div>
        <Link
          to="/admin"
          className="text-green-600 hover:text-green-700 font-medium"
        >
          ← Back to Dashboard
        </Link>
      </div>

      {/* Date Range Filter */}
      <Card className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Date Range</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Start Date
            </label>
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) =>
                setDateRange({ ...dateRange, startDate: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              End Date
            </label>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) =>
                setDateRange({ ...dateRange, endDate: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={handleGenerateReport}
              disabled={loading}
              className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:bg-gray-400"
            >
              {loading ? "Generating..." : "Generate Revenue Report"}
            </button>
          </div>
        </div>
      </Card>

      {/* Revenue Report */}
      {reportData && (
        <Card className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Revenue Summary
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">Total Earnings</div>
              <div className="text-2xl font-bold text-green-600">
                $
                {parseFloat(
                  reportData.summary?.total_earnings || 0
                ).toLocaleString()}
              </div>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">Avg Commission</div>
              <div className="text-2xl font-bold text-blue-600">
                $
                {parseFloat(reportData.summary?.avg_commission || 0).toFixed(2)}
              </div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">Active Farmers</div>
              <div className="text-2xl font-bold text-purple-600">
                {reportData.summary?.active_farmers || 0}
              </div>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">Active Buyers</div>
              <div className="text-2xl font-bold text-yellow-600">
                {reportData.summary?.active_buyers || 0}
              </div>
            </div>
          </div>

          {/* Daily Breakdown */}
          {reportData.daily && reportData.daily.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">
                Daily Breakdown
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left font-medium text-gray-700">
                        Date
                      </th>
                      <th className="px-4 py-2 text-left font-medium text-gray-700">
                        Transactions
                      </th>
                      <th className="px-4 py-2 text-left font-medium text-gray-700">
                        Volume
                      </th>
                      <th className="px-4 py-2 text-left font-medium text-gray-700">
                        Commission
                      </th>
                      <th className="px-4 py-2 text-left font-medium text-gray-700">
                        Transport Fees
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {reportData.daily.map((day: any, idx: number) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="px-4 py-2">
                          {new Date(day.date).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-2">{day.transaction_count}</td>
                        <td className="px-4 py-2">
                          ${parseFloat(day.total_volume || 0).toLocaleString()}
                        </td>
                        <td className="px-4 py-2 text-green-600 font-medium">
                          $
                          {parseFloat(
                            day.total_commission || 0
                          ).toLocaleString()}
                        </td>
                        <td className="px-4 py-2">
                          $
                          {parseFloat(day.transport_fees || 0).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Export Options */}
      <Card>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Data Export</h2>
        <p className="text-gray-600 mb-6">
          Export platform data for external analysis or reporting
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => handleExport("users")}
            disabled={loading}
            className="p-6 border-2 border-gray-200 rounded-lg hover:border-green-600 hover:bg-green-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="text-4xl mb-3">👥</div>
            <h3 className="font-bold text-gray-900 mb-2">Export Users</h3>
            <p className="text-sm text-gray-600">
              Download all user data as CSV
            </p>
          </button>

          <button
            onClick={() => handleExport("orders")}
            disabled={loading}
            className="p-6 border-2 border-gray-200 rounded-lg hover:border-green-600 hover:bg-green-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="text-4xl mb-3">📦</div>
            <h3 className="font-bold text-gray-900 mb-2">Export Orders</h3>
            <p className="text-sm text-gray-600">
              Download all order data as CSV
            </p>
          </button>

          <button
            onClick={() => handleExport("revenue")}
            disabled={loading}
            className="p-6 border-2 border-gray-200 rounded-lg hover:border-green-600 hover:bg-green-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="text-4xl mb-3">💰</div>
            <h3 className="font-bold text-gray-900 mb-2">Export Revenue</h3>
            <p className="text-sm text-gray-600">
              Download revenue data as CSV
            </p>
          </button>
        </div>
      </Card>

      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg">
            <LoadingSpinner />
            <p className="text-center mt-4 font-medium">Processing...</p>
          </div>
        </div>
      )}
    </div>
  );
}
