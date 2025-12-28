import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Layout from "../components/common/Layout";
import LoadingSpinner from "../components/common/LoadingSpinner";
import exportService, {
  type MarketIntelligence,
} from "../services/exportService";

export default function ExportMarketIntelligence() {
  const [marketData, setMarketData] = useState<MarketIntelligence[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    market: "",
    productCategory: "",
  });

  const markets = [
    "EU",
    "UK",
    "Middle East",
    "Asia",
    "North America",
    "South Africa",
  ];
  const categories = ["Fresh Produce", "Grains", "Processed", "Organic"];

  useEffect(() => {
    loadMarketIntelligence();
  }, [filters]);

  const loadMarketIntelligence = async () => {
    try {
      setLoading(true);
      const response = await exportService.getMarketIntelligence({
        market: filters.market || undefined,
        productCategory: filters.productCategory || undefined,
      });
      if (response.success) {
        setMarketData(response.data);
      }
    } catch (error) {
      console.error("Failed to load market intelligence:", error);
    } finally {
      setLoading(false);
    }
  };

  const getPriceColor = (trend: string) => {
    switch (trend) {
      case "rising":
        return "text-green-600";
      case "falling":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const getPriceTrendIcon = (trend: string) => {
    switch (trend) {
      case "rising":
        return "↗";
      case "falling":
        return "↘";
      default:
        return "→";
    }
  };

  const getDemandColor = (level: string) => {
    switch (level) {
      case "high":
        return "bg-green-100 text-green-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
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
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link
              to="/export"
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Market Intelligence
              </h1>
              <p className="text-gray-600">
                Real-time market data and trends for export planning
              </p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Target Market
              </label>
              <select
                value={filters.market}
                onChange={(e) =>
                  setFilters({ ...filters, market: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">All Markets</option>
                {markets.map((market) => (
                  <option key={market} value={market}>
                    {market}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Category
              </label>
              <select
                value={filters.productCategory}
                onChange={(e) =>
                  setFilters({ ...filters, productCategory: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Market Data Grid */}
        {marketData.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <svg
              className="w-16 h-16 mx-auto mb-4 text-gray-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
            <p className="text-gray-600">
              No market data available for selected filters
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {marketData.map((market) => (
              <div
                key={market.id}
                className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow"
              >
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-1">
                        {market.market}
                      </h3>
                      <p className="text-gray-600">{market.productCategory}</p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${getDemandColor(
                        market.demandLevel
                      )}`}
                    >
                      {market.demandLevel.toUpperCase()} DEMAND
                    </span>
                  </div>

                  {/* Price Information */}
                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">
                        Average Price
                      </span>
                      <span
                        className={`text-lg font-bold ${getPriceColor(
                          market.priceTrend
                        )}`}
                      >
                        ${market.averagePrice}/ton{" "}
                        {getPriceTrendIcon(market.priceTrend)}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500">
                      Trend: {market.priceTrend.toUpperCase()}
                    </div>
                  </div>

                  {/* Regulations */}
                  {market.regulations && market.regulations.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold text-gray-900 mb-2">
                        Key Regulations
                      </h4>
                      <ul className="space-y-1">
                        {market.regulations.slice(0, 3).map((reg, idx) => (
                          <li
                            key={idx}
                            className="text-sm text-gray-600 flex items-start gap-2"
                          >
                            <span className="text-green-600 mt-0.5">•</span>
                            <span>{reg}</span>
                          </li>
                        ))}
                      </ul>
                      {market.regulations.length > 3 && (
                        <button className="text-sm text-green-600 hover:text-green-700 mt-2">
                          View all {market.regulations.length} regulations →
                        </button>
                      )}
                    </div>
                  )}

                  {/* Competition Level */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <span className="text-sm text-gray-600">Competition</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            market.competitionLevel === "high"
                              ? "bg-red-600 w-full"
                              : market.competitionLevel === "medium"
                              ? "bg-yellow-600 w-2/3"
                              : "bg-green-600 w-1/3"
                          }`}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-900 capitalize">
                        {market.competitionLevel}
                      </span>
                    </div>
                  </div>

                  {/* Updated Date */}
                  <div className="mt-4 pt-4 border-t border-gray-200 text-xs text-gray-500">
                    Last updated:{" "}
                    {new Date(market.lastUpdated).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Quick Tips */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-start gap-4">
            <svg
              className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">
                Market Intelligence Tips
              </h4>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>
                  • Rising price trends indicate good export opportunities
                </li>
                <li>
                  • High demand + low competition = ideal market conditions
                </li>
                <li>
                  • Review regulations early to ensure compliance readiness
                </li>
                <li>
                  • Consider starting with regional markets for easier entry
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
