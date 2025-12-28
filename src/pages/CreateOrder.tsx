import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Button, Input, Card, LoadingSpinner } from "../components/common";
import { listingsService } from "../services/listingsService";
import { ordersService } from "../services/ordersService";
import type { Listing } from "../types";

const CreateOrder: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const listingId = searchParams.get("listingId");

  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    quantity: "",
    deliveryLocation: "",
    notes: "",
    transportOption: "platform", // 'platform' or 'self_pickup'
  });

  useEffect(() => {
    if (listingId) {
      fetchListing();
    } else {
      setError("No listing specified");
      setLoading(false);
    }
  }, [listingId]);

  const fetchListing = async () => {
    try {
      setLoading(true);
      const response = await listingsService.getListingById(listingId!);

      if (response.success && response.data) {
        setListing(response.data.listing);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load listing");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const calculateTotal = () => {
    if (!listing || !formData.quantity) return 0;
    const quantity = parseFloat(formData.quantity);
    const pricePerUnit = parseFloat(listing.pricePerUnit);
    return (quantity * pricePerUnit).toFixed(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!listing) {
      setError("Listing not found");
      return;
    }

    const quantity = parseFloat(formData.quantity);
    const availableQuantity = parseFloat(listing.quantity);

    if (quantity <= 0) {
      setError("Quantity must be greater than 0");
      return;
    }

    if (quantity > availableQuantity) {
      setError(
        `Maximum available quantity is ${availableQuantity} ${listing.unit}`
      );
      return;
    }

    setSubmitting(true);

    try {
      const orderData = {
        listingId: listingId!,
        quantity: formData.quantity,
        deliveryLocation:
          formData.transportOption === "platform"
            ? formData.deliveryLocation
            : listing?.location || "Self Pickup", // Use listing location for self pickup
        notes: formData.notes || undefined,
        usesTransport: formData.transportOption === "platform",
      };

      const response = await ordersService.createOrder(orderData);

      if (response.success) {
        navigate("/orders");
      }
    } catch (err: any) {
      setError(err.message || "Failed to create order");
    } finally {
      setSubmitting(false);
    }
  };

  // Redirect if not a buyer
  if (user?.role !== "buyer") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <Card className="p-8 text-center max-w-md">
          <h2 className="text-2xl font-bold text-warning mb-4">
            Access Denied
          </h2>
          <p className="text-gray-600 mb-6">Only buyers can place orders.</p>
          <Button variant="primary" onClick={() => navigate("/marketplace")}>
            Go to Marketplace
          </Button>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error && !listing) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <Card className="p-8 text-center max-w-md">
          <h2 className="text-2xl font-bold text-warning mb-4">Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button variant="primary" onClick={() => navigate("/marketplace")}>
            Go to Marketplace
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-primary-green font-serif mb-2">
            Place Order
          </h1>
          <p className="text-gray-600">
            Review product details and complete your order
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Form */}
          <div className="lg:col-span-2">
            <Card className="p-8">
              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded mb-6">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Quantity */}
                <div>
                  <Input
                    label={`Quantity (${listing?.unit}) *`}
                    type="number"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleChange}
                    placeholder="10"
                    min="0.01"
                    step="0.01"
                    max={listing?.quantity}
                    required
                  />
                  <p className="text-sm text-gray-600 mt-1">
                    Available: {listing?.quantity} {listing?.unit}
                  </p>
                </div>

                {/* Transport Option */}
                <div>
                  <label className="block mb-3 font-semibold text-dark-green">
                    Delivery Option *
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Platform Transport */}
                    <label
                      className={`relative flex flex-col p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        formData.transportOption === "platform"
                          ? "border-primary-green bg-green-50"
                          : "border-gray-300 hover:border-gray-400"
                      }`}
                    >
                      <input
                        type="radio"
                        name="transportOption"
                        value="platform"
                        checked={formData.transportOption === "platform"}
                        onChange={handleChange}
                        className="sr-only"
                      />
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl">🚚</span>
                        <span className="font-semibold text-gray-900">
                          Platform Delivery
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        We'll match you with verified transporters. Fee
                        calculated based on distance.
                      </p>
                      {formData.transportOption === "platform" && (
                        <div className="absolute top-2 right-2">
                          <span className="text-primary-green text-xl">✓</span>
                        </div>
                      )}
                    </label>

                    {/* Self Pickup */}
                    <label
                      className={`relative flex flex-col p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        formData.transportOption === "self_pickup"
                          ? "border-primary-green bg-green-50"
                          : "border-gray-300 hover:border-gray-400"
                      }`}
                    >
                      <input
                        type="radio"
                        name="transportOption"
                        value="self_pickup"
                        checked={formData.transportOption === "self_pickup"}
                        onChange={handleChange}
                        className="sr-only"
                      />
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl">📍</span>
                        <span className="font-semibold text-gray-900">
                          Self Pickup
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        Collect from farm at:{" "}
                        <strong>{listing?.location}</strong>
                      </p>
                      {formData.transportOption === "self_pickup" && (
                        <div className="absolute top-2 right-2">
                          <span className="text-primary-green text-xl">✓</span>
                        </div>
                      )}
                    </label>
                  </div>
                </div>

                {/* Delivery Location - only shown for platform transport */}
                {formData.transportOption === "platform" && (
                  <div>
                    <label className="block mb-2 font-semibold text-dark-green">
                      Delivery Location *
                    </label>
                    <select
                      name="deliveryLocation"
                      value={formData.deliveryLocation}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          deliveryLocation: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded transition-all duration-300 focus:border-primary-green focus:ring-2 focus:ring-primary-green focus:ring-opacity-20 focus:outline-none"
                      required={formData.transportOption === "platform"}
                    >
                      <option value="">Select delivery location</option>
                      <option value="Harare CBD">Harare CBD</option>
                      <option value="Bulawayo">Bulawayo</option>
                      <option value="Mutare">Mutare</option>
                      <option value="Masvingo">Masvingo</option>
                      <option value="Gweru">Gweru</option>
                      <option value="Chitungwiza">Chitungwiza</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                )}

                {/* Self Pickup Info */}
                {formData.transportOption === "self_pickup" && (
                  <div className="bg-amber-50 border border-amber-200 rounded p-4">
                    <h4 className="font-semibold text-amber-900 mb-2">
                      📍 Pickup Location
                    </h4>
                    <p className="text-amber-800">
                      <strong>{listing?.location}</strong>
                    </p>
                    <p className="text-sm text-amber-700 mt-2">
                      You'll need to arrange your own transport to collect the
                      goods from this location. Contact details will be provided
                      after payment.
                    </p>
                  </div>
                )}

                {/* Notes */}
                <div>
                  <label className="block mb-2 font-semibold text-dark-green">
                    Additional Notes
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    placeholder="e.g., Delivery needed by Friday. Please contact before delivery."
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded transition-all duration-300 focus:border-primary-green focus:ring-2 focus:ring-primary-green focus:ring-opacity-20 focus:outline-none"
                  />
                </div>

                {/* Important Notice */}
                <div className="bg-blue-50 border border-blue-200 rounded p-4">
                  <h4 className="font-semibold text-blue-900 mb-2">
                    📋 Order Process:
                  </h4>
                  <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                    <li>Your order will be created with "pending" status</li>
                    <li>Payment will be held in secure escrow</li>
                    <li>Farmer will assign a transporter using AI matching</li>
                    <li>You'll receive delivery notifications</li>
                    <li>Confirm delivery to release payment</li>
                  </ol>
                </div>

                {/* Submit Buttons */}
                <div className="flex gap-4 pt-4">
                  <Button
                    type="submit"
                    variant="success"
                    className="flex-1"
                    isLoading={submitting}
                    disabled={submitting}
                  >
                    {submitting ? "Placing Order..." : "Place Order"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => navigate(`/listings/${listingId}`)}
                    disabled={submitting}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-24">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Order Summary
              </h3>

              {/* Product Info */}
              <div className="mb-6 pb-6 border-b">
                <h4 className="font-semibold text-gray-900 mb-2">
                  {listing?.cropType}
                </h4>
                <p className="text-sm text-gray-600 mb-1">
                  Price: ${parseFloat(listing?.pricePerUnit || "0").toFixed(2)}/
                  {listing?.unit}
                </p>
                <p className="text-sm text-gray-600">
                  Location: {listing?.location}
                </p>
              </div>

              {/* Calculation */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Quantity:</span>
                  <span className="font-semibold">
                    {formData.quantity || "0"} {listing?.unit}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">
                    Price per {listing?.unit}:
                  </span>
                  <span className="font-semibold">
                    ${parseFloat(listing?.pricePerUnit || "0").toFixed(2)}
                  </span>
                </div>
                <div className="pt-3 border-t">
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-900">Total:</span>
                    <span className="text-2xl font-bold text-primary-green">
                      ${calculateTotal()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Payment Info */}
              <div className="bg-gray-50 rounded p-4 text-sm text-gray-700">
                <p className="font-semibold mb-2">💳 Payment Methods:</p>
                <ul className="space-y-1 text-xs">
                  <li>✓ EcoCash</li>
                  <li>✓ ZIPIT</li>
                  <li>✓ USD Wallet</li>
                  <li>✓ Bank Transfer</li>
                </ul>
                <p className="mt-3 text-xs text-gray-600">
                  Payment will be held securely until delivery confirmation.
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateOrder;
