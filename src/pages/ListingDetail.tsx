import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Button, Card, LoadingSpinner } from "../components/common";
import { listingsService } from "../services/listingsService";
import chatService from "../services/chatService";
import type { Listing } from "../types";
import { safeDisplayText, singularizeUnit } from "../utils/textUtils";

const ListingDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [listing, setListing] = useState<Listing | null>(null);
  const [farmer, setFarmer] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showQuantityModal, setShowQuantityModal] = useState(false);
  const [newQuantity, setNewQuantity] = useState("");
  const [quantityReason, setQuantityReason] = useState("");
  const [updatingQuantity, setUpdatingQuantity] = useState(false);
  const [showPriceModal, setShowPriceModal] = useState(false);
  const [newPrice, setNewPrice] = useState("");
  const [priceReason, setPriceReason] = useState("");
  const [updatingPrice, setUpdatingPrice] = useState(false);
  const [startingChat, setStartingChat] = useState(false);

  useEffect(() => {
    if (id) {
      fetchListing();
    }
  }, [id]);

  const fetchListing = async () => {
    try {
      setLoading(true);
      const response = await listingsService.getListingById(id!);

      if (response.success && response.data) {
        setListing(response.data.listing);
        setFarmer(response.data.farmer);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load listing");
    } finally {
      setLoading(false);
    }
  };

  const handleOrderClick = () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    if (user?.role !== "buyer") {
      alert("Only buyers can place orders");
      return;
    }

    navigate(`/orders/create?listingId=${id}`);
  };

  const handleUpdateQuantity = async () => {
    if (!newQuantity || isNaN(parseFloat(newQuantity))) {
      alert("Please enter a valid quantity");
      return;
    }

    const qty = parseFloat(newQuantity);
    if (qty < 0) {
      alert("Quantity cannot be negative");
      return;
    }

    try {
      setUpdatingQuantity(true);
      const response = await listingsService.updateListingQuantity(
        id!,
        qty,
        quantityReason
      );

      if (response.success && response.data) {
        alert("Quantity updated successfully!");
        setListing(response.data);
        setShowQuantityModal(false);
        setNewQuantity("");
        setQuantityReason("");
      }
    } catch (err: any) {
      alert(err.message || "Failed to update quantity");
    } finally {
      setUpdatingQuantity(false);
    }
  };

  const handleUpdatePrice = async () => {
    if (!newPrice || isNaN(parseFloat(newPrice))) {
      alert("Please enter a valid price");
      return;
    }

    const price = parseFloat(newPrice);
    if (price <= 0) {
      alert("Price must be greater than zero");
      return;
    }

    try {
      setUpdatingPrice(true);
      const response = await listingsService.updateListing(id!, {
        pricePerUnit: price.toString(),
      });

      if (response.success && response.data) {
        alert("Price updated successfully!");
        setListing(response.data);
        setShowPriceModal(false);
        setNewPrice("");
        setPriceReason("");
      }
    } catch (err: any) {
      alert(err.message || "Failed to update price");
    } finally {
      setUpdatingPrice(false);
    }
  };

  const handleContactFarmer = async () => {
    if (!listing) return;

    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    setStartingChat(true);
    try {
      const response = await chatService.getOrCreateConversation(
        listing.farmerId
      );
      if (response.success) {
        navigate("/chat", { state: { conversationId: response.data.id } });
      }
    } catch (error) {
      console.error("Failed to start chat:", error);
      alert("Failed to start conversation. Please try again.");
    } finally {
      setStartingChat(false);
    }
  };

  const isFarmer = user?.id === listing?.farmerId;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <Card className="p-8 text-center max-w-md">
          <h2 className="text-2xl font-bold text-warning mb-4">
            Listing Not Found
          </h2>
          <p className="text-gray-600 mb-6">
            {error || "This listing does not exist or has been removed."}
          </p>
          <Link to="/marketplace">
            <Button variant="primary">Back to Marketplace</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Breadcrumb */}
        <div className="mb-6 text-sm text-gray-600">
          <Link to="/" className="hover:text-primary-green">
            Home
          </Link>
          <span className="mx-2">/</span>
          <Link to="/marketplace" className="hover:text-primary-green">
            Marketplace
          </Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">{listing.cropType}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Card className="overflow-hidden">
              {/* Image Gallery */}
              <div className="h-96 bg-gradient-to-br from-primary-green to-medium-green flex items-center justify-center">
                {listing.images && listing.images.length > 0 ? (
                  <img
                    src={listing.images[0]}
                    alt={listing.cropType}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <svg
                    className="w-32 h-32 text-white opacity-50"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                )}
              </div>

              {/* Details */}
              <div className="p-8">
                <h1 className="text-4xl font-bold text-primary-green mb-4 font-serif">
                  {listing.cropType}
                  {listing.cropName && (
                    <span className="text-2xl font-normal text-gray-600 ml-3">
                      ({safeDisplayText(listing.cropName)})
                    </span>
                  )}
                </h1>

                {/* Price */}
                <div className="mb-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="text-4xl font-bold text-primary-green">
                      ${parseFloat(listing.pricePerUnit).toFixed(2)}
                      <span className="text-xl text-gray-600 font-normal">
                        /{singularizeUnit(listing.unit)}
                      </span>
                    </div>
                    {isFarmer && (
                      <button
                        onClick={() => {
                          setNewPrice(listing.pricePerUnit);
                          setShowPriceModal(true);
                        }}
                        className="text-sm text-primary-green hover:text-primary-green/80 font-semibold underline"
                      >
                        Update Price
                      </button>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="text-gray-600">
                      {parseFloat(listing.quantity).toFixed(2)} {listing.unit}{" "}
                      available
                    </p>
                    {isFarmer && (
                      <button
                        onClick={() => {
                          setNewQuantity(listing.quantity);
                          setShowQuantityModal(true);
                        }}
                        className="text-sm text-primary-green hover:text-primary-green/80 font-semibold underline"
                      >
                        Update Quantity
                      </button>
                    )}
                  </div>
                </div>

                {/* Quality Certifications */}
                {listing.qualityCertifications &&
                  listing.qualityCertifications.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">
                        Quality Certifications
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {listing.qualityCertifications.map((cert, index) => (
                          <span
                            key={index}
                            className="px-4 py-2 bg-light-green text-primary-green rounded-full font-semibold"
                          >
                            ✓ {cert}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                {/* Description */}
                {listing.description && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      Description
                    </h3>
                    <p className="text-gray-700 leading-relaxed">
                      {safeDisplayText(listing.description)}
                    </p>
                  </div>
                )}

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="p-4 bg-gray-50 rounded">
                    <p className="text-sm text-gray-600 mb-1">Location</p>
                    <p className="font-semibold text-gray-900">
                      {listing.location}
                    </p>
                  </div>
                  {listing.harvestDate && (
                    <div className="p-4 bg-gray-50 rounded">
                      <p className="text-sm text-gray-600 mb-1">Harvest Date</p>
                      <p className="font-semibold text-gray-900">
                        {listing.harvestDate}
                      </p>
                    </div>
                  )}
                  <div className="p-4 bg-gray-50 rounded">
                    <p className="text-sm text-gray-600 mb-1">Unit</p>
                    <p className="font-semibold text-gray-900">
                      {listing.unit}
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded">
                    <p className="text-sm text-gray-600 mb-1">Status</p>
                    <p className="font-semibold text-success capitalize">
                      {listing.status}
                    </p>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex gap-6 text-sm text-gray-600 pt-6 border-t">
                  <span>👁 {listing.viewCount} views</span>
                  <span>💬 {listing.inquiryCount} inquiries</span>
                  <span>
                    📅 Listed {new Date(listing.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Farmer Info */}
            <Card className="p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Seller Information
              </h3>

              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-primary-green rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  {farmer?.fullName?.charAt(0)}
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">
                    {farmer?.fullName}
                  </h4>
                  <p className="text-sm text-gray-600">Verified Farmer</p>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2 text-sm">
                  <svg
                    className="w-4 h-4 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                  </svg>
                  <span className="text-gray-700">{listing.location}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <svg
                    className="w-4 h-4 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                    />
                  </svg>
                  <span className="text-gray-700">
                    Platform Score: {farmer?.platformScore}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <svg
                    className="w-4 h-4 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                  <span className="text-gray-700">
                    {farmer?.totalTransactions} transactions
                  </span>
                </div>
              </div>

              {!isFarmer && (
                <div className="mb-4">
                  <button
                    onClick={handleContactFarmer}
                    disabled={startingChat}
                    className="w-full bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg flex items-center justify-center gap-2 disabled:bg-gray-400 transition-colors"
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
                    {startingChat ? "Starting chat..." : "Contact Farmer"}
                  </button>
                </div>
              )}
            </Card>

            {/* Order Card */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Place Order
              </h3>

              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">
                  Total Price (for 1 {listing.unit})
                </p>
                <p className="text-3xl font-bold text-primary-green">
                  ${parseFloat(listing.pricePerUnit).toFixed(2)}
                </p>
              </div>

              <Button
                variant="success"
                className="w-full mb-3"
                onClick={handleOrderClick}
              >
                Order Now
              </Button>

              {!isAuthenticated && (
                <p className="text-xs text-gray-600 text-center">
                  You need to{" "}
                  <Link
                    to="/login"
                    className="text-primary-green font-semibold"
                  >
                    login
                  </Link>{" "}
                  to place an order
                </p>
              )}

              <div className="mt-6 pt-6 border-t space-y-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <svg
                    className="w-4 h-4 text-success"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span>Secure escrow payment</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg
                    className="w-4 h-4 text-success"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span>AI-powered transport matching</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg
                    className="w-4 h-4 text-success"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span>Verified farmer</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Quantity Update Modal */}
      {showQuantityModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800">
                Update Quantity
              </h2>
              <button
                onClick={() => {
                  setShowQuantityModal(false);
                  setNewQuantity("");
                  setQuantityReason("");
                }}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  New Quantity ({listing.unit})
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={newQuantity}
                  onChange={(e) => setNewQuantity(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-transparent"
                  placeholder="Enter new quantity"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Current: {parseFloat(listing.quantity).toFixed(2)}{" "}
                  {listing.unit}
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Reason (Optional)
                </label>
                <textarea
                  value={quantityReason}
                  onChange={(e) => setQuantityReason(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-transparent"
                  placeholder="e.g., Sold 10 tons off-platform"
                  rows={3}
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded p-3">
                <p className="text-xs text-blue-800">
                  💡 Update this if you've sold some quantity outside the
                  platform or need to adjust availability.
                </p>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setShowQuantityModal(false);
                    setNewQuantity("");
                    setQuantityReason("");
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  className="flex-1"
                  onClick={handleUpdateQuantity}
                  isLoading={updatingQuantity}
                  disabled={updatingQuantity}
                >
                  Update
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Price Update Modal */}
      {showPriceModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800">Update Price</h2>
              <button
                onClick={() => {
                  setShowPriceModal(false);
                  setNewPrice("");
                  setPriceReason("");
                }}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  New Price per {listing.unit} (USD)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                    $
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-transparent"
                    placeholder="Enter new price"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Current: ${parseFloat(listing.pricePerUnit).toFixed(2)} per{" "}
                  {listing.unit}
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Reason (Optional)
                </label>
                <textarea
                  value={priceReason}
                  onChange={(e) => setPriceReason(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-transparent"
                  placeholder="e.g., Market price adjustment, seasonal change"
                  rows={3}
                />
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
                <p className="text-xs text-yellow-800">
                  💡 Adjust your price based on market conditions, quality, or
                  seasonal factors.
                </p>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setShowPriceModal(false);
                    setNewPrice("");
                    setPriceReason("");
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  className="flex-1"
                  onClick={handleUpdatePrice}
                  isLoading={updatingPrice}
                  disabled={updatingPrice}
                >
                  Update
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListingDetail;
