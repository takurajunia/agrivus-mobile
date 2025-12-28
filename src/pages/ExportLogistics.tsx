import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Layout from "../components/common/Layout";
import LoadingSpinner from "../components/common/LoadingSpinner";
import exportService, {
  type LogisticsPartner,
} from "../services/exportService";

export default function ExportLogistics() {
  const [partners, setPartners] = useState<LogisticsPartner[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    serviceType: "",
    market: "",
  });

  const serviceTypes = [
    "Freight Forwarding",
    "Cold Chain",
    "Air Freight",
    "Sea Freight",
    "Road Transport",
    "Customs Brokerage",
  ];

  const markets = [
    "EU",
    "UK",
    "Middle East",
    "Asia",
    "North America",
    "South Africa",
  ];

  useEffect(() => {
    loadPartners();
  }, [filters]);

  const loadPartners = async () => {
    try {
      setLoading(true);
      const response = await exportService.getLogisticsPartners({
        serviceType: filters.serviceType || undefined,
        market: filters.market || undefined,
      });
      if (response.success) {
        setPartners(response.data);
      }
    } catch (error) {
      console.error("Failed to load logistics partners:", error);
    } finally {
      setLoading(false);
    }
  };

  const getRatingStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <svg
        key={i}
        className={`w-5 h-5 ${
          i < rating ? "text-yellow-400" : "text-gray-300"
        }`}
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ));
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
                Logistics Partners
              </h1>
              <p className="text-gray-600">
                Connect with verified international shipping providers
              </p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Service Type
              </label>
              <select
                value={filters.serviceType}
                onChange={(e) =>
                  setFilters({ ...filters, serviceType: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">All Services</option>
                {serviceTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
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
          </div>
        </div>

        {/* Partners Grid */}
        {partners.length === 0 ? (
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
                d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0"
              />
            </svg>
            <p className="text-gray-600">
              No logistics partners found for selected criteria
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {partners.map((partner) => (
              <div
                key={partner.id}
                className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow"
              >
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-1">
                        {partner.companyName}
                      </h3>
                      <div className="flex items-center gap-2">
                        <div className="flex">
                          {getRatingStars(parseFloat(partner.rating))}
                        </div>
                        <span className="text-sm text-gray-600">
                          ({partner.rating}/5)
                        </span>
                      </div>
                    </div>
                    {partner.isVerified && (
                      <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded flex items-center gap-1">
                        <svg
                          className="w-4 h-4"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Verified
                      </span>
                    )}
                  </div>

                  {/* Service Type */}
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-2">
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                        {partner.serviceType}
                      </span>
                      {partner.coldChainCapable && (
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                          Cold Chain
                        </span>
                      )}
                      {partner.airFreight && (
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                          Air Freight
                        </span>
                      )}
                      {partner.seaFreight && (
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                          Sea Freight
                        </span>
                      )}
                      {partner.landFreight && (
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                          Land Freight
                        </span>
                      )}
                      {partner.customsClearance && (
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                          Customs Clearance
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Service Areas */}
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-gray-900 mb-2">
                      Service Areas
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {partner.serviceAreas.map((area: string) => (
                        <span
                          key={area}
                          className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
                        >
                          {area}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Pricing */}
                  {partner.pricingInfo && (
                    <div className="bg-gray-50 rounded-lg p-3 mb-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">
                          Pricing Info
                        </span>
                        <span className="text-lg font-bold text-gray-900">
                          {typeof partner.pricingInfo === "string"
                            ? partner.pricingInfo
                            : "Contact for quote"}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Per ton, varies by route
                      </p>
                    </div>
                  )}

                  {/* Contact */}
                  <div className="flex gap-3">
                    <a
                      href={`mailto:${partner.email}`}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors text-center text-sm font-medium"
                    >
                      Contact Partner
                    </a>
                    <a
                      href={partner.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg transition-colors text-center text-sm font-medium"
                    >
                      Visit Website
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Cost Calculator CTA */}
        <div className="mt-8 bg-gradient-to-r from-green-600 to-green-700 rounded-lg p-8 text-white">
          <div className="max-w-2xl">
            <h3 className="text-2xl font-bold mb-2">
              Need a Shipping Cost Estimate?
            </h3>
            <p className="mb-4 opacity-90">
              Use our calculator to get instant quotes from multiple freight
              forwarders based on your specific shipment details.
            </p>
            <button className="bg-white text-green-600 hover:bg-gray-100 px-6 py-3 rounded-lg transition-colors font-medium">
              Calculate Shipping Costs →
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
