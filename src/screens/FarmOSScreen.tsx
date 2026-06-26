import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Dimensions,
  KeyboardAvoidingView,
  Modal,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import { useRouter } from "expo-router";
import { ChevronDown, ClipboardList, Plus, X } from "lucide-react-native";
import Svg, {
  Circle,
  G,
  Line as SvgLine,
  Path,
  Rect,
  Text as SvgText,
} from "react-native-svg";
import {
  NeumorphicBadge,
  NeumorphicButton,
  NeumorphicCard,
  NeumorphicInput,
  NeumorphicScreen,
} from "../components/neumorphic";
import LoadingSpinner from "../components/LoadingSpinner";
import { useAuth } from "../contexts/AuthContext";
import { useNetworkStatus } from "../hooks/useNetworkStatus";
import farmOSService from "../services/farmOSService";
import {
  applyQueueItemToStoredCache,
  createLocalId,
  enqueueFarmOSMutation,
  getFarmOSPendingCount,
  getFarmOSQueue,
  isLocalId,
  loadFarmOSCache,
  mergeCacheWithQueue,
  removeQueuedCreate,
  syncFarmOSQueue,
  updateFarmOSCache,
  updateQueuedCreate,
  type FarmOSCache,
  type FarmOSQueueItem,
} from "../services/farmOSOfflineStore";
import type {
  FarmOSAccessStatus,
  FarmOSCalendarEntry,
  FarmOSCropActivity,
  FarmOSCropPlan,
  FarmOSFarm,
  FarmOSField,
  FarmOSInventoryItem,
  FarmOSInventorySummary,
  FarmOSLabourCategorySummary,
  FarmOSLabourDay,
  FarmOSLabourSummary,
  FarmOSLivestockActivity,
  FarmOSLivestockGroup,
  FarmOSMonthlyReport,
  FarmOSPlan,
  FarmOSProfitability,
  FarmOSExpense,
  FarmOSExpenseSummary,
  FarmOSRevenue,
  FarmOSRevenueSummary,
  FarmOSMarketPrice,
  FarmOSMarketInsights,
  FarmOSAnalyticsData,
  FarmOSSeasonalPredictions,
  FarmOSSubscription,
  FarmOSWeeklyReport,
  FarmOSWorker,
} from "../types";
import { neumorphicColors, spacing, borderRadius } from "../theme/neumorphic";

type FarmOSWorkerWithDob = FarmOSWorker & {
  date_of_birth?: string | null;
};

type SectionKey =
  | "setup"
  | "crops"
  | "livestock"
  | "labour"
  | "inventory"
  | "ledger"
  | "profitability"
  | "market"
  | "calendar"
  | "reports"
  | "analytics";

type FarmFormState = {
  name: string;
  location: string;
  total_area_ha: string;
  gps_lat: string;
  gps_lng: string;
  water_sources: string;
  notes: string;
};

type FieldFormState = {
  name: string;
  area_ha: string;
  soil_type: string;
  irrigation_type: string;
  current_use: string;
  status: string;
  notes: string;
};

type WorkerFormState = {
  full_name: string;
  phone: string;
  role: string;
  date_of_birth: string;
  daily_wage_usd: string;
};

type CropPlanFormState = {
  field_id: string;
  crop_type: string;
  variety: string;
  planned_area_ha: string;
  planned_area_unit: AreaUnit;
  planting_date: string;
  expected_harvest_date: string;
  expected_yield_kg: string;
  season: string;
  status: string;
  notes: string;
};

type CropActivityFormState = {
  crop_plan_id: string;
  field_id: string;
  activity_type: string;
  activity_date: string;
  area_covered_ha: string;
  inputs_used: string;
  description: string;
  notes: string;
  logged_by: string;
};

type LivestockGroupFormState = {
  field_id: string;
  species: string;
  breed: string;
  count: string;
  purpose: string;
  date_acquired: string;
  notes: string;
};

type LivestockActivityFormState = {
  livestock_group_id: string;
  activity_type: string;
  activity_date: string;
  count_affected: string;
  quantity: string;
  unit: string;
  cost_usd: string;
  description: string;
  notes: string;
  logged_by: string;
};

type LabourFormState = {
  worker_id: string;
  field_id: string;
  work_date: string;
  task_category: string;
  hours_worked: string;
  area_covered_ha: string;
  wage_usd: string;
  notes: string;
};

type InventoryFormState = {
  item_type: string;
  name: string;
  quantity: string;
  unit: string;
  unit_cost_usd: string;
  reorder_level: string;
  expiry_date: string;
  supplier: string;
};

type InventoryUsageFormState = {
  inventory_id: string;
  quantity_used: string;
  field_id: string;
  crop_plan_id: string;
  used_date: string;
  notes: string;
};

type CalendarFormState = {
  crop_type: string;
  region: string;
  recommended_planting_start: string;
  recommended_planting_end: string;
  expected_harvest_weeks: string;
  soil_requirements: string;
  water_requirements: string;
  common_pests: string;
  notes: string;
};

type ExpenseFormState = {
  expense_date: string;
  category: string;
  description: string;
  amount_usd: string;
  field_id: string;
  crop_plan_id: string;
  supplier: string;
  receipt_ref: string;
  notes: string;
};

type RevenueFormState = {
  revenue_date: string;
  category: string;
  description: string;
  amount_usd: string;
  quantity: string;
  unit: string;
  unit_price_usd: string;
  buyer_name: string;
  field_id: string;
  crop_plan_id: string;
  notes: string;
};

type MarketPriceFormState = {
  commodity: string;
  region: string;
  price_usd: string;
  unit: string;
  price_date: string;
  source: string;
  demand_level: string;
  notes: string;
};

const AREA_UNIT_OPTIONS = [
  { id: "ha", label: "Hectares (ha)" },
  { id: "acre", label: "Acres (ac)" },
  { id: "are", label: "Ares (a)" },
  { id: "m2", label: "Square meters (m2)" },
] as const;

type AreaUnit = (typeof AREA_UNIT_OPTIONS)[number]["id"];

const AREA_UNIT_TO_HA: Record<AreaUnit, number> = {
  ha: 1,
  acre: 0.40468564224,
  are: 0.01,
  m2: 0.0001,
};

const todayIso = () => new Date().toISOString().split("T")[0];

const toOptionalNumber = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : null;
};

const formatCurrency = (value: number | string | null | undefined) => {
  const numeric = Number.parseFloat(String(value ?? "0"));
  return `$${Number.isFinite(numeric) ? numeric.toFixed(2) : "0.00"}`;
};

const toCurrencyNumber = (
  value: number | string | null | undefined,
): number => {
  const numeric = Number.parseFloat(String(value ?? "0"));
  return Number.isFinite(numeric) ? numeric : 0;
};

const formatAreaValue = (value: number) => {
  const rounded = Number(value.toFixed(6));
  return Number.isFinite(rounded) ? String(rounded) : "";
};

const convertAreaValue = (
  value: number,
  fromUnit: AreaUnit,
  toUnit: AreaUnit,
) => (value * AREA_UNIT_TO_HA[fromUnit]) / AREA_UNIT_TO_HA[toUnit];

const getAreaUnitLabel = (unit: AreaUnit) =>
  AREA_UNIT_OPTIONS.find((option) => option.id === unit)?.label ??
  AREA_UNIT_OPTIONS[0].label;

const convertAreaInput = (
  value: string,
  fromUnit: AreaUnit,
  toUnit: AreaUnit,
) => {
  const numeric = toOptionalNumber(value);
  if (numeric === null) return value;
  return formatAreaValue(convertAreaValue(numeric, fromUnit, toUnit));
};

const formatDate = (value?: string | null) => {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString();
};

const formatPercent = (value: number | string | null | undefined) => {
  const numeric = Number.parseFloat(String(value ?? "0"));
  if (!Number.isFinite(numeric)) return "0%";
  return `${numeric.toFixed(1)}%`;
};

const CHART_COLORS = {
  revenue: "#06d6a0",
  expenses: "#e63946",
  profit: "#118ab2",
  expected: "#a7f3d0",
  actual: "#2d6a4f",
  labour: "#8b5cf6",
};

const CHART_PALETTE = [
  "#2d6a4f",
  "#ff9f1c",
  "#118ab2",
  "#e63946",
  "#06d6a0",
  "#ffb703",
  "#52796f",
  "#8b5cf6",
];

const toChartNumber = (value: number | string | null | undefined): number => {
  const numeric = Number.parseFloat(String(value ?? "0"));
  return Number.isFinite(numeric) ? numeric : 0;
};

const buildLinePoints = (
  values: number[],
  width: number,
  height: number,
  padding: number,
  minValue: number,
  maxValue: number,
) => {
  const count = values.length;
  if (count === 0) return [];
  const range = Math.max(maxValue - minValue, 1);
  return values.map((value, index) => {
    const x =
      padding + (index / Math.max(count - 1, 1)) * (width - padding * 2);
    const y =
      height - padding - ((value - minValue) / range) * (height - padding * 2);
    return { x, y };
  });
};

const pointsToPath = (points: Array<{ x: number; y: number }>) => {
  if (points.length === 0) return "";
  return points
    .map((point, index) => `${index === 0 ? "M" : "L"}${point.x} ${point.y}`)
    .join(" ");
};

const formatChartLabel = (label: string | null | undefined, maxLength = 12) => {
  const normalized = String(label ?? "")
    .replace(/_/g, " ")
    .trim();
  if (!normalized) return "";
  if (normalized.length <= maxLength) return normalized;
  const sliceLength = Math.max(maxLength - 3, 1);
  return `${normalized.slice(0, sliceLength)}...`;
};

const polarToCartesian = (
  centerX: number,
  centerY: number,
  radius: number,
  angleInDegrees: number,
) => {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  };
};

const describeArc = (
  x: number,
  y: number,
  radius: number,
  startAngle: number,
  endAngle: number,
) => {
  const start = polarToCartesian(x, y, radius, endAngle);
  const end = polarToCartesian(x, y, radius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
  return `M ${x} ${y} L ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 0 ${end.x} ${end.y} Z`;
};

const buildPieSlices = (values: number[], startAngle = -90) => {
  const safeValues = values.map((value) => Math.max(value, 0));
  const total = safeValues.reduce((sum, value) => sum + value, 0);
  let cursor = startAngle;
  return safeValues.map((value) => {
    const sliceAngle = total > 0 ? (value / total) * 360 : 0;
    const slice = {
      startAngle: cursor,
      endAngle: cursor + sliceAngle,
      percent: total > 0 ? value / total : 0,
    };
    cursor += sliceAngle;
    return slice;
  });
};

const getChartLabelIndexes = (count: number) => {
  if (count <= 0) return [] as number[];
  if (count <= 4) return Array.from({ length: count }, (_, index) => index);
  return [0, Math.floor(count / 2), count - 1];
};

const ChartContainer: React.FC<{
  height: number;
  children: (width: number, height: number) => React.ReactNode;
}> = ({ height, children }) => {
  const [width, setWidth] = useState(0);

  const onLayout = useCallback(
    (event: any) => {
      const nextWidth = event?.nativeEvent?.layout?.width ?? 0;
      if (nextWidth > 0 && nextWidth !== width) {
        setWidth(nextWidth);
      }
    },
    [width],
  );

  return (
    <View style={[styles.chartContainer, { height }]} onLayout={onLayout}>
      {width > 0 ? children(width, height) : null}
    </View>
  );
};

const ACTIVITY_TYPES = [
  "planting",
  "fertilising",
  "spraying",
  "irrigation",
  "weeding",
  "pruning",
  "harvesting",
  "inspection",
  "other",
];

const LIVESTOCK_SPECIES = [
  "cattle",
  "goat",
  "sheep",
  "poultry",
  "pig",
  "fish",
  "bees",
  "other",
];

const LIVESTOCK_ACTIVITY_TYPES = [
  "birth",
  "death",
  "vaccination",
  "feeding",
  "treatment",
  "breeding",
  "sale",
  "purchase",
  "weighing",
  "milking",
  "other",
];

const LABOUR_TASKS = [
  "land_prep",
  "planting",
  "weeding",
  "spraying",
  "harvesting",
  "irrigation",
  "maintenance",
  "construction",
  "livestock_care",
  "other",
];

const INVENTORY_TYPES = [
  "seed",
  "fertiliser",
  "chemical",
  "feed",
  "fuel",
  "equipment",
  "other",
];

const WORKER_ROLES = ["owner", "manager", "worker"];

const CROP_PLAN_STATUSES = [
  "planned",
  "active",
  "harvested",
  "failed",
  "cancelled",
];

const EXPENSE_CATEGORIES = [
  "labour",
  "seeds",
  "fertiliser",
  "chemicals",
  "fuel",
  "equipment",
  "irrigation",
  "transport",
  "veterinary",
  "repairs",
  "rent",
  "other",
];

const REVENUE_CATEGORIES = [
  "crop_sale",
  "livestock_sale",
  "milk",
  "eggs",
  "wool",
  "honey",
  "contract",
  "grant",
  "other",
];

const DEMAND_LEVELS = ["low", "medium", "high", "very_high"];

const SECTIONS: Array<{ key: SectionKey; label: string }> = [
  { key: "setup", label: "Setup" },
  { key: "crops", label: "Crops" },
  { key: "livestock", label: "Livestock" },
  { key: "labour", label: "Labour" },
  { key: "inventory", label: "Inventory" },
  { key: "ledger", label: "Ledger" },
  { key: "profitability", label: "Profit" },
  { key: "market", label: "Market" },
  { key: "calendar", label: "Calendar" },
  { key: "reports", label: "Reports" },
  { key: "analytics", label: "Analytics" },
];

interface FormModalProps {
  visible: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

const FormModal: React.FC<FormModalProps> = ({
  visible,
  title,
  onClose,
  children,
  footer,
}) => (
  <Modal visible={visible} transparent animationType="slide">
    <View style={styles.modalBackdrop}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.modalWrapper}
      >
        <NeumorphicCard style={styles.modalCard} variant="elevated">
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{title}</Text>
            <TouchableOpacity onPress={onClose} style={styles.modalClose}>
              <X size={18} color={neumorphicColors.text.secondary} />
            </TouchableOpacity>
          </View>
          <ScrollView showsVerticalScrollIndicator={false}>
            {children}
          </ScrollView>
          {footer}
        </NeumorphicCard>
      </KeyboardAvoidingView>
    </View>
  </Modal>
);

export default function FarmOSScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { isOnline } = useNetworkStatus();
  const [subLoading, setSubLoading] = useState(true);
  const [subscription, setSubscription] = useState<FarmOSSubscription | null>(
    null,
  );
  const [access, setAccess] = useState<FarmOSAccessStatus>("none");
  const [plans, setPlans] = useState<FarmOSPlan[]>([]);
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [activeSection, setActiveSection] = useState<SectionKey>("setup");
  const [sectionLoading, setSectionLoading] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [syncing, setSyncing] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);

  const [farm, setFarm] = useState<FarmOSFarm | null>(null);
  const [fields, setFields] = useState<FarmOSField[]>([]);
  const [workers, setWorkers] = useState<FarmOSWorker[]>([]);
  const [cropPlans, setCropPlans] = useState<FarmOSCropPlan[]>([]);
  const [cropActivities, setCropActivities] = useState<FarmOSCropActivity[]>(
    [],
  );
  const [livestockGroups, setLivestockGroups] = useState<
    FarmOSLivestockGroup[]
  >([]);
  const [livestockActivities, setLivestockActivities] = useState<
    FarmOSLivestockActivity[]
  >([]);
  const [labourDays, setLabourDays] = useState<FarmOSLabourDay[]>([]);
  const [labourSummary, setLabourSummary] =
    useState<FarmOSLabourSummary | null>(null);
  const [labourByCategory, setLabourByCategory] = useState<
    FarmOSLabourCategorySummary[]
  >([]);
  const [inventory, setInventory] = useState<FarmOSInventoryItem[]>([]);
  const [inventorySummary, setInventorySummary] = useState<
    FarmOSInventorySummary[]
  >([]);
  const [inventoryAlerts, setInventoryAlerts] = useState<FarmOSInventoryItem[]>(
    [],
  );
  const [calendarEntries, setCalendarEntries] = useState<FarmOSCalendarEntry[]>(
    [],
  );
  const [plantingNow, setPlantingNow] = useState<FarmOSCalendarEntry[]>([]);
  const [weeklyReport, setWeeklyReport] = useState<FarmOSWeeklyReport | null>(
    null,
  );
  const [monthlyReport, setMonthlyReport] =
    useState<FarmOSMonthlyReport | null>(null);

  const [financeYear, setFinanceYear] = useState(
    String(new Date().getFullYear()),
  );
  const [financeMonth, setFinanceMonth] = useState(
    String(new Date().getMonth() + 1).padStart(2, "0"),
  );
  const [expenses, setExpenses] = useState<FarmOSExpense[]>([]);
  const [expenseSummary, setExpenseSummary] =
    useState<FarmOSExpenseSummary | null>(null);
  const [revenueEntries, setRevenueEntries] = useState<FarmOSRevenue[]>([]);
  const [revenueSummary, setRevenueSummary] =
    useState<FarmOSRevenueSummary | null>(null);
  const [profitability, setProfitability] =
    useState<FarmOSProfitability | null>(null);
  const [marketPrices, setMarketPrices] = useState<FarmOSMarketPrice[]>([]);
  const [marketInsights, setMarketInsights] =
    useState<FarmOSMarketInsights | null>(null);
  const [marketGeneratedAt, setMarketGeneratedAt] = useState<string | null>(
    null,
  );
  const [marketGenerating, setMarketGenerating] = useState(false);

  const [analytics, setAnalytics] = useState<FarmOSAnalyticsData | null>(null);
  const [predictions, setPredictions] =
    useState<FarmOSSeasonalPredictions | null>(null);
  const [predictionsGeneratedAt, setPredictionsGeneratedAt] = useState<
    string | null
  >(null);
  const [predictionsLoading, setPredictionsLoading] = useState(false);
  const [exportingType, setExportingType] = useState<string | null>(null);
  const [reportExporting, setReportExporting] = useState(false);

  const [reportMode, setReportMode] = useState<"weekly" | "monthly">("weekly");
  const [monthlyYear, setMonthlyYear] = useState(
    String(new Date().getFullYear()),
  );
  const [monthlyMonth, setMonthlyMonth] = useState(
    String(new Date().getMonth() + 1).padStart(2, "0"),
  );
  const [labourStartDate, setLabourStartDate] = useState(
    new Date(new Date().setDate(1)).toISOString().split("T")[0],
  );
  const [labourEndDate, setLabourEndDate] = useState(todayIso());

  const [farmModalOpen, setFarmModalOpen] = useState(false);
  const [fieldModalOpen, setFieldModalOpen] = useState(false);
  const [editingFieldId, setEditingFieldId] = useState<string | null>(null);
  const [workerModalOpen, setWorkerModalOpen] = useState(false);
  const [editingWorkerId, setEditingWorkerId] = useState<string | null>(null);
  const [cropPlanModalOpen, setCropPlanModalOpen] = useState(false);
  const [editingCropPlanId, setEditingCropPlanId] = useState<string | null>(
    null,
  );
  const [cropActivityModalOpen, setCropActivityModalOpen] = useState(false);
  const [livestockGroupModalOpen, setLivestockGroupModalOpen] = useState(false);
  const [editingLivestockGroupId, setEditingLivestockGroupId] = useState<
    string | null
  >(null);
  const [livestockActivityModalOpen, setLivestockActivityModalOpen] =
    useState(false);
  const [labourModalOpen, setLabourModalOpen] = useState(false);
  const [inventoryModalOpen, setInventoryModalOpen] = useState(false);
  const [editingInventoryId, setEditingInventoryId] = useState<string | null>(
    null,
  );
  const [inventoryUsageModalOpen, setInventoryUsageModalOpen] = useState(false);
  const [calendarModalOpen, setCalendarModalOpen] = useState(false);

  const [expenseModalOpen, setExpenseModalOpen] = useState(false);
  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null);
  const [revenueModalOpen, setRevenueModalOpen] = useState(false);
  const [editingRevenueId, setEditingRevenueId] = useState<string | null>(null);
  const [marketPriceModalOpen, setMarketPriceModalOpen] = useState(false);

  const [farmForm, setFarmForm] = useState<FarmFormState>({
    name: "",
    location: "",
    total_area_ha: "",
    gps_lat: "",
    gps_lng: "",
    water_sources: "",
    notes: "",
  });
  const [fieldForm, setFieldForm] = useState<FieldFormState>({
    name: "",
    area_ha: "",
    soil_type: "",
    irrigation_type: "",
    current_use: "",
    status: "",
    notes: "",
  });
  const [workerForm, setWorkerForm] = useState<WorkerFormState>({
    full_name: "",
    phone: "",
    role: "worker",
    date_of_birth: "",
    daily_wage_usd: "",
  });
  const [cropPlanForm, setCropPlanForm] = useState<CropPlanFormState>({
    field_id: "",
    crop_type: "",
    variety: "",
    planned_area_ha: "",
    planned_area_unit: "ha",
    planting_date: "",
    expected_harvest_date: "",
    expected_yield_kg: "",
    season: "",
    status: "planned",
    notes: "",
  });
  const [cropPlanAreaUnitPickerOpen, setCropPlanAreaUnitPickerOpen] =
    useState(false);
  const [cropActivityForm, setCropActivityForm] =
    useState<CropActivityFormState>({
      crop_plan_id: "",
      field_id: "",
      activity_type: "planting",
      activity_date: todayIso(),
      area_covered_ha: "",
      inputs_used: "",
      description: "",
      notes: "",
      logged_by: "",
    });
  const [livestockGroupForm, setLivestockGroupForm] =
    useState<LivestockGroupFormState>({
      field_id: "",
      species: "cattle",
      breed: "",
      count: "",
      purpose: "",
      date_acquired: "",
      notes: "",
    });
  const [livestockActivityForm, setLivestockActivityForm] =
    useState<LivestockActivityFormState>({
      livestock_group_id: "",
      activity_type: "feeding",
      activity_date: todayIso(),
      count_affected: "",
      quantity: "",
      unit: "",
      cost_usd: "",
      description: "",
      notes: "",
      logged_by: "",
    });
  const [labourForm, setLabourForm] = useState<LabourFormState>({
    worker_id: "",
    field_id: "",
    work_date: todayIso(),
    task_category: "planting",
    hours_worked: "",
    area_covered_ha: "",
    wage_usd: "",
    notes: "",
  });
  const [inventoryForm, setInventoryForm] = useState<InventoryFormState>({
    item_type: "seed",
    name: "",
    quantity: "",
    unit: "",
    unit_cost_usd: "",
    reorder_level: "",
    expiry_date: "",
    supplier: "",
  });
  const [inventoryUsageForm, setInventoryUsageForm] =
    useState<InventoryUsageFormState>({
      inventory_id: "",
      quantity_used: "",
      field_id: "",
      crop_plan_id: "",
      used_date: todayIso(),
      notes: "",
    });
  const [calendarForm, setCalendarForm] = useState<CalendarFormState>({
    crop_type: "",
    region: "",
    recommended_planting_start: "",
    recommended_planting_end: "",
    expected_harvest_weeks: "",
    soil_requirements: "",
    water_requirements: "",
    common_pests: "",
    notes: "",
  });

  const [expenseForm, setExpenseForm] = useState<ExpenseFormState>({
    expense_date: todayIso(),
    category: "labour",
    description: "",
    amount_usd: "",
    field_id: "",
    crop_plan_id: "",
    supplier: "",
    receipt_ref: "",
    notes: "",
  });

  const [revenueForm, setRevenueForm] = useState<RevenueFormState>({
    revenue_date: todayIso(),
    category: "crop_sale",
    description: "",
    amount_usd: "",
    quantity: "",
    unit: "kg",
    unit_price_usd: "",
    buyer_name: "",
    field_id: "",
    crop_plan_id: "",
    notes: "",
  });

  const [marketPriceForm, setMarketPriceForm] = useState<MarketPriceFormState>({
    commodity: "",
    region: "",
    price_usd: "",
    unit: "kg",
    price_date: todayIso(),
    source: "",
    demand_level: "medium",
    notes: "",
  });

  const canAccess = access === "trial" || access === "active";

  const setIfDefined = <T,>(
    value: T | undefined,
    setter: (next: T) => void,
  ) => {
    if (value !== undefined) {
      setter(value);
    }
  };

  const applyCacheToState = useCallback((cache: FarmOSCache) => {
    if (cache.subscription) {
      setSubscription(cache.subscription.subscription ?? null);
      setAccess(cache.subscription.access);
      setPlans(cache.subscription.plans ?? []);
    }

    setIfDefined(cache.farm, setFarm);
    setIfDefined(cache.fields, setFields);
    setIfDefined(cache.workers, setWorkers);
    setIfDefined(cache.cropPlans, setCropPlans);
    setIfDefined(cache.cropActivities, setCropActivities);
    setIfDefined(cache.livestockGroups, setLivestockGroups);
    setIfDefined(cache.livestockActivities, setLivestockActivities);

    if (cache.labour) {
      setLabourDays(cache.labour.labourDays ?? []);
      setLabourSummary(cache.labour.summary ?? null);
      setLabourByCategory(cache.labour.byCategory ?? []);
    }

    if (cache.inventory) {
      setInventory(cache.inventory.inventory ?? []);
      setInventorySummary(cache.inventory.summary ?? []);
      setInventoryAlerts(cache.inventory.alerts ?? []);
    }

    if (cache.calendar) {
      setCalendarEntries(cache.calendar.calendar ?? []);
      setPlantingNow(cache.calendar.plantingNow ?? []);
    }

    setIfDefined(cache.weeklyReport, setWeeklyReport);
    setIfDefined(cache.monthlyReport, setMonthlyReport);

    if (cache.expenses) {
      setExpenses(cache.expenses.expenses ?? []);
      setExpenseSummary(cache.expenses.summary ?? null);
    }

    if (cache.revenue) {
      setRevenueEntries(cache.revenue.revenue ?? []);
      setRevenueSummary(cache.revenue.summary ?? null);
    }

    setIfDefined(cache.profitability, setProfitability);

    if (cache.market) {
      setMarketPrices(cache.market.prices ?? []);
      setMarketInsights(cache.market.insights ?? null);
      setMarketGeneratedAt(cache.market.generatedAt ?? null);
    }

    setIfDefined(cache.analytics, setAnalytics);

    if (cache.predictions) {
      setPredictions(cache.predictions.data ?? null);
      setPredictionsGeneratedAt(cache.predictions.generatedAt ?? null);
    }

    if (cache.lastSyncedAt !== undefined) {
      setLastSyncedAt(cache.lastSyncedAt ?? null);
    }
  }, []);

  const applyCacheWithQueue = useCallback(async () => {
    const cache = await loadFarmOSCache();
    if (!cache) return;
    const queue = await getFarmOSQueue();
    const merged = mergeCacheWithQueue(cache, queue);
    applyCacheToState(merged);
  }, [applyCacheToState]);

  const refreshPendingCount = useCallback(async () => {
    const count = await getFarmOSPendingCount();
    setPendingCount(count);
  }, []);

  const buildQueueItem = (
    item: Omit<FarmOSQueueItem, "id" | "createdAt">,
  ): FarmOSQueueItem => ({
    id: createLocalId(),
    createdAt: new Date().toISOString(),
    ...item,
  });

  const enqueueOfflineMutation = useCallback(
    async (item: FarmOSQueueItem, alertTitle = "Saved offline") => {
      await enqueueFarmOSMutation(item);
      const updatedCache = await applyQueueItemToStoredCache(item);
      applyCacheToState(updatedCache);
      await refreshPendingCount();
      Alert.alert(alertTitle, "We will sync this when you are back online.");
    },
    [applyCacheToState, refreshPendingCount],
  );

  const guardOffline = useCallback(async () => {
    if (isOnline) return false;
    await applyCacheWithQueue();
    return true;
  }, [applyCacheWithQueue, isOnline]);

  const updateLocalQueuedMutation = useCallback(
    async (
      entity: FarmOSQueueItem["entity"],
      localId: string,
      data: Record<string, any>,
    ) => {
      await updateQueuedCreate(entity, localId, data);
      const updatedCache = await applyQueueItemToStoredCache({
        id: createLocalId(),
        createdAt: new Date().toISOString(),
        entity,
        action: "update",
        method: "put",
        url: "",
        data,
        targetId: localId,
      });
      applyCacheToState(updatedCache);
      await refreshPendingCount();
      Alert.alert(
        "Saved offline",
        "We will sync this when you are back online.",
      );
    },
    [applyCacheToState, refreshPendingCount],
  );

  const deleteLocalQueuedMutation = useCallback(
    async (entity: FarmOSQueueItem["entity"], localId: string) => {
      await removeQueuedCreate(entity, localId);
      const updatedCache = await applyQueueItemToStoredCache({
        id: createLocalId(),
        createdAt: new Date().toISOString(),
        entity,
        action: "delete",
        method: "delete",
        url: "",
        targetId: localId,
      });
      applyCacheToState(updatedCache);
      await refreshPendingCount();
      Alert.alert(
        "Deleted offline",
        "We will sync this when you are back online.",
      );
    },
    [applyCacheToState, refreshPendingCount],
  );

  useEffect(() => {
    if (user && user.role !== "farmer" && user.role !== "admin") {
      Alert.alert("Access denied", "Farm OS is available to farm owners.");
      router.replace("/(tabs)/index");
    }
  }, [user, router]);

  useEffect(() => {
    void (async () => {
      await applyCacheWithQueue();
      await refreshPendingCount();
    })();
  }, [applyCacheWithQueue, refreshPendingCount]);

  const loadSubscription =
    useCallback(async (): Promise<FarmOSAccessStatus> => {
      setSubLoading(true);
      if (!isOnline) {
        const cached = await loadFarmOSCache();
        if (cached?.subscription) {
          setSubscription(cached.subscription.subscription ?? null);
          setAccess(cached.subscription.access);
          setPlans(cached.subscription.plans ?? []);
          setSubLoading(false);
          return cached.subscription.access;
        }
        setSubLoading(false);
        return "none";
      }

      try {
        const response = await farmOSService.getSubscription();
        if (response.success) {
          setSubscription(response.data.subscription ?? null);
          setAccess(response.data.access);
          setPlans(response.data.plans || []);
          await updateFarmOSCache({
            subscription: {
              subscription: response.data.subscription ?? null,
              access: response.data.access,
              plans: response.data.plans || [],
            },
          });
          return response.data.access;
        }
      } catch (error) {
        console.error("Failed to load Farm OS subscription:", error);
      } finally {
        setSubLoading(false);
      }
      return "none";
    }, [isOnline]);

  const loadFarm = useCallback(async () => {
    if (await guardOffline()) return;
    const response = await farmOSService.getFarm();
    if (response.success) {
      setFarm(response.data.farm ?? null);
      await updateFarmOSCache({ farm: response.data.farm ?? null });
    }
  }, [guardOffline]);

  const loadFields = useCallback(async () => {
    if (await guardOffline()) return;
    const response = await farmOSService.getFields();
    if (response.success) {
      setFields(response.data.fields || []);
      await updateFarmOSCache({ fields: response.data.fields || [] });
    }
  }, [guardOffline]);

  const loadWorkers = useCallback(async () => {
    if (await guardOffline()) return;
    const response = await farmOSService.getWorkers();
    if (response.success) {
      setWorkers(response.data.workers || []);
      await updateFarmOSCache({ workers: response.data.workers || [] });
    }
  }, [guardOffline]);

  const loadCropPlans = useCallback(async () => {
    if (await guardOffline()) return;
    const response = await farmOSService.getCropPlans();
    if (response.success) {
      setCropPlans(response.data.cropPlans || []);
      await updateFarmOSCache({ cropPlans: response.data.cropPlans || [] });
    }
  }, [guardOffline]);

  const loadCropActivities = useCallback(async () => {
    if (await guardOffline()) return;
    const response = await farmOSService.getCropActivities();
    if (response.success) {
      setCropActivities(response.data.activities || []);
      await updateFarmOSCache({
        cropActivities: response.data.activities || [],
      });
    }
  }, [guardOffline]);

  const loadLivestockGroups = useCallback(async () => {
    if (await guardOffline()) return;
    const response = await farmOSService.getLivestockGroups();
    if (response.success) {
      setLivestockGroups(response.data.groups || []);
      await updateFarmOSCache({ livestockGroups: response.data.groups || [] });
    }
  }, [guardOffline]);

  const loadLivestockActivities = useCallback(async () => {
    if (await guardOffline()) return;
    const response = await farmOSService.getLivestockActivities();
    if (response.success) {
      setLivestockActivities(response.data.activities || []);
      await updateFarmOSCache({
        livestockActivities: response.data.activities || [],
      });
    }
  }, [guardOffline]);

  const loadLabour = useCallback(async () => {
    if (await guardOffline()) return;
    const response = await farmOSService.getLabourDays({
      startDate: labourStartDate,
      endDate: labourEndDate,
    });
    if (response.success) {
      setLabourDays(response.data.labourDays || []);
      setLabourSummary(response.data.summary || null);
      setLabourByCategory(response.data.byCategory || []);
      await updateFarmOSCache({
        labour: {
          labourDays: response.data.labourDays || [],
          summary: response.data.summary || null,
          byCategory: response.data.byCategory || [],
          period: response.data.period,
        },
      });
    }
  }, [guardOffline, labourStartDate, labourEndDate]);

  const loadInventory = useCallback(async () => {
    if (await guardOffline()) return;
    const response = await farmOSService.getInventory();
    if (response.success) {
      setInventory(response.data.inventory || []);
      setInventorySummary(response.data.summary || []);
      setInventoryAlerts(response.data.alerts || []);
      await updateFarmOSCache({
        inventory: {
          inventory: response.data.inventory || [],
          summary: response.data.summary || [],
          alerts: response.data.alerts || [],
        },
      });
    }
  }, [guardOffline]);

  const loadCalendar = useCallback(async () => {
    if (await guardOffline()) return;
    const response = await farmOSService.getCroppingCalendar();
    if (response.success) {
      setCalendarEntries(response.data.calendar || []);
      setPlantingNow(response.data.plantingNow || []);
      await updateFarmOSCache({
        calendar: {
          calendar: response.data.calendar || [],
          plantingNow: response.data.plantingNow || [],
        },
      });
    }
  }, [guardOffline]);

  const loadWeeklyReport = useCallback(async () => {
    if (await guardOffline()) return;
    const response = await farmOSService.getWeeklyReport();
    if (response.success) {
      setWeeklyReport(response.data);
      await updateFarmOSCache({ weeklyReport: response.data });
    }
  }, [guardOffline]);

  const loadMonthlyReport = useCallback(async () => {
    if (await guardOffline()) return;
    const year = Number.parseInt(monthlyYear, 10);
    const month = Number.parseInt(monthlyMonth, 10);
    const response = await farmOSService.getMonthlyReport(year, month);
    if (response.success) {
      setMonthlyReport(response.data);
      await updateFarmOSCache({ monthlyReport: response.data });
    }
  }, [guardOffline, monthlyMonth, monthlyYear]);

  const getFinancePeriod = useCallback(() => {
    const yearInput = Number.parseInt(financeYear, 10);
    const monthInput = Number.parseInt(financeMonth, 10);
    const now = new Date();
    const year =
      Number.isFinite(yearInput) && yearInput > 1900
        ? yearInput
        : now.getFullYear();
    const month =
      Number.isFinite(monthInput) && monthInput >= 1 && monthInput <= 12
        ? monthInput
        : now.getMonth() + 1;
    const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
    const endDate = new Date(year, month, 0).toISOString().split("T")[0];
    return { year, month, startDate, endDate };
  }, [financeMonth, financeYear]);

  const getMonthlyPeriod = useCallback(() => {
    const yearInput = Number.parseInt(monthlyYear, 10);
    const monthInput = Number.parseInt(monthlyMonth, 10);
    const now = new Date();
    const year =
      Number.isFinite(yearInput) && yearInput > 1900
        ? yearInput
        : now.getFullYear();
    const month =
      Number.isFinite(monthInput) && monthInput >= 1 && monthInput <= 12
        ? monthInput
        : now.getMonth() + 1;
    const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
    const endDate = new Date(year, month, 0).toISOString().split("T")[0];
    return { year, month, startDate, endDate };
  }, [monthlyMonth, monthlyYear]);

  const writeExportFile = async (content: string, filename: string) => {
    const baseDir = FileSystem.cacheDirectory ?? FileSystem.documentDirectory;
    if (!baseDir) {
      throw new Error("No writable directory available.");
    }

    const path = `${baseDir}${filename}`;
    await FileSystem.writeAsStringAsync(path, content, {
      encoding: FileSystem.EncodingType.UTF8,
    });
    return path;
  };

  const shareFile = async (
    path: string,
    mimeType: string,
    dialogTitle: string,
  ) => {
    const canShare = await Sharing.isAvailableAsync();
    if (!canShare) {
      throw new Error("Sharing is unavailable on this device.");
    }
    await Sharing.shareAsync(path, {
      mimeType,
      dialogTitle,
    });
  };

  const saveExportToFiles = async (
    path: string,
    filename: string,
    mimeType: string,
  ) => {
    if (Platform.OS === "android") {
      const saf = FileSystem.StorageAccessFramework;
      if (!saf?.requestDirectoryPermissionsAsync) {
        throw new Error("Save to Files is unavailable on this device.");
      }

      const permissions = await saf.requestDirectoryPermissionsAsync();
      if (!permissions.granted) {
        Alert.alert(
          "Permission required",
          "Allow access to save the file to your device.",
        );
        return;
      }

      const destinationUri = await saf.createFileAsync(
        permissions.directoryUri,
        filename,
        mimeType,
      );
      const fileBase64 = await FileSystem.readAsStringAsync(path, {
        encoding: FileSystem.EncodingType.Base64,
      });
      await FileSystem.writeAsStringAsync(destinationUri, fileBase64, {
        encoding: FileSystem.EncodingType.Base64,
      });
      Alert.alert("Saved", "File saved to selected folder.");
      return;
    }

    await shareFile(path, mimeType, "Save Farm OS export");
  };

  const shareExportFile = async (
    content: string,
    filename: string,
    mimeType: string,
  ) => {
    const path = await writeExportFile(content, filename);
    const canShare = await Sharing.isAvailableAsync();
    const canSaveToFiles =
      Platform.OS === "android" &&
      !!FileSystem.StorageAccessFramework?.requestDirectoryPermissionsAsync;
    const showSaveOption =
      Platform.OS === "android" ? canSaveToFiles : canShare;

    if (!canShare && !canSaveToFiles) {
      Alert.alert(
        "Export ready",
        "File saved to the app cache. Sharing is not available on this device.",
      );
      return;
    }

    await new Promise<void>((resolve) => {
      const actions: Array<{
        text: string;
        style?: "cancel" | "default" | "destructive";
        onPress?: () => void;
      }> = [];

      if (showSaveOption) {
        actions.push({
          text: "Save to Files",
          onPress: () => {
            void (async () => {
              try {
                await saveExportToFiles(path, filename, mimeType);
              } catch (error) {
                Alert.alert(
                  "Export saved",
                  "Unable to open the file saving options.",
                );
              } finally {
                resolve();
              }
            })();
          },
        });
      }

      if (canShare) {
        actions.push({
          text: "Share",
          onPress: () => {
            void (async () => {
              try {
                await shareFile(path, mimeType, "Share Farm OS export");
              } catch (error) {
                Alert.alert("Export saved", "Unable to open the share sheet.");
              } finally {
                resolve();
              }
            })();
          },
        });
      }

      actions.push({ text: "Cancel", style: "cancel", onPress: resolve });

      Alert.alert(
        "Export ready",
        "Save to Files or share the export.",
        actions,
        { cancelable: true },
      );
    });
  };

  const handleExportCSV = async (
    type: string,
    period?: { startDate: string; endDate: string },
  ) => {
    if (!isOnline) {
      Alert.alert("Offline", "Exports need an internet connection.");
      return;
    }
    try {
      setExportingType(type);
      const range = period ?? getFinancePeriod();
      const csv = await farmOSService.exportCSV(
        type,
        range.startDate,
        range.endDate,
      );
      const filename = `farm-${type}-${range.startDate}-to-${range.endDate}.csv`;
      await shareExportFile(csv, filename, "text/csv");
    } catch (error: any) {
      Alert.alert(
        "Export failed",
        error.response?.data?.message || "Unable to export CSV data.",
      );
    } finally {
      setExportingType(null);
    }
  };

  const handleExportReport = async () => {
    if (!isOnline) {
      Alert.alert("Offline", "Exports need an internet connection.");
      return;
    }
    try {
      setReportExporting(true);
      const period = getMonthlyPeriod();
      const html = await farmOSService.exportMonthlyReport(
        period.year,
        period.month,
      );
      const monthLabel = String(period.month).padStart(2, "0");
      const filename = `farm-report-${period.year}-${monthLabel}.html`;
      await shareExportFile(html, filename, "text/html");
    } catch (error: any) {
      Alert.alert(
        "Export failed",
        error.response?.data?.message || "Unable to export the monthly report.",
      );
    } finally {
      setReportExporting(false);
    }
  };

  const loadLedger = useCallback(async () => {
    if (await guardOffline()) return;
    const { startDate, endDate } = getFinancePeriod();
    const [expenseRes, revenueRes] = await Promise.all([
      farmOSService.getExpenses({ startDate, endDate }),
      farmOSService.getRevenue({ startDate, endDate }),
    ]);

    if (expenseRes.success) {
      setExpenses(expenseRes.data.expenses || []);
      setExpenseSummary(expenseRes.data.summary || null);
      await updateFarmOSCache({
        expenses: {
          expenses: expenseRes.data.expenses || [],
          summary: expenseRes.data.summary || null,
          byCategory: expenseRes.data.byCategory || [],
          period: expenseRes.data.period,
        },
      });
    }
    if (revenueRes.success) {
      setRevenueEntries(revenueRes.data.revenue || []);
      setRevenueSummary(revenueRes.data.summary || null);
      await updateFarmOSCache({
        revenue: {
          revenue: revenueRes.data.revenue || [],
          summary: revenueRes.data.summary || null,
          byCategory: revenueRes.data.byCategory || [],
          period: revenueRes.data.period,
        },
      });
    }
  }, [getFinancePeriod, guardOffline]);

  const loadProfitability = useCallback(async () => {
    if (await guardOffline()) return;
    const { year, month } = getFinancePeriod();
    const response = await farmOSService.getProfitability(year, month);
    if (response.success) {
      setProfitability(response.data);
      await updateFarmOSCache({ profitability: response.data });
    }
  }, [getFinancePeriod, guardOffline]);

  const loadMarket = useCallback(async () => {
    if (await guardOffline()) return;
    const response = await farmOSService.getMarketPrices();
    if (response.success) {
      setMarketPrices(response.data.prices || []);
      await updateFarmOSCache({
        market: {
          prices: response.data.prices || [],
          insights: marketInsights ?? null,
          generatedAt: marketGeneratedAt ?? null,
        },
      });
    }
  }, [guardOffline, marketGeneratedAt, marketInsights]);

  const loadAnalytics = useCallback(async () => {
    if (await guardOffline()) return;
    const response = await farmOSService.getAnalytics();
    if (response.success) {
      setAnalytics(response.data);
      await updateFarmOSCache({ analytics: response.data });
    }
  }, [guardOffline]);

  const loadSectionData = useCallback(async () => {
    if (!canAccess) return;

    setSectionLoading(true);
    try {
      if (!isOnline) {
        await applyCacheWithQueue();
        return;
      }
      if (activeSection === "setup") {
        await Promise.all([loadFarm(), loadFields(), loadWorkers()]);
      }
      if (activeSection === "crops") {
        await Promise.all([loadFields(), loadWorkers(), loadCropPlans()]);
        await loadCropActivities();
      }
      if (activeSection === "livestock") {
        await Promise.all([loadFields(), loadWorkers(), loadLivestockGroups()]);
        await loadLivestockActivities();
      }
      if (activeSection === "labour") {
        await Promise.all([loadFields(), loadWorkers()]);
        await loadLabour();
      }
      if (activeSection === "inventory") {
        await Promise.all([loadInventory(), loadCropPlans(), loadFields()]);
      }
      if (activeSection === "ledger") {
        await Promise.all([loadFields(), loadCropPlans(), loadLedger()]);
      }
      if (activeSection === "profitability") {
        await Promise.all([loadCropPlans(), loadProfitability()]);
      }
      if (activeSection === "market") {
        await loadMarket();
      }
      if (activeSection === "calendar") {
        await loadCalendar();
      }
      if (activeSection === "analytics") {
        await loadAnalytics();
      }
      if (activeSection === "reports") {
        if (reportMode === "weekly") {
          await loadWeeklyReport();
        } else {
          await loadMonthlyReport();
        }
      }

      const queue = await getFarmOSQueue();
      if (queue.length > 0) {
        const cache = await loadFarmOSCache();
        if (cache) {
          applyCacheToState(mergeCacheWithQueue(cache, queue));
        }
      }
    } catch (error) {
      console.error("Failed to load Farm OS data:", error);
    } finally {
      setSectionLoading(false);
    }
  }, [
    activeSection,
    applyCacheToState,
    applyCacheWithQueue,
    canAccess,
    isOnline,
    loadCalendar,
    loadAnalytics,
    loadCropActivities,
    loadCropPlans,
    loadFields,
    loadFarm,
    loadInventory,
    loadLedger,
    loadLabour,
    loadLivestockActivities,
    loadLivestockGroups,
    loadMarket,
    loadMonthlyReport,
    loadProfitability,
    loadWeeklyReport,
    loadWorkers,
    reportMode,
  ]);

  const syncOfflineQueue = useCallback(
    async (showAlerts = false) => {
      if (!isOnline) {
        if (showAlerts) {
          Alert.alert("Offline", "Connect to the internet to sync changes.");
        }
        return;
      }

      if (syncing) return;

      const queue = await getFarmOSQueue();
      if (queue.length === 0) {
        if (showAlerts) {
          Alert.alert("Up to date", "No pending changes to sync.");
        }
        return;
      }

      setSyncing(true);
      try {
        const result = await syncFarmOSQueue();
        await refreshPendingCount();
        await applyCacheWithQueue();
        if (result.synced > 0) {
          await loadSectionData();
        }
        if (showAlerts) {
          Alert.alert("Sync complete", "Your offline changes are now synced.");
        }
      } catch {
        if (showAlerts) {
          Alert.alert("Sync failed", "We will retry when you're online.");
        }
      } finally {
        setSyncing(false);
      }
    },
    [
      applyCacheWithQueue,
      isOnline,
      loadSectionData,
      refreshPendingCount,
      syncing,
    ],
  );

  useEffect(() => {
    if (isOnline) {
      void syncOfflineQueue(false);
    }
  }, [isOnline, syncOfflineQueue]);

  useEffect(() => {
    loadSubscription();
  }, [loadSubscription]);

  useEffect(() => {
    if (canAccess) {
      loadSectionData();
    }
  }, [canAccess, activeSection, loadSectionData]);

  useEffect(() => {
    if (activeSection === "reports" && canAccess) {
      loadSectionData();
    }
  }, [reportMode, activeSection, canAccess, loadSectionData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    if (!isOnline) {
      await applyCacheWithQueue();
      await refreshPendingCount();
      setRefreshing(false);
      return;
    }
    const nextAccess = await loadSubscription();
    if (nextAccess === "trial" || nextAccess === "active") {
      await loadSectionData();
    }
    setRefreshing(false);
  }, [
    applyCacheWithQueue,
    isOnline,
    loadSectionData,
    loadSubscription,
    refreshPendingCount,
  ]);

  const handleWalletSubscribe = async (planId: string) => {
    if (!isOnline) {
      Alert.alert(
        "Offline",
        "Connect to the internet to activate your subscription.",
      );
      return;
    }
    try {
      setSaving(true);
      const response = await farmOSService.subscribeWithWallet(planId);
      if (response.success) {
        Alert.alert(
          "Subscription active",
          response.message || "Subscription activated.",
        );
        await loadSubscription();
      }
    } catch (error: any) {
      Alert.alert(
        "Payment failed",
        error.response?.data?.message || "Unable to complete payment.",
      );
    } finally {
      setSaving(false);
    }
  };

  const openFarmModal = () => {
    setFarmForm({
      name: farm?.name ?? "",
      location: farm?.location ?? "",
      total_area_ha: farm?.total_area_ha ? String(farm.total_area_ha) : "",
      gps_lat: farm?.gps_lat ? String(farm.gps_lat) : "",
      gps_lng: farm?.gps_lng ? String(farm.gps_lng) : "",
      water_sources: farm?.water_sources ?? "",
      notes: farm?.notes ?? "",
    });
    setFarmModalOpen(true);
  };

  const saveFarm = async () => {
    if (!farmForm.name.trim()) {
      Alert.alert("Missing name", "Please enter a farm name.");
      return;
    }

    try {
      setSaving(true);
      const payload = {
        name: farmForm.name.trim(),
        location: farmForm.location.trim() || null,
        total_area_ha: toOptionalNumber(farmForm.total_area_ha),
        gps_lat: toOptionalNumber(farmForm.gps_lat),
        gps_lng: toOptionalNumber(farmForm.gps_lng),
        water_sources: farmForm.water_sources.trim() || null,
        notes: farmForm.notes.trim() || null,
      };

      if (!isOnline) {
        if (farm?.id && isLocalId(farm.id)) {
          await updateLocalQueuedMutation("farm", farm.id, payload);
        } else {
          const localId = farm?.id ?? createLocalId();
          await enqueueOfflineMutation(
            buildQueueItem({
              entity: "farm",
              action: farm?.id ? "update" : "create",
              method: "post",
              url: "/farm-os/farm",
              data: payload,
              localId: farm?.id ? undefined : localId,
              targetId: farm?.id ?? localId,
            }),
            "Farm saved offline",
          );
        }
        setFarmModalOpen(false);
        return;
      }

      await farmOSService.saveFarm(payload);
      setFarmModalOpen(false);
      await loadFarm();
    } catch (error: any) {
      Alert.alert(
        "Error",
        error.response?.data?.message || "Failed to save farm profile.",
      );
    } finally {
      setSaving(false);
    }
  };

  const openFieldModal = (field?: FarmOSField) => {
    if (field) {
      setEditingFieldId(field.id);
      setFieldForm({
        name: field.name ?? "",
        area_ha: field.area_ha ? String(field.area_ha) : "",
        soil_type: field.soil_type ?? "",
        irrigation_type: field.irrigation_type ?? "",
        current_use: field.current_use ?? "",
        status: field.status ?? "",
        notes: field.notes ?? "",
      });
    } else {
      setEditingFieldId(null);
      setFieldForm({
        name: "",
        area_ha: "",
        soil_type: "",
        irrigation_type: "",
        current_use: "",
        status: "",
        notes: "",
      });
    }
    setFieldModalOpen(true);
  };

  const saveField = async () => {
    if (!fieldForm.name.trim()) {
      Alert.alert("Missing name", "Field name is required.");
      return;
    }

    try {
      setSaving(true);
      const payload = {
        name: fieldForm.name.trim(),
        area_ha: toOptionalNumber(fieldForm.area_ha),
        soil_type: fieldForm.soil_type.trim() || null,
        irrigation_type: fieldForm.irrigation_type.trim() || null,
        current_use: fieldForm.current_use.trim() || null,
        status: fieldForm.status.trim() || null,
        notes: fieldForm.notes.trim() || null,
      };

      if (!isOnline) {
        if (editingFieldId) {
          if (isLocalId(editingFieldId)) {
            await updateLocalQueuedMutation("field", editingFieldId, payload);
          } else {
            await enqueueOfflineMutation(
              buildQueueItem({
                entity: "field",
                action: "update",
                method: "put",
                url: `/farm-os/fields/${editingFieldId}`,
                data: payload,
                targetId: editingFieldId,
              }),
              "Field saved offline",
            );
          }
        } else {
          const localId = createLocalId();
          await enqueueOfflineMutation(
            buildQueueItem({
              entity: "field",
              action: "create",
              method: "post",
              url: "/farm-os/fields",
              data: payload,
              localId,
              targetId: localId,
            }),
            "Field saved offline",
          );
        }

        setFieldModalOpen(false);
        setEditingFieldId(null);
        return;
      }

      if (editingFieldId) {
        await farmOSService.updateField(editingFieldId, payload);
      } else {
        await farmOSService.createField(payload);
      }

      setFieldModalOpen(false);
      setEditingFieldId(null);
      await loadFields();
    } catch (error: any) {
      Alert.alert(
        "Error",
        error.response?.data?.message || "Failed to save field.",
      );
    } finally {
      setSaving(false);
    }
  };

  const deleteField = (fieldId: string) => {
    Alert.alert("Delete field", "This action cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            if (!isOnline) {
              if (isLocalId(fieldId)) {
                await deleteLocalQueuedMutation("field", fieldId);
              } else {
                await enqueueOfflineMutation(
                  buildQueueItem({
                    entity: "field",
                    action: "delete",
                    method: "delete",
                    url: `/farm-os/fields/${fieldId}`,
                    targetId: fieldId,
                  }),
                  "Field deleted offline",
                );
              }
              return;
            }

            await farmOSService.deleteField(fieldId);
            await loadFields();
          } catch (error: any) {
            Alert.alert(
              "Error",
              error.response?.data?.message || "Failed to delete field.",
            );
          }
        },
      },
    ]);
  };

  const openWorkerModal = (worker?: FarmOSWorkerWithDob) => {
    if (worker) {
      setEditingWorkerId(worker.id);
      setWorkerForm({
        full_name: worker.full_name ?? "",
        phone: worker.phone ?? "",
        role: worker.role ?? "worker",
        date_of_birth: worker.date_of_birth ?? "",
        daily_wage_usd: worker.daily_wage_usd
          ? String(worker.daily_wage_usd)
          : "",
      });
    } else {
      setEditingWorkerId(null);
      setWorkerForm({
        full_name: "",
        phone: "",
        role: "worker",
        date_of_birth: "",
        daily_wage_usd: "",
      });
    }
    setWorkerModalOpen(true);
  };

  const saveWorker = async () => {
    if (!workerForm.full_name.trim()) {
      Alert.alert("Missing name", "Worker name is required.");
      return;
    }

    if (!workerForm.date_of_birth.trim()) {
      Alert.alert("Missing date of birth", "Worker date of birth is required.");
      return;
    }

    try {
      setSaving(true);
      const payload = {
        full_name: workerForm.full_name.trim(),
        phone: workerForm.phone.trim() || null,
        role: workerForm.role,
        date_of_birth: workerForm.date_of_birth.trim(),
        daily_wage_usd: toOptionalNumber(workerForm.daily_wage_usd),
      };

      if (!isOnline) {
        if (editingWorkerId) {
          if (isLocalId(editingWorkerId)) {
            await updateLocalQueuedMutation("worker", editingWorkerId, payload);
          } else {
            await enqueueOfflineMutation(
              buildQueueItem({
                entity: "worker",
                action: "update",
                method: "put",
                url: `/farm-os/workers/${editingWorkerId}`,
                data: payload,
                targetId: editingWorkerId,
              }),
              "Worker saved offline",
            );
          }
        } else {
          const localId = createLocalId();
          await enqueueOfflineMutation(
            buildQueueItem({
              entity: "worker",
              action: "create",
              method: "post",
              url: "/farm-os/workers",
              data: payload,
              localId,
              targetId: localId,
            }),
            "Worker saved offline",
          );
        }

        setWorkerModalOpen(false);
        setEditingWorkerId(null);
        return;
      }

      if (editingWorkerId) {
        await farmOSService.updateWorker(editingWorkerId, payload);
      } else {
        await farmOSService.createWorker(payload);
      }

      setWorkerModalOpen(false);
      setEditingWorkerId(null);
      await loadWorkers();
    } catch (error: any) {
      Alert.alert(
        "Error",
        error.response?.data?.message || "Failed to save worker.",
      );
    } finally {
      setSaving(false);
    }
  };

  const openCropPlanModal = (plan?: FarmOSCropPlan) => {
    setCropPlanAreaUnitPickerOpen(false);
    if (plan) {
      setEditingCropPlanId(plan.id);
      setCropPlanForm({
        field_id: plan.field_id ?? "",
        crop_type: plan.crop_type ?? "",
        variety: plan.variety ?? "",
        planned_area_ha: plan.planned_area_ha
          ? String(plan.planned_area_ha)
          : "",
        planned_area_unit: "ha",
        planting_date: plan.planting_date ?? "",
        expected_harvest_date: plan.expected_harvest_date ?? "",
        expected_yield_kg: plan.expected_yield_kg
          ? String(plan.expected_yield_kg)
          : "",
        season: plan.season ?? "",
        status: plan.status ?? "planned",
        notes: plan.notes ?? "",
      });
    } else {
      setEditingCropPlanId(null);
      setCropPlanForm({
        field_id: "",
        crop_type: "",
        variety: "",
        planned_area_ha: "",
        planned_area_unit: "ha",
        planting_date: "",
        expected_harvest_date: "",
        expected_yield_kg: "",
        season: "",
        status: "planned",
        notes: "",
      });
    }
    setCropPlanModalOpen(true);
  };

  const saveCropPlan = async () => {
    if (!cropPlanForm.crop_type.trim()) {
      Alert.alert("Missing crop", "Crop type is required.");
      return;
    }

    try {
      setSaving(true);
      const plannedAreaValue = toOptionalNumber(cropPlanForm.planned_area_ha);
      const payload = {
        field_id: cropPlanForm.field_id || null,
        crop_type: cropPlanForm.crop_type.trim(),
        variety: cropPlanForm.variety.trim() || null,
        planned_area_ha:
          plannedAreaValue === null
            ? null
            : convertAreaValue(
                plannedAreaValue,
                cropPlanForm.planned_area_unit,
                "ha",
              ),
        planting_date: cropPlanForm.planting_date.trim() || null,
        expected_harvest_date:
          cropPlanForm.expected_harvest_date.trim() || null,
        expected_yield_kg: toOptionalNumber(cropPlanForm.expected_yield_kg),
        season: cropPlanForm.season.trim() || null,
        status: cropPlanForm.status || null,
        notes: cropPlanForm.notes.trim() || null,
      };

      if (!isOnline) {
        if (editingCropPlanId) {
          if (isLocalId(editingCropPlanId)) {
            await updateLocalQueuedMutation(
              "cropPlan",
              editingCropPlanId,
              payload,
            );
          } else {
            await enqueueOfflineMutation(
              buildQueueItem({
                entity: "cropPlan",
                action: "update",
                method: "put",
                url: `/farm-os/crop-plans/${editingCropPlanId}`,
                data: payload,
                targetId: editingCropPlanId,
              }),
              "Crop plan saved offline",
            );
          }
        } else {
          const localId = createLocalId();
          await enqueueOfflineMutation(
            buildQueueItem({
              entity: "cropPlan",
              action: "create",
              method: "post",
              url: "/farm-os/crop-plans",
              data: payload,
              localId,
              targetId: localId,
            }),
            "Crop plan saved offline",
          );
        }

        setCropPlanModalOpen(false);
        setEditingCropPlanId(null);
        return;
      }

      if (editingCropPlanId) {
        await farmOSService.updateCropPlan(editingCropPlanId, payload);
      } else {
        await farmOSService.createCropPlan(payload);
      }

      setCropPlanModalOpen(false);
      setEditingCropPlanId(null);
      await loadCropPlans();
    } catch (error: any) {
      Alert.alert(
        "Error",
        error.response?.data?.message || "Failed to save crop plan.",
      );
    } finally {
      setSaving(false);
    }
  };

  const saveCropActivity = async () => {
    if (!cropActivityForm.activity_type) {
      Alert.alert("Missing activity", "Select an activity type.");
      return;
    }

    try {
      setSaving(true);
      const payload = {
        crop_plan_id: cropActivityForm.crop_plan_id || null,
        field_id: cropActivityForm.field_id || null,
        activity_type: cropActivityForm.activity_type,
        activity_date: cropActivityForm.activity_date || null,
        area_covered_ha: toOptionalNumber(cropActivityForm.area_covered_ha),
        inputs_used: cropActivityForm.inputs_used.trim() || null,
        description: cropActivityForm.description.trim() || null,
        notes: cropActivityForm.notes.trim() || null,
        logged_by: cropActivityForm.logged_by || null,
      };

      if (!isOnline) {
        const localId = createLocalId();
        await enqueueOfflineMutation(
          buildQueueItem({
            entity: "cropActivity",
            action: "create",
            method: "post",
            url: "/farm-os/crop-activities",
            data: payload,
            localId,
            targetId: localId,
          }),
          "Activity saved offline",
        );
        setCropActivityModalOpen(false);
        setCropActivityForm({
          crop_plan_id: "",
          field_id: "",
          activity_type: "planting",
          activity_date: todayIso(),
          area_covered_ha: "",
          inputs_used: "",
          description: "",
          notes: "",
          logged_by: "",
        });
        return;
      }

      await farmOSService.createCropActivity(payload);

      setCropActivityModalOpen(false);
      setCropActivityForm({
        crop_plan_id: "",
        field_id: "",
        activity_type: "planting",
        activity_date: todayIso(),
        area_covered_ha: "",
        inputs_used: "",
        description: "",
        notes: "",
        logged_by: "",
      });
      await loadCropActivities();
    } catch (error: any) {
      Alert.alert(
        "Error",
        error.response?.data?.message || "Failed to log activity.",
      );
    } finally {
      setSaving(false);
    }
  };

  const openLivestockGroupModal = (group?: FarmOSLivestockGroup) => {
    if (group) {
      setEditingLivestockGroupId(group.id);
      setLivestockGroupForm({
        field_id: group.field_id ?? "",
        species: group.species ?? "cattle",
        breed: group.breed ?? "",
        count: group.count ? String(group.count) : "",
        purpose: group.purpose ?? "",
        date_acquired: group.date_acquired ?? "",
        notes: group.notes ?? "",
      });
    } else {
      setEditingLivestockGroupId(null);
      setLivestockGroupForm({
        field_id: "",
        species: "cattle",
        breed: "",
        count: "",
        purpose: "",
        date_acquired: "",
        notes: "",
      });
    }
    setLivestockGroupModalOpen(true);
  };

  const saveLivestockGroup = async () => {
    if (!livestockGroupForm.species || !livestockGroupForm.count.trim()) {
      Alert.alert("Missing data", "Species and count are required.");
      return;
    }

    try {
      setSaving(true);
      const payload = {
        field_id: livestockGroupForm.field_id || null,
        species: livestockGroupForm.species,
        breed: livestockGroupForm.breed.trim() || null,
        count: livestockGroupForm.count.trim(),
        purpose: livestockGroupForm.purpose.trim() || null,
        date_acquired: livestockGroupForm.date_acquired.trim() || null,
        notes: livestockGroupForm.notes.trim() || null,
      };

      if (!isOnline) {
        if (editingLivestockGroupId) {
          if (isLocalId(editingLivestockGroupId)) {
            await updateLocalQueuedMutation(
              "livestockGroup",
              editingLivestockGroupId,
              payload,
            );
          } else {
            await enqueueOfflineMutation(
              buildQueueItem({
                entity: "livestockGroup",
                action: "update",
                method: "put",
                url: `/farm-os/livestock/${editingLivestockGroupId}`,
                data: payload,
                targetId: editingLivestockGroupId,
              }),
              "Livestock saved offline",
            );
          }
        } else {
          const localId = createLocalId();
          await enqueueOfflineMutation(
            buildQueueItem({
              entity: "livestockGroup",
              action: "create",
              method: "post",
              url: "/farm-os/livestock",
              data: payload,
              localId,
              targetId: localId,
            }),
            "Livestock saved offline",
          );
        }

        setLivestockGroupModalOpen(false);
        setEditingLivestockGroupId(null);
        await loadLivestockGroups();
        return;
      }

      if (editingLivestockGroupId) {
        await farmOSService.updateLivestockGroup(
          editingLivestockGroupId,
          payload,
        );
      } else {
        await farmOSService.createLivestockGroup(payload);
      }

      setLivestockGroupModalOpen(false);
      setEditingLivestockGroupId(null);
      await loadLivestockGroups();
    } catch (error: any) {
      Alert.alert(
        "Error",
        error.response?.data?.message || "Failed to save livestock group.",
      );
    } finally {
      setSaving(false);
    }
  };

  const saveLivestockActivity = async () => {
    if (!livestockActivityForm.livestock_group_id) {
      Alert.alert("Missing group", "Select a livestock group.");
      return;
    }

    try {
      setSaving(true);
      const payload = {
        livestock_group_id: livestockActivityForm.livestock_group_id,
        activity_type: livestockActivityForm.activity_type,
        activity_date: livestockActivityForm.activity_date || null,
        count_affected: toOptionalNumber(livestockActivityForm.count_affected),
        quantity: toOptionalNumber(livestockActivityForm.quantity),
        unit: livestockActivityForm.unit.trim() || null,
        cost_usd: toOptionalNumber(livestockActivityForm.cost_usd),
        description: livestockActivityForm.description.trim() || null,
        notes: livestockActivityForm.notes.trim() || null,
        logged_by: livestockActivityForm.logged_by || null,
      };

      if (!isOnline) {
        const localId = createLocalId();
        await enqueueOfflineMutation(
          buildQueueItem({
            entity: "livestockActivity",
            action: "create",
            method: "post",
            url: "/farm-os/livestock-activities",
            data: payload,
            localId,
            targetId: localId,
          }),
          "Activity saved offline",
        );
        setLivestockActivityModalOpen(false);
        setLivestockActivityForm({
          livestock_group_id: "",
          activity_type: "feeding",
          activity_date: todayIso(),
          count_affected: "",
          quantity: "",
          unit: "",
          cost_usd: "",
          description: "",
          notes: "",
          logged_by: "",
        });
        return;
      }

      await farmOSService.createLivestockActivity(payload);

      setLivestockActivityModalOpen(false);
      setLivestockActivityForm({
        livestock_group_id: "",
        activity_type: "feeding",
        activity_date: todayIso(),
        count_affected: "",
        quantity: "",
        unit: "",
        cost_usd: "",
        description: "",
        notes: "",
        logged_by: "",
      });
      await loadLivestockActivities();
    } catch (error: any) {
      Alert.alert(
        "Error",
        error.response?.data?.message || "Failed to log livestock activity.",
      );
    } finally {
      setSaving(false);
    }
  };

  const saveLabourDay = async () => {
    if (!labourForm.task_category) {
      Alert.alert("Missing task", "Select a task category.");
      return;
    }

    try {
      setSaving(true);
      const payload = {
        worker_id: labourForm.worker_id || null,
        field_id: labourForm.field_id || null,
        work_date: labourForm.work_date || null,
        task_category: labourForm.task_category,
        hours_worked: toOptionalNumber(labourForm.hours_worked),
        area_covered_ha: toOptionalNumber(labourForm.area_covered_ha),
        wage_usd: toOptionalNumber(labourForm.wage_usd),
        notes: labourForm.notes.trim() || null,
      };

      if (!isOnline) {
        const localId = createLocalId();
        await enqueueOfflineMutation(
          buildQueueItem({
            entity: "labourDay",
            action: "create",
            method: "post",
            url: "/farm-os/labour",
            data: payload,
            localId,
            targetId: localId,
          }),
          "Labour saved offline",
        );
        setLabourModalOpen(false);
        setLabourForm({
          worker_id: "",
          field_id: "",
          work_date: todayIso(),
          task_category: "planting",
          hours_worked: "",
          area_covered_ha: "",
          wage_usd: "",
          notes: "",
        });
        return;
      }

      await farmOSService.createLabourDay(payload);

      setLabourModalOpen(false);
      setLabourForm({
        worker_id: "",
        field_id: "",
        work_date: todayIso(),
        task_category: "planting",
        hours_worked: "",
        area_covered_ha: "",
        wage_usd: "",
        notes: "",
      });
      await loadLabour();
    } catch (error: any) {
      Alert.alert(
        "Error",
        error.response?.data?.message || "Failed to log labour day.",
      );
    } finally {
      setSaving(false);
    }
  };

  const deleteLabourDay = (labourId: string) => {
    Alert.alert("Delete labour", "This action cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            if (!isOnline) {
              if (isLocalId(labourId)) {
                await deleteLocalQueuedMutation("labourDay", labourId);
              } else {
                await enqueueOfflineMutation(
                  buildQueueItem({
                    entity: "labourDay",
                    action: "delete",
                    method: "delete",
                    url: `/farm-os/labour/${labourId}`,
                    targetId: labourId,
                  }),
                  "Labour deleted offline",
                );
              }
              return;
            }

            await farmOSService.deleteLabourDay(labourId);
            await loadLabour();
          } catch (error: any) {
            Alert.alert(
              "Error",
              error.response?.data?.message || "Failed to delete labour entry.",
            );
          }
        },
      },
    ]);
  };

  const openExpenseModal = (expense?: FarmOSExpense) => {
    if (expense) {
      setEditingExpenseId(expense.id);
      setExpenseForm({
        expense_date: expense.expense_date ?? todayIso(),
        category: expense.category ?? "labour",
        description: expense.description ?? "",
        amount_usd: expense.amount_usd ? String(expense.amount_usd) : "",
        field_id: expense.field_id ?? "",
        crop_plan_id: expense.crop_plan_id ?? "",
        supplier: expense.supplier ?? "",
        receipt_ref: expense.receipt_ref ?? "",
        notes: expense.notes ?? "",
      });
    } else {
      setEditingExpenseId(null);
      setExpenseForm({
        expense_date: todayIso(),
        category: "labour",
        description: "",
        amount_usd: "",
        field_id: "",
        crop_plan_id: "",
        supplier: "",
        receipt_ref: "",
        notes: "",
      });
    }
    setExpenseModalOpen(true);
  };

  const saveExpense = async () => {
    if (!expenseForm.description.trim()) {
      Alert.alert("Missing description", "Description is required.");
      return;
    }
    const amount = toOptionalNumber(expenseForm.amount_usd);
    if (!amount || amount <= 0) {
      Alert.alert("Invalid amount", "Enter a positive amount.");
      return;
    }

    try {
      setSaving(true);

      const basePayload = {
        expense_date: expenseForm.expense_date || null,
        category: expenseForm.category,
        description: expenseForm.description.trim(),
        amount_usd: amount,
        supplier: expenseForm.supplier.trim() || null,
        receipt_ref: expenseForm.receipt_ref.trim() || null,
        notes: expenseForm.notes.trim() || null,
      };

      if (!isOnline) {
        if (editingExpenseId) {
          if (isLocalId(editingExpenseId)) {
            await updateLocalQueuedMutation(
              "expense",
              editingExpenseId,
              basePayload,
            );
          } else {
            await enqueueOfflineMutation(
              buildQueueItem({
                entity: "expense",
                action: "update",
                method: "put",
                url: `/farm-os/expenses/${editingExpenseId}`,
                data: basePayload,
                targetId: editingExpenseId,
              }),
              "Expense saved offline",
            );
          }
        } else {
          const localId = createLocalId();
          await enqueueOfflineMutation(
            buildQueueItem({
              entity: "expense",
              action: "create",
              method: "post",
              url: "/farm-os/expenses",
              data: {
                ...basePayload,
                field_id: expenseForm.field_id || null,
                crop_plan_id: expenseForm.crop_plan_id || null,
              },
              localId,
              targetId: localId,
            }),
            "Expense saved offline",
          );
        }

        setExpenseModalOpen(false);
        setEditingExpenseId(null);
        return;
      }

      if (editingExpenseId) {
        await farmOSService.updateExpense(editingExpenseId, basePayload);
      } else {
        await farmOSService.createExpense({
          ...basePayload,
          field_id: expenseForm.field_id || null,
          crop_plan_id: expenseForm.crop_plan_id || null,
        });
      }

      setExpenseModalOpen(false);
      setEditingExpenseId(null);
      await Promise.all([loadLedger(), loadProfitability()]);
    } catch (error: any) {
      Alert.alert(
        "Error",
        error.response?.data?.message || "Failed to save expense.",
      );
    } finally {
      setSaving(false);
    }
  };

  const openRevenueModal = (entry?: FarmOSRevenue) => {
    if (entry) {
      setEditingRevenueId(entry.id);
      setRevenueForm({
        revenue_date: entry.revenue_date ?? todayIso(),
        category: entry.category ?? "crop_sale",
        description: entry.description ?? "",
        amount_usd: entry.amount_usd ? String(entry.amount_usd) : "",
        quantity: entry.quantity ? String(entry.quantity) : "",
        unit: entry.unit ?? "kg",
        unit_price_usd: entry.unit_price_usd
          ? String(entry.unit_price_usd)
          : "",
        buyer_name: entry.buyer_name ?? "",
        field_id: entry.field_id ?? "",
        crop_plan_id: entry.crop_plan_id ?? "",
        notes: entry.notes ?? "",
      });
    } else {
      setEditingRevenueId(null);
      setRevenueForm({
        revenue_date: todayIso(),
        category: "crop_sale",
        description: "",
        amount_usd: "",
        quantity: "",
        unit: "kg",
        unit_price_usd: "",
        buyer_name: "",
        field_id: "",
        crop_plan_id: "",
        notes: "",
      });
    }
    setRevenueModalOpen(true);
  };

  const saveRevenue = async () => {
    if (!revenueForm.description.trim()) {
      Alert.alert("Missing description", "Description is required.");
      return;
    }
    const amount = toOptionalNumber(revenueForm.amount_usd);
    if (!amount || amount <= 0) {
      Alert.alert("Invalid amount", "Enter a positive amount.");
      return;
    }

    try {
      setSaving(true);

      const quantity = toOptionalNumber(revenueForm.quantity);
      const unitPrice = toOptionalNumber(revenueForm.unit_price_usd);

      const basePayload: Parameters<typeof farmOSService.createRevenue>[0] = {
        revenue_date: revenueForm.revenue_date || null,
        category: revenueForm.category,
        description: revenueForm.description.trim(),
        amount_usd: amount,
        unit: revenueForm.unit.trim() || null,
        buyer_name: revenueForm.buyer_name.trim() || null,
        notes: revenueForm.notes.trim() || null,
      };

      if (quantity !== null) {
        basePayload.quantity = quantity;
      }
      if (unitPrice !== null) {
        basePayload.unit_price_usd = unitPrice;
      }

      if (!isOnline) {
        if (editingRevenueId) {
          if (isLocalId(editingRevenueId)) {
            await updateLocalQueuedMutation(
              "revenue",
              editingRevenueId,
              basePayload,
            );
          } else {
            await enqueueOfflineMutation(
              buildQueueItem({
                entity: "revenue",
                action: "update",
                method: "put",
                url: `/farm-os/revenue/${editingRevenueId}`,
                data: basePayload,
                targetId: editingRevenueId,
              }),
              "Revenue saved offline",
            );
          }
        } else {
          const localId = createLocalId();
          await enqueueOfflineMutation(
            buildQueueItem({
              entity: "revenue",
              action: "create",
              method: "post",
              url: "/farm-os/revenue",
              data: {
                ...basePayload,
                field_id: revenueForm.field_id || null,
                crop_plan_id: revenueForm.crop_plan_id || null,
              },
              localId,
              targetId: localId,
            }),
            "Revenue saved offline",
          );
        }

        setRevenueModalOpen(false);
        setEditingRevenueId(null);
        return;
      }

      if (editingRevenueId) {
        await farmOSService.updateRevenue(editingRevenueId, basePayload);
      } else {
        await farmOSService.createRevenue({
          ...basePayload,
          field_id: revenueForm.field_id || null,
          crop_plan_id: revenueForm.crop_plan_id || null,
        });
      }

      setRevenueModalOpen(false);
      setEditingRevenueId(null);
      await Promise.all([loadLedger(), loadProfitability()]);
    } catch (error: any) {
      Alert.alert(
        "Error",
        error.response?.data?.message || "Failed to save revenue entry.",
      );
    } finally {
      setSaving(false);
    }
  };

  const openMarketPriceModal = () => {
    setMarketPriceForm({
      commodity: "",
      region: "",
      price_usd: "",
      unit: "kg",
      price_date: todayIso(),
      source: "",
      demand_level: "medium",
      notes: "",
    });
    setMarketPriceModalOpen(true);
  };

  const saveMarketPrice = async () => {
    if (!marketPriceForm.commodity.trim()) {
      Alert.alert("Missing commodity", "Commodity is required.");
      return;
    }
    const price = toOptionalNumber(marketPriceForm.price_usd);
    if (!price || price <= 0) {
      Alert.alert("Invalid price", "Enter a positive price.");
      return;
    }
    if (!marketPriceForm.unit.trim()) {
      Alert.alert("Missing unit", "Unit is required.");
      return;
    }

    try {
      setSaving(true);
      const payload = {
        commodity: marketPriceForm.commodity.trim(),
        region: marketPriceForm.region.trim() || null,
        price_usd: price,
        unit: marketPriceForm.unit.trim(),
        price_date: marketPriceForm.price_date || null,
        source: marketPriceForm.source.trim() || null,
        demand_level: marketPriceForm.demand_level || null,
        notes: marketPriceForm.notes.trim() || null,
      };

      if (!isOnline) {
        const localId = createLocalId();
        await enqueueOfflineMutation(
          buildQueueItem({
            entity: "marketPrice",
            action: "create",
            method: "post",
            url: "/farm-os/market",
            data: payload,
            localId,
            targetId: localId,
          }),
          "Price saved offline",
        );
        setMarketPriceModalOpen(false);
        return;
      }

      await farmOSService.createMarketPrice(payload);

      setMarketPriceModalOpen(false);
      await loadMarket();
    } catch (error: any) {
      Alert.alert(
        "Error",
        error.response?.data?.message || "Failed to add market price.",
      );
    } finally {
      setSaving(false);
    }
  };

  const generateMarketInsights = async () => {
    if (!isOnline) {
      Alert.alert("Offline", "AI insights need an internet connection to run.");
      return;
    }
    try {
      setMarketGenerating(true);
      const response = await farmOSService.generateMarketInsights();
      if (response.success) {
        setMarketInsights(response.data.insights ?? null);
        setMarketGeneratedAt(response.data.generatedAt ?? null);
        await loadMarket();
        Alert.alert(
          "Insights ready",
          response.message || "Market insights generated.",
        );
      }
    } catch (error: any) {
      Alert.alert(
        "Error",
        error.response?.data?.message || "Failed to generate market insights.",
      );
    } finally {
      setMarketGenerating(false);
    }
  };

  const handleGeneratePredictions = async () => {
    if (!isOnline) {
      Alert.alert(
        "Offline",
        "Seasonal predictions need an internet connection to run.",
      );
      return;
    }
    try {
      setPredictionsLoading(true);
      const response = await farmOSService.generateSeasonalPredictions();
      if (response.success) {
        setPredictions(response.data.predictions ?? null);
        setPredictionsGeneratedAt(response.data.generatedAt ?? null);
        await updateFarmOSCache({
          predictions: {
            data: response.data.predictions ?? null,
            generatedAt: response.data.generatedAt ?? null,
          },
        });
        Alert.alert(
          "Predictions ready",
          response.message || "Seasonal predictions generated.",
        );
      }
    } catch (error: any) {
      Alert.alert(
        "Error",
        error.response?.data?.message || "Failed to generate predictions.",
      );
    } finally {
      setPredictionsLoading(false);
    }
  };

  const openInventoryModal = (item?: FarmOSInventoryItem) => {
    if (item) {
      setEditingInventoryId(item.id);
      setInventoryForm({
        item_type: item.item_type ?? "seed",
        name: item.name ?? "",
        quantity: item.quantity ? String(item.quantity) : "",
        unit: item.unit ?? "",
        unit_cost_usd: item.unit_cost_usd ? String(item.unit_cost_usd) : "",
        reorder_level: item.reorder_level ? String(item.reorder_level) : "",
        expiry_date: item.expiry_date ?? "",
        supplier: item.supplier ?? "",
      });
    } else {
      setEditingInventoryId(null);
      setInventoryForm({
        item_type: "seed",
        name: "",
        quantity: "",
        unit: "",
        unit_cost_usd: "",
        reorder_level: "",
        expiry_date: "",
        supplier: "",
      });
    }
    setInventoryModalOpen(true);
  };

  const saveInventoryItem = async () => {
    if (!inventoryForm.name.trim()) {
      Alert.alert("Missing name", "Item name is required.");
      return;
    }

    try {
      setSaving(true);
      const payload = {
        item_type: inventoryForm.item_type,
        name: inventoryForm.name.trim(),
        quantity: toOptionalNumber(inventoryForm.quantity) ?? 0,
        unit: inventoryForm.unit.trim() || null,
        unit_cost_usd: toOptionalNumber(inventoryForm.unit_cost_usd),
        reorder_level: toOptionalNumber(inventoryForm.reorder_level),
        expiry_date: inventoryForm.expiry_date.trim() || null,
        supplier: inventoryForm.supplier.trim() || null,
      };

      if (!isOnline) {
        if (editingInventoryId) {
          if (isLocalId(editingInventoryId)) {
            await updateLocalQueuedMutation(
              "inventoryItem",
              editingInventoryId,
              payload,
            );
          } else {
            await enqueueOfflineMutation(
              buildQueueItem({
                entity: "inventoryItem",
                action: "update",
                method: "put",
                url: `/farm-os/inventory/${editingInventoryId}`,
                data: payload,
                targetId: editingInventoryId,
              }),
              "Inventory saved offline",
            );
          }
        } else {
          const localId = createLocalId();
          await enqueueOfflineMutation(
            buildQueueItem({
              entity: "inventoryItem",
              action: "create",
              method: "post",
              url: "/farm-os/inventory",
              data: payload,
              localId,
              targetId: localId,
            }),
            "Inventory saved offline",
          );
        }

        setInventoryModalOpen(false);
        setEditingInventoryId(null);
        return;
      }

      if (editingInventoryId) {
        await farmOSService.updateInventoryItem(editingInventoryId, payload);
      } else {
        await farmOSService.createInventoryItem(payload);
      }

      setInventoryModalOpen(false);
      setEditingInventoryId(null);
      await loadInventory();
    } catch (error: any) {
      Alert.alert(
        "Error",
        error.response?.data?.message || "Failed to save item.",
      );
    } finally {
      setSaving(false);
    }
  };

  const saveInventoryUsage = async () => {
    if (!inventoryUsageForm.inventory_id || !inventoryUsageForm.quantity_used) {
      Alert.alert("Missing data", "Item and quantity are required.");
      return;
    }

    try {
      setSaving(true);
      const payload = {
        inventory_id: inventoryUsageForm.inventory_id,
        quantity_used: inventoryUsageForm.quantity_used,
        field_id: inventoryUsageForm.field_id || null,
        crop_plan_id: inventoryUsageForm.crop_plan_id || null,
        used_date: inventoryUsageForm.used_date || null,
        notes: inventoryUsageForm.notes.trim() || null,
      };

      if (!isOnline) {
        await enqueueOfflineMutation(
          buildQueueItem({
            entity: "inventoryUsage",
            action: "create",
            method: "post",
            url: "/farm-os/inventory/usage",
            data: payload,
          }),
          "Usage saved offline",
        );
        setInventoryUsageModalOpen(false);
        setInventoryUsageForm({
          inventory_id: "",
          quantity_used: "",
          field_id: "",
          crop_plan_id: "",
          used_date: todayIso(),
          notes: "",
        });
        return;
      }

      await farmOSService.recordInventoryUsage(payload);

      setInventoryUsageModalOpen(false);
      setInventoryUsageForm({
        inventory_id: "",
        quantity_used: "",
        field_id: "",
        crop_plan_id: "",
        used_date: todayIso(),
        notes: "",
      });
      await loadInventory();
    } catch (error: any) {
      Alert.alert(
        "Error",
        error.response?.data?.message || "Failed to record usage.",
      );
    } finally {
      setSaving(false);
    }
  };

  const saveCalendarEntry = async () => {
    if (!calendarForm.crop_type.trim()) {
      Alert.alert("Missing crop", "Crop type is required.");
      return;
    }

    try {
      setSaving(true);
      const payload = {
        crop_type: calendarForm.crop_type.trim(),
        region: calendarForm.region.trim() || null,
        recommended_planting_start: toOptionalNumber(
          calendarForm.recommended_planting_start,
        ),
        recommended_planting_end: toOptionalNumber(
          calendarForm.recommended_planting_end,
        ),
        expected_harvest_weeks: toOptionalNumber(
          calendarForm.expected_harvest_weeks,
        ),
        soil_requirements: calendarForm.soil_requirements.trim() || null,
        water_requirements: calendarForm.water_requirements.trim() || null,
        common_pests: calendarForm.common_pests.trim() || null,
        notes: calendarForm.notes.trim() || null,
      };

      if (!isOnline) {
        const localId = createLocalId();
        await enqueueOfflineMutation(
          buildQueueItem({
            entity: "calendarEntry",
            action: "create",
            method: "post",
            url: "/farm-os/calendar",
            data: payload,
            localId,
            targetId: localId,
          }),
          "Calendar saved offline",
        );
        setCalendarModalOpen(false);
        setCalendarForm({
          crop_type: "",
          region: "",
          recommended_planting_start: "",
          recommended_planting_end: "",
          expected_harvest_weeks: "",
          soil_requirements: "",
          water_requirements: "",
          common_pests: "",
          notes: "",
        });
        return;
      }

      await farmOSService.createCalendarEntry(payload);

      setCalendarModalOpen(false);
      setCalendarForm({
        crop_type: "",
        region: "",
        recommended_planting_start: "",
        recommended_planting_end: "",
        expected_harvest_weeks: "",
        soil_requirements: "",
        water_requirements: "",
        common_pests: "",
        notes: "",
      });
      await loadCalendar();
    } catch (error: any) {
      Alert.alert(
        "Error",
        error.response?.data?.message || "Failed to add calendar entry.",
      );
    } finally {
      setSaving(false);
    }
  };

  const renderChips = (
    options: Array<{ id: string; label: string }>,
    selectedId: string,
    onSelect: (value: string) => void,
    emptyLabel?: string,
  ) => (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View style={styles.chipRow}>
        {emptyLabel && (
          <TouchableOpacity onPress={() => onSelect("")}>
            <NeumorphicBadge
              label={emptyLabel}
              size="small"
              variant={selectedId ? "neutral" : "primary"}
            />
          </TouchableOpacity>
        )}
        {options.map((option) => (
          <TouchableOpacity key={option.id} onPress={() => onSelect(option.id)}>
            <NeumorphicBadge
              label={option.label}
              size="small"
              variant={selectedId === option.id ? "primary" : "neutral"}
            />
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );

  const profitabilityBreakdowns = useMemo(() => {
    const empty = {
      byCrop: [] as Array<{
        key: string;
        revenue: number;
        expenses: number;
        profit: number;
      }>,
      byField: [] as Array<{
        key: string;
        revenue: number;
        expenses: number;
        profit: number;
      }>,
      bySeason: [] as Array<{
        key: string;
        revenue: number;
        expenses: number;
        profit: number;
      }>,
    };

    if (!profitability) return empty;

    const planById = new Map<string, FarmOSCropPlan>();
    cropPlans.forEach((plan) => planById.set(plan.id, plan));

    const byCrop = new Map<string, (typeof empty.byCrop)[number]>();
    const byField = new Map<string, (typeof empty.byField)[number]>();
    const bySeason = new Map<string, (typeof empty.bySeason)[number]>();

    for (const row of profitability.byCrop || []) {
      const revenue = toCurrencyNumber(row.revenue);
      const expenses = toCurrencyNumber(row.expenses);
      const profit = toCurrencyNumber(row.profit);

      const cropKey = row.crop_type || "Unknown crop";
      const plan = planById.get(row.crop_plan_id);
      const fieldKey = plan?.field_name || "No field";
      const seasonKey = plan?.season || "Unknown season";

      const cropAgg = byCrop.get(cropKey) ?? {
        key: cropKey,
        revenue: 0,
        expenses: 0,
        profit: 0,
      };
      cropAgg.revenue += revenue;
      cropAgg.expenses += expenses;
      cropAgg.profit += profit;
      byCrop.set(cropKey, cropAgg);

      const fieldAgg = byField.get(fieldKey) ?? {
        key: fieldKey,
        revenue: 0,
        expenses: 0,
        profit: 0,
      };
      fieldAgg.revenue += revenue;
      fieldAgg.expenses += expenses;
      fieldAgg.profit += profit;
      byField.set(fieldKey, fieldAgg);

      const seasonAgg = bySeason.get(seasonKey) ?? {
        key: seasonKey,
        revenue: 0,
        expenses: 0,
        profit: 0,
      };
      seasonAgg.revenue += revenue;
      seasonAgg.expenses += expenses;
      seasonAgg.profit += profit;
      bySeason.set(seasonKey, seasonAgg);
    }

    const sortByProfit = <T extends { profit: number }>(rows: T[]) =>
      rows.sort((a, b) => b.profit - a.profit);

    return {
      byCrop: sortByProfit(Array.from(byCrop.values())),
      byField: sortByProfit(Array.from(byField.values())),
      bySeason: sortByProfit(Array.from(bySeason.values())),
    };
  }, [cropPlans, profitability]);

  const analyticsCharts = useMemo(() => {
    const empty = {
      labourDistribution:
        [] as FarmOSAnalyticsData["charts"]["labourDistribution"],
      expenseCategories:
        [] as FarmOSAnalyticsData["charts"]["expenseCategories"],
      cropYieldComparison:
        [] as FarmOSAnalyticsData["charts"]["cropYieldComparison"],
      labourEfficiency: [] as FarmOSAnalyticsData["charts"]["labourEfficiency"],
    };

    if (!analytics) return empty;

    const labourDistribution = (
      analytics.charts.labourDistribution ?? []
    ).slice(0, 6);
    const expenseCategories = (analytics.charts.expenseCategories ?? []).slice(
      0,
      6,
    );
    const cropYieldComparison =
      analytics.charts.cropYieldComparison?.length > 0
        ? analytics.charts.cropYieldComparison
        : (analytics.charts.yieldPerformance ?? [])
            .filter(
              (row) =>
                toChartNumber(row.expected) > 0 ||
                toChartNumber(row.actual) > 0,
            )
            .map((row) => ({
              name: row.variety
                ? `${row.crop_type} ${row.variety}`
                : row.crop_type,
              expected: row.expected,
              actual: row.actual,
            }));

    return {
      labourDistribution,
      expenseCategories,
      cropYieldComparison,
      labourEfficiency: analytics.charts.labourEfficiency ?? [],
    };
  }, [analytics]);

  const sectionTabs = useMemo(
    () => (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.sectionTabs}
      >
        {SECTIONS.map((section) => (
          <TouchableOpacity
            key={section.key}
            style={[
              styles.sectionTab,
              activeSection === section.key && styles.sectionTabActive,
            ]}
            onPress={() => setActiveSection(section.key)}
          >
            <Text
              style={[
                styles.sectionTabText,
                activeSection === section.key && styles.sectionTabTextActive,
              ]}
            >
              {section.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    ),
    [activeSection],
  );

  if (subLoading) {
    return (
      <NeumorphicScreen variant="list" showLeaves={false}>
        <View style={styles.loadingContainer}>
          <LoadingSpinner />
        </View>
      </NeumorphicScreen>
    );
  }

  if (!canAccess) {
    const gateMessage =
      access === "expired"
        ? "Your Farm OS subscription has expired."
        : access === "cancelled"
          ? "Your subscription is cancelled."
          : "Subscribe to unlock Farm OS management.";

    return (
      <NeumorphicScreen variant="list" showLeaves={true}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.gateHeader}>
            <View style={styles.gateIcon}>
              <ClipboardList size={28} color={neumorphicColors.primary[600]} />
            </View>
            <Text style={styles.title}>Farm OS</Text>
            <Text style={styles.subtitle}>{gateMessage}</Text>
          </View>

          <NeumorphicCard style={styles.featureCard}>
            <Text style={styles.sectionTitle}>What you get</Text>
            {[
              "Field and worker management",
              "Crop and livestock tracking",
              "Labour and inventory logs",
              "Financial ledger and profitability",
              "Market prices and AI insights",
              "Cropping calendar",
              "Weekly and monthly reports",
              "Analytics dashboards and exports",
              "Seasonal predictions",
            ].map((feature) => (
              <Text key={feature} style={styles.featureItem}>
                {`- ${feature}`}
              </Text>
            ))}
          </NeumorphicCard>

          {plans.length === 0 ? (
            <NeumorphicCard style={styles.planCard}>
              <Text style={styles.emptyText}>
                No subscription plans are available yet. Please contact support.
              </Text>
            </NeumorphicCard>
          ) : (
            plans.map((plan) => (
              <NeumorphicCard key={plan.id} style={styles.planCard}>
                <Text style={styles.planTitle}>{plan.name}</Text>
                <Text style={styles.planPrice}>
                  {formatCurrency(plan.price_usd)}
                  <Text style={styles.planCycle}>
                    {`/${plan.billing_cycle === "monthly" ? "mo" : "yr"}`}
                  </Text>
                </Text>
                <View style={styles.planActions}>
                  <NeumorphicButton
                    title="Pay from Wallet"
                    onPress={() => handleWalletSubscribe(plan.id)}
                    loading={saving}
                    fullWidth
                  />
                </View>
              </NeumorphicCard>
            ))
          )}

          <NeumorphicButton
            title="Back to Home"
            variant="tertiary"
            onPress={() => router.replace("/(tabs)/index")}
            fullWidth
          />
        </ScrollView>
      </NeumorphicScreen>
    );
  }

  return (
    <NeumorphicScreen variant="list" showLeaves={true}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[neumorphicColors.primary[600]]}
          />
        }
      >
        <View style={styles.headerRow}>
          <View style={styles.headerText}>
            <Text style={styles.title}>Farm OS</Text>
            <Text style={styles.subtitle}>
              {subscription?.plan_name
                ? `${subscription.plan_name} active`
                : "Farm OS subscription"}
            </Text>
          </View>
          <NeumorphicButton
            title="Update Farm"
            size="small"
            variant="secondary"
            onPress={openFarmModal}
          />
        </View>

        <NeumorphicCard style={styles.syncCard}>
          <View style={styles.syncRow}>
            <NeumorphicBadge
              label={isOnline ? "Online" : "Offline"}
              size="small"
              variant={isOnline ? "success" : "error"}
            />
            {pendingCount > 0 && (
              <NeumorphicBadge
                label={`${pendingCount} pending`}
                size="small"
                variant="info"
              />
            )}
            {syncing && <Text style={styles.syncMeta}>Syncing changes...</Text>}
            {lastSyncedAt && !syncing && (
              <Text style={styles.syncMeta}>
                {`Last synced: ${formatDate(lastSyncedAt)}`}
              </Text>
            )}
            {isOnline && pendingCount > 0 && !syncing && (
              <NeumorphicButton
                title="Sync now"
                size="small"
                variant="secondary"
                onPress={() => syncOfflineQueue(true)}
              />
            )}
          </View>
          {!isOnline && (
            <Text style={styles.syncHint}>
              You are offline. Changes will sync automatically once connected.
            </Text>
          )}
        </NeumorphicCard>

        {sectionTabs}

        {sectionLoading ? (
          <View style={styles.loadingContainer}>
            <LoadingSpinner />
          </View>
        ) : (
          <>
            {activeSection === "setup" && (
              <View style={styles.section}>
                <NeumorphicCard style={styles.sectionCard}>
                  <View style={styles.sectionHeaderRow}>
                    <Text style={styles.sectionTitle}>Farm Profile</Text>
                    <NeumorphicButton
                      title="Edit"
                      size="small"
                      variant="tertiary"
                      onPress={openFarmModal}
                    />
                  </View>
                  {farm ? (
                    <View style={styles.metaBlock}>
                      <Text style={styles.metaLabel}>{farm.name}</Text>
                      {!!farm.location && (
                        <Text style={styles.metaValue}>{farm.location}</Text>
                      )}
                      <View style={styles.metaRow}>
                        <NeumorphicBadge
                          label={`${farm.field_count ?? 0} fields`}
                          size="small"
                          variant="primary"
                        />
                        <NeumorphicBadge
                          label={`${farm.worker_count ?? 0} workers`}
                          size="small"
                          variant="info"
                        />
                        <NeumorphicBadge
                          label={`${farm.active_crops ?? 0} crops`}
                          size="small"
                          variant="success"
                        />
                      </View>
                    </View>
                  ) : (
                    <Text style={styles.emptyText}>
                      Add your farm details to get started.
                    </Text>
                  )}
                </NeumorphicCard>

                <View style={styles.sectionHeaderRow}>
                  <Text style={styles.sectionTitle}>Fields</Text>
                  <NeumorphicButton
                    title="Add Field"
                    size="small"
                    onPress={() => openFieldModal()}
                    icon={
                      <Plus size={16} color={neumorphicColors.text.inverse} />
                    }
                  />
                </View>
                {fields.length === 0 ? (
                  <NeumorphicCard style={styles.emptyCard}>
                    <Text style={styles.emptyText}>No fields yet.</Text>
                  </NeumorphicCard>
                ) : (
                  fields.map((field) => (
                    <NeumorphicCard key={field.id} style={styles.dataCard}>
                      <View style={styles.cardHeader}>
                        <Text style={styles.cardTitle}>{field.name}</Text>
                        {field.status && (
                          <NeumorphicBadge
                            label={field.status}
                            size="small"
                            variant="info"
                          />
                        )}
                      </View>
                      <Text style={styles.cardMeta}>
                        {field.area_ha ? `${field.area_ha} ha` : "Area not set"}
                      </Text>
                      {field.current_crop_type && (
                        <Text style={styles.cardMeta}>
                          {`Crop: ${field.current_crop_type}`}
                        </Text>
                      )}
                      <View style={styles.cardActions}>
                        <NeumorphicButton
                          title="Edit"
                          size="small"
                          variant="tertiary"
                          onPress={() => openFieldModal(field)}
                        />
                        <NeumorphicButton
                          title="Delete"
                          size="small"
                          variant="danger"
                          onPress={() => deleteField(field.id)}
                        />
                      </View>
                    </NeumorphicCard>
                  ))
                )}

                <View style={styles.sectionHeaderRow}>
                  <Text style={styles.sectionTitle}>Workers</Text>
                  <NeumorphicButton
                    title="Add Worker"
                    size="small"
                    onPress={() => openWorkerModal()}
                    icon={
                      <Plus size={16} color={neumorphicColors.text.inverse} />
                    }
                  />
                </View>
                {workers.length === 0 ? (
                  <NeumorphicCard style={styles.emptyCard}>
                    <Text style={styles.emptyText}>No workers yet.</Text>
                  </NeumorphicCard>
                ) : (
                  workers.map((worker) => (
                    <NeumorphicCard key={worker.id} style={styles.dataCard}>
                      <View style={styles.cardHeader}>
                        <Text style={styles.cardTitle}>{worker.full_name}</Text>
                        <NeumorphicBadge
                          label={worker.role}
                          size="small"
                          variant="primary"
                        />
                      </View>
                      {!!worker.phone && (
                        <Text style={styles.cardMeta}>{worker.phone}</Text>
                      )}
                      {!!worker.daily_wage_usd && (
                        <Text style={styles.cardMeta}>
                          {`Daily wage: ${formatCurrency(worker.daily_wage_usd)}`}
                        </Text>
                      )}
                      <View style={styles.cardActions}>
                        <NeumorphicButton
                          title="Edit"
                          size="small"
                          variant="tertiary"
                          onPress={() => openWorkerModal(worker)}
                        />
                      </View>
                    </NeumorphicCard>
                  ))
                )}
              </View>
            )}

            {activeSection === "crops" && (
              <View style={styles.section}>
                <View style={styles.sectionHeaderRow}>
                  <Text style={styles.sectionTitle}>Crop Plans</Text>
                  <NeumorphicButton
                    title="New Plan"
                    size="small"
                    onPress={() => openCropPlanModal()}
                    icon={
                      <Plus size={16} color={neumorphicColors.text.inverse} />
                    }
                  />
                </View>
                {cropPlans.length === 0 ? (
                  <NeumorphicCard style={styles.emptyCard}>
                    <Text style={styles.emptyText}>No crop plans yet.</Text>
                  </NeumorphicCard>
                ) : (
                  cropPlans.map((plan) => (
                    <NeumorphicCard key={plan.id} style={styles.dataCard}>
                      <View style={styles.cardHeader}>
                        <Text style={styles.cardTitle}>{plan.crop_type}</Text>
                        <NeumorphicBadge
                          label={plan.status ?? "planned"}
                          size="small"
                          variant="success"
                        />
                      </View>
                      <Text style={styles.cardMeta}>
                        {plan.field_name || "No field"}
                      </Text>
                      {plan.expected_harvest_date && (
                        <Text style={styles.cardMeta}>
                          {`Harvest: ${formatDate(plan.expected_harvest_date)}`}
                        </Text>
                      )}
                      <View style={styles.cardActions}>
                        <NeumorphicButton
                          title="Edit"
                          size="small"
                          variant="tertiary"
                          onPress={() => openCropPlanModal(plan)}
                        />
                      </View>
                    </NeumorphicCard>
                  ))
                )}

                <View style={styles.sectionHeaderRow}>
                  <Text style={styles.sectionTitle}>Crop Activities</Text>
                  <NeumorphicButton
                    title="Log Activity"
                    size="small"
                    onPress={() => setCropActivityModalOpen(true)}
                    icon={
                      <Plus size={16} color={neumorphicColors.text.inverse} />
                    }
                  />
                </View>
                {cropActivities.length === 0 ? (
                  <NeumorphicCard style={styles.emptyCard}>
                    <Text style={styles.emptyText}>No activities logged.</Text>
                  </NeumorphicCard>
                ) : (
                  cropActivities.map((activity) => (
                    <NeumorphicCard key={activity.id} style={styles.dataCard}>
                      <View style={styles.cardHeader}>
                        <Text style={styles.cardTitle}>
                          {activity.activity_type}
                        </Text>
                        <NeumorphicBadge
                          label={formatDate(activity.activity_date)}
                          size="small"
                          variant="info"
                        />
                      </View>
                      <Text style={styles.cardMeta}>
                        {activity.crop_type || "Unknown crop"}
                      </Text>
                      {activity.field_name && (
                        <Text style={styles.cardMeta}>
                          {`Field: ${activity.field_name}`}
                        </Text>
                      )}
                      {activity.description && (
                        <Text style={styles.cardMeta}>
                          {activity.description}
                        </Text>
                      )}
                    </NeumorphicCard>
                  ))
                )}
              </View>
            )}

            {activeSection === "livestock" && (
              <View style={styles.section}>
                <View style={styles.sectionHeaderRow}>
                  <Text style={styles.sectionTitle}>Livestock Groups</Text>
                  <NeumorphicButton
                    title="Add Group"
                    size="small"
                    onPress={() => openLivestockGroupModal()}
                    icon={
                      <Plus size={16} color={neumorphicColors.text.inverse} />
                    }
                  />
                </View>
                {livestockGroups.length === 0 ? (
                  <NeumorphicCard style={styles.emptyCard}>
                    <Text style={styles.emptyText}>
                      No livestock groups yet.
                    </Text>
                  </NeumorphicCard>
                ) : (
                  livestockGroups.map((group) => (
                    <NeumorphicCard key={group.id} style={styles.dataCard}>
                      <View style={styles.cardHeader}>
                        <Text style={styles.cardTitle}>{group.species}</Text>
                        <NeumorphicBadge
                          label={`${group.count} head`}
                          size="small"
                          variant="primary"
                        />
                      </View>
                      {group.breed && (
                        <Text style={styles.cardMeta}>{group.breed}</Text>
                      )}
                      {group.field_name && (
                        <Text style={styles.cardMeta}>
                          {`Field: ${group.field_name}`}
                        </Text>
                      )}
                      <View style={styles.cardActions}>
                        <NeumorphicButton
                          title="Edit"
                          size="small"
                          variant="tertiary"
                          onPress={() => openLivestockGroupModal(group)}
                        />
                      </View>
                    </NeumorphicCard>
                  ))
                )}

                <View style={styles.sectionHeaderRow}>
                  <Text style={styles.sectionTitle}>Livestock Activities</Text>
                  <NeumorphicButton
                    title="Log Activity"
                    size="small"
                    onPress={() => setLivestockActivityModalOpen(true)}
                    icon={
                      <Plus size={16} color={neumorphicColors.text.inverse} />
                    }
                  />
                </View>
                {livestockActivities.length === 0 ? (
                  <NeumorphicCard style={styles.emptyCard}>
                    <Text style={styles.emptyText}>No activities logged.</Text>
                  </NeumorphicCard>
                ) : (
                  livestockActivities.map((activity) => (
                    <NeumorphicCard key={activity.id} style={styles.dataCard}>
                      <View style={styles.cardHeader}>
                        <Text style={styles.cardTitle}>
                          {activity.activity_type}
                        </Text>
                        <NeumorphicBadge
                          label={formatDate(activity.activity_date)}
                          size="small"
                          variant="info"
                        />
                      </View>
                      <Text style={styles.cardMeta}>
                        {`${activity.species ?? "Livestock"}`}
                      </Text>
                      {activity.description && (
                        <Text style={styles.cardMeta}>
                          {activity.description}
                        </Text>
                      )}
                    </NeumorphicCard>
                  ))
                )}
              </View>
            )}

            {activeSection === "labour" && (
              <View style={styles.section}>
                <View style={styles.sectionHeaderRow}>
                  <Text style={styles.sectionTitle}>Labour Tracking</Text>
                  <NeumorphicButton
                    title="Log Labour"
                    size="small"
                    onPress={() => setLabourModalOpen(true)}
                    icon={
                      <Plus size={16} color={neumorphicColors.text.inverse} />
                    }
                  />
                </View>

                <NeumorphicCard style={styles.sectionCard}>
                  <Text style={styles.sectionSubtitle}>Summary</Text>
                  <View style={styles.metaRow}>
                    <NeumorphicBadge
                      label={`${labourSummary?.total_hours ?? 0} hrs`}
                      size="small"
                      variant="info"
                    />
                    <NeumorphicBadge
                      label={formatCurrency(labourSummary?.total_wages ?? 0)}
                      size="small"
                      variant="success"
                    />
                    <NeumorphicBadge
                      label={`${labourSummary?.unique_workers ?? 0} workers`}
                      size="small"
                      variant="primary"
                    />
                  </View>
                </NeumorphicCard>

                <NeumorphicCard style={styles.sectionCard}>
                  <Text style={styles.sectionSubtitle}>Filter period</Text>
                  <NeumorphicInput
                    label="Start date"
                    placeholder="YYYY-MM-DD"
                    value={labourStartDate}
                    onChangeText={setLabourStartDate}
                  />
                  <NeumorphicInput
                    label="End date"
                    placeholder="YYYY-MM-DD"
                    value={labourEndDate}
                    onChangeText={setLabourEndDate}
                  />
                  <NeumorphicButton
                    title="Refresh"
                    variant="secondary"
                    size="small"
                    onPress={loadLabour}
                  />
                </NeumorphicCard>

                {labourDays.length === 0 ? (
                  <NeumorphicCard style={styles.emptyCard}>
                    <Text style={styles.emptyText}>No labour entries yet.</Text>
                  </NeumorphicCard>
                ) : (
                  labourDays.map((entry) => (
                    <NeumorphicCard key={entry.id} style={styles.dataCard}>
                      <View style={styles.cardHeader}>
                        <Text style={styles.cardTitle}>
                          {entry.task_category}
                        </Text>
                        <NeumorphicBadge
                          label={formatDate(entry.work_date)}
                          size="small"
                          variant="info"
                        />
                      </View>
                      {entry.worker_name && (
                        <Text style={styles.cardMeta}>
                          {`Worker: ${entry.worker_name}`}
                        </Text>
                      )}
                      {entry.field_name && (
                        <Text style={styles.cardMeta}>
                          {`Field: ${entry.field_name}`}
                        </Text>
                      )}
                      <Text style={styles.cardMeta}>
                        {`Hours: ${entry.hours_worked ?? 0}`}
                      </Text>
                      <View style={styles.cardActions}>
                        <NeumorphicButton
                          title="Delete"
                          size="small"
                          variant="danger"
                          onPress={() => deleteLabourDay(entry.id)}
                        />
                      </View>
                    </NeumorphicCard>
                  ))
                )}

                {labourByCategory.length > 0 && (
                  <NeumorphicCard style={styles.sectionCard}>
                    <Text style={styles.sectionSubtitle}>By category</Text>
                    {labourByCategory.map((row) => (
                      <View key={row.task_category} style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>
                          {row.task_category}
                        </Text>
                        <Text style={styles.summaryValue}>
                          {formatCurrency(row.wages ?? 0)}
                        </Text>
                      </View>
                    ))}
                  </NeumorphicCard>
                )}
              </View>
            )}

            {activeSection === "inventory" && (
              <View style={styles.section}>
                <View style={styles.sectionHeaderRow}>
                  <Text style={styles.sectionTitle}>Inventory</Text>
                  <View style={styles.headerActions}>
                    <NeumorphicButton
                      title="Add Item"
                      size="small"
                      onPress={() => openInventoryModal()}
                      icon={
                        <Plus size={16} color={neumorphicColors.text.inverse} />
                      }
                    />
                    <NeumorphicButton
                      title="Use Stock"
                      size="small"
                      variant="secondary"
                      onPress={() => setInventoryUsageModalOpen(true)}
                    />
                  </View>
                </View>

                {inventoryAlerts.length > 0 && (
                  <NeumorphicCard style={styles.alertCard}>
                    <Text style={styles.sectionSubtitle}>Alerts</Text>
                    {inventoryAlerts.map((item) => (
                      <Text key={item.id} style={styles.alertText}>
                        {`${item.name} ${item.low_stock ? "low stock" : ""}${
                          item.expiring_soon ? " expiring" : ""
                        }`}
                      </Text>
                    ))}
                  </NeumorphicCard>
                )}

                {inventorySummary.length > 0 && (
                  <NeumorphicCard style={styles.sectionCard}>
                    <Text style={styles.sectionSubtitle}>Summary</Text>
                    {inventorySummary.map((row) => (
                      <View key={row.item_type} style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>{row.item_type}</Text>
                        <Text style={styles.summaryValue}>
                          {formatCurrency(row.total_value)}
                        </Text>
                      </View>
                    ))}
                  </NeumorphicCard>
                )}

                {inventory.length === 0 ? (
                  <NeumorphicCard style={styles.emptyCard}>
                    <Text style={styles.emptyText}>
                      No inventory items yet.
                    </Text>
                  </NeumorphicCard>
                ) : (
                  inventory.map((item) => (
                    <NeumorphicCard key={item.id} style={styles.dataCard}>
                      <View style={styles.cardHeader}>
                        <Text style={styles.cardTitle}>{item.name}</Text>
                        <NeumorphicBadge
                          label={item.item_type}
                          size="small"
                          variant="primary"
                        />
                      </View>
                      <Text style={styles.cardMeta}>
                        {`Qty: ${item.quantity} ${item.unit ?? ""}`}
                      </Text>
                      {item.unit_cost_usd && (
                        <Text style={styles.cardMeta}>
                          {`Unit cost: ${formatCurrency(item.unit_cost_usd)}`}
                        </Text>
                      )}
                      <View style={styles.cardActions}>
                        <NeumorphicButton
                          title="Edit"
                          size="small"
                          variant="tertiary"
                          onPress={() => openInventoryModal(item)}
                        />
                      </View>
                    </NeumorphicCard>
                  ))
                )}
              </View>
            )}

            {activeSection === "ledger" && (
              <View style={styles.section}>
                <View style={styles.sectionHeaderRow}>
                  <Text style={styles.sectionTitle}>Financial Ledger</Text>
                  <View style={styles.headerActions}>
                    <NeumorphicButton
                      title="Expense"
                      size="small"
                      onPress={() => openExpenseModal()}
                      icon={
                        <Plus size={16} color={neumorphicColors.text.inverse} />
                      }
                    />
                    <NeumorphicButton
                      title="Revenue"
                      size="small"
                      variant="secondary"
                      onPress={() => openRevenueModal()}
                    />
                  </View>
                </View>

                <NeumorphicCard style={styles.sectionCard}>
                  <Text style={styles.sectionSubtitle}>Period</Text>
                  <NeumorphicInput
                    label="Year"
                    value={financeYear}
                    onChangeText={setFinanceYear}
                    keyboardType="numeric"
                  />
                  <NeumorphicInput
                    label="Month"
                    value={financeMonth}
                    onChangeText={setFinanceMonth}
                    keyboardType="numeric"
                  />
                  <NeumorphicButton
                    title="Load Period"
                    variant="secondary"
                    size="small"
                    onPress={loadSectionData}
                  />
                </NeumorphicCard>

                <NeumorphicCard style={styles.sectionCard}>
                  <Text style={styles.sectionSubtitle}>Exports</Text>
                  <View style={styles.exportRow}>
                    <NeumorphicButton
                      title="Expenses CSV"
                      size="small"
                      loading={exportingType === "expenses"}
                      onPress={() => handleExportCSV("expenses")}
                    />
                    <NeumorphicButton
                      title="Revenue CSV"
                      size="small"
                      variant="secondary"
                      loading={exportingType === "revenue"}
                      onPress={() => handleExportCSV("revenue")}
                    />
                  </View>
                  <Text style={styles.exportHint}>
                    Uses the selected finance period.
                  </Text>
                </NeumorphicCard>

                <NeumorphicCard style={styles.sectionCard}>
                  <Text style={styles.sectionSubtitle}>Summary</Text>
                  <View style={styles.metaRow}>
                    <NeumorphicBadge
                      label={`Expenses: ${formatCurrency(
                        expenseSummary?.total_expenses ?? 0,
                      )}`}
                      size="small"
                      variant="error"
                    />
                    <NeumorphicBadge
                      label={`Revenue: ${formatCurrency(
                        revenueSummary?.total_revenue ?? 0,
                      )}`}
                      size="small"
                      variant="success"
                    />
                    <NeumorphicBadge
                      label={`Net: ${formatCurrency(
                        toCurrencyNumber(revenueSummary?.total_revenue) -
                          toCurrencyNumber(expenseSummary?.total_expenses),
                      )}`}
                      size="small"
                      variant={
                        toCurrencyNumber(revenueSummary?.total_revenue) -
                          toCurrencyNumber(expenseSummary?.total_expenses) >=
                        0
                          ? "primary"
                          : "error"
                      }
                    />
                  </View>
                </NeumorphicCard>

                <Text style={styles.sectionSubtitle}>Expenses</Text>
                {expenses.length === 0 ? (
                  <NeumorphicCard style={styles.emptyCard}>
                    <Text style={styles.emptyText}>
                      No expenses for this period.
                    </Text>
                  </NeumorphicCard>
                ) : (
                  expenses.slice(0, 20).map((expense) => (
                    <NeumorphicCard key={expense.id} style={styles.dataCard}>
                      <View style={styles.cardHeader}>
                        <Text style={styles.cardTitle}>
                          {expense.description || expense.category}
                        </Text>
                        <NeumorphicBadge
                          label={formatCurrency(expense.amount_usd)}
                          size="small"
                          variant="error"
                        />
                      </View>
                      <Text style={styles.cardMeta}>
                        {`${expense.category} • ${formatDate(
                          expense.expense_date,
                        )}`}
                      </Text>
                      {expense.field_name && (
                        <Text style={styles.cardMeta}>
                          {`Field: ${expense.field_name}`}
                        </Text>
                      )}
                      {expense.crop_type && (
                        <Text style={styles.cardMeta}>
                          {`Crop: ${expense.crop_type}`}
                        </Text>
                      )}
                      <View style={styles.cardActions}>
                        <NeumorphicButton
                          title="Edit"
                          size="small"
                          variant="tertiary"
                          onPress={() => openExpenseModal(expense)}
                        />
                      </View>
                    </NeumorphicCard>
                  ))
                )}

                <Text style={styles.sectionSubtitle}>Revenue</Text>
                {revenueEntries.length === 0 ? (
                  <NeumorphicCard style={styles.emptyCard}>
                    <Text style={styles.emptyText}>
                      No revenue entries for this period.
                    </Text>
                  </NeumorphicCard>
                ) : (
                  revenueEntries.slice(0, 20).map((entry) => (
                    <NeumorphicCard key={entry.id} style={styles.dataCard}>
                      <View style={styles.cardHeader}>
                        <Text style={styles.cardTitle}>
                          {entry.description || entry.category}
                        </Text>
                        <NeumorphicBadge
                          label={formatCurrency(entry.amount_usd)}
                          size="small"
                          variant="success"
                        />
                      </View>
                      <Text style={styles.cardMeta}>
                        {`${entry.category} • ${formatDate(entry.revenue_date)}`}
                      </Text>
                      {entry.quantity && entry.unit && (
                        <Text style={styles.cardMeta}>
                          {`Qty: ${entry.quantity} ${entry.unit}`}
                        </Text>
                      )}
                      {entry.buyer_name && (
                        <Text style={styles.cardMeta}>
                          {`Buyer: ${entry.buyer_name}`}
                        </Text>
                      )}
                      {entry.field_name && (
                        <Text style={styles.cardMeta}>
                          {`Field: ${entry.field_name}`}
                        </Text>
                      )}
                      {entry.crop_type && (
                        <Text style={styles.cardMeta}>
                          {`Crop: ${entry.crop_type}`}
                        </Text>
                      )}
                      <View style={styles.cardActions}>
                        <NeumorphicButton
                          title="Edit"
                          size="small"
                          variant="tertiary"
                          onPress={() => openRevenueModal(entry)}
                        />
                      </View>
                    </NeumorphicCard>
                  ))
                )}
              </View>
            )}

            {activeSection === "profitability" && (
              <View style={styles.section}>
                <View style={styles.sectionHeaderRow}>
                  <Text style={styles.sectionTitle}>Profitability</Text>
                  <NeumorphicButton
                    title="Refresh"
                    size="small"
                    variant="secondary"
                    onPress={loadSectionData}
                  />
                </View>

                <NeumorphicCard style={styles.sectionCard}>
                  <Text style={styles.sectionSubtitle}>Period</Text>
                  <NeumorphicInput
                    label="Year"
                    value={financeYear}
                    onChangeText={setFinanceYear}
                    keyboardType="numeric"
                  />
                  <NeumorphicInput
                    label="Month"
                    value={financeMonth}
                    onChangeText={setFinanceMonth}
                    keyboardType="numeric"
                  />
                  <NeumorphicButton
                    title="Load Period"
                    size="small"
                    variant="secondary"
                    onPress={loadSectionData}
                  />
                </NeumorphicCard>

                {!profitability ? (
                  <NeumorphicCard style={styles.emptyCard}>
                    <Text style={styles.emptyText}>
                      Load a period to see profitability.
                    </Text>
                  </NeumorphicCard>
                ) : (
                  <>
                    <NeumorphicCard style={styles.sectionCard}>
                      <Text style={styles.sectionSubtitle}>Summary</Text>
                      <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Revenue</Text>
                        <Text style={styles.summaryValue}>
                          {formatCurrency(profitability.summary.totalRevenue)}
                        </Text>
                      </View>
                      <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Expenses</Text>
                        <Text style={styles.summaryValue}>
                          {formatCurrency(profitability.summary.totalExpenses)}
                        </Text>
                      </View>
                      <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Net profit</Text>
                        <Text style={styles.summaryValue}>
                          {formatCurrency(profitability.summary.netProfit)}
                        </Text>
                      </View>
                      <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Margin</Text>
                        <Text style={styles.summaryValue}>
                          {profitability.summary.profitMargin}
                        </Text>
                      </View>
                    </NeumorphicCard>

                    <NeumorphicCard style={styles.sectionCard}>
                      <Text style={styles.sectionSubtitle}>Profit by crop</Text>
                      {profitabilityBreakdowns.byCrop.length === 0 ? (
                        <Text style={styles.emptyText}>No crop data.</Text>
                      ) : (
                        profitabilityBreakdowns.byCrop.map((row) => (
                          <View key={row.key} style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>{row.key}</Text>
                            <Text style={styles.summaryValue}>
                              {formatCurrency(row.profit)}
                            </Text>
                          </View>
                        ))
                      )}
                    </NeumorphicCard>

                    <NeumorphicCard style={styles.sectionCard}>
                      <Text style={styles.sectionSubtitle}>
                        Profit by field
                      </Text>
                      {profitabilityBreakdowns.byField.length === 0 ? (
                        <Text style={styles.emptyText}>No field data.</Text>
                      ) : (
                        profitabilityBreakdowns.byField.map((row) => (
                          <View key={row.key} style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>{row.key}</Text>
                            <Text style={styles.summaryValue}>
                              {formatCurrency(row.profit)}
                            </Text>
                          </View>
                        ))
                      )}
                    </NeumorphicCard>

                    <NeumorphicCard style={styles.sectionCard}>
                      <Text style={styles.sectionSubtitle}>
                        Profit by season
                      </Text>
                      {profitabilityBreakdowns.bySeason.length === 0 ? (
                        <Text style={styles.emptyText}>No season data.</Text>
                      ) : (
                        profitabilityBreakdowns.bySeason.map((row) => (
                          <View key={row.key} style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>{row.key}</Text>
                            <Text style={styles.summaryValue}>
                              {formatCurrency(row.profit)}
                            </Text>
                          </View>
                        ))
                      )}
                    </NeumorphicCard>

                    {profitability.trend?.length > 0 && (
                      <NeumorphicCard style={styles.sectionCard}>
                        <Text style={styles.sectionSubtitle}>
                          6-month trend
                        </Text>
                        {profitability.trend.map((row) => (
                          <View key={row.month} style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>{row.month}</Text>
                            <Text style={styles.summaryValue}>
                              {formatCurrency(row.profit)}
                            </Text>
                          </View>
                        ))}
                      </NeumorphicCard>
                    )}
                  </>
                )}
              </View>
            )}

            {activeSection === "market" && (
              <View style={styles.section}>
                <View style={styles.sectionHeaderRow}>
                  <Text style={styles.sectionTitle}>Market Intelligence</Text>
                  <View style={styles.headerActions}>
                    <NeumorphicButton
                      title="Add Price"
                      size="small"
                      onPress={openMarketPriceModal}
                      icon={
                        <Plus size={16} color={neumorphicColors.text.inverse} />
                      }
                    />
                    <NeumorphicButton
                      title="AI Insights"
                      size="small"
                      variant="secondary"
                      loading={marketGenerating}
                      onPress={generateMarketInsights}
                    />
                  </View>
                </View>

                {marketInsights ? (
                  <NeumorphicCard style={styles.sectionCard}>
                    <Text style={styles.sectionSubtitle}>AI Summary</Text>
                    {marketGeneratedAt && (
                      <Text style={styles.cardMeta}>
                        {`Generated: ${formatDate(marketGeneratedAt)}`}
                      </Text>
                    )}
                    {!!marketInsights.marketSummary && (
                      <Text style={styles.cardMeta}>
                        {marketInsights.marketSummary}
                      </Text>
                    )}

                    {Array.isArray(marketInsights.recommendations) &&
                      marketInsights.recommendations.length > 0 && (
                        <>
                          <Text style={styles.sectionSubtitle}>
                            Recommendations
                          </Text>
                          {marketInsights.recommendations
                            .slice(0, 6)
                            .map((rec, index) => (
                              <Text
                                key={`${rec.crop}-${index}`}
                                style={styles.alertText}
                              >
                                {`- ${rec.crop}: ${rec.action}${
                                  rec.urgency ? ` (${rec.urgency})` : ""
                                }`}
                              </Text>
                            ))}
                        </>
                      )}
                  </NeumorphicCard>
                ) : (
                  <NeumorphicCard style={styles.emptyCard}>
                    <Text style={styles.emptyText}>
                      Generate AI insights to get recommendations.
                    </Text>
                  </NeumorphicCard>
                )}

                <Text style={styles.sectionSubtitle}>Latest prices</Text>
                {marketPrices.length === 0 ? (
                  <NeumorphicCard style={styles.emptyCard}>
                    <Text style={styles.emptyText}>No market prices yet.</Text>
                  </NeumorphicCard>
                ) : (
                  marketPrices.map((price) => (
                    <NeumorphicCard key={price.id} style={styles.dataCard}>
                      <View style={styles.cardHeader}>
                        <Text style={styles.cardTitle}>{price.commodity}</Text>
                        {price.demand_level && (
                          <NeumorphicBadge
                            label={price.demand_level}
                            size="small"
                            variant={
                              price.demand_level === "very_high"
                                ? "primary"
                                : price.demand_level === "high"
                                  ? "success"
                                  : price.demand_level === "medium"
                                    ? "info"
                                    : "neutral"
                            }
                          />
                        )}
                      </View>
                      <Text style={styles.cardMeta}>
                        {`${formatCurrency(price.price_usd)} / ${price.unit}`}
                      </Text>
                      <Text style={styles.cardMeta}>
                        {`Date: ${formatDate(price.price_date)}`}
                      </Text>
                      {price.region && (
                        <Text style={styles.cardMeta}>
                          {`Region: ${price.region}`}
                        </Text>
                      )}
                      {price.source && (
                        <Text style={styles.cardMeta}>
                          {`Source: ${price.source}`}
                        </Text>
                      )}
                      {price.is_ai_generated && (
                        <View style={styles.metaRow}>
                          <NeumorphicBadge
                            label="AI generated"
                            size="small"
                            variant="neutral"
                          />
                        </View>
                      )}
                    </NeumorphicCard>
                  ))
                )}
              </View>
            )}

            {activeSection === "calendar" && (
              <View style={styles.section}>
                <View style={styles.sectionHeaderRow}>
                  <Text style={styles.sectionTitle}>Cropping Calendar</Text>
                  <NeumorphicButton
                    title="Add Entry"
                    size="small"
                    onPress={() => setCalendarModalOpen(true)}
                    icon={
                      <Plus size={16} color={neumorphicColors.text.inverse} />
                    }
                  />
                </View>

                {plantingNow.length > 0 && (
                  <NeumorphicCard style={styles.sectionCard}>
                    <Text style={styles.sectionSubtitle}>Planting now</Text>
                    {plantingNow.map((entry) => (
                      <Text key={entry.id} style={styles.alertText}>
                        {entry.crop_type}
                      </Text>
                    ))}
                  </NeumorphicCard>
                )}

                {calendarEntries.length === 0 ? (
                  <NeumorphicCard style={styles.emptyCard}>
                    <Text style={styles.emptyText}>
                      No calendar entries yet.
                    </Text>
                  </NeumorphicCard>
                ) : (
                  calendarEntries.map((entry) => (
                    <NeumorphicCard key={entry.id} style={styles.dataCard}>
                      <View style={styles.cardHeader}>
                        <Text style={styles.cardTitle}>{entry.crop_type}</Text>
                        {entry.region && (
                          <NeumorphicBadge
                            label={entry.region}
                            size="small"
                            variant="info"
                          />
                        )}
                      </View>
                      {entry.expected_harvest_weeks && (
                        <Text style={styles.cardMeta}>
                          {`Harvest in ${entry.expected_harvest_weeks} weeks`}
                        </Text>
                      )}
                      {!!entry.notes && (
                        <Text style={styles.cardMeta}>{entry.notes}</Text>
                      )}
                    </NeumorphicCard>
                  ))
                )}
              </View>
            )}

            {activeSection === "analytics" && (
              <View style={styles.section}>
                <View style={styles.sectionHeaderRow}>
                  <Text style={styles.sectionTitle}>Analytics & Forecasts</Text>
                  <NeumorphicButton
                    title="Refresh"
                    size="small"
                    variant="secondary"
                    onPress={loadAnalytics}
                  />
                </View>

                <NeumorphicCard style={styles.sectionCard}>
                  <Text style={styles.sectionSubtitle}>
                    Seasonal intelligence
                  </Text>
                  <NeumorphicButton
                    title="Generate predictions"
                    size="small"
                    variant="secondary"
                    loading={predictionsLoading}
                    onPress={handleGeneratePredictions}
                  />
                  {predictionsGeneratedAt && (
                    <Text style={styles.cardMeta}>
                      {`Generated: ${formatDate(predictionsGeneratedAt)}`}
                    </Text>
                  )}
                  {predictions ? (
                    <>
                      {!!predictions.seasonalOutlook && (
                        <Text style={styles.cardMeta}>
                          {predictions.seasonalOutlook}
                        </Text>
                      )}
                      {predictions.nextMonthActions?.length > 0 && (
                        <>
                          <Text style={styles.sectionSubtitle}>
                            Next month actions
                          </Text>
                          {predictions.nextMonthActions
                            .slice(0, 4)
                            .map((item, index) => (
                              <View
                                key={`${item.action}-${index}`}
                                style={styles.predictionRow}
                              >
                                <Text style={styles.summaryLabel}>
                                  {item.action}
                                </Text>
                                <Text style={styles.predictionTag}>
                                  {item.priority}
                                </Text>
                              </View>
                            ))}
                        </>
                      )}
                      {predictions.cropRecommendations?.length > 0 && (
                        <>
                          <Text style={styles.sectionSubtitle}>
                            Crop recommendations
                          </Text>
                          {predictions.cropRecommendations
                            .slice(0, 4)
                            .map((rec, index) => (
                              <Text
                                key={`${rec.crop}-${index}`}
                                style={styles.alertText}
                              >
                                {`- ${rec.crop}: ${rec.recommendation} (${rec.timing})`}
                              </Text>
                            ))}
                        </>
                      )}
                    </>
                  ) : (
                    <Text style={styles.emptyText}>
                      Generate predictions to see seasonal outlook.
                    </Text>
                  )}
                </NeumorphicCard>

                {analytics ? (
                  <>
                    <View style={styles.kpiGrid}>
                      {[
                        {
                          label: "Revenue (6m)",
                          value: formatCurrency(analytics.kpis.totalRevenue6m),
                        },
                        {
                          label: "Expenses (6m)",
                          value: formatCurrency(analytics.kpis.totalExpenses6m),
                        },
                        {
                          label: "Net Profit",
                          value: formatCurrency(analytics.kpis.netProfit6m),
                        },
                        {
                          label: "Avg Yield",
                          value: String(
                            analytics.kpis.avgYieldAchievement || "0%",
                          ),
                        },
                      ].map((item) => (
                        <NeumorphicCard key={item.label} style={styles.kpiCard}>
                          <Text style={styles.kpiLabel}>{item.label}</Text>
                          <Text style={styles.kpiValue}>{item.value}</Text>
                        </NeumorphicCard>
                      ))}
                    </View>

                    {analytics.charts.revenueVsExpenses?.length > 0 && (
                      <NeumorphicCard style={styles.sectionCard}>
                        <Text style={styles.sectionSubtitle}>
                          Revenue vs expenses (6 months)
                        </Text>
                        <ChartContainer height={200}>
                          {(width, height) => {
                            const padding = 24;
                            const rows = analytics.charts.revenueVsExpenses;
                            const revenue = rows.map((row) =>
                              toChartNumber(row.revenue),
                            );
                            const expenses = rows.map((row) =>
                              toChartNumber(row.expenses),
                            );
                            const profit = rows.map((row) =>
                              toChartNumber(row.profit),
                            );
                            const allValues = [
                              ...revenue,
                              ...expenses,
                              ...profit,
                            ];
                            const minValue = Math.min(...allValues, 0);
                            const maxValue = Math.max(...allValues, 1);
                            const revenuePoints = buildLinePoints(
                              revenue,
                              width,
                              height,
                              padding,
                              minValue,
                              maxValue,
                            );
                            const expensePoints = buildLinePoints(
                              expenses,
                              width,
                              height,
                              padding,
                              minValue,
                              maxValue,
                            );
                            const profitPoints = buildLinePoints(
                              profit,
                              width,
                              height,
                              padding,
                              minValue,
                              maxValue,
                            );
                            const labelIndexes = [
                              0,
                              Math.max(Math.floor(rows.length / 2), 0),
                              Math.max(rows.length - 1, 0),
                            ];

                            return (
                              <Svg width={width} height={height}>
                                {Array.from({ length: 4 }).map((_, idx) => {
                                  const y =
                                    padding +
                                    ((height - padding * 2) / 3) * idx;
                                  return (
                                    <SvgLine
                                      key={`grid-${idx}`}
                                      x1={padding}
                                      x2={width - padding}
                                      y1={y}
                                      y2={y}
                                      stroke="#e5e7eb"
                                      strokeWidth={1}
                                    />
                                  );
                                })}
                                <Path
                                  d={pointsToPath(revenuePoints)}
                                  stroke={CHART_COLORS.revenue}
                                  strokeWidth={2.5}
                                  fill="none"
                                />
                                <Path
                                  d={pointsToPath(expensePoints)}
                                  stroke={CHART_COLORS.expenses}
                                  strokeWidth={2.5}
                                  fill="none"
                                />
                                <Path
                                  d={pointsToPath(profitPoints)}
                                  stroke={CHART_COLORS.profit}
                                  strokeWidth={2.5}
                                  fill="none"
                                />
                                {revenuePoints.slice(-1).map((point, idx) => (
                                  <Circle
                                    key={`rev-dot-${idx}`}
                                    cx={point.x}
                                    cy={point.y}
                                    r={4}
                                    fill={CHART_COLORS.revenue}
                                  />
                                ))}
                                {expensePoints.slice(-1).map((point, idx) => (
                                  <Circle
                                    key={`exp-dot-${idx}`}
                                    cx={point.x}
                                    cy={point.y}
                                    r={4}
                                    fill={CHART_COLORS.expenses}
                                  />
                                ))}
                                {profitPoints.slice(-1).map((point, idx) => (
                                  <Circle
                                    key={`pro-dot-${idx}`}
                                    cx={point.x}
                                    cy={point.y}
                                    r={4}
                                    fill={CHART_COLORS.profit}
                                  />
                                ))}
                                {labelIndexes
                                  .filter(
                                    (value, index, arr) =>
                                      arr.indexOf(value) === index &&
                                      value >= 0 &&
                                      value < rows.length,
                                  )
                                  .map((index) => (
                                    <SvgText
                                      key={`label-${index}`}
                                      x={revenuePoints[index]?.x ?? padding}
                                      y={height - 6}
                                      fontSize={10}
                                      fill="#6b7280"
                                      textAnchor="middle"
                                    >
                                      {rows[index]?.month ?? ""}
                                    </SvgText>
                                  ))}
                              </Svg>
                            );
                          }}
                        </ChartContainer>
                        <View style={styles.legendRow}>
                          {[
                            { label: "Revenue", color: CHART_COLORS.revenue },
                            { label: "Expenses", color: CHART_COLORS.expenses },
                            { label: "Profit", color: CHART_COLORS.profit },
                          ].map((item) => (
                            <View key={item.label} style={styles.legendItem}>
                              <View
                                style={[
                                  styles.legendDot,
                                  { backgroundColor: item.color },
                                ]}
                              />
                              <Text style={styles.legendLabel}>
                                {item.label}
                              </Text>
                            </View>
                          ))}
                        </View>
                      </NeumorphicCard>
                    )}

                    {analyticsCharts.labourDistribution.length > 0 &&
                      (() => {
                        const rows = analyticsCharts.labourDistribution;
                        const values = rows.map((row) =>
                          Math.max(toChartNumber(row.value), 0),
                        );
                        const total = values.reduce(
                          (sum, value) => sum + value,
                          0,
                        );

                        return (
                          <NeumorphicCard style={styles.sectionCard}>
                            <Text style={styles.sectionSubtitle}>
                              Labour distribution (90 days)
                            </Text>
                            <ChartContainer height={220}>
                              {(width, height) => {
                                const radius = Math.min(width, height) / 2 - 12;
                                const centerX = width / 2;
                                const centerY = height / 2;
                                const slices = buildPieSlices(values);

                                return (
                                  <Svg width={width} height={height}>
                                    <G>
                                      {total <= 0 ? (
                                        <Circle
                                          cx={centerX}
                                          cy={centerY}
                                          r={radius}
                                          fill="#e5e7eb"
                                        />
                                      ) : (
                                        slices.map((slice, idx) => (
                                          <Path
                                            key={`labour-slice-${idx}`}
                                            d={describeArc(
                                              centerX,
                                              centerY,
                                              radius,
                                              slice.startAngle,
                                              slice.endAngle,
                                            )}
                                            fill={
                                              CHART_PALETTE[
                                                idx % CHART_PALETTE.length
                                              ]
                                            }
                                          />
                                        ))
                                      )}
                                    </G>
                                  </Svg>
                                );
                              }}
                            </ChartContainer>
                            <View style={styles.legendRow}>
                              {rows.map((row, idx) => {
                                const percent =
                                  total > 0 ? (values[idx] / total) * 100 : 0;
                                return (
                                  <View
                                    key={`${row.name}-${idx}`}
                                    style={styles.legendItem}
                                  >
                                    <View
                                      style={[
                                        styles.legendDot,
                                        {
                                          backgroundColor:
                                            CHART_PALETTE[
                                              idx % CHART_PALETTE.length
                                            ],
                                        },
                                      ]}
                                    />
                                    <Text style={styles.legendLabel}>
                                      {`${formatChartLabel(
                                        row.name,
                                      )} ${formatPercent(percent)}`}
                                    </Text>
                                  </View>
                                );
                              })}
                            </View>
                          </NeumorphicCard>
                        );
                      })()}

                    {analyticsCharts.expenseCategories.length > 0 && (
                      <NeumorphicCard style={styles.sectionCard}>
                        <Text style={styles.sectionSubtitle}>
                          Top expenses (6 months)
                        </Text>
                        <ChartContainer height={220}>
                          {(width, height) => {
                            const rows = analyticsCharts.expenseCategories;
                            const values = rows.map((row) =>
                              Math.max(toChartNumber(row.value), 0),
                            );
                            const maxValue = Math.max(...values, 1);
                            const padding = 16;
                            const labelWidth = Math.min(120, width * 0.4);
                            const chartWidth = width - padding * 2 - labelWidth;
                            const rowHeight =
                              (height - padding * 2) / Math.max(rows.length, 1);
                            const barHeight = rowHeight * 0.6;

                            return (
                              <Svg width={width} height={height}>
                                {rows.map((row, idx) => {
                                  const value = values[idx];
                                  const barWidth =
                                    maxValue > 0
                                      ? (value / maxValue) * chartWidth
                                      : 0;
                                  const barX = padding + labelWidth;
                                  const barY =
                                    padding +
                                    idx * rowHeight +
                                    (rowHeight - barHeight) / 2;
                                  const safeBarWidth =
                                    value > 0 ? Math.max(barWidth, 2) : 0;
                                  const valueInside = safeBarWidth > 60;
                                  const valueX = valueInside
                                    ? barX + safeBarWidth - 6
                                    : barX + safeBarWidth + 6;
                                  const valueAnchor = valueInside
                                    ? "end"
                                    : "start";
                                  const valueColor = valueInside
                                    ? "#ffffff"
                                    : "#6b7280";

                                  return (
                                    <G key={`${row.name}-${idx}`}>
                                      <SvgText
                                        x={barX - 8}
                                        y={barY + barHeight / 2 + 4}
                                        fontSize={10}
                                        fill="#111827"
                                        textAnchor="end"
                                      >
                                        {formatChartLabel(row.name, 10)}
                                      </SvgText>
                                      <Rect
                                        x={barX}
                                        y={barY}
                                        width={safeBarWidth}
                                        height={barHeight}
                                        rx={6}
                                        fill={CHART_COLORS.expenses}
                                      />
                                      <SvgText
                                        x={valueX}
                                        y={barY + barHeight / 2 + 4}
                                        fontSize={10}
                                        fill={valueColor}
                                        textAnchor={valueAnchor}
                                      >
                                        {formatCurrency(value)}
                                      </SvgText>
                                    </G>
                                  );
                                })}
                              </Svg>
                            );
                          }}
                        </ChartContainer>
                      </NeumorphicCard>
                    )}

                    {analyticsCharts.cropYieldComparison.length > 0 && (
                      <NeumorphicCard style={styles.sectionCard}>
                        <Text style={styles.sectionSubtitle}>
                          Expected vs actual yield (kg)
                        </Text>
                        <ChartContainer height={220}>
                          {(width, height) => {
                            const rows = analyticsCharts.cropYieldComparison;
                            const expectedValues = rows.map((row) =>
                              Math.max(toChartNumber(row.expected), 0),
                            );
                            const actualValues = rows.map((row) =>
                              Math.max(toChartNumber(row.actual), 0),
                            );
                            const maxValue = Math.max(
                              ...expectedValues,
                              ...actualValues,
                              1,
                            );
                            const padding = 20;
                            const labelHeight = 18;
                            const chartHeight =
                              height - padding * 2 - labelHeight;
                            const chartWidth = width - padding * 2;
                            const groupWidth =
                              chartWidth / Math.max(rows.length, 1);
                            const barGap = 6;
                            const barWidth = Math.min(
                              18,
                              (groupWidth - barGap) / 2,
                            );
                            const safeBarWidth = Math.max(barWidth, 6);
                            const baseY = padding + chartHeight;
                            const labelIndexes = getChartLabelIndexes(
                              rows.length,
                            );

                            return (
                              <Svg width={width} height={height}>
                                {Array.from({ length: 3 }).map((_, idx) => {
                                  const y = padding + (chartHeight / 2) * idx;
                                  return (
                                    <SvgLine
                                      key={`yield-grid-${idx}`}
                                      x1={padding}
                                      x2={width - padding}
                                      y1={y}
                                      y2={y}
                                      stroke="#e5e7eb"
                                      strokeWidth={1}
                                    />
                                  );
                                })}
                                {rows.map((row, idx) => {
                                  const groupX =
                                    padding +
                                    idx * groupWidth +
                                    (groupWidth - (safeBarWidth * 2 + barGap)) /
                                      2;
                                  const expectedHeight =
                                    (expectedValues[idx] / maxValue) *
                                    chartHeight;
                                  const actualHeight =
                                    (actualValues[idx] / maxValue) *
                                    chartHeight;

                                  return (
                                    <G key={`${row.name}-${idx}`}>
                                      <Rect
                                        x={groupX}
                                        y={baseY - expectedHeight}
                                        width={safeBarWidth}
                                        height={expectedHeight}
                                        rx={4}
                                        fill={CHART_COLORS.expected}
                                      />
                                      <Rect
                                        x={groupX + safeBarWidth + barGap}
                                        y={baseY - actualHeight}
                                        width={safeBarWidth}
                                        height={actualHeight}
                                        rx={4}
                                        fill={CHART_COLORS.actual}
                                      />
                                    </G>
                                  );
                                })}
                                {labelIndexes.map((index) => (
                                  <SvgText
                                    key={`yield-label-${index}`}
                                    x={
                                      padding +
                                      index * groupWidth +
                                      groupWidth / 2
                                    }
                                    y={height - 4}
                                    fontSize={10}
                                    fill="#6b7280"
                                    textAnchor="middle"
                                  >
                                    {formatChartLabel(rows[index]?.name, 10)}
                                  </SvgText>
                                ))}
                              </Svg>
                            );
                          }}
                        </ChartContainer>
                        <View style={styles.legendRow}>
                          {[
                            {
                              label: "Expected",
                              color: CHART_COLORS.expected,
                            },
                            {
                              label: "Actual",
                              color: CHART_COLORS.actual,
                            },
                          ].map((item) => (
                            <View key={item.label} style={styles.legendItem}>
                              <View
                                style={[
                                  styles.legendDot,
                                  { backgroundColor: item.color },
                                ]}
                              />
                              <Text style={styles.legendLabel}>
                                {item.label}
                              </Text>
                            </View>
                          ))}
                        </View>
                      </NeumorphicCard>
                    )}

                    {analyticsCharts.labourEfficiency.length > 0 && (
                      <NeumorphicCard style={styles.sectionCard}>
                        <Text style={styles.sectionSubtitle}>
                          Labour cost per hectare
                        </Text>
                        <ChartContainer height={220}>
                          {(width, height) => {
                            const rows = analyticsCharts.labourEfficiency;
                            const values = rows.map((row) =>
                              Math.max(toChartNumber(row.cost_per_ha), 0),
                            );
                            const maxValue = Math.max(...values, 1);
                            const padding = 20;
                            const labelHeight = 18;
                            const chartHeight =
                              height - padding * 2 - labelHeight;
                            const chartWidth = width - padding * 2;
                            const groupWidth =
                              chartWidth / Math.max(rows.length, 1);
                            const barWidth = Math.min(20, groupWidth * 0.6);
                            const baseY = padding + chartHeight;
                            const labelIndexes = getChartLabelIndexes(
                              rows.length,
                            );

                            return (
                              <Svg width={width} height={height}>
                                {Array.from({ length: 3 }).map((_, idx) => {
                                  const y = padding + (chartHeight / 2) * idx;
                                  return (
                                    <SvgLine
                                      key={`efficiency-grid-${idx}`}
                                      x1={padding}
                                      x2={width - padding}
                                      y1={y}
                                      y2={y}
                                      stroke="#e5e7eb"
                                      strokeWidth={1}
                                    />
                                  );
                                })}
                                {rows.map((row, idx) => {
                                  const barHeight =
                                    (values[idx] / maxValue) * chartHeight;
                                  const barX =
                                    padding +
                                    idx * groupWidth +
                                    (groupWidth - barWidth) / 2;

                                  return (
                                    <Rect
                                      key={`${row.month}-${idx}`}
                                      x={barX}
                                      y={baseY - barHeight}
                                      width={barWidth}
                                      height={barHeight}
                                      rx={6}
                                      fill={CHART_COLORS.profit}
                                    />
                                  );
                                })}
                                {labelIndexes.map((index) => (
                                  <SvgText
                                    key={`efficiency-label-${index}`}
                                    x={
                                      padding +
                                      index * groupWidth +
                                      groupWidth / 2
                                    }
                                    y={height - 4}
                                    fontSize={10}
                                    fill="#6b7280"
                                    textAnchor="middle"
                                  >
                                    {formatChartLabel(rows[index]?.month, 8)}
                                  </SvgText>
                                ))}
                              </Svg>
                            );
                          }}
                        </ChartContainer>
                        <View style={styles.legendRow}>
                          <View style={styles.legendItem}>
                            <View
                              style={[
                                styles.legendDot,
                                { backgroundColor: CHART_COLORS.profit },
                              ]}
                            />
                            <Text style={styles.legendLabel}>Cost / ha</Text>
                          </View>
                        </View>
                      </NeumorphicCard>
                    )}
                  </>
                ) : (
                  <NeumorphicCard style={styles.emptyCard}>
                    <Text style={styles.emptyText}>
                      No analytics data available yet.
                    </Text>
                  </NeumorphicCard>
                )}
              </View>
            )}

            {activeSection === "reports" && (
              <View style={styles.section}>
                <NeumorphicCard style={styles.sectionCard}>
                  <View style={styles.tabRow}>
                    <TouchableOpacity
                      style={[
                        styles.tabButton,
                        reportMode === "weekly" && styles.tabButtonActive,
                      ]}
                      onPress={() => setReportMode("weekly")}
                    >
                      <Text
                        style={[
                          styles.tabLabel,
                          reportMode === "weekly" && styles.tabLabelActive,
                        ]}
                      >
                        Weekly
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.tabButton,
                        reportMode === "monthly" && styles.tabButtonActive,
                      ]}
                      onPress={() => setReportMode("monthly")}
                    >
                      <Text
                        style={[
                          styles.tabLabel,
                          reportMode === "monthly" && styles.tabLabelActive,
                        ]}
                      >
                        Monthly
                      </Text>
                    </TouchableOpacity>
                  </View>
                </NeumorphicCard>

                <NeumorphicCard style={styles.sectionCard}>
                  <Text style={styles.sectionSubtitle}>Exports</Text>
                  <View style={styles.exportRow}>
                    <NeumorphicButton
                      title="Labour CSV"
                      size="small"
                      loading={exportingType === "labour"}
                      onPress={() =>
                        handleExportCSV("labour", getMonthlyPeriod())
                      }
                    />
                    <NeumorphicButton
                      title="Inventory CSV"
                      size="small"
                      variant="secondary"
                      loading={exportingType === "inventory"}
                      onPress={() =>
                        handleExportCSV("inventory", getMonthlyPeriod())
                      }
                    />
                    <NeumorphicButton
                      title="Monthly Report"
                      size="small"
                      variant="secondary"
                      loading={reportExporting}
                      onPress={handleExportReport}
                    />
                  </View>
                  <Text style={styles.exportHint}>
                    Uses the selected month and year.
                  </Text>
                </NeumorphicCard>

                {reportMode === "weekly" ? (
                  <>
                    <NeumorphicButton
                      title="Refresh Weekly"
                      size="small"
                      variant="secondary"
                      onPress={loadWeeklyReport}
                    />
                    {weeklyReport ? (
                      <NeumorphicCard style={styles.sectionCard}>
                        <Text style={styles.sectionSubtitle}>
                          {`Period: ${weeklyReport.period.startDate} to ${weeklyReport.period.endDate}`}
                        </Text>
                        <View style={styles.summaryRow}>
                          <Text style={styles.summaryLabel}>Labour wages</Text>
                          <Text style={styles.summaryValue}>
                            {formatCurrency(
                              weeklyReport.labour.total_wages ?? 0,
                            )}
                          </Text>
                        </View>
                        <View style={styles.summaryRow}>
                          <Text style={styles.summaryLabel}>
                            Crop activities
                          </Text>
                          <Text style={styles.summaryValue}>
                            {weeklyReport.cropActivities.length}
                          </Text>
                        </View>
                      </NeumorphicCard>
                    ) : (
                      <NeumorphicCard style={styles.emptyCard}>
                        <Text style={styles.emptyText}>
                          No weekly report loaded.
                        </Text>
                      </NeumorphicCard>
                    )}
                  </>
                ) : (
                  <>
                    <NeumorphicCard style={styles.sectionCard}>
                      <NeumorphicInput
                        label="Year"
                        value={monthlyYear}
                        onChangeText={setMonthlyYear}
                        keyboardType="numeric"
                      />
                      <NeumorphicInput
                        label="Month"
                        value={monthlyMonth}
                        onChangeText={setMonthlyMonth}
                        keyboardType="numeric"
                      />
                      <NeumorphicButton
                        title="Load Monthly"
                        size="small"
                        variant="secondary"
                        onPress={loadMonthlyReport}
                      />
                    </NeumorphicCard>
                    {monthlyReport ? (
                      <NeumorphicCard style={styles.sectionCard}>
                        <Text style={styles.sectionSubtitle}>
                          {`Total cost: ${formatCurrency(monthlyReport.summary.totalCost)}`}
                        </Text>
                        <View style={styles.summaryRow}>
                          <Text style={styles.summaryLabel}>Labour</Text>
                          <Text style={styles.summaryValue}>
                            {formatCurrency(monthlyReport.summary.totalWages)}
                          </Text>
                        </View>
                        <View style={styles.summaryRow}>
                          <Text style={styles.summaryLabel}>Inputs</Text>
                          <Text style={styles.summaryValue}>
                            {formatCurrency(monthlyReport.summary.totalInputs)}
                          </Text>
                        </View>
                      </NeumorphicCard>
                    ) : (
                      <NeumorphicCard style={styles.emptyCard}>
                        <Text style={styles.emptyText}>
                          No monthly report loaded.
                        </Text>
                      </NeumorphicCard>
                    )}
                  </>
                )}
              </View>
            )}
          </>
        )}
      </ScrollView>

      <FormModal
        visible={farmModalOpen}
        title="Farm Profile"
        onClose={() => setFarmModalOpen(false)}
        footer={
          <NeumorphicButton
            title="Save Farm"
            onPress={saveFarm}
            loading={saving}
            fullWidth
          />
        }
      >
        <NeumorphicInput
          label="Farm name"
          value={farmForm.name}
          onChangeText={(value) =>
            setFarmForm((prev) => ({ ...prev, name: value }))
          }
        />
        <NeumorphicInput
          label="Location"
          value={farmForm.location}
          onChangeText={(value) =>
            setFarmForm((prev) => ({ ...prev, location: value }))
          }
        />
        <NeumorphicInput
          label="Total area (ha)"
          keyboardType="numeric"
          value={farmForm.total_area_ha}
          onChangeText={(value) =>
            setFarmForm((prev) => ({ ...prev, total_area_ha: value }))
          }
        />
        <NeumorphicInput
          label="GPS latitude"
          keyboardType="numeric"
          value={farmForm.gps_lat}
          onChangeText={(value) =>
            setFarmForm((prev) => ({ ...prev, gps_lat: value }))
          }
        />
        <NeumorphicInput
          label="GPS longitude"
          keyboardType="numeric"
          value={farmForm.gps_lng}
          onChangeText={(value) =>
            setFarmForm((prev) => ({ ...prev, gps_lng: value }))
          }
        />
        <NeumorphicInput
          label="Water sources"
          value={farmForm.water_sources}
          onChangeText={(value) =>
            setFarmForm((prev) => ({ ...prev, water_sources: value }))
          }
        />
        <NeumorphicInput
          label="Notes"
          variant="textarea"
          value={farmForm.notes}
          onChangeText={(value) =>
            setFarmForm((prev) => ({ ...prev, notes: value }))
          }
        />
      </FormModal>

      <FormModal
        visible={fieldModalOpen}
        title={editingFieldId ? "Edit Field" : "New Field"}
        onClose={() => setFieldModalOpen(false)}
        footer={
          <NeumorphicButton
            title={editingFieldId ? "Update Field" : "Save Field"}
            onPress={saveField}
            loading={saving}
            fullWidth
          />
        }
      >
        <NeumorphicInput
          label="Field name"
          value={fieldForm.name}
          onChangeText={(value) =>
            setFieldForm((prev) => ({ ...prev, name: value }))
          }
        />
        <NeumorphicInput
          label="Area (ha)"
          keyboardType="numeric"
          value={fieldForm.area_ha}
          onChangeText={(value) =>
            setFieldForm((prev) => ({ ...prev, area_ha: value }))
          }
        />
        <NeumorphicInput
          label="Soil type"
          value={fieldForm.soil_type}
          onChangeText={(value) =>
            setFieldForm((prev) => ({ ...prev, soil_type: value }))
          }
        />
        <NeumorphicInput
          label="Irrigation type"
          value={fieldForm.irrigation_type}
          onChangeText={(value) =>
            setFieldForm((prev) => ({ ...prev, irrigation_type: value }))
          }
        />
        <NeumorphicInput
          label="Current use"
          value={fieldForm.current_use}
          onChangeText={(value) =>
            setFieldForm((prev) => ({ ...prev, current_use: value }))
          }
        />
        <NeumorphicInput
          label="Status"
          value={fieldForm.status}
          onChangeText={(value) =>
            setFieldForm((prev) => ({ ...prev, status: value }))
          }
        />
        <NeumorphicInput
          label="Notes"
          variant="textarea"
          value={fieldForm.notes}
          onChangeText={(value) =>
            setFieldForm((prev) => ({ ...prev, notes: value }))
          }
        />
      </FormModal>

      <FormModal
        visible={workerModalOpen}
        title={editingWorkerId ? "Edit Worker" : "New Worker"}
        onClose={() => setWorkerModalOpen(false)}
        footer={
          <NeumorphicButton
            title={editingWorkerId ? "Update Worker" : "Save Worker"}
            onPress={saveWorker}
            loading={saving}
            fullWidth
          />
        }
      >
        <NeumorphicInput
          label="Full name"
          value={workerForm.full_name}
          onChangeText={(value) =>
            setWorkerForm((prev) => ({ ...prev, full_name: value }))
          }
        />
        <NeumorphicInput
          label="Phone"
          value={workerForm.phone}
          onChangeText={(value) =>
            setWorkerForm((prev) => ({ ...prev, phone: value }))
          }
        />
        <NeumorphicInput
          label="Date of birth"
          placeholder="YYYY-MM-DD"
          value={workerForm.date_of_birth}
          onChangeText={(value) =>
            setWorkerForm((prev) => ({ ...prev, date_of_birth: value }))
          }
          helperText="Required before a worker can be created."
        />
        <Text style={styles.inputLabel}>Role</Text>
        {renderChips(
          WORKER_ROLES.map((role) => ({ id: role, label: role })),
          workerForm.role,
          (value) => setWorkerForm((prev) => ({ ...prev, role: value })),
        )}
        <NeumorphicInput
          label="Daily wage (USD)"
          keyboardType="numeric"
          value={workerForm.daily_wage_usd}
          onChangeText={(value) =>
            setWorkerForm((prev) => ({ ...prev, daily_wage_usd: value }))
          }
        />
      </FormModal>

      <FormModal
        visible={cropPlanModalOpen}
        title={editingCropPlanId ? "Edit Crop Plan" : "New Crop Plan"}
        onClose={() => {
          setCropPlanAreaUnitPickerOpen(false);
          setCropPlanModalOpen(false);
        }}
        footer={
          <NeumorphicButton
            title={editingCropPlanId ? "Update Plan" : "Save Plan"}
            onPress={saveCropPlan}
            loading={saving}
            fullWidth
          />
        }
      >
        <Text style={styles.inputLabel}>Field</Text>
        {renderChips(
          fields.map((field) => ({ id: field.id, label: field.name })),
          cropPlanForm.field_id,
          (value) => setCropPlanForm((prev) => ({ ...prev, field_id: value })),
          "No field",
        )}
        <NeumorphicInput
          label="Crop type"
          value={cropPlanForm.crop_type}
          onChangeText={(value) =>
            setCropPlanForm((prev) => ({ ...prev, crop_type: value }))
          }
        />
        <NeumorphicInput
          label="Variety"
          value={cropPlanForm.variety}
          onChangeText={(value) =>
            setCropPlanForm((prev) => ({ ...prev, variety: value }))
          }
        />
        <NeumorphicInput
          label="Planned area"
          keyboardType="numeric"
          value={cropPlanForm.planned_area_ha}
          onChangeText={(value) =>
            setCropPlanForm((prev) => ({ ...prev, planned_area_ha: value }))
          }
          helperText="Saved as hectares. Use a smaller unit for compact plots."
        />
        <Text style={styles.inputLabel}>Area unit</Text>
        <TouchableOpacity
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            backgroundColor: neumorphicColors.base.input,
            borderRadius: borderRadius.md,
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.md,
            borderWidth: 1,
            borderColor: neumorphicColors.base.border,
            marginBottom: spacing.md,
          }}
          onPress={() => setCropPlanAreaUnitPickerOpen((previous) => !previous)}
        >
          <Text
            style={{
              color: neumorphicColors.text.primary,
              fontSize: 14,
              fontWeight: "500",
            }}
          >
            {getAreaUnitLabel(cropPlanForm.planned_area_unit)}
          </Text>
          <ChevronDown size={18} color={neumorphicColors.text.secondary} />
        </TouchableOpacity>
        {cropPlanAreaUnitPickerOpen && (
          <NeumorphicCard style={{ marginBottom: spacing.md, padding: 0 }}>
            <ScrollView style={{ maxHeight: 220 }} nestedScrollEnabled>
              {AREA_UNIT_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.id}
                  style={{
                    paddingHorizontal: spacing.md,
                    paddingVertical: spacing.md,
                    borderBottomWidth: 1,
                    borderBottomColor: neumorphicColors.base.border,
                  }}
                  onPress={() => {
                    setCropPlanForm((previous) => ({
                      ...previous,
                      planned_area_ha: convertAreaInput(
                        previous.planned_area_ha,
                        previous.planned_area_unit,
                        option.id,
                      ),
                      planned_area_unit: option.id,
                    }));
                    setCropPlanAreaUnitPickerOpen(false);
                  }}
                >
                  <Text
                    style={{
                      color: neumorphicColors.text.primary,
                      fontSize: 14,
                    }}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </NeumorphicCard>
        )}
        <NeumorphicInput
          label="Planting date"
          placeholder="YYYY-MM-DD"
          value={cropPlanForm.planting_date}
          onChangeText={(value) =>
            setCropPlanForm((prev) => ({ ...prev, planting_date: value }))
          }
        />
        <NeumorphicInput
          label="Expected harvest"
          placeholder="YYYY-MM-DD"
          value={cropPlanForm.expected_harvest_date}
          onChangeText={(value) =>
            setCropPlanForm((prev) => ({
              ...prev,
              expected_harvest_date: value,
            }))
          }
        />
        <NeumorphicInput
          label="Expected yield (kg)"
          keyboardType="numeric"
          value={cropPlanForm.expected_yield_kg}
          onChangeText={(value) =>
            setCropPlanForm((prev) => ({ ...prev, expected_yield_kg: value }))
          }
        />
        <NeumorphicInput
          label="Season"
          value={cropPlanForm.season}
          onChangeText={(value) =>
            setCropPlanForm((prev) => ({ ...prev, season: value }))
          }
        />
        <Text style={styles.inputLabel}>Status</Text>
        {renderChips(
          CROP_PLAN_STATUSES.map((status) => ({ id: status, label: status })),
          cropPlanForm.status,
          (value) => setCropPlanForm((prev) => ({ ...prev, status: value })),
        )}
        <NeumorphicInput
          label="Notes"
          variant="textarea"
          value={cropPlanForm.notes}
          onChangeText={(value) =>
            setCropPlanForm((prev) => ({ ...prev, notes: value }))
          }
        />
      </FormModal>

      <FormModal
        visible={cropActivityModalOpen}
        title="Log Crop Activity"
        onClose={() => setCropActivityModalOpen(false)}
        footer={
          <NeumorphicButton
            title="Save Activity"
            onPress={saveCropActivity}
            loading={saving}
            fullWidth
          />
        }
      >
        <Text style={styles.inputLabel}>Activity type</Text>
        {renderChips(
          ACTIVITY_TYPES.map((type) => ({ id: type, label: type })),
          cropActivityForm.activity_type,
          (value) =>
            setCropActivityForm((prev) => ({ ...prev, activity_type: value })),
        )}
        <Text style={styles.inputLabel}>Crop plan</Text>
        {renderChips(
          cropPlans.map((plan) => ({
            id: plan.id,
            label: plan.crop_type,
          })),
          cropActivityForm.crop_plan_id,
          (value) =>
            setCropActivityForm((prev) => ({ ...prev, crop_plan_id: value })),
          "No plan",
        )}
        <Text style={styles.inputLabel}>Field</Text>
        {renderChips(
          fields.map((field) => ({ id: field.id, label: field.name })),
          cropActivityForm.field_id,
          (value) =>
            setCropActivityForm((prev) => ({ ...prev, field_id: value })),
          "No field",
        )}
        <Text style={styles.inputLabel}>Logged by</Text>
        {renderChips(
          workers.map((worker) => ({
            id: worker.id,
            label: worker.full_name,
          })),
          cropActivityForm.logged_by,
          (value) =>
            setCropActivityForm((prev) => ({ ...prev, logged_by: value })),
          "Unassigned",
        )}
        <NeumorphicInput
          label="Activity date"
          placeholder="YYYY-MM-DD"
          value={cropActivityForm.activity_date}
          onChangeText={(value) =>
            setCropActivityForm((prev) => ({ ...prev, activity_date: value }))
          }
        />
        <NeumorphicInput
          label="Area covered (ha)"
          keyboardType="numeric"
          value={cropActivityForm.area_covered_ha}
          onChangeText={(value) =>
            setCropActivityForm((prev) => ({ ...prev, area_covered_ha: value }))
          }
        />
        <NeumorphicInput
          label="Inputs used"
          value={cropActivityForm.inputs_used}
          onChangeText={(value) =>
            setCropActivityForm((prev) => ({ ...prev, inputs_used: value }))
          }
        />
        <NeumorphicInput
          label="Description"
          value={cropActivityForm.description}
          onChangeText={(value) =>
            setCropActivityForm((prev) => ({ ...prev, description: value }))
          }
        />
        <NeumorphicInput
          label="Notes"
          variant="textarea"
          value={cropActivityForm.notes}
          onChangeText={(value) =>
            setCropActivityForm((prev) => ({ ...prev, notes: value }))
          }
        />
      </FormModal>

      <FormModal
        visible={livestockGroupModalOpen}
        title={
          editingLivestockGroupId ? "Edit Livestock Group" : "Add Livestock"
        }
        onClose={() => setLivestockGroupModalOpen(false)}
        footer={
          <NeumorphicButton
            title={editingLivestockGroupId ? "Update Group" : "Save Group"}
            onPress={saveLivestockGroup}
            loading={saving}
            fullWidth
          />
        }
      >
        <Text style={styles.inputLabel}>Species</Text>
        {renderChips(
          LIVESTOCK_SPECIES.map((species) => ({ id: species, label: species })),
          livestockGroupForm.species,
          (value) =>
            setLivestockGroupForm((prev) => ({ ...prev, species: value })),
        )}
        <Text style={styles.inputLabel}>Field</Text>
        {renderChips(
          fields.map((field) => ({ id: field.id, label: field.name })),
          livestockGroupForm.field_id,
          (value) =>
            setLivestockGroupForm((prev) => ({ ...prev, field_id: value })),
          "No field",
        )}
        <NeumorphicInput
          label="Breed"
          value={livestockGroupForm.breed}
          onChangeText={(value) =>
            setLivestockGroupForm((prev) => ({ ...prev, breed: value }))
          }
        />
        <NeumorphicInput
          label="Count"
          keyboardType="numeric"
          value={livestockGroupForm.count}
          onChangeText={(value) =>
            setLivestockGroupForm((prev) => ({ ...prev, count: value }))
          }
        />
        <NeumorphicInput
          label="Purpose"
          value={livestockGroupForm.purpose}
          onChangeText={(value) =>
            setLivestockGroupForm((prev) => ({ ...prev, purpose: value }))
          }
        />
        <NeumorphicInput
          label="Date acquired"
          placeholder="YYYY-MM-DD"
          value={livestockGroupForm.date_acquired}
          onChangeText={(value) =>
            setLivestockGroupForm((prev) => ({ ...prev, date_acquired: value }))
          }
        />
        <NeumorphicInput
          label="Notes"
          variant="textarea"
          value={livestockGroupForm.notes}
          onChangeText={(value) =>
            setLivestockGroupForm((prev) => ({ ...prev, notes: value }))
          }
        />
      </FormModal>

      <FormModal
        visible={livestockActivityModalOpen}
        title="Log Livestock Activity"
        onClose={() => setLivestockActivityModalOpen(false)}
        footer={
          <NeumorphicButton
            title="Save Activity"
            onPress={saveLivestockActivity}
            loading={saving}
            fullWidth
          />
        }
      >
        <Text style={styles.inputLabel}>Group</Text>
        {renderChips(
          livestockGroups.map((group) => ({
            id: group.id,
            label: `${group.species} (${group.count})`,
          })),
          livestockActivityForm.livestock_group_id,
          (value) =>
            setLivestockActivityForm((prev) => ({
              ...prev,
              livestock_group_id: value,
            })),
        )}
        <Text style={styles.inputLabel}>Activity type</Text>
        {renderChips(
          LIVESTOCK_ACTIVITY_TYPES.map((type) => ({ id: type, label: type })),
          livestockActivityForm.activity_type,
          (value) =>
            setLivestockActivityForm((prev) => ({
              ...prev,
              activity_type: value,
            })),
        )}
        <Text style={styles.inputLabel}>Logged by</Text>
        {renderChips(
          workers.map((worker) => ({
            id: worker.id,
            label: worker.full_name,
          })),
          livestockActivityForm.logged_by,
          (value) =>
            setLivestockActivityForm((prev) => ({ ...prev, logged_by: value })),
          "Unassigned",
        )}
        <NeumorphicInput
          label="Date"
          placeholder="YYYY-MM-DD"
          value={livestockActivityForm.activity_date}
          onChangeText={(value) =>
            setLivestockActivityForm((prev) => ({
              ...prev,
              activity_date: value,
            }))
          }
        />
        <NeumorphicInput
          label="Count affected"
          keyboardType="numeric"
          value={livestockActivityForm.count_affected}
          onChangeText={(value) =>
            setLivestockActivityForm((prev) => ({
              ...prev,
              count_affected: value,
            }))
          }
        />
        <NeumorphicInput
          label="Quantity"
          keyboardType="numeric"
          value={livestockActivityForm.quantity}
          onChangeText={(value) =>
            setLivestockActivityForm((prev) => ({ ...prev, quantity: value }))
          }
        />
        <NeumorphicInput
          label="Unit"
          value={livestockActivityForm.unit}
          onChangeText={(value) =>
            setLivestockActivityForm((prev) => ({ ...prev, unit: value }))
          }
        />
        <NeumorphicInput
          label="Cost (USD)"
          keyboardType="numeric"
          value={livestockActivityForm.cost_usd}
          onChangeText={(value) =>
            setLivestockActivityForm((prev) => ({ ...prev, cost_usd: value }))
          }
        />
        <NeumorphicInput
          label="Description"
          value={livestockActivityForm.description}
          onChangeText={(value) =>
            setLivestockActivityForm((prev) => ({
              ...prev,
              description: value,
            }))
          }
        />
        <NeumorphicInput
          label="Notes"
          variant="textarea"
          value={livestockActivityForm.notes}
          onChangeText={(value) =>
            setLivestockActivityForm((prev) => ({ ...prev, notes: value }))
          }
        />
      </FormModal>

      <FormModal
        visible={labourModalOpen}
        title="Log Labour Day"
        onClose={() => setLabourModalOpen(false)}
        footer={
          <NeumorphicButton
            title="Save Labour"
            onPress={saveLabourDay}
            loading={saving}
            fullWidth
          />
        }
      >
        <Text style={styles.inputLabel}>Worker</Text>
        {renderChips(
          workers.map((worker) => ({
            id: worker.id,
            label: worker.full_name,
          })),
          labourForm.worker_id,
          (value) => setLabourForm((prev) => ({ ...prev, worker_id: value })),
          "Unassigned",
        )}
        <Text style={styles.inputLabel}>Field</Text>
        {renderChips(
          fields.map((field) => ({ id: field.id, label: field.name })),
          labourForm.field_id,
          (value) => setLabourForm((prev) => ({ ...prev, field_id: value })),
          "No field",
        )}
        <Text style={styles.inputLabel}>Task</Text>
        {renderChips(
          LABOUR_TASKS.map((task) => ({ id: task, label: task })),
          labourForm.task_category,
          (value) =>
            setLabourForm((prev) => ({ ...prev, task_category: value })),
        )}
        <NeumorphicInput
          label="Work date"
          placeholder="YYYY-MM-DD"
          value={labourForm.work_date}
          onChangeText={(value) =>
            setLabourForm((prev) => ({ ...prev, work_date: value }))
          }
        />
        <NeumorphicInput
          label="Hours worked"
          keyboardType="numeric"
          value={labourForm.hours_worked}
          onChangeText={(value) =>
            setLabourForm((prev) => ({ ...prev, hours_worked: value }))
          }
        />
        <NeumorphicInput
          label="Area covered (ha)"
          keyboardType="numeric"
          value={labourForm.area_covered_ha}
          onChangeText={(value) =>
            setLabourForm((prev) => ({ ...prev, area_covered_ha: value }))
          }
        />
        <NeumorphicInput
          label="Wage (USD)"
          keyboardType="numeric"
          value={labourForm.wage_usd}
          onChangeText={(value) =>
            setLabourForm((prev) => ({ ...prev, wage_usd: value }))
          }
        />
        <NeumorphicInput
          label="Notes"
          variant="textarea"
          value={labourForm.notes}
          onChangeText={(value) =>
            setLabourForm((prev) => ({ ...prev, notes: value }))
          }
        />
      </FormModal>

      <FormModal
        visible={inventoryModalOpen}
        title={editingInventoryId ? "Edit Inventory" : "New Inventory"}
        onClose={() => setInventoryModalOpen(false)}
        footer={
          <NeumorphicButton
            title={editingInventoryId ? "Update Item" : "Save Item"}
            onPress={saveInventoryItem}
            loading={saving}
            fullWidth
          />
        }
      >
        <Text style={styles.inputLabel}>Item type</Text>
        {renderChips(
          INVENTORY_TYPES.map((type) => ({ id: type, label: type })),
          inventoryForm.item_type,
          (value) =>
            setInventoryForm((prev) => ({ ...prev, item_type: value })),
        )}
        <NeumorphicInput
          label="Item name"
          value={inventoryForm.name}
          onChangeText={(value) =>
            setInventoryForm((prev) => ({ ...prev, name: value }))
          }
        />
        <NeumorphicInput
          label="Quantity"
          keyboardType="numeric"
          value={inventoryForm.quantity}
          onChangeText={(value) =>
            setInventoryForm((prev) => ({ ...prev, quantity: value }))
          }
        />
        <NeumorphicInput
          label="Unit"
          value={inventoryForm.unit}
          onChangeText={(value) =>
            setInventoryForm((prev) => ({ ...prev, unit: value }))
          }
        />
        <NeumorphicInput
          label="Unit cost (USD)"
          keyboardType="numeric"
          value={inventoryForm.unit_cost_usd}
          onChangeText={(value) =>
            setInventoryForm((prev) => ({ ...prev, unit_cost_usd: value }))
          }
        />
        <NeumorphicInput
          label="Reorder level"
          keyboardType="numeric"
          value={inventoryForm.reorder_level}
          onChangeText={(value) =>
            setInventoryForm((prev) => ({ ...prev, reorder_level: value }))
          }
        />
        <NeumorphicInput
          label="Expiry date"
          placeholder="YYYY-MM-DD"
          value={inventoryForm.expiry_date}
          onChangeText={(value) =>
            setInventoryForm((prev) => ({ ...prev, expiry_date: value }))
          }
        />
        <NeumorphicInput
          label="Supplier"
          value={inventoryForm.supplier}
          onChangeText={(value) =>
            setInventoryForm((prev) => ({ ...prev, supplier: value }))
          }
        />
      </FormModal>

      <FormModal
        visible={inventoryUsageModalOpen}
        title="Record Inventory Usage"
        onClose={() => setInventoryUsageModalOpen(false)}
        footer={
          <NeumorphicButton
            title="Save Usage"
            onPress={saveInventoryUsage}
            loading={saving}
            fullWidth
          />
        }
      >
        <Text style={styles.inputLabel}>Inventory item</Text>
        {renderChips(
          inventory.map((item) => ({ id: item.id, label: item.name })),
          inventoryUsageForm.inventory_id,
          (value) =>
            setInventoryUsageForm((prev) => ({ ...prev, inventory_id: value })),
        )}
        <Text style={styles.inputLabel}>Field</Text>
        {renderChips(
          fields.map((field) => ({ id: field.id, label: field.name })),
          inventoryUsageForm.field_id,
          (value) =>
            setInventoryUsageForm((prev) => ({ ...prev, field_id: value })),
          "No field",
        )}
        <Text style={styles.inputLabel}>Crop plan</Text>
        {renderChips(
          cropPlans.map((plan) => ({ id: plan.id, label: plan.crop_type })),
          inventoryUsageForm.crop_plan_id,
          (value) =>
            setInventoryUsageForm((prev) => ({ ...prev, crop_plan_id: value })),
          "No plan",
        )}
        <NeumorphicInput
          label="Quantity used"
          keyboardType="numeric"
          value={inventoryUsageForm.quantity_used}
          onChangeText={(value) =>
            setInventoryUsageForm((prev) => ({ ...prev, quantity_used: value }))
          }
        />
        <NeumorphicInput
          label="Used date"
          placeholder="YYYY-MM-DD"
          value={inventoryUsageForm.used_date}
          onChangeText={(value) =>
            setInventoryUsageForm((prev) => ({ ...prev, used_date: value }))
          }
        />
        <NeumorphicInput
          label="Notes"
          variant="textarea"
          value={inventoryUsageForm.notes}
          onChangeText={(value) =>
            setInventoryUsageForm((prev) => ({ ...prev, notes: value }))
          }
        />
      </FormModal>

      <FormModal
        visible={expenseModalOpen}
        title={editingExpenseId ? "Edit Expense" : "Record Expense"}
        onClose={() => {
          setExpenseModalOpen(false);
          setEditingExpenseId(null);
        }}
        footer={
          <NeumorphicButton
            title={editingExpenseId ? "Update Expense" : "Save Expense"}
            onPress={saveExpense}
            loading={saving}
            fullWidth
          />
        }
      >
        <Text style={styles.inputLabel}>Category</Text>
        {renderChips(
          EXPENSE_CATEGORIES.map((category) => ({
            id: category,
            label: category,
          })),
          expenseForm.category,
          (value) => setExpenseForm((prev) => ({ ...prev, category: value })),
        )}

        {!editingExpenseId && (
          <>
            <Text style={styles.inputLabel}>Field</Text>
            {renderChips(
              fields.map((field) => ({ id: field.id, label: field.name })),
              expenseForm.field_id,
              (value) =>
                setExpenseForm((prev) => ({ ...prev, field_id: value })),
              "No field",
            )}
            <Text style={styles.inputLabel}>Crop plan</Text>
            {renderChips(
              cropPlans.map((plan) => ({ id: plan.id, label: plan.crop_type })),
              expenseForm.crop_plan_id,
              (value) =>
                setExpenseForm((prev) => ({ ...prev, crop_plan_id: value })),
              "No plan",
            )}
          </>
        )}

        <NeumorphicInput
          label="Date"
          placeholder="YYYY-MM-DD"
          value={expenseForm.expense_date}
          onChangeText={(value) =>
            setExpenseForm((prev) => ({ ...prev, expense_date: value }))
          }
        />
        <NeumorphicInput
          label="Description"
          value={expenseForm.description}
          onChangeText={(value) =>
            setExpenseForm((prev) => ({ ...prev, description: value }))
          }
        />
        <NeumorphicInput
          label="Amount (USD)"
          keyboardType="numeric"
          value={expenseForm.amount_usd}
          onChangeText={(value) =>
            setExpenseForm((prev) => ({ ...prev, amount_usd: value }))
          }
        />
        <NeumorphicInput
          label="Supplier"
          value={expenseForm.supplier}
          onChangeText={(value) =>
            setExpenseForm((prev) => ({ ...prev, supplier: value }))
          }
        />
        <NeumorphicInput
          label="Receipt ref"
          value={expenseForm.receipt_ref}
          onChangeText={(value) =>
            setExpenseForm((prev) => ({ ...prev, receipt_ref: value }))
          }
        />
        <NeumorphicInput
          label="Notes"
          variant="textarea"
          value={expenseForm.notes}
          onChangeText={(value) =>
            setExpenseForm((prev) => ({ ...prev, notes: value }))
          }
        />
      </FormModal>

      <FormModal
        visible={revenueModalOpen}
        title={editingRevenueId ? "Edit Revenue" : "Record Revenue"}
        onClose={() => {
          setRevenueModalOpen(false);
          setEditingRevenueId(null);
        }}
        footer={
          <NeumorphicButton
            title={editingRevenueId ? "Update Revenue" : "Save Revenue"}
            onPress={saveRevenue}
            loading={saving}
            fullWidth
          />
        }
      >
        <Text style={styles.inputLabel}>Category</Text>
        {renderChips(
          REVENUE_CATEGORIES.map((category) => ({
            id: category,
            label: category,
          })),
          revenueForm.category,
          (value) => setRevenueForm((prev) => ({ ...prev, category: value })),
        )}

        {!editingRevenueId && (
          <>
            <Text style={styles.inputLabel}>Field</Text>
            {renderChips(
              fields.map((field) => ({ id: field.id, label: field.name })),
              revenueForm.field_id,
              (value) =>
                setRevenueForm((prev) => ({ ...prev, field_id: value })),
              "No field",
            )}
            <Text style={styles.inputLabel}>Crop plan</Text>
            {renderChips(
              cropPlans.map((plan) => ({ id: plan.id, label: plan.crop_type })),
              revenueForm.crop_plan_id,
              (value) =>
                setRevenueForm((prev) => ({ ...prev, crop_plan_id: value })),
              "No plan",
            )}
          </>
        )}

        <NeumorphicInput
          label="Date"
          placeholder="YYYY-MM-DD"
          value={revenueForm.revenue_date}
          onChangeText={(value) =>
            setRevenueForm((prev) => ({ ...prev, revenue_date: value }))
          }
        />
        <NeumorphicInput
          label="Description"
          value={revenueForm.description}
          onChangeText={(value) =>
            setRevenueForm((prev) => ({ ...prev, description: value }))
          }
        />
        <NeumorphicInput
          label="Amount (USD)"
          keyboardType="numeric"
          value={revenueForm.amount_usd}
          onChangeText={(value) =>
            setRevenueForm((prev) => ({ ...prev, amount_usd: value }))
          }
        />
        <NeumorphicInput
          label="Quantity"
          keyboardType="numeric"
          value={revenueForm.quantity}
          onChangeText={(value) =>
            setRevenueForm((prev) => ({ ...prev, quantity: value }))
          }
        />
        <NeumorphicInput
          label="Unit"
          value={revenueForm.unit}
          onChangeText={(value) =>
            setRevenueForm((prev) => ({ ...prev, unit: value }))
          }
        />
        <NeumorphicInput
          label="Unit price (USD)"
          keyboardType="numeric"
          value={revenueForm.unit_price_usd}
          onChangeText={(value) =>
            setRevenueForm((prev) => ({ ...prev, unit_price_usd: value }))
          }
        />
        <NeumorphicInput
          label="Buyer"
          value={revenueForm.buyer_name}
          onChangeText={(value) =>
            setRevenueForm((prev) => ({ ...prev, buyer_name: value }))
          }
        />
        <NeumorphicInput
          label="Notes"
          variant="textarea"
          value={revenueForm.notes}
          onChangeText={(value) =>
            setRevenueForm((prev) => ({ ...prev, notes: value }))
          }
        />
      </FormModal>

      <FormModal
        visible={marketPriceModalOpen}
        title="Add Market Price"
        onClose={() => setMarketPriceModalOpen(false)}
        footer={
          <NeumorphicButton
            title="Save Price"
            onPress={saveMarketPrice}
            loading={saving}
            fullWidth
          />
        }
      >
        <NeumorphicInput
          label="Commodity"
          value={marketPriceForm.commodity}
          onChangeText={(value) =>
            setMarketPriceForm((prev) => ({ ...prev, commodity: value }))
          }
        />
        <NeumorphicInput
          label="Region"
          value={marketPriceForm.region}
          onChangeText={(value) =>
            setMarketPriceForm((prev) => ({ ...prev, region: value }))
          }
        />
        <NeumorphicInput
          label="Price (USD)"
          keyboardType="numeric"
          value={marketPriceForm.price_usd}
          onChangeText={(value) =>
            setMarketPriceForm((prev) => ({ ...prev, price_usd: value }))
          }
        />
        <NeumorphicInput
          label="Unit"
          value={marketPriceForm.unit}
          onChangeText={(value) =>
            setMarketPriceForm((prev) => ({ ...prev, unit: value }))
          }
        />
        <NeumorphicInput
          label="Price date"
          placeholder="YYYY-MM-DD"
          value={marketPriceForm.price_date}
          onChangeText={(value) =>
            setMarketPriceForm((prev) => ({ ...prev, price_date: value }))
          }
        />
        <NeumorphicInput
          label="Source"
          value={marketPriceForm.source}
          onChangeText={(value) =>
            setMarketPriceForm((prev) => ({ ...prev, source: value }))
          }
        />
        <Text style={styles.inputLabel}>Demand level</Text>
        {renderChips(
          DEMAND_LEVELS.map((level) => ({ id: level, label: level })),
          marketPriceForm.demand_level,
          (value) =>
            setMarketPriceForm((prev) => ({ ...prev, demand_level: value })),
        )}
        <NeumorphicInput
          label="Notes"
          variant="textarea"
          value={marketPriceForm.notes}
          onChangeText={(value) =>
            setMarketPriceForm((prev) => ({ ...prev, notes: value }))
          }
        />
      </FormModal>

      <FormModal
        visible={calendarModalOpen}
        title="Add Calendar Entry"
        onClose={() => setCalendarModalOpen(false)}
        footer={
          <NeumorphicButton
            title="Save Entry"
            onPress={saveCalendarEntry}
            loading={saving}
            fullWidth
          />
        }
      >
        <NeumorphicInput
          label="Crop type"
          value={calendarForm.crop_type}
          onChangeText={(value) =>
            setCalendarForm((prev) => ({ ...prev, crop_type: value }))
          }
        />
        <NeumorphicInput
          label="Region"
          value={calendarForm.region}
          onChangeText={(value) =>
            setCalendarForm((prev) => ({ ...prev, region: value }))
          }
        />
        <NeumorphicInput
          label="Planting start month"
          keyboardType="numeric"
          value={calendarForm.recommended_planting_start}
          onChangeText={(value) =>
            setCalendarForm((prev) => ({
              ...prev,
              recommended_planting_start: value,
            }))
          }
        />
        <NeumorphicInput
          label="Planting end month"
          keyboardType="numeric"
          value={calendarForm.recommended_planting_end}
          onChangeText={(value) =>
            setCalendarForm((prev) => ({
              ...prev,
              recommended_planting_end: value,
            }))
          }
        />
        <NeumorphicInput
          label="Harvest weeks"
          keyboardType="numeric"
          value={calendarForm.expected_harvest_weeks}
          onChangeText={(value) =>
            setCalendarForm((prev) => ({
              ...prev,
              expected_harvest_weeks: value,
            }))
          }
        />
        <NeumorphicInput
          label="Soil requirements"
          value={calendarForm.soil_requirements}
          onChangeText={(value) =>
            setCalendarForm((prev) => ({
              ...prev,
              soil_requirements: value,
            }))
          }
        />
        <NeumorphicInput
          label="Water requirements"
          value={calendarForm.water_requirements}
          onChangeText={(value) =>
            setCalendarForm((prev) => ({
              ...prev,
              water_requirements: value,
            }))
          }
        />
        <NeumorphicInput
          label="Common pests"
          value={calendarForm.common_pests}
          onChangeText={(value) =>
            setCalendarForm((prev) => ({ ...prev, common_pests: value }))
          }
        />
        <NeumorphicInput
          label="Notes"
          variant="textarea"
          value={calendarForm.notes}
          onChangeText={(value) =>
            setCalendarForm((prev) => ({ ...prev, notes: value }))
          }
        />
      </FormModal>
    </NeumorphicScreen>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.md,
  },
  syncCard: {
    marginBottom: spacing.md,
    padding: spacing.md,
  },
  syncRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: spacing.sm,
  },
  syncMeta: {
    fontSize: 12,
    color: neumorphicColors.text.secondary,
  },
  syncHint: {
    marginTop: spacing.xs,
    fontSize: 12,
    color: neumorphicColors.text.secondary,
  },
  headerText: {
    flex: 1,
    marginRight: spacing.md,
  },
  headerActions: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: neumorphicColors.text.primary,
  },
  subtitle: {
    color: neumorphicColors.text.secondary,
    marginTop: 4,
  },
  sectionTabs: {
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    marginBottom: spacing.md,
  },
  sectionTab: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.pill,
    backgroundColor: neumorphicColors.base.card,
    borderWidth: 1,
    borderColor: "transparent",
  },
  sectionTabActive: {
    backgroundColor: neumorphicColors.primary[50],
    borderColor: neumorphicColors.primary[200],
  },
  sectionTabText: {
    fontSize: 14,
    color: neumorphicColors.text.secondary,
    fontWeight: "600",
  },
  sectionTabTextActive: {
    color: neumorphicColors.primary[700],
  },
  section: {
    gap: spacing.md,
  },
  sectionCard: {
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: neumorphicColors.text.primary,
  },
  sectionSubtitle: {
    fontSize: 14,
    fontWeight: "600",
    color: neumorphicColors.text.secondary,
    marginBottom: spacing.sm,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  dataCard: {
    marginBottom: spacing.sm,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.xs,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: neumorphicColors.text.primary,
  },
  cardMeta: {
    fontSize: 13,
    color: neumorphicColors.text.secondary,
    marginTop: 2,
  },
  cardActions: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  emptyCard: {
    padding: spacing.lg,
    alignItems: "center",
  },
  emptyText: {
    color: neumorphicColors.text.secondary,
    textAlign: "center",
  },
  alertCard: {
    backgroundColor: "#FFF7ED",
    borderColor: "#FDBA74",
    borderWidth: 1,
  },
  alertText: {
    color: neumorphicColors.text.secondary,
    marginBottom: 4,
  },
  metaBlock: {
    gap: spacing.xs,
  },
  metaLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: neumorphicColors.text.primary,
  },
  metaValue: {
    color: neumorphicColors.text.secondary,
  },
  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
  },
  summaryLabel: {
    color: neumorphicColors.text.secondary,
  },
  summaryValue: {
    fontWeight: "600",
    color: neumorphicColors.text.primary,
  },
  kpiGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  kpiCard: {
    width: "48%",
    padding: spacing.md,
  },
  kpiLabel: {
    fontSize: 12,
    color: neumorphicColors.text.secondary,
    marginBottom: 4,
  },
  kpiValue: {
    fontSize: 18,
    fontWeight: "700",
    color: neumorphicColors.text.primary,
  },
  chartContainer: {
    width: "100%",
    marginTop: spacing.xs,
  },
  legendRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6,
  },
  legendLabel: {
    fontSize: 12,
    color: neumorphicColors.text.secondary,
  },
  predictionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
  },
  predictionTag: {
    fontSize: 12,
    fontWeight: "600",
    color: neumorphicColors.primary[700],
  },
  exportRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  exportHint: {
    marginTop: spacing.xs,
    color: neumorphicColors.text.secondary,
    fontSize: 12,
  },
  loadingContainer: {
    paddingVertical: spacing.xl,
    alignItems: "center",
  },
  gateHeader: {
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  gateIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: neumorphicColors.primary[50],
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.sm,
  },
  featureCard: {
    marginBottom: spacing.lg,
  },
  featureItem: {
    color: neumorphicColors.text.secondary,
    marginTop: spacing.xs,
  },
  planCard: {
    marginBottom: spacing.md,
  },
  planTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 4,
  },
  planPrice: {
    fontSize: 20,
    fontWeight: "700",
    color: neumorphicColors.primary[700],
  },
  planCycle: {
    fontSize: 14,
    color: neumorphicColors.text.secondary,
  },
  planActions: {
    marginTop: spacing.md,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.35)",
    justifyContent: "flex-end",
  },
  modalWrapper: {
    maxHeight: "90%",
    padding: spacing.lg,
  },
  modalCard: {
    paddingBottom: spacing.md,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  modalClose: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: neumorphicColors.base.card,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  picker: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: neumorphicColors.base.input,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderWidth: 1,
    borderColor: neumorphicColors.base.border,
    marginBottom: spacing.md,
  },
  pickerText: {
    color: neumorphicColors.text.primary,
    fontSize: 14,
    fontWeight: "500",
  },
  pickerOptions: {
    marginBottom: spacing.md,
    padding: 0,
  },
  pickerOption: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: neumorphicColors.base.border,
  },
  pickerOptionText: {
    color: neumorphicColors.text.primary,
    fontSize: 14,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: neumorphicColors.text.secondary,
    marginBottom: spacing.xs,
  },
  tabRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  tabButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: neumorphicColors.base.card,
    alignItems: "center",
  },
  tabButtonActive: {
    backgroundColor: neumorphicColors.primary[50],
  },
  tabLabel: {
    color: neumorphicColors.text.secondary,
    fontWeight: "600",
  },
  tabLabelActive: {
    color: neumorphicColors.primary[700],
  },
});
