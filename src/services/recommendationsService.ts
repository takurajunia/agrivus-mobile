import { api } from "./api";

export interface Recommendation {
  id: string;
  userId: string;
  type:
    | "crop_suggestion"
    | "buyer_match"
    | "pricing_optimization"
    | "seasonal_insight"
    | "product_bundle"
    | "market_trend";
  status: "active" | "accepted" | "rejected" | "expired";
  title: string;
  description: string;
  confidenceScore: number;
  data: any;
  potentialRevenue: string;
  estimatedRoi: string;
  viewedAt?: string;
  acceptedAt?: string;
  rejectedAt?: string;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MarketInsight {
  id: string;
  cropType: string;
  region: string;
  averagePrice: string;
  minPrice: string;
  maxPrice: string;
  priceVolatility: string;
  totalDemand: number;
  totalSupply: number;
  demandSupplyRatio: string;
  trend: "increasing" | "decreasing" | "stable";
  trendPercentage: string;
  transactionCount: number;
  averageOrderSize: string;
  periodStart: string;
  periodEnd: string;
  metadata?: any;
  createdAt: string;
}

export interface UserPreferences {
  id: string;
  userId: string;
  preferredCrops: string[];
  targetRegions: string[];
  budgetRange: { min: number; max: number } | null;
  enableCropSuggestions: boolean;
  enablePricingAlerts: boolean;
  enableMarketTrends: boolean;
  recommendationFrequency: "daily" | "weekly" | "monthly";
  createdAt: string;
  updatedAt: string;
}

class RecommendationsService {
  // Get user's recommendations
  async getRecommendations(params?: {
    type?: string;
    status?: string;
    limit?: number;
  }): Promise<{
    success: boolean;
    data: { recommendations: Recommendation[]; count: number };
  }> {
    const response = await api.get("/recommendations", { params });
    return response.data;
  }

  // Generate new recommendations
  async generateRecommendations(): Promise<{
    success: boolean;
    message: string;
    data: { count: number; recommendations: Recommendation[] };
  }> {
    const response = await api.post("/recommendations/generate");
    return response.data;
  }

  // Accept a recommendation
  async acceptRecommendation(
    id: string,
  ): Promise<{ success: boolean; message: string; data: Recommendation }> {
    const response = await api.post(`/recommendations/${id}/accept`);
    return response.data;
  }

  // Reject a recommendation
  async rejectRecommendation(
    id: string,
  ): Promise<{ success: boolean; message: string }> {
    const response = await api.post(`/recommendations/${id}/reject`);
    return response.data;
  }

  // Get market insights
  async getMarketInsights(params?: {
    cropType?: string;
    region?: string;
    limit?: number;
  }): Promise<{
    success: boolean;
    data: { insights: MarketInsight[]; count: number };
  }> {
    const response = await api.get("/recommendations/market-insights", {
      params,
    });
    return response.data;
  }

  // Get user preferences
  async getPreferences(): Promise<{ success: boolean; data: UserPreferences }> {
    const response = await api.get("/recommendations/preferences");
    return response.data;
  }

  // Update user preferences
  async updatePreferences(preferences: Partial<UserPreferences>): Promise<{
    success: boolean;
    message: string;
    data: UserPreferences;
  }> {
    const response = await api.put("/recommendations/preferences", preferences);
    return response.data;
  }
}

export const recommendationsService = new RecommendationsService();
export default recommendationsService;
