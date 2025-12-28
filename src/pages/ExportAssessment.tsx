import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/common/Layout";
import exportService from "../services/exportService";

export default function ExportAssessment() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    productType: "fresh_produce",
    targetMarkets: [] as string[],
    productionCapacity: "",
    certifications: [] as string[],
    packagingCapability: false,
    qualityControls: false,
    financialCapacity: "medium",
  });

  const productTypes = [
    { value: "fresh_produce", label: "Fresh Produce" },
    { value: "processed", label: "Processed Foods" },
    { value: "grains", label: "Grains & Cereals" },
    { value: "organic", label: "Organic Products" },
  ];

  const markets = [
    "EU",
    "UK",
    "Middle East",
    "Asia",
    "North America",
    "South Africa",
  ];

  const certificationOptions = [
    "organic",
    "gmp",
    "haccp",
    "iso22000",
    "halal",
    "globalgap",
  ];

  const handleMarketToggle = (market: string) => {
    setFormData((prev) => ({
      ...prev,
      targetMarkets: prev.targetMarkets.includes(market)
        ? prev.targetMarkets.filter((m) => m !== market)
        : [...prev.targetMarkets, market],
    }));
  };

  const handleCertificationToggle = (cert: string) => {
    setFormData((prev) => ({
      ...prev,
      certifications: prev.certifications.includes(cert)
        ? prev.certifications.filter((c) => c !== cert)
        : [...prev.certifications, cert],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.targetMarkets.length === 0) {
      alert("Please select at least one target market");
      return;
    }

    setLoading(true);
    try {
      const response = await exportService.createAssessment(formData);
      if (response.success) {
        navigate(`/export/assessment/${response.data.id}`);
      }
    } catch (error: any) {
      console.error("Assessment error:", error);
      alert(error.message || "Failed to create assessment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Export Readiness Assessment
          </h1>
          <p className="text-gray-600">
            Evaluate your capability to export agricultural products
            internationally
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-lg shadow p-6"
        >
          {/* Product Type */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Product Type *
            </label>
            <select
              value={formData.productType}
              onChange={(e) =>
                setFormData({ ...formData, productType: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
            >
              {productTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {/* Target Markets */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Target Export Markets * (Select at least one)
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {markets.map((market) => (
                <button
                  key={market}
                  type="button"
                  onClick={() => handleMarketToggle(market)}
                  className={`px-4 py-2 rounded-lg border-2 transition-colors ${
                    formData.targetMarkets.includes(market)
                      ? "border-green-600 bg-green-50 text-green-700"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                >
                  {market}
                </button>
              ))}
            </div>
          </div>

          {/* Production Capacity */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Monthly Production Capacity (tons)
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.productionCapacity}
              onChange={(e) =>
                setFormData({ ...formData, productionCapacity: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="e.g., 15"
            />
          </div>

          {/* Certifications */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quality Certifications
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {certificationOptions.map((cert) => (
                <button
                  key={cert}
                  type="button"
                  onClick={() => handleCertificationToggle(cert)}
                  className={`px-4 py-2 rounded-lg border-2 transition-colors text-sm ${
                    formData.certifications.includes(cert)
                      ? "border-green-600 bg-green-50 text-green-700"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                >
                  {cert.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Capabilities */}
          <div className="mb-6 space-y-4">
            <label className="block text-sm font-medium text-gray-700">
              Operational Capabilities
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.packagingCapability}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    packagingCapability: e.target.checked,
                  })
                }
                className="w-5 h-5 text-green-600 rounded focus:ring-2 focus:ring-green-500"
              />
              <span className="text-gray-700">
                Export-grade packaging capability
              </span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.qualityControls}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    qualityControls: e.target.checked,
                  })
                }
                className="w-5 h-5 text-green-600 rounded focus:ring-2 focus:ring-green-500"
              />
              <span className="text-gray-700">
                Quality control systems in place
              </span>
            </label>
          </div>

          {/* Financial Capacity */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Financial Capacity
            </label>
            <select
              value={formData.financialCapacity}
              onChange={(e) =>
                setFormData({ ...formData, financialCapacity: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="low">Low - Need financing support</option>
              <option value="medium">
                Medium - Can self-finance small orders
              </option>
              <option value="high">High - Can handle large orders</option>
            </select>
          </div>

          {/* Submit */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => navigate("/export")}
              className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition-colors disabled:bg-gray-400"
            >
              {loading ? "Analyzing..." : "Complete Assessment"}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
