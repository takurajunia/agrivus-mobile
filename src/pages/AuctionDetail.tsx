import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getAuctionDetails, placeBid } from "../services/auctionsService";
import { safeDisplayText } from "../utils/textUtils";
import { Card, LoadingSpinner, Button } from "../components/common";
import { useAuth } from "../contexts/AuthContext";

const AuctionDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [auction, setAuction] = useState<any>(null);
  const [listing, setListing] = useState<any>(null);
  const [farmer, setFarmer] = useState<any>(null);
  const [bids, setBids] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [bidAmount, setBidAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    if (id) {
      fetchAuctionDetails();
    }
  }, [id]);

  useEffect(() => {
    if (auction) {
      const interval = setInterval(() => {
        updateTimeLeft();
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [auction]);

  const fetchAuctionDetails = async () => {
    try {
      setLoading(true);
      const response = await getAuctionDetails(id!);
      setAuction(response.data.auction);
      setListing(response.data.listing);
      setFarmer(response.data.farmer);
      setBids(response.data.bids);

      // Set suggested bid amount
      const currentPrice = parseFloat(response.data.auction.currentPrice);
      const bidIncrement = parseFloat(response.data.auction.bidIncrement);
      setBidAmount((currentPrice + bidIncrement).toFixed(2));
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Failed to fetch auction details"
      );
    } finally {
      setLoading(false);
    }
  };

  const updateTimeLeft = () => {
    if (!auction) return;

    const end = new Date(auction.endTime).getTime();
    const now = new Date().getTime();
    const diff = end - now;

    if (diff <= 0) {
      setTimeLeft("Auction Ended");
      return;
    }

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
  };

  const handlePlaceBid = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user || user.role !== "buyer") {
      setError("Only buyers can place bids");
      return;
    }

    const bidAmountNum = parseFloat(bidAmount);
    const minBid =
      parseFloat(auction.currentPrice) + parseFloat(auction.bidIncrement);

    if (bidAmountNum < minBid) {
      setError(`Minimum bid is $${minBid.toFixed(2)}`);
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      await placeBid(id!, { bidAmount: bidAmountNum });

      // Refresh auction details
      await fetchAuctionDetails();

      // Show success message
      alert("Bid placed successfully! 🎉");
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to place bid");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!auction) return <div>Auction not found</div>;

  const isWinner = auction.winnerId === user?.id;
  const isFarmer = auction.farmerId === user?.id;
  const canBid =
    user?.role === "buyer" && auction.status === "live" && !isFarmer;
  const reserveMet = auction.reservePrice
    ? parseFloat(auction.currentPrice) >= parseFloat(auction.reservePrice)
    : true;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back Button */}
      <button
        onClick={() => navigate("/auctions")}
        className="mb-4 text-primary-green hover:underline"
      >
        ← Back to Auctions
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <Card>
            {/* Status Badge */}
            <div className="flex gap-2 mb-4">
              {auction.status === "live" && (
                <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold animate-pulse">
                  🔴 LIVE
                </span>
              )}
              {auction.status === "awaiting_transport" && isWinner && (
                <span className="bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                  ⏰ Choose Transport
                </span>
              )}
              {auction.status === "completed" && (
                <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                  ✅ Completed
                </span>
              )}
              {reserveMet && auction.status === "live" && (
                <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm">
                  ✓ Reserve Met
                </span>
              )}
            </div>

            {/* Listing Info */}
            <div className="h-64 bg-gradient-to-br from-primary-green to-secondary-green rounded-lg mb-6 flex items-center justify-center">
              <span className="text-white text-9xl">
                {listing?.cropType?.charAt(0) || "🌾"}
              </span>
            </div>

            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              {listing?.cropType || "Crop Auction"}
            </h1>
            <p className="text-gray-600 mb-4">
              📍 {listing?.location || "Location"} • 👨‍🌾 {farmer?.fullName}
            </p>
            <p className="text-gray-700 mb-6">
              {safeDisplayText(listing?.description)}
            </p>

            {/* Listing Details */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-light-green p-4 rounded-lg">
                <span className="text-sm text-gray-600">Quantity</span>
                <p className="text-xl font-bold text-primary-green">
                  {listing?.quantity} {listing?.unit}
                </p>
              </div>
              <div className="bg-light-green p-4 rounded-lg">
                <span className="text-sm text-gray-600">Harvest Date</span>
                <p className="text-xl font-bold text-primary-green">
                  {listing?.harvestDate}
                </p>
              </div>
            </div>

            {/* Winner Message */}
            {isWinner && auction.status === "awaiting_transport" && (
              <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-6">
                <h3 className="font-bold text-yellow-800 mb-2">
                  🎉 Congratulations! You Won!
                </h3>
                <p className="text-yellow-700 mb-4">
                  You won this auction with a bid of $
                  {parseFloat(auction.finalPrice).toLocaleString()}. Please
                  choose your transport option within 7 days.
                </p>
                <Button
                  onClick={() => navigate(`/auctions/${id}/checkout`)}
                  className="bg-yellow-500 hover:bg-yellow-600"
                >
                  Choose Transport Now →
                </Button>
              </div>
            )}

            {/* Bid History */}
            <div className="mt-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Bid History ({bids.length})
              </h2>

              {bids.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  No bids yet. Be the first to bid!
                </p>
              ) : (
                <div className="space-y-2">
                  {bids.map((bid: any, index: number) => (
                    <div
                      key={bid.bid.id}
                      className={`flex justify-between items-center p-4 rounded-lg ${
                        index === 0
                          ? "bg-green-50 border-2 border-green-500"
                          : "bg-gray-50"
                      }`}
                    >
                      <div>
                        <span className="font-semibold">
                          {bid.bidder?.fullName || "Anonymous"}
                        </span>
                        {index === 0 && (
                          <span className="ml-2 text-xs bg-green-500 text-white px-2 py-1 rounded">
                            Leading
                          </span>
                        )}
                        {bid.bid.status === "won" && (
                          <span className="ml-2 text-xs bg-yellow-500 text-white px-2 py-1 rounded">
                            Winner
                          </span>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-primary-green">
                          ${parseFloat(bid.bid.bidAmount).toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(bid.bid.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Sidebar - Bidding Panel */}
        <div className="lg:col-span-1">
          <Card className="sticky top-24">
            {/* Timer */}
            <div className="bg-dark-green text-white p-4 rounded-lg mb-4 text-center">
              <p className="text-sm mb-1">Time Remaining</p>
              <p className="text-2xl font-bold">{timeLeft}</p>
            </div>

            {/* Current Price */}
            <div className="mb-6">
              <p className="text-sm text-gray-600 mb-1">Current Bid</p>
              <p className="text-4xl font-bold text-primary-green mb-2">
                ${parseFloat(auction.currentPrice).toLocaleString()}
              </p>
              <p className="text-sm text-gray-600">
                Starting price: $
                {parseFloat(auction.startingPrice).toLocaleString()}
              </p>
              {auction.reservePrice && (
                <p className="text-sm text-gray-600">
                  Reserve: ${parseFloat(auction.reservePrice).toLocaleString()}
                  {reserveMet ? " ✓" : ""}
                </p>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-light-green p-3 rounded-lg text-center">
                <p className="text-2xl font-bold text-primary-green">
                  {auction.totalBids}
                </p>
                <p className="text-xs text-gray-600">Total Bids</p>
              </div>
              <div className="bg-light-green p-3 rounded-lg text-center">
                <p className="text-2xl font-bold text-primary-green">
                  ${parseFloat(auction.bidIncrement).toFixed(0)}
                </p>
                <p className="text-xs text-gray-600">Bid Increment</p>
              </div>
            </div>

            {/* Bidding Form */}
            {canBid ? (
              <form onSubmit={handlePlaceBid} className="space-y-4">
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-600 px-3 py-2 rounded text-sm">
                    {error}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Your Bid Amount (USD)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={bidAmount}
                    onChange={(e) => setBidAmount(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-transparent text-xl font-bold"
                    placeholder="Enter bid amount"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Minimum bid: $
                    {(
                      parseFloat(auction.currentPrice) +
                      parseFloat(auction.bidIncrement)
                    ).toFixed(2)}
                  </p>
                </div>

                <Button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-accent-gold hover:bg-yellow-500 text-dark-green font-bold text-lg py-4"
                >
                  {submitting ? "Placing Bid..." : "🔨 Place Bid"}
                </Button>

                <p className="text-xs text-gray-500 text-center">
                  Your wallet balance will be checked before bidding
                </p>
              </form>
            ) : (
              <div className="text-center">
                {!user && (
                  <div>
                    <p className="text-gray-600 mb-4">Login to place a bid</p>
                    <Button
                      onClick={() => navigate("/login")}
                      className="w-full"
                    >
                      Login to Bid
                    </Button>
                  </div>
                )}
                {user?.role !== "buyer" && (
                  <p className="text-gray-600">Only buyers can place bids</p>
                )}
                {isFarmer && (
                  <p className="text-gray-600">
                    You cannot bid on your own auction
                  </p>
                )}
                {auction.status !== "live" && (
                  <p className="text-gray-600">This auction has ended</p>
                )}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AuctionDetail;
