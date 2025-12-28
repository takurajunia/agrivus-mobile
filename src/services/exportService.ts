import api from "./api";

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

export interface ComplianceChecklist {
  id: string;
  userId: string;
  assessmentId: string | null;
  market: string;
  productType: string;
  items: any[];
  completedItems: string[];
  completionPercentage: string;
  status: string;
  verifiedBy: string | null;
  verifiedAt: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

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
