import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Layout from "../components/common/Layout";
import LoadingSpinner from "../components/common/LoadingSpinner";
import exportService, {
  type ExportAssessment,
} from "../services/exportService";

export default function ExportAssessmentResults() {
  const { assessmentId } = useParams<{ assessmentId: string }>();
  const navigate = useNavigate();
  const [assessment, setAssessment] = useState<ExportAssessment | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (assessmentId) {
      loadAssessment();
    }
  }, [assessmentId]);

  const loadAssessment = async () => {
    try {
      setLoading(true);
      const response = await exportService.getAssessmentById(assessmentId!);
      if (response.success) {
        setAssessment(response.data);
      }
    } catch (error) {
      console.error("Failed to load assessment:", error);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getReadinessColor = (level: string) => {
    switch (level) {
      case "ready":
        return "bg-green-100 text-green-800 border-green-200";
      case "needs_improvement":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "not_ready":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getReadinessLabel = (level: string) => {
    switch (level) {
      case "ready":
        return "Export Ready";
      case "needs_improvement":
        return "Needs Improvement";
      case "not_ready":
        return "Not Ready";
      default:
        return "Unknown";
    }
  };

  const getReadinessMessage = (level: string) => {
    switch (level) {
      case "ready":
        return "Congratulations! You meet the requirements for international export.";
      case "needs_improvement":
        return "You're on the right track, but some improvements are needed before export readiness.";
      case "not_ready":
        return "Significant preparation is required before you can export internationally.";
      default:
        return "";
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

  if (!assessment) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 py-8">
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
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <p className="text-gray-600 mb-4">Assessment not found</p>
            <Link
              to="/export"
              className="text-green-600 hover:text-green-700 font-medium"
            >
              Return to Export Gateway
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  const overallScore = parseInt(assessment.overallScore);

  return (
    <Layout>
      <div className="max-w-5xl mx-auto px-4 py-8">
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
                Export Readiness Assessment Results
              </h1>
              <p className="text-gray-600">
                {assessment.productType
                  .replace("_", " ")
                  .replace(/\b\w/g, (l) => l.toUpperCase())}{" "}
                • {assessment.targetMarkets.join(", ")}
              </p>
            </div>
          </div>
        </div>

        {/* Overall Score */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="p-8">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-br from-green-400 to-green-600 mb-4">
                <div className="text-center text-white">
                  <div className="text-4xl font-bold">{overallScore}%</div>
                  <div className="text-sm opacity-90">Overall Score</div>
                </div>
              </div>

              <div
                className={`inline-block px-6 py-3 rounded-full border-2 font-bold text-lg ${getReadinessColor(
                  assessment.readinessLevel
                )}`}
              >
                {getReadinessLabel(assessment.readinessLevel)}
              </div>

              <p className="text-gray-600 mt-4 max-w-2xl mx-auto">
                {getReadinessMessage(assessment.readinessLevel)}
              </p>
            </div>

            {/* Score Breakdown */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-8">
              <div className="text-center">
                <div
                  className={`text-2xl font-bold mb-1 ${getScoreColor(
                    parseInt(assessment.productQualityScore)
                  )}`}
                >
                  {assessment.productQualityScore}%
                </div>
                <div className="text-sm text-gray-600">Product Quality</div>
              </div>

              <div className="text-center">
                <div
                  className={`text-2xl font-bold mb-1 ${getScoreColor(
                    parseInt(assessment.documentationScore)
                  )}`}
                >
                  {assessment.documentationScore}%
                </div>
                <div className="text-sm text-gray-600">Documentation</div>
              </div>

              <div className="text-center">
                <div
                  className={`text-2xl font-bold mb-1 ${getScoreColor(
                    parseInt(assessment.logisticsScore)
                  )}`}
                >
                  {assessment.logisticsScore}%
                </div>
                <div className="text-sm text-gray-600">Logistics</div>
              </div>

              <div className="text-center">
                <div
                  className={`text-2xl font-bold mb-1 ${getScoreColor(
                    parseInt(assessment.complianceScore)
                  )}`}
                >
                  {assessment.complianceScore}%
                </div>
                <div className="text-sm text-gray-600">Compliance</div>
              </div>

              <div className="text-center">
                <div
                  className={`text-2xl font-bold mb-1 ${getScoreColor(
                    parseInt(assessment.financialScore)
                  )}`}
                >
                  {assessment.financialScore}%
                </div>
                <div className="text-sm text-gray-600">Financial</div>
              </div>
            </div>
          </div>
        </div>

        {/* Recommendations */}
        {assessment.recommendations &&
          assessment.recommendations.length > 0 && (
            <div className="bg-white rounded-lg shadow mb-6">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <svg
                    className="w-6 h-6 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                    />
                  </svg>
                  Recommendations
                </h2>
              </div>
              <div className="p-6">
                <ul className="space-y-3">
                  {assessment.recommendations.map((rec: any, idx: number) => (
                    <li
                      key={idx}
                      className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg"
                    >
                      <span className="text-blue-600 font-bold flex-shrink-0">
                        {idx + 1}.
                      </span>
                      <span className="text-gray-700">
                        {typeof rec === "string"
                          ? rec
                          : rec.text || rec.description || rec.recommendation}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

        {/* Action Items */}
        {assessment.actionItems && assessment.actionItems.length > 0 && (
          <div className="bg-white rounded-lg shadow mb-6">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <svg
                  className="w-6 h-6 text-yellow-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
                Action Items
              </h2>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                {assessment.actionItems.map((item: any, idx: number) => (
                  <div
                    key={idx}
                    className="flex items-start gap-3 p-4 border border-gray-200 rounded-lg hover:border-green-300 transition-colors"
                  >
                    <input
                      type="checkbox"
                      className="mt-1 w-5 h-5 text-green-600 rounded focus:ring-2 focus:ring-green-500"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">
                        {typeof item === "string"
                          ? item
                          : item.title || item.action || item.item}
                      </div>
                      {typeof item === "object" && item.timeline && (
                        <p className="text-sm text-gray-600 mt-1">
                          Timeline: {item.timeline}
                        </p>
                      )}
                      {typeof item === "object" && item.priority && (
                        <span
                          className={`inline-block text-xs px-2 py-1 rounded mt-1 ${
                            item.priority === "high"
                              ? "bg-red-100 text-red-700"
                              : item.priority === "medium"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          {item.priority.toUpperCase()} PRIORITY
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Next Steps */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-lg p-8 text-white">
          <h2 className="text-2xl font-bold mb-4">Ready to Take Action?</h2>
          <p className="mb-6 opacity-90">
            Based on your assessment, here are the recommended next steps to
            improve your export readiness.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              to="/export/market-intelligence"
              className="bg-white text-green-600 hover:bg-gray-100 px-6 py-3 rounded-lg transition-colors font-medium"
            >
              Explore Target Markets
            </Link>
            <Link
              to="/export/documents"
              className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-6 py-3 rounded-lg transition-colors font-medium backdrop-blur-sm"
            >
              Download Required Documents
            </Link>
            <Link
              to="/export/logistics"
              className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-6 py-3 rounded-lg transition-colors font-medium backdrop-blur-sm"
            >
              Find Logistics Partners
            </Link>
          </div>
        </div>

        {/* Print & Share */}
        <div className="mt-6 flex justify-center gap-4">
          <button
            onClick={() => window.print()}
            className="text-gray-600 hover:text-gray-900 transition-colors flex items-center gap-2"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
              />
            </svg>
            Print Report
          </button>
          <button
            onClick={() =>
              navigate(`/export/compliance?assessmentId=${assessmentId}`)
            }
            className="text-green-600 hover:text-green-700 transition-colors flex items-center gap-2 font-medium"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
              />
            </svg>
            Create Compliance Checklist
          </button>
        </div>
      </div>
    </Layout>
  );
}
