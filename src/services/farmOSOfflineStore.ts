import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "./api";
import type {
  FarmOSAccessStatus,
  FarmOSAnalyticsData,
  FarmOSCalendarEntry,
  FarmOSCropActivity,
  FarmOSCropPlan,
  FarmOSExpense,
  FarmOSExpenseCategorySummary,
  FarmOSExpenseSummary,
  FarmOSFarm,
  FarmOSField,
  FarmOSInventoryItem,
  FarmOSInventorySummary,
  FarmOSLabourCategorySummary,
  FarmOSLabourDay,
  FarmOSLabourSummary,
  FarmOSLivestockActivity,
  FarmOSLivestockGroup,
  FarmOSMarketInsights,
  FarmOSMarketPrice,
  FarmOSMonthlyReport,
  FarmOSPlan,
  FarmOSProfitability,
  FarmOSRevenue,
  FarmOSRevenueCategorySummary,
  FarmOSRevenueSummary,
  FarmOSSeasonalPredictions,
  FarmOSSubscription,
  FarmOSWeeklyReport,
  FarmOSWorker,
} from "../types";

const CACHE_KEY = "farmOS:cache:v1";
const QUEUE_KEY = "farmOS:queue:v1";
const LOCAL_ID_PREFIX = "local-";

export type FarmOSCache = {
  subscription?: {
    subscription: FarmOSSubscription | null;
    access: FarmOSAccessStatus;
    plans: FarmOSPlan[];
  };
  farm?: FarmOSFarm | null;
  fields?: FarmOSField[];
  workers?: FarmOSWorker[];
  cropPlans?: FarmOSCropPlan[];
  cropActivities?: FarmOSCropActivity[];
  livestockGroups?: FarmOSLivestockGroup[];
  livestockActivities?: FarmOSLivestockActivity[];
  labour?: {
    labourDays: FarmOSLabourDay[];
    summary: FarmOSLabourSummary | null;
    byCategory: FarmOSLabourCategorySummary[];
    period?: { startDate: string; endDate: string };
  };
  inventory?: {
    inventory: FarmOSInventoryItem[];
    summary: FarmOSInventorySummary[];
    alerts: FarmOSInventoryItem[];
  };
  calendar?: {
    calendar: FarmOSCalendarEntry[];
    plantingNow: FarmOSCalendarEntry[];
  };
  weeklyReport?: FarmOSWeeklyReport | null;
  monthlyReport?: FarmOSMonthlyReport | null;
  expenses?: {
    expenses: FarmOSExpense[];
    summary: FarmOSExpenseSummary | null;
    byCategory?: FarmOSExpenseCategorySummary[];
    period?: { startDate: string; endDate: string };
  };
  revenue?: {
    revenue: FarmOSRevenue[];
    summary: FarmOSRevenueSummary | null;
    byCategory?: FarmOSRevenueCategorySummary[];
    period?: { startDate: string; endDate: string };
  };
  profitability?: FarmOSProfitability | null;
  market?: {
    prices: FarmOSMarketPrice[];
    insights?: FarmOSMarketInsights | null;
    generatedAt?: string | null;
  };
  analytics?: FarmOSAnalyticsData | null;
  predictions?: {
    data: FarmOSSeasonalPredictions | null;
    generatedAt?: string | null;
  };
  lastSyncedAt?: string | null;
  updatedAt?: string;
};

export type FarmOSQueueEntity =
  | "farm"
  | "field"
  | "worker"
  | "cropPlan"
  | "cropActivity"
  | "livestockGroup"
  | "livestockActivity"
  | "labourDay"
  | "inventoryItem"
  | "inventoryUsage"
  | "calendarEntry"
  | "expense"
  | "revenue"
  | "marketPrice";

export type FarmOSQueueItem = {
  id: string;
  createdAt: string;
  entity: FarmOSQueueEntity;
  action: "create" | "update" | "delete";
  method: "post" | "put" | "delete";
  url: string;
  data?: Record<string, any>;
  targetId?: string;
  localId?: string;
};

const parseJson = <T>(raw: string | null): T | null => {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
};

export const isLocalId = (id?: string | null): boolean =>
  !!id && id.startsWith(LOCAL_ID_PREFIX);

export const createLocalId = (): string => {
  return `${LOCAL_ID_PREFIX}${Date.now()}-${Math.floor(Math.random() * 10000)}`;
};

export const loadFarmOSCache = async (): Promise<FarmOSCache | null> => {
  const raw = await AsyncStorage.getItem(CACHE_KEY);
  return parseJson<FarmOSCache>(raw);
};

export const saveFarmOSCache = async (cache: FarmOSCache): Promise<void> => {
  await AsyncStorage.setItem(
    CACHE_KEY,
    JSON.stringify({ ...cache, updatedAt: new Date().toISOString() }),
  );
};

export const updateFarmOSCache = async (
  patch: Partial<FarmOSCache>,
): Promise<FarmOSCache> => {
  const current = (await loadFarmOSCache()) ?? {};
  const next = { ...current, ...patch };
  await saveFarmOSCache(next);
  return next;
};

export const getFarmOSQueue = async (): Promise<FarmOSQueueItem[]> => {
  const raw = await AsyncStorage.getItem(QUEUE_KEY);
  return parseJson<FarmOSQueueItem[]>(raw) ?? [];
};

export const setFarmOSQueue = async (
  items: FarmOSQueueItem[],
): Promise<void> => {
  await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(items));
};

export const enqueueFarmOSMutation = async (
  item: FarmOSQueueItem,
): Promise<FarmOSQueueItem[]> => {
  const queue = await getFarmOSQueue();
  const next = [...queue, item];
  await setFarmOSQueue(next);
  return next;
};

export const updateQueuedCreate = async (
  entity: FarmOSQueueEntity,
  localId: string,
  data: Record<string, any>,
): Promise<FarmOSQueueItem[]> => {
  const queue = await getFarmOSQueue();
  const next = queue.map((item) => {
    if (item.entity !== entity || item.action !== "create") return item;
    if (item.localId !== localId) return item;
    return { ...item, data: { ...(item.data ?? {}), ...data } };
  });
  await setFarmOSQueue(next);
  return next;
};

export const removeQueuedCreate = async (
  entity: FarmOSQueueEntity,
  localId: string,
): Promise<FarmOSQueueItem[]> => {
  const queue = await getFarmOSQueue();
  const next = queue.filter(
    (item) =>
      !(
        item.entity === entity &&
        item.action === "create" &&
        item.localId === localId
      ),
  );
  await setFarmOSQueue(next);
  return next;
};

export const getFarmOSPendingCount = async (): Promise<number> => {
  const queue = await getFarmOSQueue();
  return queue.length;
};

const withPendingFlag = <T extends { id: string }>(
  item: T,
  isPending: boolean,
): T => ({
  ...item,
  _pending: isPending,
});

const updateListItem = <T extends { id: string }>(
  list: T[] | undefined,
  id: string,
  updates: Partial<T>,
  pending = true,
): T[] => {
  if (!list) return [];
  return list.map((item) =>
    item.id === id
      ? withPendingFlag({ ...item, ...updates } as T, pending)
      : item,
  );
};

const removeListItem = <T extends { id: string }>(
  list: T[] | undefined,
  id: string,
): T[] => {
  if (!list) return [];
  return list.filter((item) => item.id !== id);
};

const lookupFieldName = (cache: FarmOSCache, fieldId?: string | null) => {
  if (!fieldId) return null;
  return cache.fields?.find((field) => field.id === fieldId)?.name ?? null;
};

const lookupWorkerName = (cache: FarmOSCache, workerId?: string | null) => {
  if (!workerId) return null;
  return (
    cache.workers?.find((worker) => worker.id === workerId)?.full_name ?? null
  );
};

const lookupCropType = (cache: FarmOSCache, planId?: string | null) => {
  if (!planId) return null;
  return cache.cropPlans?.find((plan) => plan.id === planId)?.crop_type ?? null;
};

const applyInventoryUsage = (
  cache: FarmOSCache,
  data: Record<string, any>,
): FarmOSCache => {
  const inventoryId = data.inventory_id as string | undefined;
  const used = Number(data.quantity_used ?? 0);
  if (!inventoryId || Number.isNaN(used) || used <= 0) {
    return cache;
  }

  const updatedInventory = cache.inventory?.inventory?.map((item) => {
    if (item.id !== inventoryId) return item;
    const current = Number(item.quantity ?? 0);
    const nextQty = Number.isFinite(current)
      ? Math.max(0, current - used)
      : item.quantity;
    return withPendingFlag(
      { ...item, quantity: nextQty } as FarmOSInventoryItem,
      true,
    );
  });

  return {
    ...cache,
    inventory: cache.inventory
      ? {
          ...cache.inventory,
          inventory: updatedInventory ?? cache.inventory.inventory,
        }
      : cache.inventory,
  };
};

export const applyQueueItemToCache = (
  cache: FarmOSCache,
  item: FarmOSQueueItem,
): FarmOSCache => {
  const farmId = cache.farm?.id ?? "local-farm";
  const targetId = item.targetId ?? item.localId;
  const data = item.data ?? {};

  switch (item.entity) {
    case "farm": {
      if (item.action === "delete") return cache;
      const localFarm: FarmOSFarm = {
        id: targetId ?? cache.farm?.id ?? createLocalId(),
        owner_id: cache.farm?.owner_id ?? "local-owner",
        name: data.name ?? cache.farm?.name ?? "",
        location: data.location ?? cache.farm?.location ?? null,
        total_area_ha: data.total_area_ha ?? cache.farm?.total_area_ha ?? null,
        gps_lat: data.gps_lat ?? cache.farm?.gps_lat ?? null,
        gps_lng: data.gps_lng ?? cache.farm?.gps_lng ?? null,
        water_sources: data.water_sources ?? cache.farm?.water_sources ?? null,
        notes: data.notes ?? cache.farm?.notes ?? null,
        created_at: cache.farm?.created_at ?? new Date().toISOString(),
        updated_at: new Date().toISOString(),
        field_count: cache.farm?.field_count ?? 0,
        worker_count: cache.farm?.worker_count ?? 0,
        active_crops: cache.farm?.active_crops ?? 0,
        livestock_groups: cache.farm?.livestock_groups ?? 0,
      };
      return { ...cache, farm: withPendingFlag(localFarm, true) };
    }
    case "field": {
      if (!targetId) return cache;
      if (item.action === "delete") {
        return { ...cache, fields: removeListItem(cache.fields, targetId) };
      }
      if (item.action === "update") {
        return {
          ...cache,
          fields: updateListItem(
            cache.fields,
            targetId,
            data as Partial<FarmOSField>,
          ),
        };
      }
      const localField: FarmOSField = {
        id: targetId,
        farm_id: farmId,
        name: data.name ?? "",
        area_ha: data.area_ha ?? null,
        soil_type: data.soil_type ?? null,
        irrigation_type: data.irrigation_type ?? null,
        current_use: data.current_use ?? null,
        status: data.status ?? null,
        notes: data.notes ?? null,
        created_at: new Date().toISOString(),
      };
      return {
        ...cache,
        fields: [...(cache.fields ?? []), withPendingFlag(localField, true)],
      };
    }
    case "worker": {
      if (!targetId) return cache;
      if (item.action === "update") {
        return {
          ...cache,
          workers: updateListItem(
            cache.workers,
            targetId,
            data as Partial<FarmOSWorker>,
          ),
        };
      }
      const localWorker: FarmOSWorker = {
        id: targetId,
        farm_id: farmId,
        full_name: data.full_name ?? "",
        phone: data.phone ?? null,
        role: data.role ?? "worker",
        daily_wage_usd: data.daily_wage_usd ?? null,
        is_active: true,
        created_at: new Date().toISOString(),
      };
      return {
        ...cache,
        workers: [...(cache.workers ?? []), withPendingFlag(localWorker, true)],
      };
    }
    case "cropPlan": {
      if (!targetId) return cache;
      if (item.action === "update") {
        return {
          ...cache,
          cropPlans: updateListItem(
            cache.cropPlans,
            targetId,
            data as Partial<FarmOSCropPlan>,
          ),
        };
      }
      const localPlan: FarmOSCropPlan = {
        id: targetId,
        farm_id: farmId,
        field_id: data.field_id ?? null,
        crop_type: data.crop_type ?? "",
        variety: data.variety ?? null,
        planned_area_ha: data.planned_area_ha ?? null,
        planting_date: data.planting_date ?? null,
        expected_harvest_date: data.expected_harvest_date ?? null,
        expected_yield_kg: data.expected_yield_kg ?? null,
        season: data.season ?? null,
        status: data.status ?? null,
        notes: data.notes ?? null,
        field_name: lookupFieldName(cache, data.field_id ?? null),
        created_at: new Date().toISOString(),
      };
      return {
        ...cache,
        cropPlans: [
          ...(cache.cropPlans ?? []),
          withPendingFlag(localPlan, true),
        ],
      };
    }
    case "cropActivity": {
      if (!targetId) return cache;
      const localActivity: FarmOSCropActivity = {
        id: targetId,
        farm_id: farmId,
        crop_plan_id: data.crop_plan_id ?? null,
        field_id: data.field_id ?? null,
        activity_type: data.activity_type ?? "",
        activity_date: data.activity_date ?? new Date().toISOString(),
        area_covered_ha: data.area_covered_ha ?? null,
        inputs_used: data.inputs_used ?? null,
        description: data.description ?? null,
        notes: data.notes ?? null,
        logged_by: data.logged_by ?? null,
        field_name: lookupFieldName(cache, data.field_id ?? null),
        crop_type: lookupCropType(cache, data.crop_plan_id ?? null),
        created_at: new Date().toISOString(),
      };
      return {
        ...cache,
        cropActivities: [
          ...(cache.cropActivities ?? []),
          withPendingFlag(localActivity, true),
        ],
      };
    }
    case "livestockGroup": {
      if (!targetId) return cache;
      if (item.action === "update") {
        return {
          ...cache,
          livestockGroups: updateListItem(
            cache.livestockGroups,
            targetId,
            data as Partial<FarmOSLivestockGroup>,
          ),
        };
      }
      const localGroup: FarmOSLivestockGroup = {
        id: targetId,
        farm_id: farmId,
        field_id: data.field_id ?? null,
        species: data.species ?? "",
        breed: data.breed ?? null,
        count: data.count ?? "0",
        purpose: data.purpose ?? null,
        date_acquired: data.date_acquired ?? null,
        notes: data.notes ?? null,
        field_name: lookupFieldName(cache, data.field_id ?? null),
        created_at: new Date().toISOString(),
      };
      return {
        ...cache,
        livestockGroups: [
          ...(cache.livestockGroups ?? []),
          withPendingFlag(localGroup, true),
        ],
      };
    }
    case "livestockActivity": {
      if (!targetId) return cache;
      const localActivity: FarmOSLivestockActivity = {
        id: targetId,
        farm_id: farmId,
        livestock_group_id: data.livestock_group_id ?? "",
        activity_type: data.activity_type ?? "",
        activity_date: data.activity_date ?? new Date().toISOString(),
        count_affected: data.count_affected ?? null,
        quantity: data.quantity ?? null,
        unit: data.unit ?? null,
        cost_usd: data.cost_usd ?? null,
        description: data.description ?? null,
        notes: data.notes ?? null,
        logged_by: data.logged_by ?? null,
        created_at: new Date().toISOString(),
      };
      return {
        ...cache,
        livestockActivities: [
          ...(cache.livestockActivities ?? []),
          withPendingFlag(localActivity, true),
        ],
      };
    }
    case "labourDay": {
      if (!targetId) return cache;
      if (item.action === "delete") {
        return {
          ...cache,
          labour: cache.labour
            ? {
                ...cache.labour,
                labourDays: removeListItem(cache.labour.labourDays, targetId),
              }
            : cache.labour,
        };
      }
      const localLabour: FarmOSLabourDay = {
        id: targetId,
        farm_id: farmId,
        field_id: data.field_id ?? null,
        worker_id: data.worker_id ?? null,
        work_date: data.work_date ?? new Date().toISOString(),
        task_category: data.task_category ?? "",
        hours_worked: data.hours_worked ?? null,
        area_covered_ha: data.area_covered_ha ?? null,
        wage_usd: data.wage_usd ?? null,
        notes: data.notes ?? null,
        created_at: new Date().toISOString(),
        worker_name: lookupWorkerName(cache, data.worker_id ?? null),
        field_name: lookupFieldName(cache, data.field_id ?? null),
      };
      return {
        ...cache,
        labour: {
          labourDays: [
            ...(cache.labour?.labourDays ?? []),
            withPendingFlag(localLabour, true),
          ],
          summary: cache.labour?.summary ?? null,
          byCategory: cache.labour?.byCategory ?? [],
          period: cache.labour?.period,
        },
      };
    }
    case "inventoryItem": {
      if (!targetId) return cache;
      if (item.action === "update") {
        return {
          ...cache,
          inventory: cache.inventory
            ? {
                ...cache.inventory,
                inventory: updateListItem(
                  cache.inventory.inventory,
                  targetId,
                  data as Partial<FarmOSInventoryItem>,
                ),
              }
            : cache.inventory,
        };
      }
      const localItem: FarmOSInventoryItem = {
        id: targetId,
        farm_id: farmId,
        item_type: data.item_type ?? "",
        name: data.name ?? "",
        quantity: data.quantity ?? 0,
        unit: data.unit ?? null,
        unit_cost_usd: data.unit_cost_usd ?? null,
        reorder_level: data.reorder_level ?? null,
        expiry_date: data.expiry_date ?? null,
        supplier: data.supplier ?? null,
      };
      return {
        ...cache,
        inventory: {
          inventory: [
            ...(cache.inventory?.inventory ?? []),
            withPendingFlag(localItem, true),
          ],
          summary: cache.inventory?.summary ?? [],
          alerts: cache.inventory?.alerts ?? [],
        },
      };
    }
    case "inventoryUsage": {
      return applyInventoryUsage(cache, data);
    }
    case "calendarEntry": {
      if (!targetId) return cache;
      const localEntry: FarmOSCalendarEntry = {
        id: targetId,
        farm_id: farmId,
        crop_type: data.crop_type ?? "",
        region: data.region ?? null,
        recommended_planting_start: data.recommended_planting_start ?? null,
        recommended_planting_end: data.recommended_planting_end ?? null,
        expected_harvest_weeks: data.expected_harvest_weeks ?? null,
        soil_requirements: data.soil_requirements ?? null,
        water_requirements: data.water_requirements ?? null,
        common_pests: data.common_pests ?? null,
        notes: data.notes ?? null,
        created_at: new Date().toISOString(),
      };
      return {
        ...cache,
        calendar: {
          calendar: [
            ...(cache.calendar?.calendar ?? []),
            withPendingFlag(localEntry, true),
          ],
          plantingNow: cache.calendar?.plantingNow ?? [],
        },
      };
    }
    case "expense": {
      if (!targetId) return cache;
      if (item.action === "update") {
        return {
          ...cache,
          expenses: cache.expenses
            ? {
                ...cache.expenses,
                expenses: updateListItem(
                  cache.expenses.expenses,
                  targetId,
                  data as Partial<FarmOSExpense>,
                ),
              }
            : cache.expenses,
        };
      }
      if (item.action === "delete") {
        return {
          ...cache,
          expenses: cache.expenses
            ? {
                ...cache.expenses,
                expenses: removeListItem(cache.expenses.expenses, targetId),
              }
            : cache.expenses,
        };
      }
      const localExpense: FarmOSExpense = {
        id: targetId,
        farm_id: farmId,
        expense_date: data.expense_date ?? new Date().toISOString(),
        category: data.category ?? "",
        description: data.description ?? null,
        amount_usd: data.amount_usd ?? 0,
        field_id: data.field_id ?? null,
        crop_plan_id: data.crop_plan_id ?? null,
        supplier: data.supplier ?? null,
        receipt_ref: data.receipt_ref ?? null,
        notes: data.notes ?? null,
        created_at: new Date().toISOString(),
      };
      return {
        ...cache,
        expenses: {
          expenses: [
            ...(cache.expenses?.expenses ?? []),
            withPendingFlag(localExpense, true),
          ],
          summary: cache.expenses?.summary ?? null,
          byCategory: cache.expenses?.byCategory,
          period: cache.expenses?.period,
        },
      };
    }
    case "revenue": {
      if (!targetId) return cache;
      if (item.action === "update") {
        return {
          ...cache,
          revenue: cache.revenue
            ? {
                ...cache.revenue,
                revenue: updateListItem(
                  cache.revenue.revenue,
                  targetId,
                  data as Partial<FarmOSRevenue>,
                ),
              }
            : cache.revenue,
        };
      }
      if (item.action === "delete") {
        return {
          ...cache,
          revenue: cache.revenue
            ? {
                ...cache.revenue,
                revenue: removeListItem(cache.revenue.revenue, targetId),
              }
            : cache.revenue,
        };
      }
      const localRevenue: FarmOSRevenue = {
        id: targetId,
        farm_id: farmId,
        revenue_date: data.revenue_date ?? new Date().toISOString(),
        category: data.category ?? "",
        description: data.description ?? null,
        amount_usd: data.amount_usd ?? 0,
        quantity: data.quantity ?? null,
        unit: data.unit ?? null,
        unit_price_usd: data.unit_price_usd ?? null,
        buyer_name: data.buyer_name ?? null,
        field_id: data.field_id ?? null,
        crop_plan_id: data.crop_plan_id ?? null,
        notes: data.notes ?? null,
        created_at: new Date().toISOString(),
      };
      return {
        ...cache,
        revenue: {
          revenue: [
            ...(cache.revenue?.revenue ?? []),
            withPendingFlag(localRevenue, true),
          ],
          summary: cache.revenue?.summary ?? null,
          byCategory: cache.revenue?.byCategory,
          period: cache.revenue?.period,
        },
      };
    }
    case "marketPrice": {
      if (!targetId) return cache;
      const localPrice: FarmOSMarketPrice = {
        id: targetId,
        commodity: data.commodity ?? "",
        region: data.region ?? null,
        price_usd: data.price_usd ?? 0,
        unit: data.unit ?? "",
        price_date: data.price_date ?? new Date().toISOString(),
        source: data.source ?? null,
        demand_level: data.demand_level ?? null,
        notes: data.notes ?? null,
      };
      return {
        ...cache,
        market: {
          prices: [
            ...(cache.market?.prices ?? []),
            withPendingFlag(localPrice, true),
          ],
          insights: cache.market?.insights ?? null,
          generatedAt: cache.market?.generatedAt ?? null,
        },
      };
    }
    default:
      return cache;
  }
};

export const applyQueueItemToStoredCache = async (
  item: FarmOSQueueItem,
): Promise<FarmOSCache> => {
  const cache = (await loadFarmOSCache()) ?? {};
  const next = applyQueueItemToCache(cache, item);
  await saveFarmOSCache(next);
  return next;
};

export const mergeCacheWithQueue = (
  cache: FarmOSCache,
  queue: FarmOSQueueItem[],
): FarmOSCache => queue.reduce(applyQueueItemToCache, cache);

const ENTITY_RESPONSE_KEY: Partial<Record<FarmOSQueueEntity, string>> = {
  farm: "farm",
  field: "field",
  worker: "worker",
  cropPlan: "cropPlan",
  cropActivity: "activity",
  livestockGroup: "group",
  livestockActivity: "activity",
  labourDay: "labourDay",
  inventoryItem: "item",
  calendarEntry: "entry",
  expense: "expense",
  revenue: "revenue",
  marketPrice: "price",
};

const replaceLocalIdDeep = (
  value: unknown,
  localId: string,
  remoteId: string,
): unknown => {
  if (value === localId) return remoteId;
  if (Array.isArray(value)) {
    return value.map((item) => replaceLocalIdDeep(item, localId, remoteId));
  }
  if (value && typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>).map(
      ([key, item]) => [key, replaceLocalIdDeep(item, localId, remoteId)],
    );
    return Object.fromEntries(entries);
  }
  return value;
};

const replaceLocalIdInQueueItem = (
  item: FarmOSQueueItem,
  localId: string,
  remoteId: string,
): FarmOSQueueItem => {
  const next: FarmOSQueueItem = { ...item };
  if (next.targetId === localId) next.targetId = remoteId;
  if (next.localId === localId) next.localId = remoteId;
  if (next.url.includes(localId)) {
    next.url = next.url.replace(localId, remoteId);
  }
  if (next.data) {
    next.data = replaceLocalIdDeep(next.data, localId, remoteId) as Record<
      string,
      any
    >;
  }
  return next;
};

const applyIdMapToQueueItem = (
  item: FarmOSQueueItem,
  idMap: Record<string, string>,
): FarmOSQueueItem =>
  Object.entries(idMap).reduce(
    (current, [localId, remoteId]) =>
      replaceLocalIdInQueueItem(current, localId, remoteId),
    item,
  );

const extractCreatedId = (
  entity: FarmOSQueueEntity,
  responseData: any,
): string | null => {
  const key = ENTITY_RESPONSE_KEY[entity];
  if (!key) return null;
  const record = responseData?.data?.[key];
  if (!record || typeof record !== "object") return null;
  const idValue = (record as { id?: string | number }).id;
  return idValue ? String(idValue) : null;
};

export const syncFarmOSQueue = async (): Promise<{
  synced: number;
  remaining: number;
}> => {
  let queue = await getFarmOSQueue();
  if (queue.length === 0) {
    return { synced: 0, remaining: 0 };
  }

  let index = 0;
  const idMap: Record<string, string> = {};

  for (; index < queue.length; index += 1) {
    let item = applyIdMapToQueueItem(queue[index], idMap);
    queue[index] = item;
    try {
      const response = await api.request({
        method: item.method,
        url: item.url,
        data: item.data,
      });

      if (item.action === "create" && item.localId) {
        const createdId = extractCreatedId(item.entity, response.data);
        if (createdId && createdId !== item.localId) {
          idMap[item.localId] = createdId;
          queue = queue.map((queuedItem, queuedIndex) =>
            queuedIndex <= index
              ? queuedItem
              : replaceLocalIdInQueueItem(queuedItem, item.localId!, createdId),
          );
        }
      }
    } catch {
      break;
    }
  }

  const remainingItems = queue.slice(index);
  if (index > 0 || Object.keys(idMap).length > 0) {
    await setFarmOSQueue(remainingItems);
  }

  if (Object.keys(idMap).length > 0) {
    const cache = (await loadFarmOSCache()) ?? {};
    const updatedCache = Object.entries(idMap).reduce(
      (current, [localId, remoteId]) =>
        replaceLocalIdDeep(current, localId, remoteId) as FarmOSCache,
      cache,
    );
    await saveFarmOSCache(updatedCache);
  }

  if (remainingItems.length === 0 && index > 0) {
    await updateFarmOSCache({ lastSyncedAt: new Date().toISOString() });
  }

  return { synced: index, remaining: remainingItems.length };
};
