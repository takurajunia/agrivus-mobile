import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import Button from "../components/common/Button";
import Card from "../components/common/Card";
import LoadingSpinner from "../components/common/LoadingSpinner";
import { auctionsService } from "../services/auctionsService";
import api from "../services/api";

interface Transporter {
  id: string;
  fullName: string;
  phone: string;
  vehicleType: string;
  vehicleCapacity: string;
  baseRate: string;
  platformScore: number;
  totalTransactions: number;
  estimatedCost?: number;
  estimatedDistance?: number;
}

const AuctionWinner: React.FC = () => {
  const { auctionId } = useParams<{ auctionId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [auction, setAuction] = useState<any>(null);
  const [transporters, setTransporters] = useState<Transporter[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    deliveryLocation: "",
    notes: "",
    usesTransport: true,
    transporterId: "",
    transportCost: 0,
  });

  useEffect(() => {
    fetchAuctionDetails();
  }, [auctionId]);

  const fetchAuctionDetails = async () => {
    try {
      setLoading(true);
      const response = await auctionsService.getAuctionDetails(auctionId!);

      if (response.success) {
        setAuction(response.data);

        // Verify user is the winner
        if (response.data.auction.winnerId !== user?.id) {
          setError("You are not the winner of this auction");
          return;
        }

        // Check if already completed
        if (response.data.auction.orderId) {
          navigate(`/orders`);
          return;
        }

        // Fetch available transporters
        await fetchTransporters(response.data.listing.location);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load auction details");
    } finally {
      setLoading(false);
    }
  };

  const fetchTransporters = async (location: string) => {
    try {
      const response = await api.get("/orders/transporters", {
        params: { location },
      });

      if (response.data.success) {
        setTransporters(response.data.data);
        if (response.data.data.length > 0) {
          setFormData((prev) => ({
            ...prev,
            transporterId: response.data.data[0].id,
            transportCost: response.data.data[0].estimatedCost || 0,
          }));
        }
      }
    } catch (err) {
      console.error("Failed to fetch transporters:", err);
    }
  };

  const handleTransporterChange = (transporterId: string) => {
    const transporter = transporters.find((t) => t.id === transporterId);
    setFormData({
      ...formData,
      transporterId,
      transportCost: transporter?.estimatedCost || 0,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      // Validate delivery location only if using transport
      if (formData.usesTransport && !formData.deliveryLocation) {
        setError("Please enter delivery location");
        setSubmitting(false);
        return;
      }

      if (formData.usesTransport && !formData.transporterId) {
        setError("Please select a transporter");
        setSubmitting(false);
        return;
      }

      const response = await auctionsService.chooseTransport(
        auctionId!,
        formData
      );

      if (response.success) {
        // Navigate to orders page
        navigate("/orders");
      }
    } catch (err: any) {
      setError(err.message || "Failed to complete checkout");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error && !auction) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <Card className="p-8 text-center max-w-md">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button variant="primary" onClick={() => navigate("/auctions")}>
            Back to Auctions
          </Button>
        </Card>
      </div>
    );
  }

  const totalCost =
    parseFloat(auction?.auction.winningBid || 0) +
    (formData.usesTransport ? formData.transportCost : 0);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Success Header */}
        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg p-8 mb-8 text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h1 className="text-4xl font-bold mb-2">Congratulations!</h1>
          <p className="text-xl">
            You won the auction for {auction?.listing.cropType}
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <Card className="p-8">
              <h2 className="text-2xl font-bold text-primary-green mb-6">
                Complete Your Purchase
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Transport Options - First, so user chooses before entering location */}
                <div>
                  <label className="block mb-2 font-semibold text-dark-green">
                    Transport Method
                  </label>
                  <div className="space-y-3">
                    <label className="flex items-center p-4 border-2 border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-all">
                      <input
                        type="radio"
                        name="transport"
                        checked={formData.usesTransport}
                        onChange={() =>
                          setFormData({
                            ...formData,
                            usesTransport: true,
                            deliveryLocation: "",
                          })
                        }
                        className="mr-3 w-4 h-4"
                      />
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900">
                          🚚 Use Platform Transport
                        </div>
                        <div className="text-sm text-gray-600">
                          We'll arrange delivery for you
                        </div>
                      </div>
                      {formData.usesTransport && (
                        <div className="text-green-600">
                          <svg
                            className="w-6 h-6"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                      )}
                    </label>

                    <label className="flex items-center p-4 border-2 border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-all">
                      <input
                        type="radio"
                        name="transport"
                        checked={!formData.usesTransport}
                        onChange={() =>
                          setFormData({
                            ...formData,
                            usesTransport: false,
                            transportCost: 0,
                            deliveryLocation: auction?.listing.location || "",
                          })
                        }
                        className="mr-3 w-4 h-4"
                      />
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900">
                          📦 Self Pickup
                        </div>
                        <div className="text-sm text-gray-600">
                          I'll arrange my own transport
                        </div>
                      </div>
                      {!formData.usesTransport && (
                        <div className="text-green-600">
                          <svg
                            className="w-6 h-6"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                      )}
                    </label>
                  </div>
                </div>

                {/* Delivery Location - Only for Platform Transport */}
                {formData.usesTransport && (
                  <div>
                    <label className="block mb-2 font-semibold text-dark-green">
                      Delivery Location *
                    </label>
                    <input
                      type="text"
                      value={formData.deliveryLocation}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          deliveryLocation: e.target.value,
                        })
                      }
                      placeholder="Enter your delivery address"
                      className="w-full px-4 py-3 border border-gray-300 rounded focus:border-primary-green focus:ring-2 focus:ring-primary-green focus:ring-opacity-20 focus:outline-none"
                      required
                    />
                    <p className="text-sm text-gray-600 mt-2">
                      📍 Where should the transporter deliver your order?
                    </p>
                  </div>
                )}

                {/* Pickup Location - Only for Self Pickup */}
                {!formData.usesTransport && (
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded">
                    <h4 className="font-semibold text-blue-900 mb-2">
                      📍 Pickup Location
                    </h4>
                    <p className="text-blue-800 mb-2">
                      <strong>Farm Location:</strong>{" "}
                      {auction?.listing.location}
                    </p>
                    <p className="text-sm text-blue-700">
                      You'll need to arrange pickup directly with the farmer.
                      Their contact details will be shared after completing this
                      purchase.
                    </p>
                  </div>
                )}

                {/* Transporter Selection - Only for Platform Transport */}
                {formData.usesTransport && transporters.length > 0 && (
                  <div>
                    <label className="block mb-2 font-semibold text-dark-green">
                      Select Transporter *
                    </label>
                    <select
                      value={formData.transporterId}
                      onChange={(e) => handleTransporterChange(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded focus:border-primary-green focus:ring-2 focus:ring-primary-green focus:ring-opacity-20 focus:outline-none"
                      required
                    >
                      {transporters.map((transporter) => (
                        <option key={transporter.id} value={transporter.id}>
                          {transporter.fullName} - {transporter.vehicleType} (
                          {transporter.vehicleCapacity}) - $
                          {transporter.estimatedCost?.toFixed(2)} - ⭐{" "}
                          {transporter.platformScore}
                        </option>
                      ))}
                    </select>

                    <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded text-sm">
                      <p className="font-semibold text-blue-900 mb-1">
                        Selected Transporter Details:
                      </p>
                      {transporters
                        .filter((t) => t.id === formData.transporterId)
                        .map((t) => (
                          <div key={t.id} className="text-blue-800">
                            <p>📞 Phone: {t.phone}</p>
                            <p>🚚 Vehicle: {t.vehicleType}</p>
                            <p>📦 Capacity: {t.vehicleCapacity}</p>
                            <p>⭐ Rating: {t.platformScore}/100</p>
                            <p>
                              🚚 Completed Deliveries: {t.totalTransactions}
                            </p>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {formData.usesTransport && transporters.length === 0 && (
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
                    ⚠️ No transporters available in this area. Please select
                    self-pickup or contact support.
                  </div>
                )}

                {/* Notes */}
                <div>
                  <label className="block mb-2 font-semibold text-dark-green">
                    Additional Notes (Optional)
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) =>
                      setFormData({ ...formData, notes: e.target.value })
                    }
                    rows={3}
                    placeholder={
                      formData.usesTransport
                        ? "Any special delivery instructions..."
                        : "Any special pickup arrangements or timing preferences..."
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded focus:border-primary-green focus:ring-2 focus:ring-primary-green focus:ring-opacity-20 focus:outline-none"
                  />
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  variant="primary"
                  className="w-full"
                  isLoading={submitting}
                  disabled={submitting}
                >
                  {submitting ? "Processing..." : "Complete Purchase"}
                </Button>
              </form>
            </Card>
          </div>

          {/* Order Summary Sidebar */}
          <div>
            <Card className="p-6 sticky top-8">
              <h3 className="text-xl font-bold text-primary-green mb-4">
                Order Summary
              </h3>

              {/* Product Info */}
              <div className="mb-4 pb-4 border-b">
                <p className="text-sm text-gray-600 mb-1">Product</p>
                <p className="font-semibold">
                  {auction?.listing.cropType} - {auction?.listing.quantity}{" "}
                  {auction?.listing.unit}
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  📍 {auction?.listing.location}
                </p>
              </div>

              {/* Farmer Info */}
              <div className="mb-4 pb-4 border-b">
                <p className="text-sm text-gray-600 mb-1">Farmer</p>
                <p className="font-semibold">{auction?.farmer.fullName}</p>
                <p className="text-sm text-gray-600">
                  ⭐ Score: {auction?.farmer.platformScore}
                </p>
              </div>

              {/* Price Breakdown */}
              <div className="space-y-2 mb-4 pb-4 border-b">
                <div className="flex justify-between">
                  <span className="text-gray-600">Winning Bid</span>
                  <span className="font-semibold">
                    ${parseFloat(auction?.auction.winningBid || 0).toFixed(2)}
                  </span>
                </div>
                {formData.usesTransport && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Transport Cost</span>
                    <span className="font-semibold">
                      ${formData.transportCost.toFixed(2)}
                    </span>
                  </div>
                )}
              </div>

              {/* Total */}
              <div className="flex justify-between items-center text-lg font-bold">
                <span>Total</span>
                <span className="text-primary-green">
                  ${totalCost.toFixed(2)}
                </span>
              </div>

              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded text-sm">
                <p className="font-semibold text-blue-900 mb-2">
                  💰 Payment Protection
                </p>
                <p className="text-blue-800 text-xs leading-relaxed">
                  Your payment will be held in escrow until delivery is
                  confirmed. This protects both you and the farmer.
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuctionWinner;
