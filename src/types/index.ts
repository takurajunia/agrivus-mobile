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
  name?: string; // Alias for fullName, may come from API
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

// Auction Types
export interface Auction {
  id: string;
  listingId: string;
  farmerId: string;
  startingPrice: string;
  currentPrice: string;
  reservePrice: string | null;
  bidIncrement: string;
  startTime: string;
  endTime: string;
  status: string;
  totalBids: number;
  winnerId: string | null;
  finalPrice: string | null;
  escrowHeldAt: string | null;
  transportChoiceDeadline: string | null;
  orderId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Bid {
  id: string;
  auctionId: string;
  bidderId: string;
  bidAmount: string;
  status: string;
  createdAt: string;
}

// Bid with bidder info from API join
export interface BidWithBidder {
  bid: Bid;
  bidder: {
    id: string;
    fullName: string;
  } | null;
}

// Auction detail response from API (includes joined data)
export interface AuctionDetailResponse {
  auction: Auction;
  listing: Listing | null;
  farmer: {
    id: string;
    fullName: string;
    phone: string;
  } | null;
  bids: BidWithBidder[];
}

export interface CreateAuctionData {
  listingId: string;
  startingPrice: number;
  reservePrice?: number;
  bidIncrement?: number;
  durationHours?: number;
  autoExtend?: boolean;
}

export interface PlaceBidData {
  bidAmount: number;
}

export interface ChooseTransportData {
  deliveryLocation: string;
  notes?: string;
  usesTransport: boolean;
  transporterId?: string;
  transportCost?: number;
}

// AgriMall Types
export interface Product {
  id: string;
  vendorId: string;
  categoryId: string | null;
  name: string;
  slug: string;
  description: string | null;
  price: string;
  compareAtPrice: string | null;
  stockQuantity: number;
  unit: string;
  brand: string | null;
  images: string[];
  rating: string;
  reviewCount: number;
  isActive: boolean;
  isFeatured: boolean;
  vendor?: {
    id: string;
    storeName: string;
    rating: string;
  };
}

export interface CartItem {
  productId: string;
  quantity: number;
  price: string;
  subtotal: string;
  product: {
    id: string;
    name: string;
    images: string[];
    stockQuantity: number;
    unit: string;
  };
  vendor: {
    id: string;
    storeName: string;
    phone: string;
    deliveryAreas: string[];
  };
  available: boolean;
}

export interface Cart {
  id: string;
  userId: string;
  items: CartItem[];
  totalAmount: string;
  createdAt: string;
  updatedAt: string;
}

export interface CheckoutSummary {
  cart: {
    id: string;
    items: CartItem[];
    itemCount: number;
  };
  pricing: {
    subtotal: string;
    estimatedDeliveryFee: string;
    tax: string;
    total: string;
  };
  availability: {
    allAvailable: boolean;
    unavailableItems: any[];
  };
  wallet: {
    balance: string;
    sufficient: boolean;
    shortfall: string;
  };
}

export interface AgrimallOrder {
  id: string;
  orderNumber: string;
  buyerId: string;
  vendorId: string;
  items: any[];
  subtotal: string;
  deliveryFee: string;
  totalAmount: string;
  deliveryAddress: string;
  status: string;
  paymentStatus: string;
  createdAt: string;
  updatedAt: string;
}

// Export Types
export interface ExportAssessment {
  id: string;
  userId: string;
  productType: string;
  targetMarkets: string[];
  productionCapacity: string;
  overallScore: string;
  readinessLevel: string;
  productQualityScore: string;
  documentationScore: string;
  logisticsScore: string;
  complianceScore: string;
  financialScore: string;
  recommendations: any[];
  actionItems: any[];
  status: string;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface MarketIntelligence {
  id: string;
  market: string;
  productCategory: string;
  averagePrice: string;
  priceUnit: string;
  priceTrend: string;
  demandLevel: string;
  seasonalDemand: any;
  qualityStandards: string[];
  certifications: string[];
  packagingRequirements: string[];
  importTariff: string;
  tradingPartners: string[];
  marketOpportunities: string;
  challenges: string;
  recommendations: string;
  dataSource: string;
  lastUpdated: string;
  regulations: string[];
  competitionLevel: string;
}

export interface DocumentTemplate {
  id: string;
  type: string;
  name: string;
  description: string;
  templateUrl: string;
  fileUrl: string;
  required: boolean;
  category: string;
  requiredFor: string[];
}

export interface LogisticsPartner {
  id: string;
  companyName: string;
  serviceType: string;
  contactPerson: string;
  email: string;
  phone: string;
  website: string;
  serviceAreas: string[];
  specializations: string[];
  coldChainCapable: boolean;
  airFreight: boolean;
  seaFreight: boolean;
  landFreight: boolean;
  customsClearance: boolean;
  rating: string;
  totalShipments: string;
  pricingInfo: any;
  isVerified: boolean;
  isActive: boolean;
}

// Wallet Types
export interface WalletBalance {
  balance: number;
  escrowBalance: number;
  availableBalance: number;
  currency: string;
  isLocked: boolean;
  dailyWithdrawalLimit: number;
  dailyWithdrawn: number;
}

export interface Transaction {
  id: string;
  type: string;
  amount: string;
  balanceBefore: string;
  balanceAfter: string;
  description: string;
  metadata: any;
  createdAt: string;
}

export interface TransactionHistory {
  transactions: Transaction[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Payment Types
export type PaymentMethodType =
  | "ecocash"
  | "onemoney"
  | "telecash"
  | "zipit"
  | "usd_bank"
  | "card";

export type PaymentStatusType =
  | "pending"
  | "processing"
  | "completed"
  | "failed"
  | "cancelled";

export interface PaymentStatus {
  paymentId: string;
  reference: string;
  status: PaymentStatusType;
  paid: boolean;
  amount: number;
  paidAmount?: number;
  completedAt?: string;
  paymentMethod?: string;
}

export interface PaymentHistoryItem {
  id: string;
  type: string;
  amount: string;
  currency: string;
  paymentMethod: string;
  status: string;
  reference: string;
  instructions?: string;
  createdAt: string;
  completedAt?: string;
}

export interface PaymentHistoryPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// Notification Types
export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  data?: any;
  isRead: boolean;
  createdAt: string;
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
