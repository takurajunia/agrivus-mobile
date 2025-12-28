import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { safeDisplayText } from "../utils/textUtils";
import Button from "../components/common/Button";
import Card from "../components/common/Card";
import LoadingSpinner from "../components/common/LoadingSpinner";
import { ordersService } from "../services/ordersService";
import chatService from "../services/chatService";
import type { TransporterMatch } from "../types";

const OrderDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  // Transporter matching state
  const [transporterMatches, setTransporterMatches] = useState<
    TransporterMatch[]
  >([]);
  const [matchingLoading, setMatchingLoading] = useState(false);
  const [selectedTransporter, setSelectedTransporter] = useState<string | null>(
    null
  );
  const [showTransporterModal, setShowTransporterModal] = useState(false);

  useEffect(() => {
    fetchOrderDetails();
  }, [id]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const response = await ordersService.getOrderById(id!);
      if (response.success) {
        setOrder(response.data);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load order details");
    } finally {
      setLoading(false);
    }
  };

  const handleMatchTransporter = async () => {
    try {
      setMatchingLoading(true);
      const response = await ordersService.matchTransporter(id!);
      if (response.success && response.data) {
        setTransporterMatches(response.data.matches || []);
        setShowTransporterModal(true);
      }
    } catch (err: any) {
      alert(err.message || "Failed to find transporters");
    } finally {
      setMatchingLoading(false);
    }
  };

  const handleAssignTransporter = async () => {
    if (!selectedTransporter) {
      alert("Please select a transporter");
      return;
    }

    const selected = transporterMatches.find(
      (t) => t.transporterId === selectedTransporter
    );
    if (!selected) return;

    // Calculate estimated cost based on distance (simplified)
    const estimatedCost = 15; // Base cost - in production this would be calculated

    try {
      setActionLoading(true);
      const response = await ordersService.assignTransporter(id!, {
        transporterId: selectedTransporter,
        transportCost: estimatedCost.toString(),
        pickupLocation: order.listing?.location,
      });

      if (response.success) {
        alert("✅ Transporter assigned successfully!");
        setShowTransporterModal(false);
        setSelectedTransporter(null);
        setTransporterMatches([]);
        fetchOrderDetails();
      }
    } catch (err: any) {
      alert(err.message || "Failed to assign transporter");
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmDelivery = async () => {
    if (
      !window.confirm(
        "Confirm that you have received the goods in good condition?"
      )
    ) {
      return;
    }

    try {
      setActionLoading(true);
      const response = await ordersService.confirmDelivery(id!);
      if (response.success) {
        alert("Delivery confirmed! Payment released to seller.");
        fetchOrderDetails();
      }
    } catch (err: any) {
      alert(err.message || "Failed to confirm delivery");
    } finally {
      setActionLoading(false);
    }
  };

  const handleMessageUser = async (userId: string) => {
    try {
      const response = await chatService.getOrCreateConversation(userId);
      if (response.success) {
        navigate("/chat", { state: { conversationId: response.data.id } });
      }
    } catch (error) {
      console.error("Failed to start chat:", error);
      alert("Failed to start conversation. Please try again.");
    }
  };

  const handleMarkInTransit = async () => {
    const isPickup = !order?.order?.usesTransport;
    const message = isPickup
      ? "Confirm that the goods are ready for the buyer to collect?"
      : "Confirm that the goods have been dispatched/handed over for delivery?";

    if (!window.confirm(message)) {
      return;
    }

    try {
      setActionLoading(true);
      const response = await ordersService.updateOrderStatus(id!, "in_transit");
      if (response.success) {
        const successMsg = isPickup
          ? "✅ Goods marked as ready for pickup!"
          : "✅ Order marked as in transit!";
        alert(successMsg);
        fetchOrderDetails();
      }
    } catch (err: any) {
      alert(err.message || "Failed to update order status");
    } finally {
      setActionLoading(false);
    }
  };

  const handleMarkDelivered = async () => {
    const isPickup = !order?.order?.usesTransport;
    const message = isPickup
      ? "Confirm that the buyer has collected the goods?"
      : "Confirm that the goods have been delivered to the buyer?";

    if (!window.confirm(message)) {
      return;
    }

    try {
      setActionLoading(true);
      const response = await ordersService.updateOrderStatus(id!, "delivered");
      if (response.success) {
        const successMsg = isPickup
          ? "✅ Collection confirmed! Waiting for buyer to confirm receipt."
          : "✅ Order marked as delivered! Waiting for buyer confirmation.";
        alert(successMsg);
        fetchOrderDetails();
      }
    } catch (err: any) {
      alert(err.message || "Failed to update order status");
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-800",
      confirmed: "bg-blue-100 text-blue-800",
      in_transit: "bg-purple-100 text-purple-800",
      delivered: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
    };
    return styles[status] || "bg-gray-100 text-gray-800";
  };

  const getStatusText = (status: string, usesTransport: boolean) => {
    if (status === "in_transit") {
      return usesTransport ? "IN TRANSIT" : "READY FOR COLLECTION";
    }
    return status.replace("_", " ").toUpperCase();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <Card className="p-8 text-center max-w-md">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-600 mb-6">{error || "Order not found"}</p>
          <Button variant="primary" onClick={() => navigate("/orders")}>
            Back to Orders
          </Button>
        </Card>
      </div>
    );
  }

  const isBuyer = user?.id === order.order.buyerId;
  const isFarmer = user?.id === order.order.farmerId;
  const isTransporter =
    order.transport && user?.id === order.transport.transporterId;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={() => navigate("/orders")}
            className="mb-4"
          >
            ← Back to Orders
          </Button>
          <h1 className="text-3xl font-bold text-primary-green">
            Order Details
          </h1>
          <p className="text-gray-600 mt-1">
            Order ID: {order.order.id.substring(0, 8)}...
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Status */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800">
                  Order Status
                </h2>
                <span
                  className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusBadge(
                    order.order.status
                  )}`}
                >
                  {getStatusText(order.order.status, order.order.usesTransport)}
                </span>
              </div>

              {/* Timeline */}
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white">
                    ✓
                  </div>
                  <div className="ml-4">
                    <p className="font-semibold">Order Created</p>
                    <p className="text-sm text-gray-600">
                      {new Date(order.order.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>

                {order.order.status !== "pending" && (
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white">
                      ✓
                    </div>
                    <div className="ml-4">
                      <p className="font-semibold">Payment in Escrow</p>
                      <p className="text-sm text-gray-600">Funds secured</p>
                    </div>
                  </div>
                )}

                {order.transporter && (
                  <div className="flex items-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-white ${
                        order.order.status === "in_transit" ||
                        order.order.status === "delivered"
                          ? "bg-green-500"
                          : "bg-gray-300"
                      }`}
                    >
                      {order.order.status === "in_transit" ||
                      order.order.status === "delivered"
                        ? "✓"
                        : "○"}
                    </div>
                    <div className="ml-4">
                      <p className="font-semibold">In Transit</p>
                      <p className="text-sm text-gray-600">
                        Being delivered by transporter
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-white ${
                      order.order.status === "delivered"
                        ? "bg-green-500"
                        : "bg-gray-300"
                    }`}
                  >
                    {order.order.status === "delivered" ? "✓" : "○"}
                  </div>
                  <div className="ml-4">
                    <p className="font-semibold">
                      {order.order.usesTransport ? "Delivered" : "Collected"}
                    </p>
                    <p className="text-sm text-gray-600">
                      {order.order.deliveredAt
                        ? new Date(order.order.deliveredAt).toLocaleString()
                        : order.order.usesTransport
                        ? "Awaiting delivery"
                        : "Awaiting collection"}
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Product Details */}
            <Card className="p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                Product Details
              </h2>
              <div className="space-y-3">
                <div>
                  <span className="text-gray-600">Product:</span>
                  <span className="ml-2 font-semibold">
                    {order.listing?.cropType || "N/A"}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Quantity:</span>
                  <span className="ml-2 font-semibold">
                    {order.order.quantity} {order.listing?.unit || "units"}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Pickup Location:</span>
                  <span className="ml-2 font-semibold">
                    {order.listing?.location || "N/A"}
                  </span>
                </div>
                {order.listing?.description && (
                  <div>
                    <span className="text-gray-600 block mb-1">
                      Description:
                    </span>
                    <p className="text-sm">
                      {safeDisplayText(order.listing?.description)}
                    </p>
                  </div>
                )}
              </div>
            </Card>

            {/* Delivery Details */}
            <Card className="p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                {order.order.usesTransport
                  ? "Delivery Information"
                  : "Collection Information"}
              </h2>
              <div className="space-y-3">
                <div>
                  <span className="text-gray-600">
                    {order.order.usesTransport
                      ? "Delivery Location:"
                      : "Collection Location:"}
                  </span>
                  <span className="ml-2 font-semibold">
                    {order.order.usesTransport
                      ? order.order.deliveryLocation
                      : order.listing?.location || "Pickup from farm"}
                  </span>
                </div>
                {order.transporter ? (
                  <>
                    <div>
                      <span className="text-gray-600">Transporter:</span>
                      <span className="ml-2 font-semibold">
                        {order.transporter.fullName}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Phone:</span>
                      <span className="ml-2 font-semibold">
                        {order.transporter.phone}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Vehicle:</span>
                      <span className="ml-2 font-semibold">
                        {order.transporter.vehicleType}
                      </span>
                    </div>
                    <button
                      onClick={() => handleMessageUser(order.transporter.id)}
                      className="text-blue-600 hover:text-blue-700 flex items-center gap-2 mt-2"
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
                          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                        />
                      </svg>
                      Message Transporter
                    </button>
                  </>
                ) : (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                    <p className="text-sm text-blue-800">
                      {order.order.usesTransport
                        ? "🚚 Platform transport - Transporter will be assigned soon"
                        : "🚗 Self pickup - Buyer will arrange their own transport"}
                    </p>
                  </div>
                )}
                {order.order.notes && (
                  <div>
                    <span className="text-gray-600 block mb-1">Notes:</span>
                    <p className="text-sm bg-gray-50 p-3 rounded">
                      {safeDisplayText(order.order.notes)}
                    </p>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Info */}
            <Card className="p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">
                {isBuyer ? "Seller Information" : "Buyer Information"}
              </h3>
              <div className="space-y-3">
                <div>
                  <span className="text-gray-600 block text-sm">Name</span>
                  <span className="font-semibold">
                    {isBuyer ? order.farmer.fullName : order.buyer.fullName}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600 block text-sm">Phone</span>
                  <span className="font-semibold">
                    {isBuyer ? order.farmer.phone : order.buyer.phone}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600 block text-sm">Rating</span>
                  <span className="font-semibold">
                    ⭐{" "}
                    {isBuyer
                      ? order.farmer.platformScore
                      : order.buyer.platformScore}
                    /100
                  </span>
                </div>
                <button
                  onClick={() =>
                    handleMessageUser(
                      isBuyer ? order.order.farmerId : order.order.buyerId
                    )
                  }
                  className="w-full mt-2 text-blue-600 hover:text-blue-700 border border-blue-600 hover:border-blue-700 px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
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
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                  Message {isBuyer ? "Farmer" : "Buyer"}
                </button>
              </div>
            </Card>

            {/* Price Summary */}
            <Card className="p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">
                Price Summary
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Product Price</span>
                  <span className="font-semibold">
                    ${parseFloat(order.order.totalAmount).toFixed(2)}
                  </span>
                </div>
                {order.transporter && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Transport Cost</span>
                    <span className="font-semibold">
                      ${parseFloat(order.order.transportCost || 0).toFixed(2)}
                    </span>
                  </div>
                )}
                <div className="border-t pt-3 flex justify-between">
                  <span className="font-bold">Total</span>
                  <span className="font-bold text-primary-green text-xl">
                    $
                    {(
                      parseFloat(order.order.totalAmount) +
                      parseFloat(order.order.transportCost || 0)
                    ).toFixed(2)}
                  </span>
                </div>
              </div>

              {order.order.status !== "delivered" && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded text-sm">
                  <p className="font-semibold text-blue-900 mb-1">
                    💰 Payment Protection
                  </p>
                  <p className="text-blue-800 text-xs">
                    Funds are held in escrow until delivery is confirmed.
                  </p>
                </div>
              )}
            </Card>

            {/* Buyer Actions - Delivery Confirmation */}
            {isBuyer && (
              <>
                {order.order.status === "delivered" ? (
                  <Card className="p-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">
                      Actions
                    </h3>
                    <Button
                      variant="primary"
                      className="w-full"
                      onClick={handleConfirmDelivery}
                      isLoading={actionLoading}
                      disabled={actionLoading}
                    >
                      {order.order.usesTransport
                        ? "✅ Confirm Receipt & Release Payment"
                        : "✅ Confirm Collection & Release Payment"}
                    </Button>
                    <p className="text-xs text-gray-600 mt-2">
                      {order.order.usesTransport
                        ? "Only confirm after you've received and inspected the goods. This will release the payment to the seller."
                        : "Only confirm after you've collected and inspected the goods. This will release the payment to the seller."}
                    </p>
                  </Card>
                ) : order.order.status === "in_transit" ? (
                  <Card className="p-6">
                    <div
                      className={`${
                        order.order.usesTransport
                          ? "bg-blue-50 border-blue-200"
                          : "bg-green-50 border-green-200"
                      } border rounded p-4 text-center`}
                    >
                      <p className="text-2xl mb-2">
                        {order.order.usesTransport ? "🚚" : "📦"}
                      </p>
                      <p
                        className={`text-sm font-semibold ${
                          order.order.usesTransport
                            ? "text-blue-800"
                            : "text-green-800"
                        }`}
                      >
                        {order.order.usesTransport
                          ? "Order In Transit"
                          : "Ready for Collection"}
                      </p>
                      <p
                        className={`text-xs mt-2 ${
                          order.order.usesTransport
                            ? "text-blue-700"
                            : "text-green-700"
                        }`}
                      >
                        {order.order.usesTransport
                          ? "Your order is on its way! You'll be able to confirm delivery once it arrives."
                          : "Your order is ready! You can collect it from the farmer's location."}
                      </p>
                    </div>
                  </Card>
                ) : order.order.status === "paid" ||
                  order.order.status === "assigned" ? (
                  <Card className="p-6">
                    <div className="bg-amber-50 border border-amber-200 rounded p-4 text-center">
                      <p className="text-2xl mb-2">📦</p>
                      <p className="text-sm text-amber-800 font-semibold">
                        Order Being Prepared
                      </p>
                      <p className="text-xs text-amber-700 mt-2">
                        The farmer is preparing your order for{" "}
                        {order.order.usesTransport ? "delivery" : "pickup"}.
                      </p>
                    </div>
                  </Card>
                ) : null}
              </>
            )}

            {/* Farmer Actions */}
            {isFarmer && order.order.status === "paid" && (
              <Card className="p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">
                  Actions
                </h3>

                {/* Check if order uses platform transport and no transporter assigned yet */}
                {order.order.usesTransport && !order.transporter ? (
                  <>
                    <Button
                      variant="primary"
                      className="w-full"
                      onClick={handleMatchTransporter}
                      isLoading={matchingLoading}
                      disabled={matchingLoading}
                    >
                      🔍 Find Transporters
                    </Button>
                    <p className="text-xs text-gray-600 mt-2">
                      Match with available transporters using AI-powered
                      recommendations.
                    </p>
                  </>
                ) : order.order.usesTransport && order.transporter ? (
                  <>
                    <div className="bg-green-50 border border-green-200 rounded p-3 mb-4">
                      <p className="text-sm text-green-800 font-semibold">
                        ✅ Transporter Assigned:{" "}
                        {order.transporter.businessName ||
                          order.transporter.fullName}
                      </p>
                      <p className="text-xs text-green-700 mt-1">
                        Contact: {order.transporter.phone}
                      </p>
                    </div>
                    <Button
                      variant="primary"
                      className="w-full"
                      onClick={handleMarkInTransit}
                      isLoading={actionLoading}
                      disabled={actionLoading}
                    >
                      🚚 Mark as Dispatched
                    </Button>
                    <p className="text-xs text-gray-600 mt-2">
                      Mark as dispatched once goods are handed over to the
                      transporter.
                    </p>
                  </>
                ) : (
                  /* Self pickup - no transporter needed */
                  <>
                    <div className="bg-amber-50 border border-amber-200 rounded p-3 mb-4">
                      <p className="text-sm text-amber-800 font-semibold">
                        📍 Self Pickup Order
                      </p>
                      <p className="text-xs text-amber-700 mt-1">
                        Buyer will collect from: {order.listing?.location}
                      </p>
                    </div>
                    <Button
                      variant="primary"
                      className="w-full"
                      onClick={handleMarkInTransit}
                      isLoading={actionLoading}
                      disabled={actionLoading}
                    >
                      📦 Mark as Ready for Pickup
                    </Button>
                    <p className="text-xs text-gray-600 mt-2">
                      Mark when goods are ready for the buyer to collect.
                    </p>
                  </>
                )}
              </Card>
            )}

            {/* Assigned status - waiting for dispatch */}
            {isFarmer && order.order.status === "assigned" && (
              <Card className="p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">
                  Actions
                </h3>
                {order.transporter && (
                  <div className="bg-green-50 border border-green-200 rounded p-3 mb-4">
                    <p className="text-sm text-green-800 font-semibold">
                      ✅ Transporter:{" "}
                      {order.transporter.businessName ||
                        order.transporter.fullName}
                    </p>
                    <p className="text-xs text-green-700 mt-1">
                      Contact: {order.transporter.phone}
                    </p>
                  </div>
                )}
                <Button
                  variant="primary"
                  className="w-full"
                  onClick={handleMarkInTransit}
                  isLoading={actionLoading}
                  disabled={actionLoading}
                >
                  🚚 Mark as Dispatched
                </Button>
                <p className="text-xs text-gray-600 mt-2">
                  Mark as dispatched once goods are handed over for delivery.
                </p>
              </Card>
            )}

            {isFarmer && order.order.status === "in_transit" && (
              <Card className="p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">
                  Actions
                </h3>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleMarkDelivered}
                  isLoading={actionLoading}
                  disabled={actionLoading}
                >
                  {order.order.usesTransport
                    ? "📦 Mark as Delivered"
                    : "✅ Order Collected"}
                </Button>
                <p className="text-xs text-gray-600 mt-2">
                  {order.order.usesTransport
                    ? "Mark as delivered once the buyer has received the goods."
                    : "Confirm once the buyer has collected the goods."}
                </p>
              </Card>
            )}

            {/* Transporter Actions - Assigned status (picked up from farmer) */}
            {isTransporter && order.order.status === "assigned" && (
              <Card className="p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">
                  🚚 Transporter Actions
                </h3>
                <div className="bg-blue-50 border border-blue-200 rounded p-3 mb-4">
                  <p className="text-sm text-blue-800 font-semibold">
                    📍 Pickup Location
                  </p>
                  <p className="text-xs text-blue-700 mt-1">
                    {order.transport?.pickupLocation}
                  </p>
                </div>
                <Button
                  variant="primary"
                  className="w-full"
                  onClick={handleMarkInTransit}
                  isLoading={actionLoading}
                  disabled={actionLoading}
                >
                  ✅ Confirm Pickup
                </Button>
                <p className="text-xs text-gray-600 mt-2">
                  Confirm once you have picked up the goods from the farmer.
                </p>
              </Card>
            )}

            {/* Transporter Actions - In Transit (picked up, on the way) */}
            {isTransporter && order.order.status === "in_transit" && (
              <Card className="p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">
                  🚚 Transporter Actions
                </h3>
                <div className="space-y-3 mb-4">
                  <div className="bg-green-50 border border-green-200 rounded p-3">
                    <p className="text-sm text-green-800 font-semibold">
                      ✅ Goods Picked Up
                    </p>
                    <p className="text-xs text-green-700 mt-1">
                      From: {order.transport?.pickupLocation}
                    </p>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded p-3">
                    <p className="text-sm text-blue-800 font-semibold">
                      📍 Delivery Location
                    </p>
                    <p className="text-xs text-blue-700 mt-1">
                      {order.transport?.deliveryLocation}
                    </p>
                  </div>
                </div>
                <Button
                  variant="success"
                  className="w-full"
                  onClick={handleMarkDelivered}
                  isLoading={actionLoading}
                  disabled={actionLoading}
                >
                  ✅ Confirm Delivery
                </Button>
                <p className="text-xs text-gray-600 mt-2">
                  Confirm once you have delivered the goods to the buyer.
                </p>
              </Card>
            )}

            {/* Transporter - Delivered (waiting for buyer confirmation) */}
            {isTransporter && order.order.status === "delivered" && (
              <Card className="p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">
                  🚚 Delivery Status
                </h3>
                <div className="bg-green-50 border border-green-200 rounded p-4 text-center">
                  <p className="text-2xl mb-2">✅</p>
                  <p className="text-sm text-green-800 font-semibold">
                    Delivery Confirmed
                  </p>
                  <p className="text-xs text-green-700 mt-2">
                    Waiting for buyer to confirm receipt. Payment will be
                    released after confirmation.
                  </p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Transporter Selection Modal */}
      {showTransporterModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-800">
                  🚚 Select a Transporter
                </h2>
                <button
                  onClick={() => {
                    setShowTransporterModal(false);
                    setSelectedTransporter(null);
                  }}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                AI-matched transporters based on route and capacity
              </p>
            </div>

            <div className="p-6 overflow-y-auto max-h-[50vh]">
              {transporterMatches.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-600">
                    No transporters available for this route.
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    Try again later or contact support.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {transporterMatches.map((match) => (
                    <label
                      key={match.transporterId}
                      className={`block p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        selectedTransporter === match.transporterId
                          ? "border-primary-green bg-green-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name="transporter"
                        value={match.transporterId}
                        checked={selectedTransporter === match.transporterId}
                        onChange={() =>
                          setSelectedTransporter(match.transporterId)
                        }
                        className="sr-only"
                      />
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-gray-900">
                              {match.transporter.fullName}
                            </span>
                            <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded">
                              {(match.matchScore * 100).toFixed(0)}% match
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            📍 {match.transporter.baseLocation}
                          </p>
                          <p className="text-sm text-gray-600">
                            🚛 {match.transporter.vehicleType} • Capacity:{" "}
                            {match.transporter.vehicleCapacity}
                          </p>
                          <p className="text-sm text-gray-600">
                            ⭐ Rating: {match.transporter.rating || "New"} •{" "}
                            {match.transporter.completedDeliveries || 0}{" "}
                            deliveries
                          </p>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {match.matchReasons.highPlatformActivity && (
                              <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded">
                                Active
                              </span>
                            )}
                            {match.matchReasons.serviceAreaMatch && (
                              <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded">
                                Area Match
                              </span>
                            )}
                            {match.matchReasons.goodRating && (
                              <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded">
                                Top Rated
                              </span>
                            )}
                            {match.matchReasons.experienced && (
                              <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded">
                                Experienced
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-500">
                            On-time: {match.transporter.onTimeDeliveryRate}
                          </p>
                        </div>
                      </div>
                      {selectedTransporter === match.transporterId && (
                        <div className="mt-2 pt-2 border-t">
                          <span className="text-primary-green text-sm font-semibold">
                            ✓ Selected
                          </span>
                        </div>
                      )}
                    </label>
                  ))}
                </div>
              )}
            </div>

            <div className="p-6 border-t bg-gray-50 flex gap-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setShowTransporterModal(false);
                  setSelectedTransporter(null);
                }}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                className="flex-1"
                onClick={handleAssignTransporter}
                disabled={!selectedTransporter || actionLoading}
                isLoading={actionLoading}
              >
                Assign Transporter
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderDetail;
