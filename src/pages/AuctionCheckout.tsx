import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getAuctionDetails,
  chooseTransport,
} from "../services/auctionsService";
import { Card, Button, LoadingSpinner } from "../components/common";
import { useAuth } from "../contexts/AuthContext";

const AuctionCheckout: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [auction, setAuction] = useState<any>(null);
  const [listing, setListing] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [usesTransport, setUsesTransport] = useState(false);

  const [formData, setFormData] = useState({
    deliveryLocation: "",
    notes: "",
  });

  useEffect(() => {
    if (id) {
      fetchAuctionDetails();
    }
  }, [id]);

  const fetchAuctionDetails = async () => {
    try {
      setLoading(true);
      const response = await getAuctionDetails(id!);
      setAuction(response.data.auction);
      setListing(response.data.listing);
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Failed to fetch auction details"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.deliveryLocation.trim()) {
      setError("Delivery location is required");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      await chooseTransport(id!, {
        deliveryLocation: formData.deliveryLocation,
        notes: formData.notes,
        usesTransport,
        // Transport details would be selected from a matching UI
        // For now, we're just doing self-pickup
      });

      alert("Order created successfully! 🎉");
      navigate("/orders");
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to create order");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!auction) return <div>Auction not found</div>;

  const isWinner = auction.winnerId === user?.id;
  const canCheckout = isWinner && auction.status === "awaiting_transport";

  if (!canCheckout) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Access Denied
            </h2>
            <p className="text-gray-600">
              {!isWinner
                ? "Only the auction winner can access this page"
                : "This auction is not awaiting transport selection"}
            </p>
            <Button
              onClick={() => navigate(`/auctions/${id}`)}
              className="mt-4"
            >
              View Auction
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const deadline = auction.transportChoiceDeadline
    ? new Date(auction.transportChoiceDeadline)
    : null;
  const daysLeft = deadline
    ? Math.ceil((deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : 0;

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <button
        onClick={() => navigate(`/auctions/${id}`)}
        className="mb-4 text-primary-green hover:underline"
      >
        ← Back to Auction
      </button>

      {/* Success Banner */}
      <div className="bg-green-50 border-l-4 border-green-500 p-6 mb-6 rounded-lg">
        <h2 className="text-2xl font-bold text-green-800 mb-2">
          🎉 Congratulations! You Won!
        </h2>
        <p className="text-green-700">
          You won this auction with a bid of{" "}
          <span className="font-bold">
            ${parseFloat(auction.finalPrice).toLocaleString()}
          </span>
          . Your funds are held securely in escrow.
        </p>
      </div>

      {/* Deadline Warning */}
      {daysLeft > 0 && daysLeft <= 7 && (
        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-6 rounded-lg">
          <p className="text-yellow-800">
            ⏰{" "}
            <strong>
              {daysLeft} day{daysLeft !== 1 ? "s" : ""} remaining
            </strong>{" "}
            to choose your transport option. Your funds will be returned with an
            8% penalty if you don't complete this step.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Summary */}
        <div className="lg:col-span-1">
          <Card>
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              Order Summary
            </h3>

            {/* Listing Details */}
            <div className="mb-4">
              <div className="h-32 bg-gradient-to-br from-primary-green to-secondary-green rounded-lg mb-3 flex items-center justify-center">
                <span className="text-white text-5xl">
                  {listing?.cropType?.charAt(0) || "🌾"}
                </span>
              </div>
              <h4 className="font-bold text-gray-800">{listing?.cropType}</h4>
              <p className="text-sm text-gray-600">📍 {listing?.location}</p>
            </div>

            {/* Price Breakdown */}
            <div className="space-y-2 border-t pt-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Quantity:</span>
                <span className="font-semibold">
                  {listing?.quantity} {listing?.unit}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Your Winning Bid:</span>
                <span className="font-semibold text-primary-green">
                  ${parseFloat(auction.finalPrice).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Escrow Status:</span>
                <span className="text-green-600 font-semibold">✓ Held</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Transport Selection Form */}
        <div className="lg:col-span-2">
          <Card>
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              Choose Transport Option
            </h3>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Transport Type Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  How would you like to receive your order?
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setUsesTransport(false)}
                    className={`p-4 border-2 rounded-lg transition-all ${
                      !usesTransport
                        ? "border-primary-green bg-light-green"
                        : "border-gray-300 hover:border-primary-green"
                    }`}
                  >
                    <div className="text-3xl mb-2">🚗</div>
                    <div className="font-semibold">Self Pickup</div>
                    <div className="text-xs text-gray-600 mt-1">
                      Collect from farmer
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setUsesTransport(true)}
                    className={`p-4 border-2 rounded-lg transition-all ${
                      usesTransport
                        ? "border-primary-green bg-light-green"
                        : "border-gray-300 hover:border-primary-green"
                    }`}
                  >
                    <div className="text-3xl mb-2">🚚</div>
                    <div className="font-semibold">Delivery</div>
                    <div className="text-xs text-gray-600 mt-1">
                      We'll arrange transport
                    </div>
                  </button>
                </div>
              </div>

              {/* Delivery Location */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {usesTransport ? "Delivery Address" : "Pickup Location"} *
                </label>
                <input
                  type="text"
                  name="deliveryLocation"
                  value={formData.deliveryLocation}
                  onChange={handleChange}
                  placeholder={
                    usesTransport
                      ? "Enter full delivery address"
                      : "Enter where you'll collect"
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-transparent"
                  required
                />
              </div>

              {/* Transport Info (if delivery selected) */}
              {usesTransport && (
                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                  <h4 className="font-bold text-blue-800 mb-2">
                    Transport Matching
                  </h4>
                  <p className="text-sm text-blue-700 mb-3">
                    After submitting, we'll match you with the best transporter
                    based on location, price, and ratings.
                  </p>
                  <p className="text-xs text-blue-600">
                    Transport costs will be added to your escrow when a
                    transporter is assigned.
                  </p>
                </div>
              )}

              {/* Notes */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Special Instructions (Optional)
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder="Any special delivery instructions..."
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-transparent"
                />
              </div>

              {/* Info Box */}
              <div className="bg-light-green p-4 rounded-lg">
                <h4 className="font-bold text-primary-green mb-2">
                  What happens next?
                </h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>✓ Order will be created with status "Paid"</li>
                  <li>
                    ✓ Your ${parseFloat(auction.finalPrice).toLocaleString()}{" "}
                    stays in escrow
                  </li>
                  {usesTransport && (
                    <li>✓ We'll match you with a transporter</li>
                  )}
                  <li>✓ Farmer prepares your order</li>
                  <li>✓ You receive and confirm delivery</li>
                  <li>
                    ✓ Funds are released to farmer (you keep nothing to pay)
                  </li>
                </ul>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={submitting}
                className="w-full bg-accent-gold hover:bg-yellow-500 text-dark-green font-bold text-lg py-4"
              >
                {submitting ? "Creating Order..." : "✓ Confirm & Create Order"}
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AuctionCheckout;
