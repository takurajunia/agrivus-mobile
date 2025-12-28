import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import agrimallService from "../services/agrimallService";
import type { CheckoutSummary, Transporter } from "../services/agrimallService";
import { Button, LoadingSpinner, Card } from "../components/common";

export default function Checkout() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [summary, setSummary] = useState<CheckoutSummary | null>(null);
  const [transporters, setTransporters] = useState<Transporter[]>([]);
  const [error, setError] = useState("");

  // Form state
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [selectedTransporter, setSelectedTransporter] = useState<string | null>(
    null
  );
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [buyerNotes, setBuyerNotes] = useState("");
  const [showTransporters, setShowTransporters] = useState(false);

  useEffect(() => {
    loadCheckoutSummary();
  }, []);

  const loadCheckoutSummary = async () => {
    try {
      setLoading(true);
      const response = await agrimallService.getCheckoutSummary();
      setSummary(response.data);

      if (response.data.cart.items.length === 0) {
        navigate("/agrimall/cart");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load checkout");
    } finally {
      setLoading(false);
    }
  };

  const loadTransporters = async () => {
    if (!deliveryAddress.trim()) {
      alert("Please enter delivery address first");
      return;
    }

    try {
      setLoading(true);
      const response = await agrimallService.getTransporters(deliveryAddress);
      setTransporters(response.data.transporters || []);
      setShowTransporters(true);
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to load transporters");
    } finally {
      setLoading(false);
    }
  };

  const selectTransporter = (transporter: Transporter) => {
    setSelectedTransporter(transporter.transporterId);
    setDeliveryFee(parseFloat(transporter.estimatedDeliveryFee));
    setShowTransporters(false);
  };

  const handleCheckout = async () => {
    if (!deliveryAddress.trim()) {
      alert("Please enter delivery address");
      return;
    }

    if (!summary) return;

    const total = parseFloat(summary.pricing.subtotal) + deliveryFee;

    if (!summary.wallet.sufficient) {
      alert(
        `Insufficient wallet balance. You need $${summary.wallet.shortfall} more.`
      );
      return;
    }

    if (!confirm(`Complete checkout for $${total.toFixed(2)}?`)) {
      return;
    }

    try {
      setProcessing(true);
      const response = await agrimallService.checkout({
        deliveryAddress: deliveryAddress.trim(),
        deliveryMethod: "standard",
        transporterId: selectedTransporter || undefined,
        deliveryFee,
        buyerNotes: buyerNotes.trim() || undefined,
      });

      alert(`✓ Order(s) created successfully! ${response.message}`);
      navigate("/agrimall/orders");
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to process checkout");
    } finally {
      setProcessing(false);
    }
  };

  if (loading && !summary) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="text-center py-12">
          <p className="text-gray-500 text-lg">Unable to load checkout</p>
        </Card>
      </div>
    );
  }

  const totalAmount = parseFloat(summary.pricing.subtotal) + deliveryFee;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Checkout</h1>
        <p className="text-gray-600">Complete your order</p>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Insufficient Balance Warning */}
      {!summary.wallet.sufficient && (
        <div className="mb-6 bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg">
          ⚠️ Insufficient wallet balance. You need ${summary.wallet.shortfall}{" "}
          more.
          <a href="/wallet" className="ml-2 underline font-semibold">
            Add Funds
          </a>
        </div>
      )}

      {/* Unavailable Items Warning */}
      {!summary.availability.allAvailable && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
          ⚠️ Some items in your cart are no longer available:
          <ul className="list-disc ml-6 mt-2">
            {summary.availability.unavailableItems.map((item: any) => (
              <li key={item.productId}>
                {item.productName} - Requested: {item.requested}, Available:{" "}
                {item.available}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Delivery & Transport */}
        <div className="lg:col-span-2 space-y-6">
          {/* Delivery Address */}
          <Card className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Delivery Information
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Delivery Address *
                </label>
                <textarea
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  placeholder="Enter your full delivery address including city and landmarks"
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Order Notes (Optional)
                </label>
                <textarea
                  value={buyerNotes}
                  onChange={(e) => setBuyerNotes(e.target.value)}
                  placeholder="Special instructions for the vendor..."
                  rows={2}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>
          </Card>

          {/* Transport Selection */}
          <Card className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                Delivery Transport
              </h2>
              <Button
                variant="outline"
                size="sm"
                onClick={loadTransporters}
                disabled={loading || !deliveryAddress.trim()}
              >
                {loading ? "Loading..." : "Find Transporters"}
              </Button>
            </div>

            {selectedTransporter ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-green-900">
                      ✓ Transport Selected
                    </p>
                    <p className="text-sm text-green-700 mt-1">
                      Delivery Fee: ${deliveryFee.toFixed(2)}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedTransporter(null);
                      setDeliveryFee(0);
                    }}
                    className="text-sm text-red-600 hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-gray-500 text-sm">
                Optional: Select a transporter for faster delivery
              </p>
            )}

            {/* Transporters List */}
            {showTransporters && transporters.length > 0 && (
              <div className="mt-4 space-y-3">
                <p className="text-sm font-semibold text-gray-700">
                  Available Transporters:
                </p>
                {transporters.map((t) => (
                  <div
                    key={t.transporterId}
                    className="border border-gray-200 rounded-lg p-4 hover:border-green-500 cursor-pointer transition"
                    onClick={() => selectTransporter(t)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-gray-900">
                          {t.transporter.fullName}
                        </p>
                        <p className="text-sm text-gray-600">
                          {t.transporter.vehicleType} -{" "}
                          {t.transporter.vehicleCapacity}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Match Score: {t.matchScore}/100 | ETA:{" "}
                          {t.estimatedDeliveryTime}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600">
                          ${t.estimatedDeliveryFee}
                        </p>
                        <p className="text-xs text-gray-500">delivery fee</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {showTransporters && transporters.length === 0 && (
              <p className="text-sm text-gray-500 mt-4">
                No transporters available for this location. Vendor will arrange
                delivery.
              </p>
            )}
          </Card>

          {/* Order Items */}
          <Card className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Order Items ({summary.cart.itemCount})
            </h2>

            <div className="space-y-3">
              {summary.cart.items.map((item) => (
                <div
                  key={item.productId}
                  className="flex gap-3 pb-3 border-b last:border-b-0"
                >
                  <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    {item.product.images && item.product.images.length > 0 ? (
                      <img
                        src={item.product.images[0]}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        📦
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-sm text-gray-900">
                      {item.product.name}
                    </p>
                    <p className="text-xs text-gray-600">
                      {item.vendor.storeName}
                    </p>
                    <p className="text-sm text-gray-700 mt-1">
                      ${item.price} × {item.quantity} = ${item.subtotal}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Column - Order Summary */}
        <div className="lg:col-span-1">
          <Card className="p-6 sticky top-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Order Summary
            </h2>

            <div className="space-y-3 mb-4">
              <div className="flex justify-between text-gray-700">
                <span>Subtotal:</span>
                <span>${summary.pricing.subtotal}</span>
              </div>
              <div className="flex justify-between text-gray-700">
                <span>Delivery Fee:</span>
                <span>${deliveryFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-700">
                <span>Tax:</span>
                <span>${summary.pricing.tax}</span>
              </div>
            </div>

            <div className="border-t pt-4 mb-4">
              <div className="flex justify-between text-xl font-bold">
                <span>Total:</span>
                <span className="text-green-600">
                  ${totalAmount.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="mb-6 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-700 mb-2">
                <strong>Wallet Balance:</strong> ${summary.wallet.balance}
              </p>
              <p className="text-sm text-gray-700">
                <strong>Available:</strong> $
                {(parseFloat(summary.wallet.balance) - 0).toFixed(2)}
              </p>
            </div>

            <Button
              variant="primary"
              size="lg"
              className="w-full"
              onClick={handleCheckout}
              disabled={
                processing ||
                !deliveryAddress.trim() ||
                !summary.wallet.sufficient ||
                !summary.availability.allAvailable
              }
            >
              {processing ? (
                <>
                  <LoadingSpinner size="sm" />
                  <span className="ml-2">Processing...</span>
                </>
              ) : (
                `Place Order - $${totalAmount.toFixed(2)}`
              )}
            </Button>

            <p className="text-xs text-gray-500 text-center mt-4">
              Funds will be held in escrow until delivery confirmation
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
