import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getLiveAuctions } from "../services/auctionsService";
import { Card, LoadingSpinner } from "../components/common";

const Auctions: React.FC = () => {
  const [auctions, setAuctions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchAuctions();
  }, []);

  const fetchAuctions = async () => {
    try {
      setLoading(true);
      const response = await getLiveAuctions();
      setAuctions(response.data.auctions);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch auctions");
    } finally {
      setLoading(false);
    }
  };

  const getTimeRemaining = (endTime: string) => {
    const end = new Date(endTime).getTime();
    const now = new Date().getTime();
    const diff = end - now;

    if (diff <= 0) return "Ended";

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) return `${hours}h ${minutes}m left`;
    return `${minutes}m left`;
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-primary-green">
          🔥 Live Auctions
        </h1>
        <Link
          to="/auctions/create"
          className="bg-primary-green text-white px-6 py-2 rounded-lg hover:bg-secondary-green transition-colors"
        >
          Create Auction
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      {auctions.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              No live auctions at the moment
            </p>
            <Link
              to="/marketplace"
              className="text-primary-green hover:underline mt-2 inline-block"
            >
              Browse regular listings →
            </Link>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {auctions.map((item) => (
            <Card
              key={item.auction.id}
              className="hover:shadow-xl transition-shadow"
            >
              <div className="relative">
                {/* Auction Badge */}
                <div className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold animate-pulse">
                  LIVE
                </div>

                {/* Listing Image */}
                <div className="h-48 bg-gradient-to-br from-primary-green to-secondary-green rounded-lg mb-4 flex items-center justify-center">
                  <span className="text-white text-6xl">
                    {item.listing?.cropType?.charAt(0) || "🌾"}
                  </span>
                </div>

                {/* Auction Info */}
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  {item.listing?.cropType || "Crop"}
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                  📍 {item.listing?.location || "Location"}
                </p>

                {/* Price Info */}
                <div className="bg-light-green p-3 rounded-lg mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">Current Bid:</span>
                    <span className="text-xl font-bold text-primary-green">
                      ${parseFloat(item.auction.currentPrice).toLocaleString()}
                    </span>
                  </div>
                  {item.auction.reservePrice && (
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Reserve:</span>
                      <span className="text-gray-800">
                        $
                        {parseFloat(item.auction.reservePrice).toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>

                {/* Stats */}
                <div className="flex justify-between text-sm mb-4">
                  <span className="text-gray-600">
                    🏷️ {item.bidCount || 0} bids
                  </span>
                  <span className="text-red-600 font-semibold">
                    ⏰ {getTimeRemaining(item.auction.endTime)}
                  </span>
                </div>

                {/* Action Button */}
                <Link
                  to={`/auctions/${item.auction.id}`}
                  className="block w-full bg-accent-gold text-dark-green text-center py-3 rounded-lg font-bold hover:bg-yellow-500 transition-colors"
                >
                  View & Bid
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Auctions;
