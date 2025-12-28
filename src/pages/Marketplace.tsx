import React, { useState, useEffect } from "react";
import { LoadingSpinner } from "../components/common";
import ListingCard from "../components/marketplace/ListingCard";
import MarketplaceFilters from "../components/marketplace/MarketplaceFilters";
import { listingsService } from "../services/listingsService";
import type { ListingWithFarmer, ListingFilters } from "../types";

const Marketplace: React.FC = () => {
  const [listings, setListings] = useState<ListingWithFarmer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState<ListingFilters>({
    page: 1,
    limit: 20,
    sortBy: "date_desc",
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });

  useEffect(() => {
    fetchListings();
  }, [filters]);

  const fetchListings = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await listingsService.getListings(filters);

      if (response.success && response.data) {
        setListings(response.data.listings);
        setPagination(response.data.pagination);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load listings");
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters: ListingFilters) => {
    setFilters(newFilters);
  };

  const handlePageChange = (newPage: number) => {
    setFilters({ ...filters, page: newPage });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-primary-green font-serif mb-2">
            Marketplace
          </h1>
          <p className="text-gray-600">
            Browse agricultural products from verified farmers across Zimbabwe
          </p>
        </div>

        {/* Filters */}
        <MarketplaceFilters
          filters={filters}
          onFilterChange={handleFilterChange}
        />

        {/* Boost Info Banner */}
        <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="text-3xl">🚀</div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-900 mb-1">
                Smart Ranking Active
              </h3>
              <p className="text-sm text-gray-700">
                Products from the most active and reliable farmers appear first.
                Look for the{" "}
                <span className="inline-flex items-center gap-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold rounded-full px-2 py-0.5 text-xs">
                  <span>🏆</span>
                  <span>3.5x</span>
                </span>{" "}
                badges to find top-rated sellers!
              </p>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <>
            {/* Results Count */}
            <div className="mb-6">
              <p className="text-gray-600">
                Showing {listings.length} of {pagination.total} listings
              </p>
            </div>

            {/* Listings Grid */}
            {listings.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {listings.map((listing) => (
                    <ListingCard key={listing.listing.id} listing={listing} />
                  ))}
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="flex justify-center gap-2">
                    <button
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page === 1}
                      className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>

                    {[...Array(pagination.totalPages)].map((_, index) => (
                      <button
                        key={index}
                        onClick={() => handlePageChange(index + 1)}
                        className={`px-4 py-2 border rounded ${
                          pagination.page === index + 1
                            ? "bg-primary-green text-white border-primary-green"
                            : "border-gray-300 hover:bg-gray-100"
                        }`}
                      >
                        {index + 1}
                      </button>
                    ))}

                    <button
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page === pagination.totalPages}
                      className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-20">
                <svg
                  className="w-24 h-24 mx-auto mb-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                  />
                </svg>
                <h3 className="text-2xl font-bold text-gray-700 mb-2">
                  No listings found
                </h3>
                <p className="text-gray-600">
                  Try adjusting your filters or check back later for new
                  products.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Marketplace;
