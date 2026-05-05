import api from "./api";
import type {
  FarmLogAccessStatus,
  FarmLogDailyReport,
  FarmLogEntry,
  FarmLogInput,
  FarmLogPlan,
  FarmLogSubscription,
  FarmLogWeeklyReport,
  FarmLogYield,
} from "../types";

type SubscriptionResponse = {
  success: boolean;
  data: {
    subscription: FarmLogSubscription | null;
    access: FarmLogAccessStatus;
    trialDaysLeft: number;
  };
};

type PlansResponse = {
  success: boolean;
  data: { plans: FarmLogPlan[] };
};

type LogsResponse = {
  success: boolean;
  data: {
    logs: FarmLogEntry[];
    pagination?: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
};

type WeeklyReportResponse = {
  success: boolean;
  data: FarmLogWeeklyReport;
};

type DailyReportResponse = {
  success: boolean;
  data: FarmLogDailyReport;
};

type LogPayload = {
  log_date?: string;
  activity_type: string;
  crop?: string | null;
  field_area?: string | null;
  description?: string | null;
  weather?: string | null;
  notes?: string | null;
  inputs?: Array<{
    input_type: string;
    name: string;
    quantity?: number | null;
    unit?: string | null;
    cost_usd?: number | null;
    supplier?: string | null;
  }>;
  yields?: Array<{
    crop: string;
    quantity: number;
    unit: string;
    quality?: string | null;
    notes?: string | null;
  }>;
};

type LogFilters = {
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
  activityType?: string;
};

const farmLogService = {
  async getSubscription(): Promise<SubscriptionResponse> {
    const response = await api.get("/farm-log/subscription");
    return response.data;
  },

  async getPlans(): Promise<PlansResponse> {
    const response = await api.get("/farm-log/plans");
    return response.data;
  },

  async subscribeWithWallet(planId: string) {
    const response = await api.post("/farm-log/subscribe/wallet", { planId });
    return response.data;
  },

  async subscribeWithPaynow(planId: string, paymentMethod = "ecocash") {
    const response = await api.post("/farm-log/subscribe/paynow", {
      planId,
      paymentMethod,
    });
    return response.data;
  },

  async getLogs(filters?: LogFilters): Promise<LogsResponse> {
    const params: Record<string, string> = {};

    if (filters?.page) params.page = filters.page.toString();
    if (filters?.limit) params.limit = filters.limit.toString();
    if (filters?.startDate) params.startDate = filters.startDate;
    if (filters?.endDate) params.endDate = filters.endDate;
    if (filters?.activityType) params.activity_type = filters.activityType;

    const response = await api.get("/farm-log/logs", { params });
    return response.data;
  },

  async createLog(payload: LogPayload) {
    const response = await api.post("/farm-log/logs", payload);
    return response.data;
  },

  async updateLog(id: string, payload: LogPayload) {
    const response = await api.put(`/farm-log/logs/${id}`, payload);
    return response.data;
  },

  async deleteLog(id: string) {
    const response = await api.delete(`/farm-log/logs/${id}`);
    return response.data;
  },

  async addInput(logId: string, input: FarmLogInput) {
    const response = await api.post(`/farm-log/logs/${logId}/inputs`, input);
    return response.data;
  },

  async deleteInput(inputId: string) {
    const response = await api.delete(`/farm-log/inputs/${inputId}`);
    return response.data;
  },

  async addYield(logId: string, entry: FarmLogYield) {
    const response = await api.post(`/farm-log/logs/${logId}/yields`, entry);
    return response.data;
  },

  async deleteYield(yieldId: string) {
    const response = await api.delete(`/farm-log/yields/${yieldId}`);
    return response.data;
  },

  async getWeeklyReport(startDate?: string, endDate?: string) {
    const params: Record<string, string> = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;

    const response = await api.get<WeeklyReportResponse>(
      "/farm-log/reports/weekly",
      { params },
    );
    return response.data;
  },

  async getDailyReport(date?: string) {
    const params: Record<string, string> = {};
    if (date) params.date = date;

    const response = await api.get<DailyReportResponse>(
      "/farm-log/reports/daily",
      { params },
    );
    return response.data;
  },
};

export default farmLogService;
