import api, { getWithCache } from "./api";
import type {
  ApiResponse,
  Listing,
  ListingWithFarmer,
  ListingFilters,
} from "../types";

export const listingsService = {
  // Get all listings with filters
  getListings: async (
    filters?: ListingFilters,
    options?: { forceRefresh?: boolean }
  ) => {
    const params: Record<string, string> = {};

    if (filters?.page) params.page = filters.page.toString();
    if (filters?.limit) params.limit = filters.limit.toString();
    if (filters?.cropType) params.cropType = filters.cropType;
    if (filters?.location) params.location = filters.location;
    if (filters?.search) params.search = filters.search;
    if (filters?.minPrice) params.minPrice = filters.minPrice.toString();
    if (filters?.maxPrice) params.maxPrice = filters.maxPrice.toString();
    if (filters?.sortBy) params.sortBy = filters.sortBy;

    const response = await getWithCache<
      ApiResponse<{
        listings: ListingWithFarmer[];
        pagination: {
          page: number;
          limit: number;
          total: number;
          totalPages: number;
        };
      }>
    >(
      "/listings",
      { params },
      {
        ttlMs: 2 * 60 * 1000,
        forceRefresh: options?.forceRefresh,
      }
    );

    return response;
  },

  // Get single listing by ID
  getListingById: async (id: string) => {
    const response = await api.get<
      ApiResponse<{
        listing: Listing;
        farmer: any;
      }>
    >(`/listings/${id}`);
    return response.data;
  },

  // Get my listings (farmers only)
  getMyListings: async () => {
    const response = await api.get<ApiResponse<Listing[]>>(
      "/listings/my/listings"
    );
    return response.data;
  },

  // Create listing (farmers only)
  createListing: async (data: Partial<Listing>) => {
    const response = await api.post<ApiResponse<Listing>>("/listings", data);
    return response.data;
  },

  // Update listing
  updateListing: async (id: string, data: Partial<Listing>) => {
    const response = await api.put<ApiResponse<Listing>>(
      `/listings/${id}`,
      data
    );
    return response.data;
  },

  // Delete listing
  deleteListing: async (id: string) => {
    const response = await api.delete<ApiResponse>(`/listings/${id}`);
    return response.data;
  },

  // Update listing quantity (farmers only)
  updateListingQuantity: async (
    id: string,
    quantity: number,
    reason?: string
  ) => {
    const response = await api.patch<ApiResponse<Listing>>(
      `/listings/${id}/quantity`,
      { quantity, reason }
    );
    return response.data;
  },
};

export default listingsService;
