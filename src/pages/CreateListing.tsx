import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import Button from "../components/common/Button";
import Input from "../components/common/Input";
import Card from "../components/common/Card";
import ImageUpload from "../components/common/ImageUpload";
import { listingsService } from "../services/listingsService";

const CreateListing: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    cropType: "",
    cropName: "",
    quantity: "",
    unit: "tons",
    pricePerUnit: "",
    location: "",
    harvestDate: "",
    description: "",
    qualityCertifications: "",
    images: [] as string[],
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleImagesUploaded = (urls: string[]) => {
    setFormData({
      ...formData,
      images: urls,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Validate images
      if (formData.images.length === 0) {
        setError("Please upload at least one product image");
        setLoading(false);
        return;
      }

      // Prepare data
      const listingData = {
        cropType: formData.cropType,
        cropName: formData.cropName || undefined,
        quantity: formData.quantity,
        unit: formData.unit,
        pricePerUnit: formData.pricePerUnit,
        location: formData.location,
        harvestDate: formData.harvestDate || undefined,
        description: formData.description || undefined,
        qualityCertifications: formData.qualityCertifications
          ? formData.qualityCertifications
              .split(",")
              .map((cert) => cert.trim())
              .filter(Boolean)
          : [],
        images: formData.images,
      };

      const response = await listingsService.createListing(listingData);

      if (response.success) {
        navigate("/dashboard");
      }
    } catch (err: any) {
      setError(err.message || "Failed to create listing");
    } finally {
      setLoading(false);
    }
  };

  // Redirect if not a farmer
  if (user?.role !== "farmer") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <Card className="p-8 text-center max-w-md">
          <h2 className="text-2xl font-bold text-warning mb-4">
            Access Denied
          </h2>
          <p className="text-gray-600 mb-6">
            Only farmers can create listings.
          </p>
          <Button variant="primary" onClick={() => navigate("/marketplace")}>
            Go to Marketplace
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-3xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-primary-green font-serif mb-2">
            Create New Listing
          </h1>
          <p className="text-gray-600">
            Add your agricultural product to the marketplace
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Form */}
        <Card className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Product Images - First for better UX */}
            <div>
              <label className="block mb-2 font-semibold text-dark-green">
                Product Images *
              </label>
              <ImageUpload
                onUploadComplete={handleImagesUploaded}
                maxImages={5}
                existingImages={formData.images}
              />
            </div>

            {/* Crop Type */}
            <div>
              <label className="block mb-2 font-semibold text-dark-green">
                Crop Type *
              </label>
              <select
                name="cropType"
                value={formData.cropType}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded transition-all duration-300 focus:border-primary-green focus:ring-2 focus:ring-primary-green focus:ring-opacity-20 focus:outline-none"
                required
              >
                <option value="">Select crop type</option>
                <option value="Maize">Maize</option>
                <option value="Wheat">Wheat</option>
                <option value="Soybeans">Soybeans</option>
                <option value="Vegetables">Vegetables</option>
                <option value="Fruits">Fruits</option>
                <option value="Tobacco">Tobacco</option>
                <option value="Cotton">Cotton</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Crop Name/Variety (Optional) */}
            {formData.cropType && (
              <Input
                label="Crop Name/Variety (Optional)"
                type="text"
                name="cropName"
                value={formData.cropName}
                onChange={handleChange}
                placeholder={
                  formData.cropType === "Maize"
                    ? "e.g., Hickory King, SC627"
                    : formData.cropType === "Vegetables"
                    ? "e.g., Cabbage, Tomato, Spinach"
                    : formData.cropType === "Fruits"
                    ? "e.g., Mango, Apple, Orange"
                    : formData.cropType === "Other"
                    ? "e.g., Dressed Chicken, Honey"
                    : "e.g., Specific variety or name"
                }
              />
            )}

            {/* Quantity and Unit */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Quantity *"
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                placeholder="50"
                min="0.01"
                step="0.01"
                required
              />

              <div>
                <label className="block mb-2 font-semibold text-dark-green">
                  Unit *
                </label>
                <select
                  name="unit"
                  value={formData.unit}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded transition-all duration-300 focus:border-primary-green focus:ring-2 focus:ring-primary-green focus:ring-opacity-20 focus:outline-none"
                  required
                >
                  <option value="tons">Tons</option>
                  <option value="kg">Kilograms</option>
                  <option value="bags">Bags</option>
                  <option value="crates">Crates</option>
                </select>
              </div>
            </div>

            {/* Price Per Unit */}
            <Input
              label="Price Per Unit (USD) *"
              type="number"
              name="pricePerUnit"
              value={formData.pricePerUnit}
              onChange={handleChange}
              placeholder="285.00"
              min="0.01"
              step="0.01"
              required
              icon={
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
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              }
            />

            {/* Location */}
            <div>
              <label className="block mb-2 font-semibold text-dark-green">
                Location *
              </label>
              <select
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded transition-all duration-300 focus:border-primary-green focus:ring-2 focus:ring-primary-green focus:ring-opacity-20 focus:outline-none"
                required
              >
                <option value="">Select location</option>
                <option value="Harare">Harare</option>
                <option value="Bulawayo">Bulawayo</option>
                <option value="Mutare">Mutare</option>
                <option value="Masvingo">Masvingo</option>
                <option value="Gweru">Gweru</option>
                <option value="Marondera">Marondera</option>
                <option value="Chitungwiza">Chitungwiza</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Harvest Date */}
            <Input
              label="Harvest Date/Period"
              type="text"
              name="harvestDate"
              value={formData.harvestDate}
              onChange={handleChange}
              placeholder="e.g., March 2024 or March 15-30, 2024"
            />

            {/* Description */}
            <div>
              <label className="block mb-2 font-semibold text-dark-green">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe your product quality, farming practices, etc."
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded transition-all duration-300 focus:border-primary-green focus:ring-2 focus:ring-primary-green focus:ring-opacity-20 focus:outline-none"
              />
            </div>

            {/* Quality Certifications */}
            <Input
              label="Quality Certifications (comma-separated)"
              type="text"
              name="qualityCertifications"
              value={formData.qualityCertifications}
              onChange={handleChange}
              placeholder="e.g., Grade A, Organic, Non-GMO"
            />

            <div className="text-sm text-gray-600 bg-blue-50 border border-blue-200 rounded p-4">
              <p className="font-semibold mb-2">
                💡 Tips for a successful listing:
              </p>
              <ul className="list-disc list-inside space-y-1">
                <li>Upload clear photos showing product quality</li>
                <li>Set competitive prices based on market rates</li>
                <li>Include quality certifications if available</li>
                <li>Specify accurate harvest dates</li>
                <li>Provide detailed descriptions</li>
              </ul>
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-4 pt-4">
              <Button
                type="submit"
                variant="primary"
                className="flex-1"
                isLoading={loading}
                disabled={loading || formData.images.length === 0}
              >
                {loading ? "Creating Listing..." : "Create Listing"}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => navigate("/dashboard")}
                disabled={loading}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default CreateListing;
