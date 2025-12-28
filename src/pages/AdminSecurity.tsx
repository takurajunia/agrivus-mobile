import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getSecurityIncidents } from "../services/adminService";
import { Card, LoadingSpinner } from "../components/common";

interface SecurityIncident {
  id: string;
  user_id: string;
  incident_type: string;
  severity: string;
  details: string;
  ip_address: string;
  user_agent: string;
  resolved: boolean;
  resolved_by: string | null;
  resolved_at: string | null;
  created_at: string;
}

export default function AdminSecurity() {
  const [incidents, setIncidents] = useState<SecurityIncident[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [filters, setFilters] = useState({
    severity: "",
  });

  const severityLevels = ["low", "medium", "high", "critical"];

  useEffect(() => {
    loadIncidents();
  }, [pagination.page, filters]);

  const loadIncidents = async () => {
    try {
      setLoading(true);
      const response = await getSecurityIncidents({
        page: pagination.page,
        limit: pagination.limit,
        severity: filters.severity || undefined,
      });

      if (response.success) {
        setIncidents(response.data.incidents);
        setPagination(response.data.pagination);
      }
    } catch (error) {
      console.error("Failed to load security incidents:", error);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-600 text-white";
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getIncidentIcon = (type: string) => {
    switch (type) {
      case "failed_login":
        return "🔒";
      case "suspicious_activity":
        return "⚠️";
      case "unauthorized_access":
        return "🚫";
      case "rate_limit_exceeded":
        return "⏱️";
      case "large_transaction":
        return "💰";
      default:
        return "🔔";
    }
  };

  if (loading && incidents.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <LoadingSpinner />
      </div>
    );
  }

  const criticalCount = incidents.filter(
    (i) => i.severity === "critical"
  ).length;
  const highCount = incidents.filter((i) => i.severity === "high").length;
  const unresolvedCount = incidents.filter((i) => !i.resolved).length;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Security Center</h1>
          <p className="text-gray-600">
            Monitor security incidents and threats
          </p>
        </div>
        <Link
          to="/admin"
          className="text-green-600 hover:text-green-700 font-medium"
        >
          ← Back to Dashboard
        </Link>
      </div>

      {/* Alert Banner */}
      {criticalCount > 0 && (
        <div className="bg-red-50 border-l-4 border-red-600 p-4 mb-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-800">
                <span className="font-bold">
                  {criticalCount} Critical Incidents
                </span>{" "}
                require immediate attention!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card className="bg-red-50 border-l-4 border-red-600">
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              {criticalCount}
            </div>
            <div className="text-sm text-gray-600">Critical</div>
          </div>
        </Card>
        <Card className="bg-yellow-50 border-l-4 border-yellow-600">
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {highCount}
            </div>
            <div className="text-sm text-gray-600">High Priority</div>
          </div>
        </Card>
        <Card className="bg-blue-50 border-l-4 border-blue-600">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {unresolvedCount}
            </div>
            <div className="text-sm text-gray-600">Unresolved</div>
          </div>
        </Card>
        <Card className="bg-gray-50 border-l-4 border-gray-600">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-600">
              {pagination.total}
            </div>
            <div className="text-sm text-gray-600">Total Incidents</div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Severity Level
            </label>
            <select
              value={filters.severity}
              onChange={(e) =>
                setFilters({ ...filters, severity: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="">All Severity Levels</option>
              {severityLevels.map((level) => (
                <option key={level} value={level}>
                  {level.toUpperCase()}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end md:col-span-2">
            <button
              onClick={() => {
                setFilters({ severity: "" });
                setPagination({ ...pagination, page: 1 });
              }}
              className="w-full px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </Card>

      {/* Incidents List */}
      <div className="space-y-4">
        {incidents.map((incident) => (
          <Card
            key={incident.id}
            className={`border-l-4 ${
              incident.severity === "critical"
                ? "border-red-600 bg-red-50"
                : incident.severity === "high"
                ? "border-yellow-600 bg-yellow-50"
                : "border-blue-600"
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">
                    {getIncidentIcon(incident.incident_type)}
                  </span>
                  <div>
                    <h3 className="font-bold text-gray-900 capitalize">
                      {incident.incident_type.replace(/_/g, " ")}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold ${getSeverityColor(
                          incident.severity
                        )}`}
                      >
                        {incident.severity.toUpperCase()}
                      </span>
                      {incident.resolved ? (
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          ✓ RESOLVED
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          UNRESOLVED
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-4 mb-3">
                  <p className="text-gray-700 mb-2">{incident.details}</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs text-gray-600">
                    <div>
                      <strong>IP:</strong> {incident.ip_address || "N/A"}
                    </div>
                    <div>
                      <strong>User ID:</strong>{" "}
                      {incident.user_id?.substring(0, 8)}
                      ...
                    </div>
                    <div>
                      <strong>Time:</strong>{" "}
                      {new Date(incident.created_at).toLocaleString()}
                    </div>
                    {incident.resolved && incident.resolved_at && (
                      <div>
                        <strong>Resolved:</strong>{" "}
                        {new Date(incident.resolved_at).toLocaleString()}
                      </div>
                    )}
                  </div>
                </div>

                {incident.user_agent && (
                  <details className="text-xs text-gray-500 cursor-pointer">
                    <summary className="font-medium hover:text-gray-700">
                      User Agent Details
                    </summary>
                    <p className="mt-2 p-2 bg-gray-50 rounded">
                      {incident.user_agent}
                    </p>
                  </details>
                )}
              </div>

              <div className="ml-4">
                {!incident.resolved && (
                  <button
                    onClick={() =>
                      alert("Mark as resolved functionality coming soon")
                    }
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    Mark Resolved
                  </button>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <Card className="mt-6">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
              {Math.min(pagination.page * pagination.limit, pagination.total)}{" "}
              of {pagination.total} incidents
            </div>
            <div className="flex gap-2">
              <button
                onClick={() =>
                  setPagination({ ...pagination, page: pagination.page - 1 })
                }
                disabled={pagination.page === 1}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="px-4 py-2 bg-green-600 text-white rounded-lg">
                {pagination.page}
              </span>
              <button
                onClick={() =>
                  setPagination({ ...pagination, page: pagination.page + 1 })
                }
                disabled={pagination.page === pagination.totalPages}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
