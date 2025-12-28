import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import agrimallService from "../services/agrimallService";
import { Card, Button, LoadingSpinner } from "../components/common";
import { useAuth } from "../contexts/AuthContext";

export default function AgriMallOrderDetail() {
  const { orderId } = useParams<{ orderId: string }>();
  const { user } = useAuth();
  const [orderData, setOrderData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [processing, setProcessing] = useState(false);

  // Vendor actions
  const [newStatus, setNewStatus] = useState("");
  const [vendorNotes, setVendorNotes] = useState("");

  useEffect(() => {
    if (orderId) {
      loadOrder();
    }
  }, [orderId]);

  const loadOrder = async () => {
    try {
      setLoading(true);
      const response = await agrimallService.getOrder(orderId!);
      setOrderData(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load order");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!newStatus) {
      alert("Please select a status");
      return;
    }

    try {
      setProcessing(true);
      await agrimallService.updateOrderStatus(orderId!, newStatus, vendorNotes);
      alert("✓ Order status updated");
      setNewStatus("");
      setVendorNotes("");
      await loadOrder();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to update status");
    } finally {
      setProcessing(false);
    }
  };

  const handleConfirmDelivery = async () => {
    if (!confirm("Confirm delivery? This will release funds to the vendor.")) {
      return;
    }

    try {
      setProcessing(true);
      await agrimallService.confirmDelivery(orderId!, 5, "Great service!");
      alert("✓ Delivery confirmed! Funds released to vendor.");
      await loadOrder();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to confirm delivery");
    } finally {
      setProcessing(false);
    }
  };

  const handleCancelOrder = async () => {
    const reason = prompt("Reason for cancellation:");
    if (!reason) return;

    try {
      setProcessing(true);
      await agrimallService.cancelOrder(orderId!, reason);
      alert("✓ Order cancelled");
      await loadOrder();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to cancel order");
    } finally {
      setProcessing(false);
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

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !orderData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="text-center py-12">
          <p className="text-red-600 text-lg mb-4">
            {error || "Order not found"}
          </p>
          <Link to="/agrimall/orders">
            <Button variant="primary">Back to Orders</Button>
          </Link>
        </Card>
      </div>
    );
  }

  const { order, buyer, vendor } = orderData;
  const isBuyer = user?.id === order.buyerId;
  const isVendor = vendor?.userId === user?.id;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Order #{order.orderNumber}
          </h1>
          <p className="text-gray-600">
            Placed on {new Date(order.createdAt).toLocaleDateString()} at{" "}
            {new Date(order.createdAt).toLocaleTimeString()}
          </p>
        </div>
        <Link to="/agrimall/orders">
          <Button variant="outline" size="sm">
            ← Back to Orders
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Order Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Status */}
          <Card className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Order Status
            </h2>
            <div className="flex gap-3 mb-4">
              <span
                className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(
                  order.status
                )}`}
              >
                {order.status.replace("_", " ").toUpperCase()}
              </span>
              <span
                className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${
                  order.paymentStatus === "paid"
                    ? "bg-green-100 text-green-800"
                    : "bg-yellow-100 text-yellow-800"
                }`}
              >
                {order.paymentStatus.toUpperCase()}
              </span>
            </div>

            {/* Status History */}
            {order.statusHistory && order.statusHistory.length > 0 && (
              <div className="mt-4">
                <h3 className="font-semibold text-gray-700 mb-3">
                  Status History
                </h3>
                <div className="space-y-2">
                  {order.statusHistory.map((history: any, idx: number) => (
                    <div key={idx} className="flex items-start gap-3 text-sm">
                      <div className="w-2 h-2 mt-1.5 rounded-full bg-green-500 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">
                          {history.status.replace("_", " ").toUpperCase()}
                        </p>
                        <p className="text-gray-600">
                          {new Date(history.timestamp).toLocaleString()}
                        </p>
                        {history.note && (
                          <p className="text-gray-500 italic mt-1">
                            {history.note}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>

          {/* Order Items */}
          <Card className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Order Items ({order.items?.length || 0})
            </h2>
            <div className="space-y-4">
              {order.items?.map((item: any, idx: number) => (
                <div
                  key={idx}
                  className="flex gap-4 pb-4 border-b last:border-b-0"
                >
                  <div className="w-20 h-20 bg-gray-100 rounded-lg flex-shrink-0 flex items-center justify-center">
                    <span className="text-2xl">📦</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">
                      {item.productName}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Quantity: {item.quantity}
                    </p>
                    <p className="text-sm text-gray-600">
                      Price: ${item.price} per unit
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">${item.total}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Delivery Information */}
          <Card className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Delivery Information
            </h2>
            <div className="space-y-3 text-sm">
              <div>
                <p className="font-semibold text-gray-700">Delivery Address:</p>
                <p className="text-gray-900">{order.deliveryAddress}</p>
              </div>
              <div>
                <p className="font-semibold text-gray-700">Delivery Method:</p>
                <p className="text-gray-900">
                  {order.deliveryMethod?.toUpperCase() || "STANDARD"}
                </p>
              </div>
              {order.estimatedDelivery && (
                <div>
                  <p className="font-semibold text-gray-700">
                    Estimated Delivery:
                  </p>
                  <p className="text-gray-900">
                    {new Date(order.estimatedDelivery).toLocaleDateString()}
                  </p>
                </div>
              )}
              {order.actualDelivery && (
                <div>
                  <p className="font-semibold text-gray-700">Delivered On:</p>
                  <p className="text-gray-900">
                    {new Date(order.actualDelivery).toLocaleString()}
                  </p>
                </div>
              )}
              {order.buyerNotes && (
                <div>
                  <p className="font-semibold text-gray-700">Buyer Notes:</p>
                  <p className="text-gray-900 italic">{order.buyerNotes}</p>
                </div>
              )}
              {order.vendorNotes && (
                <div>
                  <p className="font-semibold text-gray-700">Vendor Notes:</p>
                  <p className="text-gray-900 italic">{order.vendorNotes}</p>
                </div>
              )}
            </div>
          </Card>

          {/* Vendor Actions */}
          {isVendor && !["confirmed", "cancelled"].includes(order.status) && (
            <Card className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Update Order Status
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    New Status
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">Select status...</option>
                    <option value="processing">Processing</option>
                    <option value="ready_for_pickup">Ready for Pickup</option>
                    <option value="shipped">Shipped</option>
                    <option value="in_transit">In Transit</option>
                    <option value="delivered">Delivered</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Notes (Optional)
                  </label>
                  <textarea
                    value={vendorNotes}
                    onChange={(e) => setVendorNotes(e.target.value)}
                    placeholder="Add notes about this status update..."
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <Button
                  variant="primary"
                  onClick={handleUpdateStatus}
                  disabled={processing || !newStatus}
                  className="w-full"
                >
                  {processing ? "Updating..." : "Update Status"}
                </Button>
              </div>
            </Card>
          )}
        </div>

        {/* Right Column - Summary & Actions */}
        <div className="lg:col-span-1 space-y-6">
          {/* Order Summary */}
          <Card className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Order Summary
            </h2>
            <div className="space-y-2 text-sm mb-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal:</span>
                <span className="text-gray-900">${order.subtotal}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Delivery Fee:</span>
                <span className="text-gray-900">${order.deliveryFee}</span>
              </div>
              {order.tax !== "0.00" && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax:</span>
                  <span className="text-gray-900">${order.tax}</span>
                </div>
              )}
              {order.discount !== "0.00" && (
                <div className="flex justify-between text-green-600">
                  <span>Discount:</span>
                  <span>-${order.discount}</span>
                </div>
              )}
            </div>
            <div className="border-t pt-3">
              <div className="flex justify-between text-lg font-bold">
                <span>Total:</span>
                <span className="text-green-600">${order.totalAmount}</span>
              </div>
            </div>
          </Card>

          {/* Parties */}
          <Card className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Parties</h2>
            <div className="space-y-4 text-sm">
              {vendor && (
                <div>
                  <p className="font-semibold text-gray-700">Vendor:</p>
                  <p className="text-gray-900">{vendor.storeName}</p>
                  <p className="text-gray-600">{vendor.phone}</p>
                </div>
              )}
              {buyer && isBuyer && (
                <div>
                  <p className="font-semibold text-gray-700">Buyer:</p>
                  <p className="text-gray-900">{buyer.fullName}</p>
                  <p className="text-gray-600">{buyer.phone}</p>
                </div>
              )}
            </div>
          </Card>

          {/* Actions */}
          <Card className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Actions</h2>
            <div className="space-y-3">
              {/* Buyer Actions */}
              {isBuyer && order.status === "delivered" && (
                <Button
                  variant="success"
                  onClick={handleConfirmDelivery}
                  disabled={processing}
                  className="w-full"
                >
                  {processing ? "Processing..." : "Confirm Delivery"}
                </Button>
              )}

              {isBuyer &&
                ["pending", "paid", "processing"].includes(order.status) && (
                  <Button
                    variant="danger"
                    onClick={handleCancelOrder}
                    disabled={processing}
                    className="w-full"
                  >
                    {processing ? "Cancelling..." : "Cancel Order"}
                  </Button>
                )}

              {/* Contact */}
              {vendor && isBuyer && (
                <a href={`tel:${vendor.phone}`}>
                  <Button variant="outline" className="w-full">
                    📞 Contact Vendor
                  </Button>
                </a>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
