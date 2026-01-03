import api from "./api";
import type {
  ExportAssessment,
  MarketIntelligence,
  DocumentTemplate,
  LogisticsPartner,
} from "../types";

const exportService = {
  // Export Assessments
  async createAssessment(data: {
    productType: string;
    targetMarkets: string[];
    productionCapacity?: string;
    certifications?: string[];
    packagingCapability?: boolean;
    qualityControls?: boolean;
    financialCapacity?: string;
  }) {
    const response = await api.post("/export/assessments", data);
    return response.data;
  },

  async getAssessments() {
    const response = await api.get("/export/assessments");
    return response.data;
  },

  async getAssessmentById(assessmentId: string) {
    const response = await api.get(`/export/assessments/${assessmentId}`);
    return response.data;
  },

  // Market Intelligence
  async getMarketIntelligence(params?: {
    market?: string;
    productCategory?: string;
  }) {
    const response = await api.get("/export/market-intelligence", { params });
    return response.data;
  },

  // Document Templates
  async getDocumentTemplates() {
    const response = await api.get("/export/document-templates");
    return response.data;
  },

  // Logistics Partners
  async getLogisticsPartners(params?: {
    serviceType?: string;
    market?: string;
  }) {
    const response = await api.get("/export/logistics-partners", { params });
    return response.data;
  },

  // Compliance Checklists
  async createComplianceChecklist(data: {
    market: string;
    productType: string;
    assessmentId?: string;
  }) {
    const response = await api.post("/export/compliance-checklists", data);
    return response.data;
  },

  async getComplianceChecklists() {
    const response = await api.get("/export/compliance-checklists");
    return response.data;
  },

  async updateComplianceChecklist(
    checklistId: string,
    completedItems: string[]
  ) {
    const response = await api.put(
      `/export/compliance-checklists/${checklistId}`,
      { completedItems }
    );
    return response.data;
  },
};

export default exportService;
