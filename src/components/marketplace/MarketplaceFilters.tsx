import React from "react";
import { Input, Button } from "../common";
import type { ListingFilters } from "../../types";

interface MarketplaceFiltersProps {
  filters: ListingFilters;
  onFilterChange: (filters: ListingFilters) => void;
}

const MarketplaceFilters: React.FC<MarketplaceFiltersProps> = ({
  filters,
  onFilterChange,
}) => {
  const handleInputChange = (field: keyof ListingFilters, value: any) => {
    onFilterChange({
      ...filters,
      [field]: value,
      page: 1, // Reset to page 1 when filters change
    });
  };

  const handleClearFilters = () => {
    onFilterChange({
      page: 1,
      limit: 20,
    });
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-card mb-8">
      <h3 className="text-lg font-bold text-primary-green mb-4">
        Filter Products
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Search */}
        <Input
          placeholder="Search..."
          value={filters.search || ""}
          onChange={(e) => handleInputChange("search", e.target.value)}
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
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          }
        />

        {/* Crop Type */}
        <select
          value={filters.cropType || ""}
          onChange={(e) => handleInputChange("cropType", e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded transition-all duration-300 focus:border-primary-green focus:ring-2 focus:ring-primary-green focus:ring-opacity-20 focus:outline-none"
        >
          <option value="">All Crops</option>
          <option value="Maize">Maize</option>
          <option value="Wheat">Wheat</option>
          <option value="Soybeans">Soybeans</option>
          <option value="Vegetables">Vegetables</option>
          <option value="Fruits">Fruits</option>
          <option value="Tobacco">Tobacco</option>
          <option value="Cotton">Cotton</option>
        </select>

        {/* Location */}
        <select
          value={filters.location || ""}
          onChange={(e) => handleInputChange("location", e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded transition-all duration-300 focus:border-primary-green focus:ring-2 focus:ring-primary-green focus:ring-opacity-20 focus:outline-none"
        >
          <option value="">All Locations</option>
          <option value="Harare">Harare</option>
          <option value="Bulawayo">Bulawayo</option>
          <option value="Mutare">Mutare</option>
          <option value="Masvingo">Masvingo</option>
          <option value="Gweru">Gweru</option>
          <option value="Marondera">Marondera</option>
        </select>

        {/* Sort By */}
        <select
          value={filters.sortBy || "date_desc"}
          onChange={(e) => handleInputChange("sortBy", e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded transition-all duration-300 focus:border-primary-green focus:ring-2 focus:ring-primary-green focus:ring-opacity-20 focus:outline-none"
        >
          <option value="date_desc">Newest First</option>
          <option value="date_asc">Oldest First</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
        </select>
      </div>

      {/* Clear Filters */}
      {(filters.search ||
        filters.cropType ||
        filters.location ||
        filters.sortBy !== "date_desc") && (
        <div className="mt-4">
          <Button variant="outline" size="sm" onClick={handleClearFilters}>
            Clear Filters
          </Button>
        </div>
      )}
    </div>
  );
};

export default MarketplaceFilters;
