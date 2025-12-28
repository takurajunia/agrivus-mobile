import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { safeDisplayText } from "../utils/textUtils";
import Button from "../components/common/Button";
import Card from "../components/common/Card";
import LoadingSpinner from "../components/common/LoadingSpinner";
import { ordersService } from "../services/ordersService";
import type { OrderStatus } from "../types";

const Orders: React.FC = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterStatus, setFilterStatus] = useState<OrderStatus | "">("");

  useEffect(() => {
    fetchOrders();
  }, [filterStatus]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await ordersService.getOrders({
        status: filterStatus || undefined,
      });

      if (response.success && response.data) {
        setOrders(response.data.orders);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-800 border-yellow-300",
      paid: "bg-blue-100 text-blue-800 border-blue-300",
      assigned: "bg-purple-100 text-purple-800 border-purple-300",
      in_transit: "bg-indigo-100 text-indigo-800 border-indigo-300",
      delivered: "bg-green-100 text-green-800 border-green-300",
      confirmed: "bg-green-200 text-green-900 border-green-400",
      cancelled: "bg-red-100 text-red-800 border-red-300",
      disputed: "bg-orange-100 text-orange-800 border-orange-300",
    };
    return colors[status] || "bg-gray-100 text-gray-800 border-gray-300";
  };

  const getStatusText = (status: string, usesTransport: boolean) => {
    if (status === "in_transit") {
      return usesTransport ? "IN TRANSIT" : "READY FOR COLLECTION";
    }
    return status.replace("_", " ").toUpperCase();
  };

  const getRoleSpecificActions = (order: any) => {
    // For buyers: Only show view details button
    if (user?.role === "buyer") {
      return null; // View Details button is already shown in the Actions column
    }

    // For farmers: Only show status messages, no action buttons
    if (user?.role === "farmer") {
      switch (order.order.status) {
        case "pending":
          return (
            <div className="text-xs text-yellow-700 bg-yellow-50 border border-yellow-200 px-3 py-2 rounded">
              ⏳ Awaiting payment
            </div>
          );
        case "delivered":
          return (
            <div className="text-xs text-purple-700 bg-purple-50 border border-purple-200 px-3 py-2 rounded">
              📦 Awaiting buyer confirmation
            </div>
          );
        case "confirmed":
          return (
            <div className="text-xs text-green-700 bg-green-50 border border-green-200 px-3 py-2 rounded font-semibold">
              ✅ Payment released
            </div>
          );
      }
    }

    return null;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-primary-green font-serif mb-2">
            My Orders
          </h1>
          <p className="text-gray-600">
            {user?.role === "farmer"
              ? "Track and manage your sales"
              : "View and manage your purchases"}
          </p>
        </div>

        {/* Filters */}
        <Card className="p-6 mb-8">
          <div className="flex flex-wrap items-center gap-4">
            <label className="font-semibold text-gray-700">
              Filter by status:
            </label>
            <select
              value={filterStatus}
              onChange={(e) =>
                setFilterStatus(e.target.value as OrderStatus | "")
              }
              className="px-4 py-2 border border-gray-300 rounded focus:border-primary-green focus:ring-2 focus:ring-primary-green focus:ring-opacity-20 focus:outline-none"
            >
              <option value="">All Orders</option>
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="in_transit">In Transit</option>
              <option value="delivered">Delivered</option>
              <option value="confirmed">Confirmed</option>
              <option value="cancelled">Cancelled</option>
            </select>

            <Button
              variant="outline"
              size="sm"
              onClick={fetchOrders}
              disabled={loading}
            >
              🔄 Refresh
            </Button>
          </div>
        </Card>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="flex justify-center py-20">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <>
            {/* Orders List */}
            {orders.length > 0 ? (
              <div className="space-y-4">
                {orders.map(({ order, buyer, farmer, listing }) => (
                  <Card
                    key={order.id}
                    className="p-6 hover:shadow-lg transition-shadow"
                  >
                    <div className="flex items-start justify-between gap-6">
                      <div className="flex-1">
                        {/* Order ID and Status */}
                        <div className="flex items-center gap-3 mb-4">
                          <h3 className="text-lg font-bold text-gray-900">
                            Order #{order.id.slice(0, 8)}...
                          </h3>
                          <span
                            className={`px-3 py-1.5 rounded-full text-xs font-bold border ${getStatusColor(
                              order.status
                            )}`}
                          >
                            {getStatusText(order.status, order.usesTransport)}
                          </span>
                        </div>

                        {/* Product Info */}
                        {listing && (
                          <div className="mb-4 pb-4 border-b">
                            <p className="text-sm text-gray-600 mb-1">
                              Product
                            </p>
                            <p className="font-semibold text-lg">
                              {listing.cropType} -{" "}
                              {parseFloat(order.quantity).toFixed(2)}{" "}
                              {listing.unit}
                            </p>
                          </div>
                        )}

                        {/* Order Details Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          <div>
                            <p className="text-sm text-gray-600">
                              Total Amount
                            </p>
                            <p className="font-bold text-primary-green text-lg">
                              ${parseFloat(order.totalAmount).toFixed(2)}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Delivery</p>
                            <p className="font-semibold text-sm">
                              {order.deliveryLocation || "Self pickup"}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Order Date</p>
                            <p className="font-semibold text-sm">
                              {new Date(order.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">
                              {user?.role === "farmer" ? "Buyer" : "Seller"}
                            </p>
                            <p className="font-semibold text-sm">
                              {user?.role === "farmer"
                                ? buyer?.fullName || "Unknown"
                                : farmer?.fullName || "Unknown"}
                            </p>
                          </div>
                        </div>

                        {/* Notes */}
                        {order.notes && (
                          <div className="bg-blue-50 border border-blue-200 rounded p-3 text-sm">
                            <p className="text-blue-900 font-semibold mb-1">
                              📝 Notes:
                            </p>
                            <p className="text-blue-800">
                              {safeDisplayText(order.notes)}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Actions Column */}
                      <div className="flex flex-col gap-3 items-end">
                        <Link to={`/orders/${order.id}`}>
                          <Button size="sm" variant="outline">
                            📄 View Details
                          </Button>
                        </Link>
                        {getRoleSpecificActions({
                          order,
                          buyer,
                          farmer,
                          listing,
                        })}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-12 text-center">
                <svg
                  className="w-24 h-24 mx-auto mb-4 text-gray-400"
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
                <h3 className="text-2xl font-bold text-gray-700 mb-2">
                  No orders found
                </h3>
                <p className="text-gray-600 mb-6">
                  {user?.role === "buyer"
                    ? "You haven't placed any orders yet."
                    : "You don't have any orders to fulfill yet."}
                </p>
                {user?.role === "buyer" && (
                  <Link to="/marketplace">
                    <Button variant="primary">Browse Marketplace</Button>
                  </Link>
                )}
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Orders;
