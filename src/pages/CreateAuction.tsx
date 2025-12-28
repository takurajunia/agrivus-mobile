import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createAuction } from "../services/auctionsService";
import { listingsService } from "../services/listingsService";
import { Card, Button, Input } from "../components/common";
import { useAuth } from "../contexts/AuthContext";
import { singularizeUnit } from "../utils/textUtils";

const CreateAuction: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    listingId: "",
    startingPrice: "",
    reservePrice: "",
    bidIncrement: "25",
    durationHours: "24",
    autoExtend: true,
  });

  useEffect(() => {
    fetchMyListings();
  }, []);

  const fetchMyListings = async () => {
    try {
      setLoading(true);
      const response = await listingsService.getMyListings();
      // Filter only active listings not in auction
      const activeListings = (response.data || []).filter(
        (l: any) => l.status === "active" && !l.isAuction
      );
      setListings(activeListings);
    } catch (err: any) {
      setError("Failed to fetch your listings");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.listingId) {
      setError("Please select a listing");
      return;
    }

    if (parseFloat(formData.startingPrice) <= 0) {
      setError("Starting price must be greater than 0");
      return;
    }

    if (
      formData.reservePrice &&
      parseFloat(formData.reservePrice) < parseFloat(formData.startingPrice)
    ) {
      setError("Reserve price must be greater than or equal to starting price");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      await createAuction({
        listingId: formData.listingId,
        startingPrice: parseFloat(formData.startingPrice),
        reservePrice: formData.reservePrice
          ? parseFloat(formData.reservePrice)
          : undefined,
        bidIncrement: parseFloat(formData.bidIncrement),
        durationHours: parseFloat(formData.durationHours),
        autoExtend: formData.autoExtend,
      });

      alert("Auction created successfully! 🎉");
      navigate("/auctions");
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to create auction");
    } finally {
      setSubmitting(false);
    }
  };

  if (user?.role !== "farmer") {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Access Denied
            </h2>
            <p className="text-gray-600">Only farmers can create auctions</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <button
        onClick={() => navigate("/auctions")}
        className="mb-4 text-primary-green hover:underline"
      >
        ← Back to Auctions
      </button>

      <Card>
        <h1 className="text-3xl font-bold text-primary-green mb-6">
          Create Auction
        </h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-8">Loading your listings...</div>
        ) : listings.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600 mb-4">
              You need an active listing to create an auction
            </p>
            <Button onClick={() => navigate("/listings/create")}>
              Create Listing First
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Select Listing */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Select Listing *
              </label>
              <select
                name="listingId"
                value={formData.listingId}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-transparent"
                required
              >
                <option value="">Choose a listing...</option>
                {listings.map((listing) => (
                  <option key={listing.id} value={listing.id}>
                    {listing.cropType} - {listing.quantity} {listing.unit} - $
                    {listing.pricePerUnit}/{singularizeUnit(listing.unit)}
                  </option>
                ))}
              </select>
            </div>

            {/* Starting Price */}
            <Input
              label="Starting Price (USD) *"
              type="number"
              name="startingPrice"
              value={formData.startingPrice}
              onChange={handleChange}
              placeholder="500.00"
              step="0.01"
              required
            />

            {/* Reserve Price */}
            <Input
              label="Reserve Price (USD) - Optional"
              type="number"
              name="reservePrice"
              value={formData.reservePrice}
              onChange={handleChange}
              placeholder="800.00"
              step="0.01"
              helpText="Minimum acceptable price. Auction won't sell below this."
            />

            {/* Bid Increment */}
            <Input
              label="Bid Increment (USD) *"
              type="number"
              name="bidIncrement"
              value={formData.bidIncrement}
              onChange={handleChange}
              placeholder="25.00"
              step="0.01"
              required
              helpText="Minimum amount each bid must increase by"
            />

            {/* Duration */}
            <Input
              label="Auction Duration (Hours) *"
              type="number"
              name="durationHours"
              value={formData.durationHours}
              onChange={handleChange}
              placeholder="24"
              min="1"
              required
              helpText="How long the auction will run"
            />

            {/* Auto Extend */}
            <div className="flex items-center">
              <input
                type="checkbox"
                name="autoExtend"
                checked={formData.autoExtend}
                onChange={handleChange}
                className="w-4 h-4 text-primary-green border-gray-300 rounded focus:ring-primary-green"
              />
              <label className="ml-2 text-sm text-gray-700">
                Auto-extend auction if bid placed in last minute (extends by 5
                minutes)
              </label>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
              <h3 className="font-bold text-blue-800 mb-2">
                How Auctions Work:
              </h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Buyers place bids on your listing</li>
                <li>
                  • When auction ends, highest bidder wins (if reserve met)
                </li>
                <li>• Winner's funds are held in escrow immediately</li>
                <li>• Winner chooses transport within 7 days</li>
                <li>• Order is created and proceeds like normal</li>
              </ul>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={submitting}
              className="w-full bg-accent-gold hover:bg-yellow-500 text-dark-green font-bold py-3"
            >
              {submitting ? "Creating Auction..." : "🔨 Create Auction"}
            </Button>
          </form>
        )}
      </Card>
    </div>
  );
};

export default CreateAuction;
