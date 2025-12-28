import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getMyBids } from "../services/auctionsService";
import { Card, LoadingSpinner } from "../components/common";
import { useAuth } from "../contexts/AuthContext";

const MyBids: React.FC = () => {
  const { user } = useAuth();
  const [bids, setBids] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchMyBids();
  }, []);

  const fetchMyBids = async () => {
    try {
      setLoading(true);
      const response = await getMyBids();
      setBids(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch your bids");
    } finally {
      setLoading(false);
    }
  };

  if (user?.role !== "buyer") {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Access Denied
            </h2>
            <p className="text-gray-600">Only buyers can view bids</p>
          </div>
        </Card>
      </div>
    );
  }

  if (loading) return <LoadingSpinner />;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-primary-green mb-6">
        My Bids ({bids.length})
      </h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      {bids.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg mb-4">
              You haven't placed any bids yet
            </p>
            <Link to="/auctions" className="text-primary-green hover:underline">
              Browse Live Auctions →
            </Link>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {bids.map((item) => {
            const isWinning = item.bid.status === "winning";
            const hasWon = item.bid.status === "won";
            const isOutbid = item.bid.status === "outbid";
            const auctionLive = item.auction?.status === "live";
            const awaitingTransport =
              item.auction?.status === "awaiting_transport";

            return (
              <Card
                key={item.bid.id}
                className="hover:shadow-lg transition-shadow"
              >
                <div className="flex flex-col md:flex-row gap-4">
                  {/* Listing Image */}
                  <div className="w-full md:w-32 h-32 bg-gradient-to-br from-primary-green to-secondary-green rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-4xl">
                      {item.listing?.cropType?.charAt(0) || "🌾"}
                    </span>
                  </div>

                  {/* Bid Details */}
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="text-xl font-bold text-gray-800">
                          {item.listing?.cropType || "Crop"}
                        </h3>
                        <p className="text-sm text-gray-600">
                          📍 {item.listing?.location}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        {/* Status Badges */}
                        {hasWon && (
                          <span className="bg-yellow-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                            🏆 Winner
                          </span>
                        )}
                        {isWinning && auctionLive && (
                          <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                            ✓ Leading
                          </span>
                        )}
                        {isOutbid && auctionLive && (
                          <span className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                            ✗ Outbid
                          </span>
                        )}
                        {awaitingTransport && hasWon && (
                          <span className="bg-yellow-500 text-white px-3 py-1 rounded-full text-xs font-bold animate-pulse">
                            ⏰ Choose Transport
                          </span>
                        )}
                        {item.auction?.status === "completed" && (
                          <span className="bg-gray-500 text-white px-3 py-1 rounded-full text-xs">
                            Completed
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Bid Info */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                      <div>
                        <p className="text-xs text-gray-600">Your Bid</p>
                        <p className="text-lg font-bold text-primary-green">
                          ${parseFloat(item.bid.bidAmount).toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Current Price</p>
                        <p className="text-lg font-bold text-gray-800">
                          $
                          {parseFloat(
                            item.auction?.currentPrice || "0"
                          ).toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Total Bids</p>
                        <p className="text-lg font-bold text-gray-800">
                          {item.auction?.totalBids || 0}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Bid Time</p>
                        <p className="text-sm text-gray-600">
                          {new Date(item.bid.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 mt-4">
                      <Link
                        to={`/auctions/${item.auction?.id}`}
                        className="flex-1 bg-primary-green text-white text-center py-2 rounded-lg hover:bg-secondary-green transition-colors"
                      >
                        View Auction
                      </Link>
                      {awaitingTransport && hasWon && (
                        <Link
                          to={`/auctions/${item.auction?.id}/checkout`}
                          className="flex-1 bg-accent-gold text-dark-green text-center py-2 rounded-lg hover:bg-yellow-500 transition-colors font-bold"
                        >
                          Choose Transport →
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyBids;
