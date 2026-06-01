import api from "./api";
import type {
  FarmOSAccessStatus,
  FarmOSSubscription,
  FarmOSPlan,
  FarmOSFarm,
  FarmOSField,
  FarmOSWorker,
  FarmOSCropPlan,
  FarmOSCropActivity,
  FarmOSLivestockGroup,
  FarmOSLivestockActivity,
  FarmOSLabourDay,
  FarmOSLabourSummary,
  FarmOSLabourCategorySummary,
  FarmOSInventoryItem,
  FarmOSInventorySummary,
  FarmOSCalendarEntry,
  FarmOSWeeklyReport,
  FarmOSMonthlyReport,
  FarmOSExpense,
  FarmOSExpenseSummary,
  FarmOSExpenseCategorySummary,
  FarmOSRevenue,
  FarmOSRevenueSummary,
  FarmOSRevenueCategorySummary,
  FarmOSProfitability,
  FarmOSMarketPrice,
  FarmOSMarketInsights,
  FarmOSAnalyticsData,
  FarmOSSeasonalPredictions,
} from "../types";

type SubscriptionResponse = {
  success: boolean;
  data: {
    subscription: FarmOSSubscription | null;
    access: FarmOSAccessStatus;
    plans: FarmOSPlan[];
  };
};

type FarmResponse = {
  success: boolean;
  data: { farm: FarmOSFarm | null };
};

type FieldsResponse = {
  success: boolean;
  data: { fields: FarmOSField[]; farmId?: string };
};

type WorkersResponse = {
  success: boolean;
  data: { workers: FarmOSWorker[]; farmId?: string };
};

type CropPlansResponse = {
  success: boolean;
  data: { cropPlans: FarmOSCropPlan[]; farmId?: string };
};

type CropActivitiesResponse = {
  success: boolean;
  data: { activities: FarmOSCropActivity[] };
};

type LivestockGroupsResponse = {
  success: boolean;
  data: { groups: FarmOSLivestockGroup[]; farmId?: string };
};

type LivestockActivitiesResponse = {
  success: boolean;
  data: { activities: FarmOSLivestockActivity[] };
};

type LabourResponse = {
  success: boolean;
  data: {
    labourDays: FarmOSLabourDay[];
    summary: FarmOSLabourSummary | null;
    byCategory: FarmOSLabourCategorySummary[];
    period?: { startDate: string; endDate: string };
  };
};

type InventoryResponse = {
  success: boolean;
  data: {
    inventory: FarmOSInventoryItem[];
    summary: FarmOSInventorySummary[];
    alerts: FarmOSInventoryItem[];
  };
};

type CalendarResponse = {
  success: boolean;
  data: {
    calendar: FarmOSCalendarEntry[];
    plantingNow: FarmOSCalendarEntry[];
    currentMonth: number;
  };
};

type WeeklyReportResponse = { success: boolean; data: FarmOSWeeklyReport };

type MonthlyReportResponse = { success: boolean; data: FarmOSMonthlyReport };

type ExpensesResponse = {
  success: boolean;
  data: {
    expenses: FarmOSExpense[];
    summary: FarmOSExpenseSummary | null;
    byCategory: FarmOSExpenseCategorySummary[];
    period?: { startDate: string; endDate: string };
  };
};

type RevenueResponse = {
  success: boolean;
  data: {
    revenue: FarmOSRevenue[];
    summary: FarmOSRevenueSummary | null;
    byCategory: FarmOSRevenueCategorySummary[];
    period?: { startDate: string; endDate: string };
  };
};

type ProfitabilityResponse = { success: boolean; data: FarmOSProfitability };

type MarketPricesResponse = {
  success: boolean;
  data: { prices: FarmOSMarketPrice[] };
};

type MarketInsightsResponse = {
  success: boolean;
  message?: string;
  data: { insights: FarmOSMarketInsights; generatedAt: string };
};

type AnalyticsResponse = {
  success: boolean;
  data: FarmOSAnalyticsData;
};

type SeasonalPredictionsResponse = {
  success: boolean;
  message?: string;
  data: { predictions: FarmOSSeasonalPredictions; generatedAt: string };
};

type FarmPayload = {
  name: string;
  location?: string | null;
  total_area_ha?: number | string | null;
  gps_lat?: number | string | null;
  gps_lng?: number | string | null;
  water_sources?: string | null;
  notes?: string | null;
};

type FieldPayload = {
  name: string;
  area_ha?: number | string | null;
  soil_type?: string | null;
  irrigation_type?: string | null;
  current_use?: string | null;
  status?: string | null;
  notes?: string | null;
};

type WorkerPayload = {
  full_name: string;
  phone?: string | null;
  role?: string;
  daily_wage_usd?: number | string | null;
  is_active?: boolean;
};

type CropPlanPayload = {
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
};

type CropActivityPayload = {
  crop_plan_id?: string | null;
  field_id?: string | null;
  activity_type: string;
  activity_date?: string | null;
  area_covered_ha?: number | string | null;
  inputs_used?: string | null;
  description?: string | null;
  notes?: string | null;
  logged_by?: string | null;
};

type LivestockGroupPayload = {
  field_id?: string | null;
  species: string;
  breed?: string | null;
  count: number | string;
  purpose?: string | null;
  date_acquired?: string | null;
  notes?: string | null;
};

type LivestockActivityPayload = {
  livestock_group_id: string;
  activity_type: string;
  activity_date?: string | null;
  count_affected?: number | string | null;
  quantity?: number | string | null;
  unit?: string | null;
  cost_usd?: number | string | null;
  description?: string | null;
  notes?: string | null;
  logged_by?: string | null;
};

type LabourPayload = {
  worker_id?: string | null;
  field_id?: string | null;
  work_date?: string | null;
  task_category: string;
  hours_worked?: number | string | null;
  area_covered_ha?: number | string | null;
  wage_usd?: number | string | null;
  notes?: string | null;
  logged_by?: string | null;
};

type InventoryPayload = {
  item_type: string;
  name: string;
  quantity?: number | string | null;
  unit?: string | null;
  unit_cost_usd?: number | string | null;
  reorder_level?: number | string | null;
  expiry_date?: string | null;
  supplier?: string | null;
};

type InventoryUsagePayload = {
  inventory_id: string;
  quantity_used: number | string;
  field_id?: string | null;
  crop_plan_id?: string | null;
  logged_by?: string | null;
  notes?: string | null;
  used_date?: string | null;
};

type CalendarPayload = {
  crop_type: string;
  region?: string | null;
  recommended_planting_start?: number | string | null;
  recommended_planting_end?: number | string | null;
  expected_harvest_weeks?: number | string | null;
  soil_requirements?: string | null;
  water_requirements?: string | null;
  common_pests?: string | null;
  notes?: string | null;
};

type ExpensePayload = {
  expense_date?: string | null;
  category: string;
  description: string;
  amount_usd: number | string;
  field_id?: string | null;
  crop_plan_id?: string | null;
  supplier?: string | null;
  receipt_ref?: string | null;
  notes?: string | null;
};

type RevenuePayload = {
  revenue_date?: string | null;
  category: string;
  description: string;
  amount_usd: number | string;
  quantity?: number | string | null;
  unit?: string | null;
  unit_price_usd?: number | string | null;
  buyer_name?: string | null;
  field_id?: string | null;
  crop_plan_id?: string | null;
  notes?: string | null;
};

type MarketPricePayload = {
  commodity: string;
  region?: string | null;
  price_usd: number | string;
  unit: string;
  price_date?: string | null;
  source?: string | null;
  demand_level?: string | null;
  notes?: string | null;
};

const farmOSService = {
  async getSubscription(): Promise<SubscriptionResponse> {
    const response = await api.get("/farm-os/subscription");
    return response.data;
  },

  async subscribeWithWallet(planId: string) {
    const response = await api.post("/farm-os/subscribe/wallet", { planId });
    return response.data;
  },

  async getFarm(): Promise<FarmResponse> {
    const response = await api.get("/farm-os/farm");
    return response.data;
  },

  async saveFarm(payload: FarmPayload) {
    const response = await api.post("/farm-os/farm", payload);
    return response.data;
  },

  async getFields(): Promise<FieldsResponse> {
    const response = await api.get("/farm-os/fields");
    return response.data;
  },

  async createField(payload: FieldPayload) {
    const response = await api.post("/farm-os/fields", payload);
    return response.data;
  },

  async updateField(id: string, payload: FieldPayload) {
    const response = await api.put(`/farm-os/fields/${id}`, payload);
    return response.data;
  },

  async deleteField(id: string) {
    const response = await api.delete(`/farm-os/fields/${id}`);
    return response.data;
  },

  async getWorkers(): Promise<WorkersResponse> {
    const response = await api.get("/farm-os/workers");
    return response.data;
  },

  async createWorker(payload: WorkerPayload) {
    const response = await api.post("/farm-os/workers", payload);
    return response.data;
  },

  async updateWorker(id: string, payload: WorkerPayload) {
    const response = await api.put(`/farm-os/workers/${id}`, payload);
    return response.data;
  },

  async getCropPlans(status?: string): Promise<CropPlansResponse> {
    const params: Record<string, string> = {};
    if (status) params.status = status;
    const response = await api.get("/farm-os/crop-plans", { params });
    return response.data;
  },

  async createCropPlan(payload: CropPlanPayload) {
    const response = await api.post("/farm-os/crop-plans", payload);
    return response.data;
  },

  async updateCropPlan(id: string, payload: CropPlanPayload) {
    const response = await api.put(`/farm-os/crop-plans/${id}`, payload);
    return response.data;
  },

  async getCropActivities(filters?: {
    crop_plan_id?: string;
    field_id?: string;
  }): Promise<CropActivitiesResponse> {
    const params: Record<string, string> = {};
    if (filters?.crop_plan_id) params.crop_plan_id = filters.crop_plan_id;
    if (filters?.field_id) params.field_id = filters.field_id;
    const response = await api.get("/farm-os/crop-activities", { params });
    return response.data;
  },

  async createCropActivity(payload: CropActivityPayload) {
    const response = await api.post("/farm-os/crop-activities", payload);
    return response.data;
  },

  async getLivestockGroups(): Promise<LivestockGroupsResponse> {
    const response = await api.get("/farm-os/livestock");
    return response.data;
  },

  async createLivestockGroup(payload: LivestockGroupPayload) {
    const response = await api.post("/farm-os/livestock", payload);
    return response.data;
  },

  async updateLivestockGroup(id: string, payload: LivestockGroupPayload) {
    const response = await api.put(`/farm-os/livestock/${id}`, payload);
    return response.data;
  },

  async getLivestockActivities(
    groupId?: string,
  ): Promise<LivestockActivitiesResponse> {
    const params: Record<string, string> = {};
    if (groupId) params.group_id = groupId;
    const response = await api.get("/farm-os/livestock-activities", { params });
    return response.data;
  },

  async createLivestockActivity(payload: LivestockActivityPayload) {
    const response = await api.post("/farm-os/livestock-activities", payload);
    return response.data;
  },

  async getLabourDays(filters?: {
    startDate?: string;
    endDate?: string;
    worker_id?: string;
    task_category?: string;
  }): Promise<LabourResponse> {
    const params: Record<string, string> = {};
    if (filters?.startDate) params.startDate = filters.startDate;
    if (filters?.endDate) params.endDate = filters.endDate;
    if (filters?.worker_id) params.worker_id = filters.worker_id;
    if (filters?.task_category) params.task_category = filters.task_category;
    const response = await api.get("/farm-os/labour", { params });
    return response.data;
  },

  async createLabourDay(payload: LabourPayload) {
    const response = await api.post("/farm-os/labour", payload);
    return response.data;
  },

  async deleteLabourDay(id: string) {
    const response = await api.delete(`/farm-os/labour/${id}`);
    return response.data;
  },

  async getInventory(itemType?: string): Promise<InventoryResponse> {
    const params: Record<string, string> = {};
    if (itemType) params.item_type = itemType;
    const response = await api.get("/farm-os/inventory", { params });
    return response.data;
  },

  async createInventoryItem(payload: InventoryPayload) {
    const response = await api.post("/farm-os/inventory", payload);
    return response.data;
  },

  async updateInventoryItem(id: string, payload: InventoryPayload) {
    const response = await api.put(`/farm-os/inventory/${id}`, payload);
    return response.data;
  },

  async recordInventoryUsage(payload: InventoryUsagePayload) {
    const response = await api.post("/farm-os/inventory/usage", payload);
    return response.data;
  },

  async getCroppingCalendar(): Promise<CalendarResponse> {
    const response = await api.get("/farm-os/calendar");
    return response.data;
  },

  async createCalendarEntry(payload: CalendarPayload) {
    const response = await api.post("/farm-os/calendar", payload);
    return response.data;
  },

  async getWeeklyReport(
    startDate?: string,
    endDate?: string,
  ): Promise<WeeklyReportResponse> {
    const params: Record<string, string> = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    const response = await api.get("/farm-os/reports/weekly", { params });
    return response.data;
  },

  async getMonthlyReport(
    year?: number,
    month?: number,
  ): Promise<MonthlyReportResponse> {
    const params: Record<string, string> = {};
    if (year) params.year = String(year);
    if (month) params.month = String(month);
    const response = await api.get("/farm-os/reports/monthly", { params });
    return response.data;
  },

  async getExpenses(filters?: {
    startDate?: string;
    endDate?: string;
    category?: string;
    crop_plan_id?: string;
    field_id?: string;
  }): Promise<ExpensesResponse> {
    const params: Record<string, string> = {};
    if (filters?.startDate) params.startDate = filters.startDate;
    if (filters?.endDate) params.endDate = filters.endDate;
    if (filters?.category) params.category = filters.category;
    if (filters?.crop_plan_id) params.crop_plan_id = filters.crop_plan_id;
    if (filters?.field_id) params.field_id = filters.field_id;
    const response = await api.get("/farm-os/expenses", { params });
    return response.data;
  },

  async createExpense(payload: ExpensePayload) {
    const response = await api.post("/farm-os/expenses", payload);
    return response.data;
  },

  async updateExpense(id: string, payload: Partial<ExpensePayload>) {
    const response = await api.put(`/farm-os/expenses/${id}`, payload);
    return response.data;
  },

  async deleteExpense(id: string) {
    const response = await api.delete(`/farm-os/expenses/${id}`);
    return response.data;
  },

  async getRevenue(filters?: {
    startDate?: string;
    endDate?: string;
    category?: string;
  }): Promise<RevenueResponse> {
    const params: Record<string, string> = {};
    if (filters?.startDate) params.startDate = filters.startDate;
    if (filters?.endDate) params.endDate = filters.endDate;
    if (filters?.category) params.category = filters.category;
    const response = await api.get("/farm-os/revenue", { params });
    return response.data;
  },

  async createRevenue(payload: RevenuePayload) {
    const response = await api.post("/farm-os/revenue", payload);
    return response.data;
  },

  async updateRevenue(id: string, payload: Partial<RevenuePayload>) {
    const response = await api.put(`/farm-os/revenue/${id}`, payload);
    return response.data;
  },

  async deleteRevenue(id: string) {
    const response = await api.delete(`/farm-os/revenue/${id}`);
    return response.data;
  },

  async getProfitability(
    year?: number,
    month?: number,
  ): Promise<ProfitabilityResponse> {
    const params: Record<string, string> = {};
    if (year) params.year = String(year);
    if (month) params.month = String(month);
    const response = await api.get("/farm-os/profitability", { params });
    return response.data;
  },

  async getMarketPrices(): Promise<MarketPricesResponse> {
    const response = await api.get("/farm-os/market");
    return response.data;
  },

  async createMarketPrice(payload: MarketPricePayload) {
    const response = await api.post("/farm-os/market", payload);
    return response.data;
  },

  async generateMarketInsights(): Promise<MarketInsightsResponse> {
    const response = await api.post("/farm-os/market/insights", {});
    return response.data;
  },

  async getAnalytics(): Promise<AnalyticsResponse> {
    const response = await api.get("/farm-os/analytics");
    return response.data;
  },

  async generateSeasonalPredictions(): Promise<SeasonalPredictionsResponse> {
    const response = await api.post("/farm-os/analytics/predict", {});
    return response.data;
  },

  async exportCSV(
    type: string,
    startDate?: string,
    endDate?: string,
  ): Promise<string> {
    const params: Record<string, string> = { type };
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    const response = await api.get("/farm-os/export/csv", {
      params,
      responseType: "text",
    });
    return response.data;
  },

  async exportMonthlyReport(year: number, month: number): Promise<string> {
    const response = await api.get("/farm-os/export/report", {
      params: { year: String(year), month: String(month) },
      responseType: "text",
    });
    return response.data;
  },
};

export default farmOSService;
