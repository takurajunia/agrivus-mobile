// User Types
export type UserRole =
  | "farmer"
  | "buyer"
  | "transporter"
  | "agro_supplier"
  | "vendor"
  | "support_moderator"
  | "accounts_officer"
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

export interface ProfileUpdateData {
  fullName: string;
  phone: string;
  profile: {
    businessLocation?: string;
    buyerType?: string;
    purchaseVolume?: string;
    qualityRequirements?: string;
    productsInterested?: string[];
    farmLocation?: string;
    farmSize?: string;
    crops?: string[];
    productionMethod?: string;
    experienceYears?: string;
    harvestPeriod?: string;
  };
}

export interface AuthProfileResponseData {
  user: User;
  profile: Record<string, any> | null;
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

// Farm Log Types
export type FarmLogAccessStatus =
  | "trial"
  | "active"
  | "expired"
  | "cancelled"
  | "none";

export interface FarmLogSubscription {
  status: "trial" | "active" | "expired" | "cancelled";
  trial_ends_at: string;
  current_period_end: string | null;
  plan_name: string | null;
  billing_cycle: string | null;
  price_usd: string | null;
}

export interface FarmLogPlan {
  id: string;
  name: string;
  billing_cycle: "monthly" | "annual";
  price_usd: string;
}

export interface FarmLogInput {
  id?: string;
  input_type: string;
  name: string;
  quantity?: number | string | null;
  unit?: string | null;
  cost_usd?: number | string | null;
  supplier?: string | null;
}

export interface FarmLogYield {
  id?: string;
  crop: string;
  quantity: number | string;
  unit: string;
  quality?: string | null;
  notes?: string | null;
}

export interface FarmLogEntry {
  id: string;
  log_date: string;
  activity_type: string;
  crop: string | null;
  field_area: string | null;
  description: string | null;
  weather: string | null;
  notes: string | null;
  inputs: FarmLogInput[];
  yields: FarmLogYield[];
}

export interface FarmLogDailyReport {
  date: string;
  logs: FarmLogEntry[];
  summary: {
    total_cost: number | string;
    total_yield_qty: number | string;
    total_activities: number | string;
  };
}

export interface FarmLogWeeklyReport {
  startDate: string;
  endDate: string;
  byDay: Array<{
    log_date: string;
    activities: number | string;
    total_cost: number | string;
    total_yield: number | string;
  }>;
  byActivity: Array<{
    activity_type: string;
    count: number | string;
  }>;
  summary: {
    total_cost: number | string;
    total_yield: number | string;
    total_activities: number | string;
  };
}

// Farm OS Types
export type FarmOSAccessStatus =
  | "trial"
  | "active"
  | "expired"
  | "cancelled"
  | "none";

export interface FarmOSSubscription {
  status: "trial" | "active" | "expired" | "cancelled";
  trial_ends_at?: string | null;
  current_period_end?: string | null;
  plan_name?: string | null;
  billing_cycle?: string | null;
  price_usd?: string | null;
}

export interface FarmOSPlan {
  id: string;
  name: string;
  billing_cycle: "monthly" | "annual";
  price_usd: string;
}

export interface FarmOSFarm {
  id: string;
  owner_id: string;
  name: string;
  location?: string | null;
  total_area_ha?: number | string | null;
  gps_lat?: number | string | null;
  gps_lng?: number | string | null;
  water_sources?: string | null;
  notes?: string | null;
  created_at?: string;
  updated_at?: string;
  field_count?: number | string;
  worker_count?: number | string;
  active_crops?: number | string;
  livestock_groups?: number | string;
}

export interface FarmOSField {
  id: string;
  farm_id: string;
  name: string;
  area_ha?: number | string | null;
  soil_type?: string | null;
  irrigation_type?: string | null;
  current_use?: string | null;
  status?: string | null;
  notes?: string | null;
  created_at?: string;
  updated_at?: string;
  current_crop_type?: string | null;
  crop_status?: string | null;
  expected_harvest_date?: string | null;
}

export interface FarmOSWorker {
  id: string;
  farm_id: string;
  user_id?: string | null;
  full_name: string;
  phone?: string | null;
  role: "owner" | "manager" | "worker" | string;
  is_active?: boolean;
  daily_wage_usd?: number | string | null;
  invite_code?: string | null;
  created_at?: string;
  user_email?: string | null;
  user_is_active?: boolean | null;
  total_wages_paid?: number | string | null;
  total_days_worked?: number | string | null;
}

export interface FarmOSCropPlan {
  id: string;
  farm_id: string;
  field_id?: string | null;
  crop_type: string;
  variety?: string | null;
  planned_area_ha?: number | string | null;
  planting_date?: string | null;
  expected_harvest_date?: string | null;
  actual_harvest_date?: string | null;
  expected_yield_kg?: number | string | null;
  actual_yield_kg?: number | string | null;
  season?: string | null;
  status?: string | null;
  notes?: string | null;
  created_at?: string;
  updated_at?: string;
  field_name?: string | null;
  field_area_ha?: number | string | null;
  activity_count?: number | string | null;
  total_input_cost?: number | string | null;
}

export interface FarmOSCropActivity {
  id: string;
  crop_plan_id?: string | null;
  farm_id: string;
  field_id?: string | null;
  activity_type: string;
  activity_date: string;
  area_covered_ha?: number | string | null;
  inputs_used?: string | null;
  description?: string | null;
  notes?: string | null;
  logged_by?: string | null;
  created_at?: string;
  field_name?: string | null;
  logged_by_name?: string | null;
  crop_type?: string | null;
}

export interface FarmOSLivestockGroup {
  id: string;
  farm_id: string;
  field_id?: string | null;
  species: string;
  breed?: string | null;
  count: number | string;
  purpose?: string | null;
  date_acquired?: string | null;
  notes?: string | null;
  created_at?: string;
  updated_at?: string;
  field_name?: string | null;
  activity_count?: number | string | null;
  total_cost?: number | string | null;
}

export interface FarmOSLivestockActivity {
  id: string;
  livestock_group_id: string;
  farm_id: string;
  activity_type: string;
  activity_date: string;
  count_affected?: number | string | null;
  quantity?: number | string | null;
  unit?: string | null;
  cost_usd?: number | string | null;
  description?: string | null;
  notes?: string | null;
  logged_by?: string | null;
  created_at?: string;
  species?: string | null;
  breed?: string | null;
  logged_by_name?: string | null;
}

export interface FarmOSLabourDay {
  id: string;
  farm_id: string;
  field_id?: string | null;
  worker_id?: string | null;
  work_date: string;
  task_category: string;
  hours_worked?: number | string | null;
  area_covered_ha?: number | string | null;
  wage_usd?: number | string | null;
  notes?: string | null;
  logged_by?: string | null;
  created_at?: string;
  worker_name?: string | null;
  worker_role?: string | null;
  field_name?: string | null;
}

export interface FarmOSLabourSummary {
  total_entries?: number | string | null;
  total_hours?: number | string | null;
  total_wages?: number | string | null;
  unique_workers?: number | string | null;
  total_area_covered?: number | string | null;
}

export interface FarmOSLabourCategorySummary {
  task_category: string;
  entries?: number | string | null;
  hours?: number | string | null;
  wages?: number | string | null;
  area_ha?: number | string | null;
}

export interface FarmOSInventoryItem {
  id: string;
  farm_id: string;
  item_type: string;
  name: string;
  quantity: number | string;
  unit?: string | null;
  unit_cost_usd?: number | string | null;
  reorder_level?: number | string | null;
  expiry_date?: string | null;
  supplier?: string | null;
  updated_at?: string;
  low_stock?: boolean;
  expiring_soon?: boolean;
  usage_last_30d?: number | string | null;
}

export interface FarmOSInventorySummary {
  item_type: string;
  items: number | string;
  total_value: number | string;
}

export interface FarmOSCalendarEntry {
  id: string;
  farm_id?: string | null;
  crop_type: string;
  region?: string | null;
  recommended_planting_start?: number | string | null;
  recommended_planting_end?: number | string | null;
  expected_harvest_weeks?: number | string | null;
  soil_requirements?: string | null;
  water_requirements?: string | null;
  common_pests?: string | null;
  notes?: string | null;
  is_ai_generated?: boolean | null;
  created_at?: string;
}

export interface FarmOSWeeklyReport {
  farmName: string;
  period: { startDate: string; endDate: string };
  labour: {
    total_entries?: number | string | null;
    workers_active?: number | string | null;
    total_hours?: number | string | null;
    total_wages?: number | string | null;
    total_area?: number | string | null;
  };
  cropActivities: Array<{
    activity_type: string;
    count: number | string;
    area_covered: number | string;
  }>;
  livestock: Array<{
    activity_type: string;
    count: number | string;
    total_cost: number | string;
  }>;
  inventoryUsed: Array<{
    name: string;
    item_type: string;
    total_used: number | string;
    unit?: string | null;
  }>;
}

export interface FarmOSMonthlyReport {
  farmName: string;
  period: { year: number; month: number; startDate: string; endDate: string };
  summary: {
    totalWages: number;
    totalInputs: number;
    totalCost: number;
    totalManDays: number;
  };
  labour: {
    byTask: Array<{
      task_category: string;
      man_days: number | string;
      total_hours: number | string;
      total_wages: number | string;
      area_covered: number | string;
    }>;
    byWorker: Array<{
      full_name: string | null;
      role: string | null;
      days_worked: number | string;
      total_hours: number | string;
      total_wages: number | string;
    }>;
  };
  crops: Array<{
    crop_type: string | null;
    activity_type: string;
    count: number | string;
    area_covered: number | string;
  }>;
  livestock: Array<{
    species: string;
    activity_type: string;
    count: number | string;
    total_cost: number | string;
  }>;
  inventory: Array<{
    item_type: string;
    name: string;
    unit: string | null;
    total_used: number | string;
    total_cost: number | string;
  }>;
}

// Farm OS Phase 2 Types (Finance + Market)
export interface FarmOSExpense {
  id: string;
  farm_id: string;
  expense_date: string;
  category: string;
  description?: string | null;
  amount_usd: number | string;
  field_id?: string | null;
  crop_plan_id?: string | null;
  livestock_group_id?: string | null;
  supplier?: string | null;
  receipt_ref?: string | null;
  logged_by?: string | null;
  notes?: string | null;
  created_at?: string;
  field_name?: string | null;
  crop_type?: string | null;
  logged_by_name?: string | null;
}

export interface FarmOSExpenseSummary {
  total_expenses?: number | string | null;
  total_entries?: number | string | null;
  labour_cost?: number | string | null;
  input_cost?: number | string | null;
  equipment_cost?: number | string | null;
  transport_cost?: number | string | null;
}

export interface FarmOSExpenseCategorySummary {
  category: string;
  entries?: number | string | null;
  total?: number | string | null;
}

export interface FarmOSRevenue {
  id: string;
  farm_id: string;
  revenue_date: string;
  category: string;
  description?: string | null;
  amount_usd: number | string;
  quantity?: number | string | null;
  unit?: string | null;
  unit_price_usd?: number | string | null;
  buyer_name?: string | null;
  field_id?: string | null;
  crop_plan_id?: string | null;
  livestock_group_id?: string | null;
  logged_by?: string | null;
  notes?: string | null;
  created_at?: string;
  field_name?: string | null;
  crop_type?: string | null;
  logged_by_name?: string | null;
}

export interface FarmOSRevenueSummary {
  total_revenue?: number | string | null;
  total_entries?: number | string | null;
  crop_revenue?: number | string | null;
  livestock_revenue?: number | string | null;
  produce_revenue?: number | string | null;
}

export interface FarmOSRevenueCategorySummary {
  category: string;
  entries?: number | string | null;
  total?: number | string | null;
}

export interface FarmOSProfitability {
  farmName: string;
  period: { year: number; month: number; startDate: string; endDate: string };
  summary: {
    totalRevenue: number;
    totalExpenses: number;
    netProfit: number;
    profitMargin: string;
    isProfit: boolean;
  };
  expenses: {
    total_expenses: number | string;
    labour: number | string;
    inputs: number | string;
    fuel: number | string;
    equipment: number | string;
    transport: number | string;
    other: number | string;
  };
  revenue: {
    total_revenue: number | string;
    crop_sales: number | string;
    livestock_sales: number | string;
    produce: number | string;
  };
  byCrop: Array<{
    crop_plan_id: string;
    crop_type: string;
    variety?: string | null;
    planned_area_ha?: number | string | null;
    actual_yield_kg?: number | string | null;
    expected_yield_kg?: number | string | null;
    revenue: number | string;
    expenses: number | string;
    profit: number | string;
  }>;
  expenseCategories: Array<{
    category: string;
    total: number | string;
    count: number | string;
  }>;
  trend: Array<{
    month: string;
    expenses: number | string;
    revenue: number | string;
    profit: number | string;
  }>;
}

export interface FarmOSMarketPrice {
  id: string;
  commodity: string;
  region?: string | null;
  price_usd: number | string;
  unit: string;
  price_date: string;
  source?: string | null;
  demand_level?: string | null;
  notes?: string | null;
  is_ai_generated?: boolean | null;
}

export interface FarmOSMarketInsights {
  marketSummary?: string;
  recommendations?: Array<{
    crop: string;
    action: "sell_now" | "hold" | "plant_more" | "reduce" | string;
    reason?: string;
    estimatedPrice?: string;
    urgency?: "high" | "medium" | "low" | string;
  }>;
  suggestedPrices?: Array<{
    commodity: string;
    suggestedPrice: number;
    unit: string;
    demandLevel?: "low" | "medium" | "high" | "very_high" | string;
    notes?: string;
  }>;
}

export interface FarmOSAnalyticsData {
  farm?: {
    name: string;
    location?: string | null;
    area?: number | string | null;
  };
  kpis: {
    totalRevenue6m: number | string;
    totalExpenses6m: number | string;
    netProfit6m: number | string;
    totalLabourWages?: number | string;
    avgYieldAchievement: string;
  };
  charts: {
    revenueVsExpenses: Array<{
      month: string;
      month_key?: string;
      expenses: number | string;
      revenue: number | string;
      profit: number | string;
    }>;
    labourDistribution: Array<{
      name: string;
      value: number | string;
      man_days?: number | string;
      hours?: number | string;
    }>;
    yieldPerformance: Array<{
      crop_type: string;
      variety?: string | null;
      expected?: number | string;
      actual?: number | string;
      area?: number | string;
      achievement_pct?: number | string;
      yield_per_ha?: number | string;
    }>;
    inventoryValue: Array<{
      name: string;
      value: number | string;
      items?: number | string;
    }>;
    expenseCategories: Array<{
      name: string;
      value: number | string;
    }>;
    livestockCounts: Array<{
      name: string;
      value: number | string;
    }>;
    cropYieldComparison: Array<{
      name: string;
      expected?: number | string;
      actual?: number | string;
    }>;
    labourEfficiency: Array<{
      month: string;
      wages?: number | string;
      area?: number | string;
      man_days?: number | string;
      cost_per_ha?: number | string;
    }>;
  };
}

export interface FarmOSSeasonalPredictions {
  seasonalOutlook: string;
  nextMonthActions: Array<{
    action: string;
    reasoning: string;
    priority: "high" | "medium" | "low" | string;
    category: string;
  }>;
  cropRecommendations: Array<{
    crop: string;
    recommendation: string;
    notes?: string;
    timing: string;
    expectedYieldPerHa?: string;
  }>;
  financialForecast?: {
    expectedRevenue: number | string;
    expectedExpenses: number | string;
    keyRisks: string[];
    opportunities: string[];
  } | null;
  labourPlan?: {
    estimatedManDays: number | string;
    peakWeeks: string;
    keyTasks: string[];
  } | null;
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
