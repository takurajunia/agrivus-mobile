import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getUserDetails, updateUserStatus } from "../services/adminService";
import { Card, LoadingSpinner } from "../components/common";

export default function AdminUserDetail() {
  const { userId } = useParams<{ userId: string }>();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      loadUserDetails();
    }
  }, [userId]);

  const loadUserDetails = async () => {
    try {
      setLoading(true);
      const response = await getUserDetails(userId!);
      console.log("User details response:", response); // Debug log
      if (response.success) {
        setData(response.data);
      } else {
        console.error("Failed to load user details:", response);
      }
    } catch (error: any) {
      console.error("Failed to load user details:", error);
      console.error("Error response:", error.response?.data);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusToggle = async () => {
    const action = data.user.is_active ? "suspend" : "activate";
    const reason = prompt(
      data.user.is_active
        ? "Reason for suspension:"
        : "Reason for activation (optional):"
    );

    if (data.user.is_active && !reason) {
      alert("Suspension reason is required");
      return;
    }

    try {
      await updateUserStatus(
        userId!,
        !data.user.is_active,
        reason || undefined
      );
      alert(`User ${action}d successfully`);
      loadUserDetails();
    } catch (error) {
      console.error(`Failed to ${action} user:`, error);
      alert(`Failed to ${action} user`);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <LoadingSpinner />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              User Not Found
            </h2>
            <Link
              to="/admin/users"
              className="text-green-600 hover:text-green-700 font-medium"
            >
              ← Back to Users
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  const { user, wallet, recentOrders, recentTransactions, securityIncidents } =
    data;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{user.full_name}</h1>
          <p className="text-gray-600">{user.email}</p>
        </div>
        <Link
          to="/admin/users"
          className="text-green-600 hover:text-green-700 font-medium"
        >
          ← Back to Users
        </Link>
      </div>

      {/* User Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <h3 className="font-semibold text-gray-900 mb-4">Account Status</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Status:</span>
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  user.is_active
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {user.is_active ? "Active" : "Suspended"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Verified:</span>
              <span
                className={user.is_verified ? "text-green-600" : "text-red-600"}
              >
                {user.is_verified ? "Yes ✓" : "No ✗"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Role:</span>
              <span className="font-medium uppercase">{user.role}</span>
            </div>
            <button
              onClick={handleStatusToggle}
              className={`w-full mt-4 px-4 py-2 rounded-lg font-medium transition-colors ${
                user.is_active
                  ? "bg-red-600 hover:bg-red-700 text-white"
                  : "bg-green-600 hover:bg-green-700 text-white"
              }`}
            >
              {user.is_active ? "Suspend Account" : "Activate Account"}
            </button>
          </div>
        </Card>

        <Card>
          <h3 className="font-semibold text-gray-900 mb-4">
            Platform Activity
          </h3>
          <div className="space-y-3">
            <div>
              <div className="text-sm text-gray-600">Platform Score</div>
              <div className="text-2xl font-bold text-green-600">
                {parseFloat(user.platform_score).toFixed(1)}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Total Transactions</div>
              <div className="text-2xl font-bold text-gray-900">
                {user.total_transactions}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Total Volume</div>
              <div className="text-2xl font-bold text-gray-900">
                ${parseFloat(user.total_volume || "0").toLocaleString()}
              </div>
            </div>
            {user.boost_score && (
              <div>
                <div className="text-sm text-gray-600">Boost Score</div>
                <div className="text-2xl font-bold text-yellow-600">
                  {parseFloat(user.boost_score).toFixed(1)}
                </div>
              </div>
            )}
          </div>
        </Card>

        <Card>
          <h3 className="font-semibold text-gray-900 mb-4">Wallet</h3>
          {wallet ? (
            <div className="space-y-3">
              <div>
                <div className="text-sm text-gray-600">Balance</div>
                <div className="text-2xl font-bold text-green-600">
                  ${parseFloat(wallet.balance).toLocaleString()}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Status:</span>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    wallet.is_locked
                      ? "bg-red-100 text-red-800"
                      : "bg-green-100 text-green-800"
                  }`}
                >
                  {wallet.is_locked ? "Locked" : "Active"}
                </span>
              </div>
              {wallet.is_locked && wallet.lock_reason && (
                <div className="text-sm text-gray-600">
                  <strong>Reason:</strong> {wallet.lock_reason}
                </div>
              )}
            </div>
          ) : (
            <p className="text-gray-500">No wallet found</p>
          )}
        </Card>
      </div>

      {/* Recent Orders */}
      <Card className="mb-6">
        <h3 className="font-semibold text-gray-900 mb-4">Recent Orders</h3>
        {recentOrders && recentOrders.length > 0 ? (
          <div className="space-y-3">
            {recentOrders.map((order: any) => (
              <div
                key={order.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div>
                  <div className="font-medium text-gray-900">
                    {order.crop_type} • {order.quantity} units
                  </div>
                  <div className="text-sm text-gray-600">
                    {new Date(order.created_at).toLocaleDateString()}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-green-600">
                    ${parseFloat(order.total_amount).toLocaleString()}
                  </div>
                  <span
                    className={`text-xs px-2 py-1 rounded ${
                      order.status === "delivered"
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">No recent orders</p>
        )}
      </Card>

      {/* Recent Transactions */}
      <Card className="mb-6">
        <h3 className="font-semibold text-gray-900 mb-4">
          Recent Wallet Transactions
        </h3>
        {recentTransactions && recentTransactions.length > 0 ? (
          <div className="space-y-3">
            {recentTransactions.map((txn: any) => (
              <div
                key={txn.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div>
                  <div className="font-medium text-gray-900 capitalize">
                    {txn.type.replace("_", " ")}
                  </div>
                  <div className="text-sm text-gray-600">{txn.description}</div>
                  <div className="text-xs text-gray-400">
                    {new Date(txn.created_at).toLocaleString()}
                  </div>
                </div>
                <div className="text-right">
                  <div
                    className={`font-bold ${
                      txn.type === "credit" ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {txn.type === "credit" ? "+" : "-"}$
                    {parseFloat(txn.amount).toLocaleString()}
                  </div>
                  <span
                    className={`text-xs px-2 py-1 rounded ${
                      txn.status === "completed"
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {txn.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">
            No recent transactions
          </p>
        )}
      </Card>

      {/* Security Incidents */}
      {securityIncidents && securityIncidents.length > 0 && (
        <Card>
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span className="text-red-600">⚠️</span>
            Security Incidents
          </h3>
          <div className="space-y-3">
            {securityIncidents.map((incident: any, idx: number) => (
              <div
                key={idx}
                className="p-4 bg-red-50 border border-red-200 rounded-lg"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-red-900 capitalize">
                    {incident.incident_type.replace("_", " ")}
                  </span>
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      incident.severity === "critical"
                        ? "bg-red-600 text-white"
                        : incident.severity === "high"
                        ? "bg-red-100 text-red-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {incident.severity.toUpperCase()}
                  </span>
                </div>
                <div className="text-sm text-gray-600">{incident.details}</div>
                <div className="text-xs text-gray-400 mt-2">
                  {new Date(incident.created_at).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
