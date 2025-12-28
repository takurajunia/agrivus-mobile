// User Types
export type UserRole =
  | "farmer"
  | "buyer"
  | "transporter"
  | "agro_supplier"
  | "admin";

export interface User {
  id: string;
  email: string;
  phone: string;
  fullName: string;
  role: UserRole;
  isVerified: boolean;
  isActive?: boolean;

  // Activity metrics
  platformScore: number;
  totalTransactions: number;
  totalVolume: string;
  lastActiveDate?: string | null;

  // Boost metrics
  recentTransactions30d?: number;
  recentTransactions7d?: number;
  avgResponseTimeHours?: number;
  qualityScore?: string;
  streakDays?: number;
  lastStreakUpdate?: string | null;
  boostMultiplier?: string;

  createdAt: string;
  updatedAt?: string;
}

export interface FarmerProfile {
  id: string;
  userId: string;
  farmLocation: string;
  farmSize?: string;
  crops?: string[];
  productionMethod?: string;
  experienceYears?: string;
  harvestPeriod?: string;
  rating: string;
  totalRatings: number;
  successfulDeliveries: number;
  responseTime: number;
  investmentReady: boolean;
  certifications?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface TransporterProfile {
  id: string;
  userId: string;
  baseLocation: string;
  vehicleType: string;
  vehicleCapacity: string;
  availability: string;
  serviceAreas?: string[];
  transportRates?: string;
  experienceYears?: string;
  rating: string;
  totalRatings: number;
  completedDeliveries: number;
  onTimeDeliveryRate: string;
  createdAt: string;
  updatedAt: string;
}

// Listing Types
export type ListingStatus = "active" | "sold" | "expired" | "draft";

export interface Listing {
  id: string;
  farmerId: string;
  cropType: string;
  cropName?: string;
  quantity: string;
  unit: string;
  pricePerUnit: string;
  location: string;
  harvestDate?: string;
  description?: string;
  status: ListingStatus;
  images?: string[];
  qualityCertifications?: string[];
  viewCount: number;
  inquiryCount: number;
  boostScore: number;
  thumbnailUrl?: string;
  hasOfflineData: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ListingWithFarmer {
  listing: Listing;
  farmer: {
    id: string;
    fullName: string;
    platformScore: number;
    totalTransactions: number;
    boostMultiplier?: string;
    recentTransactions7d?: number;
    streakDays?: number;
  };
}

// Order Types
export type OrderStatus =
  | "pending"
  | "payment_pending"
  | "paid"
  | "assigned"
  | "in_transit"
  | "delivered"
  | "confirmed"
  | "cancelled"
  | "disputed";

export interface Order {
  id: string;
  listingId: string;
  buyerId: string;
  farmerId: string;
  quantity: string;
  totalAmount: string;
  deliveryLocation: string;
  status: OrderStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TransportAssignment {
  id: string;
  orderId: string;
  transporterId: string;
  pickupLocation: string;
  deliveryLocation: string;
  distance?: string;
  transportCost: string;
  status: string;
  pickupTime?: string;
  deliveryTime?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TransporterMatch {
  transporterId: string;
  transporter: {
    fullName: string;
    phone: string;
    email: string;
    platformScore: number;
    vehicleType: string;
    vehicleCapacity: string;
    baseLocation: string;
    rating: string;
    completedDeliveries: number;
    onTimeDeliveryRate: string;
  };
  matchScore: number;
  matchReasons: {
    highPlatformActivity: boolean;
    serviceAreaMatch: boolean;
    goodRating: boolean;
    experienced: boolean;
  };
}

// Auth Types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  phone: string;
  password: string;
  fullName: string;
  role: UserRole;
  profile?: Record<string, any>;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    token: string;
    refreshToken: string;
  };
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: {
    items: T[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

// Filter & Search Types
export interface ListingFilters {
  page?: number;
  limit?: number;
  cropType?: string;
  location?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: "price_asc" | "price_desc" | "date_desc" | "date_asc";
}

export interface OrderFilters {
  page?: number;
  limit?: number;
  status?: OrderStatus;
}
