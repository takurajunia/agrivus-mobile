import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getAllOrders } from "../services/adminService";
import { Card, LoadingSpinner } from "../components/common";

interface Order {
  id: string;
  listing_id: string;
  buyer_id: string;
  farmer_id: string;
  transporter_id: string | null;
  crop_type: string;
  quantity: string;
  unit: string;
  price_per_unit: string;
  total_amount: string;
  status: string;
  pickup_location: string;
  delivery_location: string;
  created_at: string;
  farmer_name: string;
  farmer_email: string;
  buyer_name: string;
  buyer_email: string;
  transporter_name: string | null;
}

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [filters, setFilters] = useState({
    status: "",
    search: "",
  });

  const statuses = [
    "pending",
    "payment_pending",
    "paid",
    "assigned",
    "in_transit",
    "delivered",
    "confirmed",
    "cancelled",
  ];

  useEffect(() => {
    loadOrders();
  }, [pagination.page, filters]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const response = await getAllOrders({
        page: pagination.page,
        limit: pagination.limit,
        status: filters.status || undefined,
        search: filters.search || undefined,
      });

      if (response.success) {
        setOrders(response.data.orders);
        setPagination(response.data.pagination);
      }
    } catch (error) {
      console.error("Failed to load orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
      case "delivered":
        return "bg-green-100 text-green-800";
      case "in_transit":
      case "assigned":
        return "bg-blue-100 text-blue-800";
      case "paid":
      case "payment_pending":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading && orders.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Order Management</h1>
          <p className="text-gray-600">Monitor all platform orders</p>
        </div>
        <Link
          to="/admin"
          className="text-green-600 hover:text-green-700 font-medium"
        >
          ← Back to Dashboard
        </Link>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card className="bg-blue-50">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {pagination.total}
            </div>
            <div className="text-sm text-gray-600">Total Orders</div>
          </div>
        </Card>
        <Card className="bg-green-50">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              $
              {orders
                .filter((o) => o.status === "confirmed")
                .reduce((sum, o) => sum + parseFloat(o.total_amount), 0)
                .toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">Completed Value</div>
          </div>
        </Card>
        <Card className="bg-yellow-50">
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {orders.filter((o) => o.status === "in_transit").length}
            </div>
            <div className="text-sm text-gray-600">In Transit</div>
          </div>
        </Card>
        <Card className="bg-purple-50">
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {orders.filter((o) => o.status === "pending").length}
            </div>
            <div className="text-sm text-gray-600">Pending</div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search
            </label>
            <input
              type="text"
              value={filters.search}
              onChange={(e) =>
                setFilters({ ...filters, search: e.target.value })
              }
              placeholder="Order ID, crop, farmer, buyer..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) =>
                setFilters({ ...filters, status: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="">All Status</option>
              {statuses.map((status) => (
                <option key={status} value={status}>
                  {status.replace("_", " ").toUpperCase()}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => {
                setFilters({ status: "", search: "" });
                setPagination({ ...pagination, page: 1 });
              }}
              className="w-full px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </Card>

      {/* Orders Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Farmer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Buyer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Transporter
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="font-medium text-gray-900">
                        #{order.id.substring(0, 8)}
                      </div>
                      <div className="text-sm text-gray-500">
                        {order.crop_type}
                      </div>
                      <div className="text-sm text-gray-500">
                        {order.quantity} {order.unit}
                      </div>
                      <div className="text-xs text-gray-400">
                        {new Date(order.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {order.farmer_name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {order.farmer_email}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {order.buyer_name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {order.buyer_email}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {order.transporter_name || (
                        <span className="text-gray-400 italic">
                          Not assigned
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-bold text-gray-900">
                      ${parseFloat(order.total_amount).toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-500">
                      ${parseFloat(order.price_per_unit).toFixed(2)}/
                      {order.unit}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        order.status
                      )}`}
                    >
                      {order.status.replace("_", " ").toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <Link
                      to={`/orders/${order.id}`}
                      className="text-blue-600 hover:text-blue-700 font-medium"
                    >
                      View Details
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
              {Math.min(pagination.page * pagination.limit, pagination.total)}{" "}
              of {pagination.total} orders
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
        )}
      </Card>
    </div>
  );
}
