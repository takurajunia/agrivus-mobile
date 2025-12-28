import api from "./api";
import type {
  ApiResponse,
  Listing,
  ListingWithFarmer,
  ListingFilters,
} from "../types";

export const listingsService = {
  // Get all listings with filters
  getListings: async (filters?: ListingFilters) => {
    const params = new URLSearchParams();

    if (filters?.page) params.append("page", filters.page.toString());
    if (filters?.limit) params.append("limit", filters.limit.toString());
    if (filters?.cropType) params.append("cropType", filters.cropType);
    if (filters?.location) params.append("location", filters.location);
    if (filters?.search) params.append("search", filters.search);
    if (filters?.minPrice)
      params.append("minPrice", filters.minPrice.toString());
    if (filters?.maxPrice)
      params.append("maxPrice", filters.maxPrice.toString());
    if (filters?.sortBy) params.append("sortBy", filters.sortBy);

    const response = await api.get<
      ApiResponse<{
        listings: ListingWithFarmer[];
        pagination: {
          page: number;
          limit: number;
          total: number;
          totalPages: number;
        };
      }>
    >(`/listings?${params.toString()}`);

    return response.data;
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
