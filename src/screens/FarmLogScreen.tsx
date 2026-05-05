import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Modal,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Linking,
} from "react-native";
import { useRouter } from "expo-router";
import { ClipboardList, Plus, X } from "lucide-react-native";
import {
  neumorphicColors,
  typography,
  spacing,
  borderRadius,
} from "../theme/neumorphic";
import {
  NeumorphicScreen,
  NeumorphicCard,
  NeumorphicButton,
  NeumorphicBadge,
  NeumorphicInput,
} from "../components/neumorphic";
import LoadingSpinner from "../components/LoadingSpinner";
import farmLogService from "../services/farmLogService";
import { useAuth } from "../contexts/AuthContext";
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

type LogInputForm = {
  id?: string;
  input_type: string;
  name: string;
  quantity: string;
  unit: string;
  cost_usd: string;
  supplier: string;
};

type LogYieldForm = {
  id?: string;
  crop: string;
  quantity: string;
  unit: string;
  quality: string;
  notes: string;
};

type LogFormState = {
  log_date: string;
  activity_type: string;
  crop: string;
  field_area: string;
  description: string;
  weather: string;
  notes: string;
  inputs: LogInputForm[];
  yields: LogYieldForm[];
};

const ACTIVITY_TYPES = [
  { value: "planting", label: "Planting", badge: "success" },
  { value: "spraying", label: "Spraying", badge: "info" },
  { value: "harvesting", label: "Harvesting", badge: "warning" },
  { value: "feeding", label: "Feeding", badge: "primary" },
  { value: "irrigation", label: "Irrigation", badge: "info" },
  { value: "pruning", label: "Pruning", badge: "neutral" },
  { value: "fertilising", label: "Fertilising", badge: "success" },
  { value: "weeding", label: "Weeding", badge: "warning" },
  { value: "inspection", label: "Inspection", badge: "neutral" },
  { value: "other", label: "Other", badge: "neutral" },
] as const;

const WEATHER_OPTIONS = [
  "Sunny",
  "Cloudy",
  "Rainy",
  "Windy",
  "Hot",
  "Cold",
  "Humid",
];
const UNITS = [
  "kg",
  "litres",
  "crates",
  "bags",
  "tonnes",
  "boxes",
  "hours",
  "units",
];

const todayIso = () => new Date().toISOString().split("T")[0];

const emptyInput: LogInputForm = {
  input_type: "seed",
  name: "",
  quantity: "",
  unit: "",
  cost_usd: "",
  supplier: "",
};

const emptyYield: LogYieldForm = {
  crop: "",
  quantity: "",
  unit: "kg",
  quality: "",
  notes: "",
};

const emptyForm: LogFormState = {
  log_date: todayIso(),
  activity_type: "planting",
  crop: "",
  field_area: "",
  description: "",
  weather: "",
  notes: "",
  inputs: [],
  yields: [],
};

const toNumber = (value: number | string | null | undefined) => {
  const num = typeof value === "number" ? value : Number.parseFloat(value ?? "");
  return Number.isFinite(num) ? num : 0;
};

const toOptionalNumber = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const num = Number(trimmed);
  return Number.isFinite(num) ? num : null;
};

const formatDate = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString();
};

const formatCurrency = (value: number | string | null | undefined) =>
  `$${toNumber(value).toFixed(2)}`;

const getActivityMeta = (type: string) =>
  ACTIVITY_TYPES.find((activity) => activity.value === type);

export default function FarmLogScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [subLoading, setSubLoading] = useState(true);
  const [subscription, setSubscription] =
    useState<FarmLogSubscription | null>(null);
  const [access, setAccess] = useState<FarmLogAccessStatus>("none");
  const [trialDaysLeft, setTrialDaysLeft] = useState(0);
  const [plans, setPlans] = useState<FarmLogPlan[]>([]);
  const [logs, setLogs] = useState<FarmLogEntry[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<LogFormState>(emptyForm);
  const [originalInputs, setOriginalInputs] = useState<FarmLogInput[]>([]);
  const [originalYields, setOriginalYields] = useState<FarmLogYield[]>([]);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"logs" | "reports">("logs");
  const [reportMode, setReportMode] = useState<"weekly" | "daily">("weekly");
  const [weeklyReport, setWeeklyReport] =
    useState<FarmLogWeeklyReport | null>(null);
  const [dailyReport, setDailyReport] =
    useState<FarmLogDailyReport | null>(null);
  const [dailyDate, setDailyDate] = useState(todayIso());
  const [reportsLoading, setReportsLoading] = useState(false);
  const [plansModalOpen, setPlansModalOpen] = useState(false);

  const canAccess = access === "trial" || access === "active";

  useEffect(() => {
    if (user && user.role !== "farmer") {
      Alert.alert("Access denied", "Farm Log is available to farmers only.");
      router.replace("/(tabs)/index");
    }
  }, [user, router]);

  const loadSubscription = useCallback(async (): Promise<FarmLogAccessStatus> => {
    try {
      setSubLoading(true);
      const response = await farmLogService.getSubscription();
      if (response.success) {
        setSubscription(response.data.subscription);
        setAccess(response.data.access);
        setTrialDaysLeft(response.data.trialDaysLeft);
        return response.data.access;
      }
    } catch (error) {
      console.error("Failed to load subscription:", error);
    } finally {
      setSubLoading(false);
    }
    return "none";
  }, []);

  const loadPlans = useCallback(async () => {
    try {
      const response = await farmLogService.getPlans();
      if (response.success) {
        setPlans(response.data.plans);
      }
    } catch (error) {
      console.error("Failed to load plans:", error);
    }
  }, []);

  const openPlansModal = useCallback(() => {
    if (plans.length === 0) {
      loadPlans();
    }
    setPlansModalOpen(true);
  }, [plans.length, loadPlans]);

  const loadLogs = useCallback(async () => {
    try {
      setLogsLoading(true);
      const response = await farmLogService.getLogs({ limit: 30 });
      if (response.success) {
        setLogs(response.data.logs);
      }
    } catch (error) {
      console.error("Failed to load logs:", error);
    } finally {
      setLogsLoading(false);
    }
  }, []);

  const loadReports = useCallback(async () => {
    const shouldLoadDaily = reportMode === "daily" && dailyDate.length >= 10;
    if (reportMode === "daily" && !shouldLoadDaily) {
      setDailyReport(null);
      return;
    }

    try {
      setReportsLoading(true);
      if (reportMode === "weekly") {
        const response = await farmLogService.getWeeklyReport();
        if (response.success) {
          setWeeklyReport(response.data);
        }
      } else if (shouldLoadDaily) {
        const response = await farmLogService.getDailyReport(dailyDate);
        if (response.success) {
          setDailyReport(response.data);
        }
      }
    } catch (error) {
      console.error("Failed to load reports:", error);
    } finally {
      setReportsLoading(false);
    }
  }, [reportMode, dailyDate]);

  useEffect(() => {
    loadSubscription();
    loadPlans();
  }, [loadSubscription, loadPlans]);

  useEffect(() => {
    if (canAccess) {
      loadLogs();
    }
  }, [canAccess, loadLogs]);

  useEffect(() => {
    if (activeTab === "reports" && canAccess) {
      loadReports();
    }
  }, [activeTab, canAccess, loadReports]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    const nextAccess = await loadSubscription();
    if (nextAccess === "trial" || nextAccess === "active") {
      await loadLogs();
      if (activeTab === "reports") {
        await loadReports();
      }
    }
    setRefreshing(false);
  }, [activeTab, loadLogs, loadReports, loadSubscription]);

  const openCreate = () => {
    setEditingId(null);
    setOriginalInputs([]);
    setOriginalYields([]);
    setForm({ ...emptyForm, log_date: todayIso() });
    setModalOpen(true);
  };

  const openEdit = (log: FarmLogEntry) => {
    setEditingId(log.id);
    setOriginalInputs(log.inputs || []);
    setOriginalYields(log.yields || []);
    setForm({
      log_date: log.log_date?.split("T")[0] ?? todayIso(),
      activity_type: log.activity_type,
      crop: log.crop ?? "",
      field_area: log.field_area ?? "",
      description: log.description ?? "",
      weather: log.weather ?? "",
      notes: log.notes ?? "",
      inputs: (log.inputs || []).map((input) => ({
        id: input.id,
        input_type: input.input_type || "seed",
        name: input.name || "",
        quantity: input.quantity ? String(input.quantity) : "",
        unit: input.unit ?? "",
        cost_usd: input.cost_usd ? String(input.cost_usd) : "",
        supplier: input.supplier ?? "",
      })),
      yields: (log.yields || []).map((entry) => ({
        id: entry.id,
        crop: entry.crop || "",
        quantity: entry.quantity ? String(entry.quantity) : "",
        unit: entry.unit || "kg",
        quality: entry.quality ?? "",
        notes: entry.notes ?? "",
      })),
    });
    setModalOpen(true);
  };

  const updateInputAt = (index: number, patch: Partial<LogInputForm>) => {
    setForm((prev) => {
      const inputs = [...prev.inputs];
      inputs[index] = { ...inputs[index], ...patch };
      return { ...prev, inputs };
    });
  };

  const updateYieldAt = (index: number, patch: Partial<LogYieldForm>) => {
    setForm((prev) => {
      const yields = [...prev.yields];
      yields[index] = { ...yields[index], ...patch };
      return { ...prev, yields };
    });
  };

  const replaceInputs = async (logId: string, inputs: LogInputForm[]) => {
    if (originalInputs.length > 0) {
      await Promise.all(
        originalInputs
          .map((input) => input.id)
          .filter((id): id is string => !!id)
          .map((id) => farmLogService.deleteInput(id)),
      );
    }

    const payload = inputs
      .filter((input) => input.name.trim())
      .map((input) => ({
        input_type: input.input_type || "seed",
        name: input.name.trim(),
        quantity: toOptionalNumber(input.quantity),
        unit: input.unit ? input.unit.trim() : null,
        cost_usd: toOptionalNumber(input.cost_usd),
        supplier: input.supplier ? input.supplier.trim() : null,
      }));

    if (payload.length > 0) {
      await Promise.all(
        payload.map((input) => farmLogService.addInput(logId, input)),
      );
    }
  };

  const replaceYields = async (logId: string, yields: LogYieldForm[]) => {
    if (originalYields.length > 0) {
      await Promise.all(
        originalYields
          .map((entry) => entry.id)
          .filter((id): id is string => !!id)
          .map((id) => farmLogService.deleteYield(id)),
      );
    }

    const payload = yields
      .filter((entry) => entry.crop.trim())
      .map((entry) => ({
        crop: entry.crop.trim(),
        quantity: Number(entry.quantity),
        unit: entry.unit || "kg",
        quality: entry.quality ? entry.quality.trim() : null,
        notes: entry.notes ? entry.notes.trim() : null,
      }));

    if (payload.length > 0) {
      await Promise.all(
        payload.map((entry) => farmLogService.addYield(logId, entry)),
      );
    }
  };

  const handleSave = async () => {
    const invalidYield = form.yields.find(
      (entry) => entry.crop.trim() && !entry.quantity.trim(),
    );
    if (invalidYield) {
      Alert.alert("Missing quantity", "Please enter a quantity for each yield.");
      return;
    }
    const invalidYieldNumber = form.yields.find(
      (entry) =>
        entry.crop.trim() &&
        entry.quantity.trim() &&
        Number.isNaN(Number(entry.quantity)),
    );
    if (invalidYieldNumber) {
      Alert.alert("Invalid quantity", "Yield quantity must be a number.");
      return;
    }

    const payload = {
      log_date: form.log_date,
      activity_type: form.activity_type,
      crop: form.crop.trim() || null,
      field_area: form.field_area.trim() || null,
      description: form.description.trim() || null,
      weather: form.weather.trim() || null,
      notes: form.notes.trim() || null,
    };

    try {
      setSaving(true);
      if (editingId) {
        await farmLogService.updateLog(editingId, payload);
        await replaceInputs(editingId, form.inputs);
        await replaceYields(editingId, form.yields);
        Alert.alert("Saved", "Log entry updated.");
      } else {
        const inputs = form.inputs
          .filter((input) => input.name.trim())
          .map((input) => ({
            input_type: input.input_type || "seed",
            name: input.name.trim(),
            quantity: toOptionalNumber(input.quantity),
            unit: input.unit ? input.unit.trim() : null,
            cost_usd: toOptionalNumber(input.cost_usd),
            supplier: input.supplier ? input.supplier.trim() : null,
          }));

        const yields = form.yields
          .filter((entry) => entry.crop.trim())
          .map((entry) => ({
            crop: entry.crop.trim(),
            quantity: Number(entry.quantity),
            unit: entry.unit || "kg",
            quality: entry.quality ? entry.quality.trim() : null,
            notes: entry.notes ? entry.notes.trim() : null,
          }));

        await farmLogService.createLog({ ...payload, inputs, yields });
        Alert.alert("Saved", "Log entry added.");
      }

      setModalOpen(false);
      setEditingId(null);
      setForm({ ...emptyForm, log_date: todayIso() });
      setOriginalInputs([]);
      setOriginalYields([]);
      loadLogs();
    } catch (error: any) {
      Alert.alert(
        "Error",
        error.response?.data?.message || "Failed to save log.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (logId: string) => {
    Alert.alert("Delete log", "This action cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await farmLogService.deleteLog(logId);
            loadLogs();
          } catch (error: any) {
            Alert.alert(
              "Error",
              error.response?.data?.message || "Failed to delete log.",
            );
          }
        },
      },
    ]);
  };

  const handleWalletSubscribe = async (planId: string) => {
    try {
      setSaving(true);
      const response = await farmLogService.subscribeWithWallet(planId);
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

  const handlePaynowSubscribe = async (planId: string) => {
    try {
      setSaving(true);
      const response = await farmLogService.subscribeWithPaynow(planId);
      if (response.success && response.data?.redirectUrl) {
        const url = response.data.redirectUrl as string;
        const canOpen = await Linking.canOpenURL(url);
        if (canOpen) {
          await Linking.openURL(url);
        } else {
          Alert.alert("Payment", "Cannot open payment page.");
        }
      } else if (response.message) {
        Alert.alert("Payment", response.message);
      }
    } catch (error: any) {
      Alert.alert(
        "Payment failed",
        error.response?.data?.message || "Unable to initiate payment.",
      );
    } finally {
      setSaving(false);
    }
  };

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
        ? "Your free trial has ended. Subscribe to keep tracking your farm."
        : access === "cancelled"
          ? "Your subscription is cancelled. Renew to continue."
          : "Subscribe to unlock the Farm Log and start tracking.";

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
            <Text style={styles.title}>Farm Log</Text>
            <Text style={styles.subtitle}>{gateMessage}</Text>
          </View>

          <NeumorphicCard style={styles.featureCard}>
            <Text style={styles.sectionTitle}>What is included</Text>
            {[
              "Daily activity logs",
              "Input and seed tracking",
              "Cost tracking per activity",
              "Yield and harvest recording",
              "Weekly performance summaries",
              "Works across devices",
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
                <Text style={styles.planNote}>
                  {plan.billing_cycle === "annual"
                    ? "Annual plan billed yearly"
                    : "Monthly plan billed every month"}
                </Text>
                <View style={styles.planActions}>
                  <NeumorphicButton
                    title="Pay from Wallet"
                    onPress={() => handleWalletSubscribe(plan.id)}
                    loading={saving}
                    fullWidth
                  />
                  <NeumorphicButton
                    title="Pay via Paynow"
                    onPress={() => handlePaynowSubscribe(plan.id)}
                    variant="secondary"
                    loading={saving}
                    fullWidth
                    style={styles.planButton}
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
            <Text style={styles.title}>Farm Log</Text>
            <Text style={styles.subtitle}>
              {access === "trial"
                ? `Trial: ${trialDaysLeft} day${trialDaysLeft === 1 ? "" : "s"} left`
                : `${subscription?.plan_name ?? "Subscription"} active${
                    subscription?.current_period_end
                      ? ` until ${formatDate(subscription.current_period_end)}`
                      : ""
                  }`}
            </Text>
          </View>
          <View style={styles.headerActions}>
            {access === "trial" && (
              <NeumorphicButton
                title="Subscribe"
                variant="secondary"
                size="small"
                onPress={openPlansModal}
              />
            )}
            <NeumorphicButton
              title="New Log"
              onPress={openCreate}
              size="small"
              icon={<Plus size={16} color={neumorphicColors.text.inverse} />}
              style={styles.headerButton}
            />
          </View>
        </View>

        {access === "trial" && (
          <NeumorphicCard style={styles.trialCard}>
            <Text style={styles.trialText}>
              Your free trial is active. Subscribe anytime to keep access.
            </Text>
            <NeumorphicButton
              title="Subscribe now"
              size="small"
              onPress={openPlansModal}
              style={styles.trialButton}
            />
          </NeumorphicCard>
        )}

        <NeumorphicCard style={styles.tabCard}>
          <View style={styles.tabRow}>
            <TouchableOpacity
              style={[
                styles.tabButton,
                activeTab === "logs" && styles.tabButtonActive,
              ]}
              onPress={() => setActiveTab("logs")}
            >
              <Text
                style={[
                  styles.tabLabel,
                  activeTab === "logs" && styles.tabLabelActive,
                ]}
              >
                Activity Logs
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.tabButton,
                activeTab === "reports" && styles.tabButtonActive,
              ]}
              onPress={() => setActiveTab("reports")}
            >
              <Text
                style={[
                  styles.tabLabel,
                  activeTab === "reports" && styles.tabLabelActive,
                ]}
              >
                Reports
              </Text>
            </TouchableOpacity>
          </View>
        </NeumorphicCard>

        {activeTab === "logs" && (
          <View style={styles.section}>
            {logsLoading ? (
              <View style={styles.loadingContainer}>
                <LoadingSpinner />
              </View>
            ) : logs.length === 0 ? (
              <NeumorphicCard style={styles.emptyCard}>
                <Text style={styles.emptyTitle}>No logs yet</Text>
                <Text style={styles.emptyText}>
                  Start recording your daily farm activities.
                </Text>
                <NeumorphicButton
                  title="Add First Log"
                  onPress={openCreate}
                  style={styles.emptyButton}
                />
              </NeumorphicCard>
            ) : (
              logs.map((log) => {
                const activityMeta = getActivityMeta(log.activity_type);
                const totalCost = (log.inputs || []).reduce(
                  (sum, input) => sum + toNumber(input.cost_usd),
                  0,
                );
                const yieldSummary = (log.yields || [])
                  .map((entry) =>
                    `${entry.quantity} ${entry.unit} ${entry.crop}`,
                  )
                  .join(", ");

                return (
                  <NeumorphicCard key={log.id} style={styles.logCard}>
                    <View style={styles.logHeader}>
                      <NeumorphicBadge
                        label={activityMeta?.label ?? log.activity_type}
                        variant={
                          activityMeta?.badge ? (activityMeta.badge as any) : "neutral"
                        }
                        size="small"
                      />
                      <Text style={styles.logDate}>
                        {formatDate(log.log_date)}
                      </Text>
                    </View>
                    {(log.crop || log.field_area) && (
                      <Text style={styles.logMeta}>
                        {[log.crop, log.field_area].filter(Boolean).join(" - ")}
                      </Text>
                    )}
                    {log.description && (
                      <Text style={styles.logDescription}>{log.description}</Text>
                    )}

                    <View style={styles.logStatsRow}>
                      <Text style={styles.logStat}>{
                        `Inputs: ${log.inputs?.length ?? 0}`
                      }</Text>
                      {totalCost > 0 && (
                        <Text style={styles.logStat}>{
                          `Cost: ${formatCurrency(totalCost)}`
                        }</Text>
                      )}
                      {yieldSummary.length > 0 && (
                        <Text style={styles.logStat}>{
                          `Yield: ${yieldSummary}`
                        }</Text>
                      )}
                    </View>

                    <View style={styles.logActions}>
                      <TouchableOpacity
                        onPress={() => openEdit(log)}
                        style={styles.logActionButton}
                      >
                        <Text style={styles.logActionText}>Edit</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => handleDelete(log.id)}
                        style={styles.logActionButton}
                      >
                        <Text style={[styles.logActionText, styles.deleteText]}>
                          Delete
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </NeumorphicCard>
                );
              })
            )}
          </View>
        )}

        {activeTab === "reports" && (
          <View style={styles.section}>
            <NeumorphicCard style={styles.reportModeCard}>
              <View style={styles.reportModeRow}>
                <TouchableOpacity
                  style={[
                    styles.reportModeButton,
                    reportMode === "weekly" && styles.reportModeButtonActive,
                  ]}
                  onPress={() => setReportMode("weekly")}
                >
                  <Text
                    style={[
                      styles.reportModeText,
                      reportMode === "weekly" && styles.reportModeTextActive,
                    ]}
                  >
                    Weekly
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.reportModeButton,
                    reportMode === "daily" && styles.reportModeButtonActive,
                  ]}
                  onPress={() => setReportMode("daily")}
                >
                  <Text
                    style={[
                      styles.reportModeText,
                      reportMode === "daily" && styles.reportModeTextActive,
                    ]}
                  >
                    Daily
                  </Text>
                </TouchableOpacity>
              </View>
            </NeumorphicCard>

            {reportMode === "daily" && (
              <NeumorphicCard style={styles.reportFilterCard}>
                <NeumorphicInput
                  label="Date"
                  placeholder="YYYY-MM-DD"
                  value={dailyDate}
                  onChangeText={setDailyDate}
                />
                <NeumorphicButton
                  title="Load Daily Report"
                  onPress={loadReports}
                  variant="secondary"
                  size="small"
                />
              </NeumorphicCard>
            )}

            {reportsLoading ? (
              <View style={styles.loadingContainer}>
                <LoadingSpinner />
              </View>
            ) : reportMode === "weekly" ? (
              weeklyReport ? (
                <View style={styles.reportContent}>
                  <View style={styles.reportSummaryRow}>
                    <NeumorphicCard style={styles.summaryCard}>
                      <Text style={styles.summaryValue}>
                        {toNumber(weeklyReport.summary?.total_activities)}
                      </Text>
                      <Text style={styles.summaryLabel}>Activities</Text>
                    </NeumorphicCard>
                    <NeumorphicCard style={styles.summaryCard}>
                      <Text style={styles.summaryValue}>
                        {formatCurrency(weeklyReport.summary?.total_cost)}
                      </Text>
                      <Text style={styles.summaryLabel}>Total Cost</Text>
                    </NeumorphicCard>
                    <NeumorphicCard
                      style={[styles.summaryCard, styles.summaryCardLast]}
                    >
                      <Text style={styles.summaryValue}>
                        {toNumber(weeklyReport.summary?.total_yield)}
                      </Text>
                      <Text style={styles.summaryLabel}>Total Yield</Text>
                    </NeumorphicCard>
                  </View>

                  {weeklyReport.byActivity?.length > 0 && (
                    <NeumorphicCard style={styles.reportCard}>
                      <Text style={styles.sectionTitle}>By Activity</Text>
                      {weeklyReport.byActivity.map((entry) => (
                        <View key={entry.activity_type} style={styles.reportRow}>
                          <Text style={styles.reportText}>
                            {getActivityMeta(entry.activity_type)?.label ??
                              entry.activity_type}
                          </Text>
                          <Text style={styles.reportValue}>{entry.count}</Text>
                        </View>
                      ))}
                    </NeumorphicCard>
                  )}

                  {weeklyReport.byDay?.length > 0 && (
                    <NeumorphicCard style={styles.reportCard}>
                      <Text style={styles.sectionTitle}>
                        Daily Summary ({weeklyReport.startDate} to {weeklyReport.endDate})
                      </Text>
                      {weeklyReport.byDay.map((entry) => (
                        <View key={entry.log_date} style={styles.reportRow}>
                          <Text style={styles.reportText}>
                            {formatDate(entry.log_date)}
                          </Text>
                          <Text style={styles.reportValue}>
                            {entry.activities} activities
                          </Text>
                        </View>
                      ))}
                    </NeumorphicCard>
                  )}
                </View>
              ) : (
                <NeumorphicCard style={styles.emptyCard}>
                  <Text style={styles.emptyText}>No weekly data yet.</Text>
                </NeumorphicCard>
              )
            ) : dailyReport ? (
              <View style={styles.reportContent}>
                <View style={styles.reportSummaryRow}>
                  <NeumorphicCard style={styles.summaryCard}>
                    <Text style={styles.summaryValue}>
                      {toNumber(dailyReport.summary?.total_activities)}
                    </Text>
                    <Text style={styles.summaryLabel}>Activities</Text>
                  </NeumorphicCard>
                  <NeumorphicCard style={styles.summaryCard}>
                    <Text style={styles.summaryValue}>
                      {formatCurrency(dailyReport.summary?.total_cost)}
                    </Text>
                    <Text style={styles.summaryLabel}>Total Cost</Text>
                  </NeumorphicCard>
                  <NeumorphicCard
                    style={[styles.summaryCard, styles.summaryCardLast]}
                  >
                    <Text style={styles.summaryValue}>
                      {toNumber(dailyReport.summary?.total_yield_qty)}
                    </Text>
                    <Text style={styles.summaryLabel}>Total Yield</Text>
                  </NeumorphicCard>
                </View>

                <NeumorphicCard style={styles.reportCard}>
                  <Text style={styles.sectionTitle}>Entries for {dailyReport.date}</Text>
                  {dailyReport.logs?.length ? (
                    dailyReport.logs.map((log) => (
                      <View key={log.id} style={styles.reportRow}>
                        <Text style={styles.reportText}>
                          {getActivityMeta(log.activity_type)?.label ??
                            log.activity_type}
                        </Text>
                        <Text style={styles.reportValue}>
                          {log.crop ?? ""}
                        </Text>
                      </View>
                    ))
                  ) : (
                    <Text style={styles.emptyText}>No logs for this day.</Text>
                  )}
                </NeumorphicCard>
              </View>
            ) : (
              <NeumorphicCard style={styles.emptyCard}>
                <Text style={styles.emptyText}>No daily data yet.</Text>
              </NeumorphicCard>
            )}
          </View>
        )}
      </ScrollView>

      <Modal
        visible={plansModalOpen}
        animationType="slide"
        transparent
        onRequestClose={() => setPlansModalOpen(false)}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Choose a plan</Text>
              <TouchableOpacity onPress={() => setPlansModalOpen(false)}>
                <X size={22} color={neumorphicColors.text.secondary} />
              </TouchableOpacity>
            </View>
            <ScrollView
              style={styles.modalContent}
              showsVerticalScrollIndicator={false}
            >
              {access === "trial" && (
                <NeumorphicCard style={styles.modalCallout}>
                  <Text style={styles.modalSubtitle}>
                    {trialDaysLeft > 0
                      ? `Trial ends in ${trialDaysLeft} day${
                          trialDaysLeft === 1 ? "" : "s"
                        }.`
                      : "Your trial has ended. Subscribe to continue."}
                  </Text>
                </NeumorphicCard>
              )}

              {plans.length === 0 ? (
                <NeumorphicCard style={styles.planCard}>
                  <Text style={styles.emptyText}>
                    No subscription plans are available yet.
                  </Text>
                </NeumorphicCard>
              ) : (
                plans.map((plan) => (
                  <NeumorphicCard key={plan.id} style={styles.planCard}
                  >
                    {plan.billing_cycle === "annual" && (
                      <NeumorphicBadge
                        label="Best value"
                        variant="success"
                        size="small"
                        style={styles.planBadge}
                      />
                    )}
                    <Text style={styles.planTitle}>{plan.name}</Text>
                    <Text style={styles.planPrice}>
                      {formatCurrency(plan.price_usd)}
                      <Text style={styles.planCycle}>
                        {`/${plan.billing_cycle === "monthly" ? "mo" : "yr"}`}
                      </Text>
                    </Text>
                    <Text style={styles.planNote}>
                      {plan.billing_cycle === "annual"
                        ? "Annual plan billed yearly"
                        : "Monthly plan billed every month"}
                    </Text>
                    <View style={styles.planActions}>
                      <NeumorphicButton
                        title="Pay from Wallet"
                        onPress={() => handleWalletSubscribe(plan.id)}
                        loading={saving}
                        fullWidth
                      />
                      <NeumorphicButton
                        title="Pay via Paynow"
                        onPress={() => handlePaynowSubscribe(plan.id)}
                        variant="secondary"
                        loading={saving}
                        fullWidth
                        style={styles.planButton}
                      />
                    </View>
                  </NeumorphicCard>
                ))
              )}
            </ScrollView>
            <View style={styles.modalFooter}>
              <NeumorphicButton
                title="Not now"
                variant="tertiary"
                onPress={() => setPlansModalOpen(false)}
                fullWidth
              />
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <Modal visible={modalOpen} animationType="slide" transparent>
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingId ? "Edit Log Entry" : "New Log Entry"}
              </Text>
              <TouchableOpacity onPress={() => setModalOpen(false)}>
                <X size={22} color={neumorphicColors.text.secondary} />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.modalContent}
              showsVerticalScrollIndicator={false}
            >
              <NeumorphicInput
                label="Date"
                placeholder="YYYY-MM-DD"
                value={form.log_date}
                onChangeText={(value) =>
                  setForm((prev) => ({ ...prev, log_date: value }))
                }
              />

              <Text style={styles.sectionTitle}>Activity Type</Text>
              <View style={styles.chipRow}>
                {ACTIVITY_TYPES.map((activity) => (
                  <TouchableOpacity
                    key={activity.value}
                    style={[
                      styles.chip,
                      form.activity_type === activity.value &&
                        styles.chipActive,
                    ]}
                    onPress={() =>
                      setForm((prev) => ({
                        ...prev,
                        activity_type: activity.value,
                      }))
                    }
                  >
                    <Text
                      style={[
                        styles.chipText,
                        form.activity_type === activity.value &&
                          styles.chipTextActive,
                      ]}
                    >
                      {activity.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <NeumorphicInput
                label="Crop"
                placeholder="e.g. Tomatoes"
                value={form.crop}
                onChangeText={(value) =>
                  setForm((prev) => ({ ...prev, crop: value }))
                }
              />

              <NeumorphicInput
                label="Field or Area"
                placeholder="e.g. Block A"
                value={form.field_area}
                onChangeText={(value) =>
                  setForm((prev) => ({ ...prev, field_area: value }))
                }
              />

              <NeumorphicInput
                label="Description"
                placeholder="What was done?"
                value={form.description}
                onChangeText={(value) =>
                  setForm((prev) => ({ ...prev, description: value }))
                }
                variant="textarea"
              />

              <Text style={styles.sectionTitle}>Weather</Text>
              <View style={styles.chipRow}>
                {WEATHER_OPTIONS.map((weather) => (
                  <TouchableOpacity
                    key={weather}
                    style={[
                      styles.chip,
                      form.weather === weather && styles.chipActive,
                    ]}
                    onPress={() =>
                      setForm((prev) => ({ ...prev, weather }))
                    }
                  >
                    <Text
                      style={[
                        styles.chipText,
                        form.weather === weather && styles.chipTextActive,
                      ]}
                    >
                      {weather}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionTitle}>Inputs Used</Text>
                <TouchableOpacity
                  onPress={() =>
                    setForm((prev) => ({
                      ...prev,
                      inputs: [...prev.inputs, { ...emptyInput }],
                    }))
                  }
                >
                  <Text style={styles.addText}>Add Input</Text>
                </TouchableOpacity>
              </View>

              {form.inputs.map((input, index) => (
                <NeumorphicCard key={`input-${index}`} style={styles.formCard}>
                  <View style={styles.formCardHeader}>
                    <Text style={styles.formCardTitle}>{`Input ${index + 1}`}</Text>
                    <TouchableOpacity
                      onPress={() =>
                        setForm((prev) => ({
                          ...prev,
                          inputs: prev.inputs.filter((_, idx) => idx !== index),
                        }))
                      }
                    >
                      <Text style={styles.deleteText}>Remove</Text>
                    </TouchableOpacity>
                  </View>

                  <NeumorphicInput
                    label="Type"
                    placeholder="seed, fertiliser, labour"
                    value={input.input_type}
                    onChangeText={(value) =>
                      updateInputAt(index, { input_type: value })
                    }
                  />

                  <NeumorphicInput
                    label="Name"
                    placeholder="Input name"
                    value={input.name}
                    onChangeText={(value) => updateInputAt(index, { name: value })}
                  />

                  <NeumorphicInput
                    label="Quantity"
                    placeholder="Amount used"
                    value={input.quantity}
                    keyboardType="decimal-pad"
                    onChangeText={(value) =>
                      updateInputAt(index, { quantity: value })
                    }
                  />

                  <NeumorphicInput
                    label="Unit"
                    placeholder="kg, litres, hours"
                    value={input.unit}
                    onChangeText={(value) => updateInputAt(index, { unit: value })}
                  />

                  <NeumorphicInput
                    label="Cost (USD)"
                    placeholder="0.00"
                    value={input.cost_usd}
                    keyboardType="decimal-pad"
                    onChangeText={(value) =>
                      updateInputAt(index, { cost_usd: value })
                    }
                  />

                  <NeumorphicInput
                    label="Supplier"
                    placeholder="Optional"
                    value={input.supplier}
                    onChangeText={(value) =>
                      updateInputAt(index, { supplier: value })
                    }
                  />
                </NeumorphicCard>
              ))}

              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionTitle}>Yield or Harvest</Text>
                <TouchableOpacity
                  onPress={() =>
                    setForm((prev) => ({
                      ...prev,
                      yields: [...prev.yields, { ...emptyYield }],
                    }))
                  }
                >
                  <Text style={styles.addText}>Add Yield</Text>
                </TouchableOpacity>
              </View>

              {form.yields.map((entry, index) => (
                <NeumorphicCard key={`yield-${index}`} style={styles.formCard}>
                  <View style={styles.formCardHeader}>
                    <Text style={styles.formCardTitle}>{`Yield ${index + 1}`}</Text>
                    <TouchableOpacity
                      onPress={() =>
                        setForm((prev) => ({
                          ...prev,
                          yields: prev.yields.filter((_, idx) => idx !== index),
                        }))
                      }
                    >
                      <Text style={styles.deleteText}>Remove</Text>
                    </TouchableOpacity>
                  </View>

                  <NeumorphicInput
                    label="Crop"
                    placeholder="Crop name"
                    value={entry.crop}
                    onChangeText={(value) => updateYieldAt(index, { crop: value })}
                  />

                  <NeumorphicInput
                    label="Quantity"
                    placeholder="Amount harvested"
                    value={entry.quantity}
                    keyboardType="decimal-pad"
                    onChangeText={(value) =>
                      updateYieldAt(index, { quantity: value })
                    }
                  />

                  <NeumorphicInput
                    label="Unit"
                    placeholder={UNITS.join(", ")}
                    value={entry.unit}
                    onChangeText={(value) => updateYieldAt(index, { unit: value })}
                  />

                  <NeumorphicInput
                    label="Quality"
                    placeholder="Optional"
                    value={entry.quality}
                    onChangeText={(value) => updateYieldAt(index, { quality: value })}
                  />

                  <NeumorphicInput
                    label="Notes"
                    placeholder="Optional"
                    value={entry.notes}
                    onChangeText={(value) => updateYieldAt(index, { notes: value })}
                    variant="textarea"
                  />
                </NeumorphicCard>
              ))}

              <NeumorphicInput
                label="Additional Notes"
                placeholder="Any extra notes"
                value={form.notes}
                onChangeText={(value) => setForm((prev) => ({ ...prev, notes: value }))}
                variant="textarea"
              />

              <View style={styles.modalActions}>
                <NeumorphicButton
                  title="Cancel"
                  variant="tertiary"
                  onPress={() => setModalOpen(false)}
                  style={styles.modalButton}
                />
                <NeumorphicButton
                  title={saving ? "Saving..." : "Save Log"}
                  onPress={handleSave}
                  loading={saving}
                  style={[styles.modalButton, styles.modalButtonLast]}
                />
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </NeumorphicScreen>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xl * 2,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 200,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.lg,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerButton: {
    marginLeft: spacing.sm,
  },
  headerText: {
    flex: 1,
    marginRight: spacing.md,
  },
  title: {
    ...typography.h3,
    color: neumorphicColors.text.primary,
  },
  subtitle: {
    ...typography.bodySmall,
    color: neumorphicColors.text.secondary,
    marginTop: spacing.xs,
  },
  gateHeader: {
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  gateIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: neumorphicColors.base.card,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
  },
  featureCard: {
    marginBottom: spacing.lg,
    padding: spacing.lg,
  },
  featureItem: {
    ...typography.bodySmall,
    color: neumorphicColors.text.secondary,
    marginTop: spacing.xs,
  },
  planCard: {
    marginBottom: spacing.lg,
    padding: spacing.lg,
  },
  planTitle: {
    ...typography.h4,
    color: neumorphicColors.text.primary,
  },
  planBadge: {
    marginBottom: spacing.sm,
  },
  planPrice: {
    fontSize: 24,
    fontWeight: "700",
    color: neumorphicColors.primary[600],
    marginTop: spacing.sm,
  },
  planCycle: {
    fontSize: 14,
    color: neumorphicColors.text.secondary,
  },
  planNote: {
    ...typography.bodySmall,
    color: neumorphicColors.text.secondary,
    marginTop: spacing.xs,
  },
  planActions: {
    marginTop: spacing.md,
  },
  planButton: {
    marginTop: spacing.sm,
  },
  trialCard: {
    marginBottom: spacing.lg,
    padding: spacing.md,
  },
  trialText: {
    ...typography.bodySmall,
    color: neumorphicColors.text.secondary,
  },
  trialButton: {
    marginTop: spacing.sm,
  },
  tabCard: {
    marginBottom: spacing.lg,
    padding: spacing.xs,
  },
  tabRow: {
    flexDirection: "row",
  },
  tabButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    alignItems: "center",
  },
  tabButtonActive: {
    backgroundColor: neumorphicColors.primary[100],
  },
  tabLabel: {
    ...typography.bodySmall,
    color: neumorphicColors.text.secondary,
  },
  tabLabelActive: {
    color: neumorphicColors.primary[700],
    fontWeight: "600",
  },
  section: {
    marginBottom: spacing.lg,
  },
  emptyCard: {
    padding: spacing.lg,
    alignItems: "center",
  },
  emptyTitle: {
    ...typography.h4,
    color: neumorphicColors.text.primary,
  },
  emptyText: {
    ...typography.bodySmall,
    color: neumorphicColors.text.secondary,
    marginTop: spacing.sm,
    textAlign: "center",
  },
  emptyButton: {
    marginTop: spacing.md,
  },
  logCard: {
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  logHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.sm,
  },
  logDate: {
    ...typography.bodySmall,
    color: neumorphicColors.text.secondary,
  },
  logMeta: {
    ...typography.bodySmall,
    color: neumorphicColors.text.secondary,
    marginBottom: spacing.xs,
  },
  logDescription: {
    ...typography.bodySmall,
    color: neumorphicColors.text.primary,
    marginBottom: spacing.sm,
  },
  logStatsRow: {
    marginBottom: spacing.sm,
  },
  logStat: {
    ...typography.bodySmall,
    color: neumorphicColors.text.secondary,
    marginTop: spacing.xs,
  },
  logActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  logActionButton: {
    marginLeft: spacing.md,
  },
  logActionText: {
    ...typography.bodySmall,
    color: neumorphicColors.primary[700],
    fontWeight: "600",
  },
  deleteText: {
    color: neumorphicColors.semantic.error,
  },
  reportModeCard: {
    padding: spacing.xs,
    marginBottom: spacing.md,
  },
  reportModeRow: {
    flexDirection: "row",
  },
  reportModeButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    alignItems: "center",
  },
  reportModeButtonActive: {
    backgroundColor: neumorphicColors.primary[100],
  },
  reportModeText: {
    ...typography.bodySmall,
    color: neumorphicColors.text.secondary,
  },
  reportModeTextActive: {
    color: neumorphicColors.primary[700],
    fontWeight: "600",
  },
  reportFilterCard: {
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  reportContent: {
    marginBottom: spacing.lg,
  },
  reportSummaryRow: {
    flexDirection: "row",
    marginBottom: spacing.md,
  },
  summaryCard: {
    flex: 1,
    padding: spacing.md,
    marginRight: spacing.sm,
    alignItems: "center",
  },
  summaryCardLast: {
    marginRight: 0,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: "700",
    color: neumorphicColors.primary[700],
  },
  summaryLabel: {
    ...typography.bodySmall,
    color: neumorphicColors.text.secondary,
    marginTop: spacing.xs,
    textAlign: "center",
  },
  reportCard: {
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  reportRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: spacing.sm,
  },
  reportText: {
    ...typography.bodySmall,
    color: neumorphicColors.text.primary,
  },
  reportValue: {
    ...typography.bodySmall,
    color: neumorphicColors.text.secondary,
  },
  sectionTitle: {
    ...typography.body,
    color: neumorphicColors.text.primary,
    fontWeight: "600",
    marginBottom: spacing.sm,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: spacing.md,
  },
  chip: {
    backgroundColor: neumorphicColors.base.card,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
  },
  chipActive: {
    backgroundColor: neumorphicColors.primary[100],
  },
  chipText: {
    ...typography.bodySmall,
    color: neumorphicColors.text.secondary,
  },
  chipTextActive: {
    color: neumorphicColors.primary[700],
    fontWeight: "600",
  },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  addText: {
    ...typography.bodySmall,
    color: neumorphicColors.primary[700],
    fontWeight: "600",
  },
  formCard: {
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  formCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  formCardTitle: {
    ...typography.body,
    color: neumorphicColors.text.primary,
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.35)",
    justifyContent: "center",
    padding: spacing.md,
  },
  modalCard: {
    backgroundColor: neumorphicColors.base.background,
    borderRadius: borderRadius.lg,
    maxHeight: "90%",
    overflow: "hidden",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: neumorphicColors.base.border,
  },
  modalTitle: {
    ...typography.h4,
    color: neumorphicColors.text.primary,
  },
  modalContent: {
    padding: spacing.lg,
  },
  modalCallout: {
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  modalSubtitle: {
    ...typography.bodySmall,
    color: neumorphicColors.text.secondary,
  },
  modalFooter: {
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: neumorphicColors.base.border,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: spacing.md,
    marginBottom: spacing.xl,
  },
  modalButton: {
    flex: 1,
    marginRight: spacing.sm,
  },
  modalButtonLast: {
    marginRight: 0,
  },
});
