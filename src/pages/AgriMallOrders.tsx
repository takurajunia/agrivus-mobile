import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import agrimallService from "../services/agrimallService";
import { Card, Button, LoadingSpinner } from "../components/common";
import { useAuth } from "../contexts/AuthContext";

export default function AgriMallOrders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    loadOrders();
  }, [statusFilter]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const response = await agrimallService.getOrders({
        status: statusFilter || undefined,
        limit: 50,
      });
      setOrders(response.data.orders || []);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: "bg-gray-100 text-gray-800",
      paid: "bg-blue-100 text-blue-800",
      processing: "bg-yellow-100 text-yellow-800",
      ready_for_pickup: "bg-purple-100 text-purple-800",
      shipped: "bg-indigo-100 text-indigo-800",
      in_transit: "bg-blue-100 text-blue-800",
      delivered: "bg-green-100 text-green-800",
      confirmed: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const getPaymentStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-800",
      paid: "bg-green-100 text-green-800",
      failed: "bg-red-100 text-red-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          My Agri-Mall Orders
        </h1>
        <p className="text-gray-600">
          Track and manage your agricultural product orders
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="mb-6 flex gap-4 items-center">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="paid">Paid</option>
          <option value="processing">Processing</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="confirmed">Confirmed</option>
          <option value="cancelled">Cancelled</option>
        </select>

        <Button variant="outline" size="sm" onClick={loadOrders}>
          Refresh
        </Button>
      </div>

      {/* Orders List */}
      {orders.length === 0 ? (
        <Card className="text-center py-12">
          <p className="text-gray-500 text-lg mb-4">No orders found</p>
          <Link to="/agrimall/products">
            <Button variant="primary">Start Shopping</Button>
          </Link>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((orderData) => {
            const order = orderData.order;
            const vendor = orderData.vendor;

            return (
              <Card key={order.id} className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">
                      Order #{order.orderNumber}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {vendor?.storeName || "Vendor"}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(order.createdAt).toLocaleDateString()} at{" "}
                      {new Date(order.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                        order.status
                      )}`}
                    >
                      {order.status.replace("_", " ").toUpperCase()}
                    </span>
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ml-2 ${getPaymentStatusColor(
                        order.paymentStatus
                      )}`}
                    >
                      {order.paymentStatus.toUpperCase()}
                    </span>
                  </div>
                </div>

                {/* Order Items Summary */}
                <div className="mb-4 pb-4 border-b">
                  <p className="text-sm text-gray-700 mb-2">
                    <strong>Items:</strong> {order.items?.length || 0}{" "}
                    product(s)
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {order.items?.slice(0, 3).map((item: any, idx: number) => (
                      <span
                        key={idx}
                        className="text-xs bg-gray-100 px-2 py-1 rounded"
                      >
                        {item.productName} × {item.quantity}
                      </span>
                    ))}
                    {order.items?.length > 3 && (
                      <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                        +{order.items.length - 3} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Delivery Info */}
                <div className="mb-4 text-sm text-gray-700">
                  <p>
                    <strong>Delivery:</strong> {order.deliveryAddress}
                  </p>
                  {order.buyerNotes && (
                    <p className="mt-1">
                      <strong>Notes:</strong> {order.buyerNotes}
                    </p>
                  )}
                </div>

                {/* Pricing */}
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-700">
                    <p>Subtotal: ${order.subtotal}</p>
                    <p>Delivery: ${order.deliveryFee}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-green-600">
                      ${order.totalAmount}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-4 pt-4 border-t flex gap-3">
                  <Link to={`/agrimall/orders/${order.id}`} className="flex-1">
                    <Button variant="primary" size="sm" className="w-full">
                      View Details
                    </Button>
                  </Link>

                  {order.status === "delivered" && user?.role === "buyer" && (
                    <Button
                      variant="success"
                      size="sm"
                      onClick={async () => {
                        try {
                          await agrimallService.confirmDelivery(order.id, 5);
                          alert("✓ Delivery confirmed!");
                          loadOrders();
                        } catch (err: any) {
                          alert(
                            err.response?.data?.message || "Failed to confirm"
                          );
                        }
                      }}
                    >
                      Confirm Delivery
                    </Button>
                  )}

                  {["pending", "paid", "processing"].includes(order.status) && (
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={async () => {
                        if (!confirm("Cancel this order?")) return;
                        try {
                          await agrimallService.cancelOrder(
                            order.id,
                            "Changed my mind"
                          );
                          alert("✓ Order cancelled");
                          loadOrders();
                        } catch (err: any) {
                          alert(
                            err.response?.data?.message || "Failed to cancel"
                          );
                        }
                      }}
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
