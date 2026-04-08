import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Alert,
  Modal,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { ArrowLeft, Shield, Plus, X } from "lucide-react-native";
import {
  NeumorphicScreen,
  NeumorphicCard,
  NeumorphicButton,
  NeumorphicIconButton,
  NeumorphicInput,
  NeumorphicBadge,
} from "../../src/components/neumorphic";
import {
  neumorphicColors,
  typography,
  spacing,
  borderRadius,
  getNeumorphicShadow,
} from "../../src/theme/neumorphic";
import adminService, {
  CropTrackerEntry,
  CropTrackerFarmer,
  CropTrackerStatus,
} from "../../src/services/adminService";
import { useAuth } from "../../src/contexts/AuthContext";

const { width } = Dimensions.get("window");
const kpiCardWidth = (width - spacing.xl * 3) / 2;

const UNITS = [
  "kg",
  "crates",
  "bags",
  "tonnes",
  "boxes",
  "bunches",
  "litres",
  "units",
] as const;

type Feedback = { type: "success" | "error"; msg: string };

type FiltersState = {
  category: string;
  farmer_id: string;
  status: "" | CropTrackerStatus;
};

type FormState = {
  farmer_id: string;
  crop_category: string;
  quantity: string;
  unit: string;
  harvest_date: string;
  notes: string;
  status: CropTrackerStatus;
};

type PaginationState = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

const emptyForm: FormState = {
  farmer_id: "",
  crop_category: "",
  quantity: "",
  unit: "",
  harvest_date: "",
  notes: "",
  status: "upcoming",
};

const STATUS_META: Array<{ value: CropTrackerStatus; label: string; badge: "info" | "warning" | "success" | "error" }> = [
  { value: "upcoming", label: "Upcoming", badge: "info" },
  { value: "harvesting", label: "Harvesting", badge: "warning" },
  { value: "harvested", label: "Harvested", badge: "success" },
  { value: "cancelled", label: "Cancelled", badge: "error" },
];

const statusLabel = (status: CropTrackerStatus): string => {
  return STATUS_META.find((s) => s.value === status)?.label ?? status;
};

const statusBadgeVariant = (
  status: CropTrackerStatus,
): "info" | "warning" | "success" | "error" => {
  return STATUS_META.find((s) => s.value === status)?.badge ?? "info";
};

function isHarvestingSoon(dateStr: string | null): boolean {
  if (!dateStr) return false;
  const days = Math.ceil(
    (new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24),
  );
  return days >= 0 && days <= 7;
}

function isOverdue(dateStr: string | null, status: CropTrackerStatus): boolean {
  if (!dateStr || status === "harvested" || status === "cancelled") return false;
  return new Date(dateStr) < new Date();
}

const formatDate = (dateStr: string | null): string => {
  if (!dateStr) return "Not set";
  try {
    return new Date(dateStr).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
};

const formatQuantity = (quantity: string | null, unit: string | null): string => {
  if (!quantity) return "—";
  const asNumber = Number.parseFloat(quantity);
  const formatted = Number.isFinite(asNumber)
    ? asNumber.toLocaleString("en-US")
    : quantity;
  return `${formatted} ${unit ?? ""}`.trim();
};

export default function AdminCropTrackerScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const canAccess = user?.role === "admin";

  const [entries, setEntries] = useState<CropTrackerEntry[]>([]);
  const [farmers, setFarmers] = useState<CropTrackerFarmer[]>([]);
  const [categories, setCategories] = useState<string[]>([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  const [filters, setFilters] = useState<FiltersState>({
    category: "",
    farmer_id: "",
    status: "",
  });

  const filtersRef = useRef(filters);
  useEffect(() => {
    filtersRef.current = filters;
  }, [filters]);

  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0,
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>({ ...emptyForm });
  const [farmerSearch, setFarmerSearch] = useState("");
  const [farmerFilterSearch, setFarmerFilterSearch] = useState("");
  const [farmerResults, setFarmerResults] = useState<CropTrackerFarmer[]>([]);
  const [selectedFarmer, setSelectedFarmer] = useState<CropTrackerFarmer | null>(
    null,
  );

  const modalFarmerSearchDebounceRef =
    useRef<ReturnType<typeof setTimeout> | null>(null);
  const filterFarmerSearchDebounceRef =
    useRef<ReturnType<typeof setTimeout> | null>(null);
  const categoryFilterDebounceRef =
    useRef<ReturnType<typeof setTimeout> | null>(null);

  const cancelCategoryFilterDebounce = useCallback(() => {
    if (categoryFilterDebounceRef.current) {
      clearTimeout(categoryFilterDebounceRef.current);
      categoryFilterDebounceRef.current = null;
    }
  }, []);

  const flash = useCallback((type: Feedback["type"], msg: string) => {
    setFeedback({ type, msg });
    setTimeout(() => setFeedback(null), 4000);
  }, []);

  useEffect(() => {
    return () => {
      cancelCategoryFilterDebounce();
    };
  }, [cancelCategoryFilterDebounce]);

  const loadEntries = useCallback(
    async (pageOverride?: number, filtersOverride?: FiltersState) => {
      try {
        const page = pageOverride ?? pagination.page;
        const effectiveFilters = filtersOverride ?? filters;
        const params: Record<string, any> = { page, limit: pagination.limit };
        if (effectiveFilters.category.trim()) {
          params.category = effectiveFilters.category.trim();
        }
        if (effectiveFilters.farmer_id) {
          params.farmer_id = effectiveFilters.farmer_id;
        }
        if (effectiveFilters.status) {
          params.status = effectiveFilters.status;
        }

        const res = await adminService.getCropTrackerEntries(params);
        if (res.success) {
          setEntries(res.data.entries || []);
          setPagination(res.data.pagination);
        }
      } catch (error: any) {
        console.error("Failed to load crop tracker entries:", error);
        flash("error", error?.message || "Failed to load entries.");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [pagination.page, pagination.limit, filters, flash],
  );

  const loadCategories = useCallback(async () => {
    try {
      const res = await adminService.getCropTrackerCategories();
      if (res.success) setCategories(res.data.categories || []);
    } catch (error) {
      console.error("Failed to load crop categories:", error);
    }
  }, []);

  const loadFarmers = useCallback(async (search?: string) => {
    try {
      const res = await adminService.getCropTrackerFarmers(
        search?.trim() ? { search: search.trim() } : {},
      );
      if (res.success) setFarmers(res.data.farmers || []);
    } catch (error) {
      console.error("Failed to load farmers:", error);
    }
  }, []);

  const searchFarmers = useCallback(async (search: string) => {
    try {
      const res = await adminService.getCropTrackerFarmers({ search });
      if (res.success) setFarmerResults(res.data.farmers || []);
    } catch (error) {
      console.error("Failed to search farmers:", error);
    }
  }, []);

  useEffect(() => {
    if (!canAccess) return;
    setLoading(true);
    loadEntries(1);
    loadCategories();
    loadFarmers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canAccess]);

  useEffect(() => {
    if (!modalOpen || editingId) return;

    if (modalFarmerSearchDebounceRef.current) {
      clearTimeout(modalFarmerSearchDebounceRef.current);
    }

    const query = farmerSearch.trim();

    if (!query) {
      setFarmerResults(farmers);
      return;
    }

    modalFarmerSearchDebounceRef.current = setTimeout(() => {
      searchFarmers(query);
    }, 250);

    return () => {
      if (modalFarmerSearchDebounceRef.current) {
        clearTimeout(modalFarmerSearchDebounceRef.current);
        modalFarmerSearchDebounceRef.current = null;
      }
    };
  }, [farmerSearch, modalOpen, editingId, farmers, searchFarmers]);

  useEffect(() => {
    if (!canAccess) return;
    if (selectedFarmer) return;

    if (filterFarmerSearchDebounceRef.current) {
      clearTimeout(filterFarmerSearchDebounceRef.current);
    }

    const query = farmerFilterSearch.trim();
    if (!query) {
      setFarmerResults([]);
      return;
    }

    filterFarmerSearchDebounceRef.current = setTimeout(() => {
      searchFarmers(query);
    }, 250);

    return () => {
      if (filterFarmerSearchDebounceRef.current) {
        clearTimeout(filterFarmerSearchDebounceRef.current);
        filterFarmerSearchDebounceRef.current = null;
      }
    };
  }, [canAccess, farmerFilterSearch, selectedFarmer, searchFarmers]);

  useEffect(() => {
    if (!filters.farmer_id) {
      setSelectedFarmer(null);
    }
  }, [filters.farmer_id]);

  const onRefresh = useCallback(() => {
    cancelCategoryFilterDebounce();
    setRefreshing(true);
    loadEntries(pagination.page);
    loadCategories();
  }, [cancelCategoryFilterDebounce, loadEntries, loadCategories, pagination.page]);

  const applyFilters = useCallback(
    (nextFilters: FiltersState) => {
      cancelCategoryFilterDebounce();
      setFilters(nextFilters);
      setPagination((p) => ({ ...p, page: 1 }));
      setLoading(true);
      loadEntries(1, nextFilters);
    },
    [cancelCategoryFilterDebounce, loadEntries],
  );

  const onCategoryFilterChange = useCallback(
    (text: string) => {
      setFilters((prev) => ({ ...prev, category: text }));

      if (categoryFilterDebounceRef.current) {
        clearTimeout(categoryFilterDebounceRef.current);
      }

      categoryFilterDebounceRef.current = setTimeout(() => {
        categoryFilterDebounceRef.current = null;
        const nextFilters: FiltersState = {
          ...filtersRef.current,
          category: text,
        };
        setPagination((p) => ({ ...p, page: 1 }));
        setLoading(true);
        loadEntries(1, nextFilters);
      }, 350);
    },
    [loadEntries],
  );

  const openCreate = () => {
    setEditingId(null);
    setForm({ ...emptyForm });
    setFarmerSearch("");
    setModalOpen(true);
  };

  const openEdit = (entry: CropTrackerEntry) => {
    setEditingId(entry.id);
    setForm({
      farmer_id: entry.farmer_id,
      crop_category: entry.crop_category,
      quantity: entry.quantity ?? "",
      unit: entry.unit ?? "",
      harvest_date: entry.harvest_date ? entry.harvest_date.split("T")[0] : "",
      notes: entry.notes ?? "",
      status: entry.status,
    });
    setFarmerSearch("");
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingId(null);
    setForm({ ...emptyForm });
    setFarmerSearch("");
  };

  const handleSave = async () => {
    if (!form.farmer_id || !form.crop_category.trim()) {
      flash("error", "Farmer and crop category are required.");
      return;
    }

    const basePayload = {
      crop_category: form.crop_category.trim(),
      quantity: form.quantity ? Number(form.quantity) : null,
      unit: form.unit ? form.unit : null,
      harvest_date: form.harvest_date ? form.harvest_date : null,
      notes: form.notes.trim() ? form.notes.trim() : null,
      status: form.status,
    };

    try {
      setSaving(true);

      if (editingId) {
        await adminService.updateCropTrackerEntry(editingId, basePayload);
        flash("success", "Entry updated successfully.");
      } else {
        await adminService.createCropTrackerEntry({
          farmer_id: form.farmer_id,
          ...basePayload,
        });
        flash("success", "Entry added successfully.");
      }

      closeModal();
      setLoading(true);
      cancelCategoryFilterDebounce();
      await loadEntries(pagination.page);
      await loadCategories();
    } catch (error: any) {
      console.error("Failed to save crop entry:", error);
      flash("error", error?.message || "Failed to save entry.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert(
      "Delete Entry",
      "Are you sure you want to delete this crop entry?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await adminService.deleteCropTrackerEntry(id);
              flash("success", "Entry deleted.");
              setLoading(true);
              cancelCategoryFilterDebounce();
              await loadEntries(pagination.page);
              await loadCategories();
            } catch (error: any) {
              console.error("Failed to delete entry:", error);
              flash("error", error?.message || "Failed to delete entry.");
            }
          },
        },
      ],
    );
  };

  const handleQuickStatus = (id: string, current: CropTrackerStatus) => {
    Alert.alert("Update Status", "Choose a new status", [
      ...STATUS_META.map((s) => ({
        text: s.label,
        onPress: async () => {
          if (s.value === current) return;
          try {
            await adminService.updateCropTrackerEntry(id, { status: s.value });
            setLoading(true);
            cancelCategoryFilterDebounce();
            await loadEntries(pagination.page);
          } catch (error) {
            flash("error", "Failed to update status.");
          }
        },
      })),
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const kpis = useMemo(() => {
    const upcoming = entries.filter((e) => e.status === "upcoming").length;
    const harvesting = entries.filter((e) => e.status === "harvesting").length;
    const soonCount = entries.filter(
      (e) =>
        isHarvestingSoon(e.harvest_date) &&
        e.status !== "harvested" &&
        e.status !== "cancelled",
    ).length;
    const categoryCount = new Set(entries.map((e) => e.crop_category)).size;

    return {
      total: pagination.total,
      active: upcoming + harvesting,
      soonCount,
      categoryCount,
    };
  }, [entries, pagination.total]);

  if (!canAccess) {
    return (
      <NeumorphicScreen variant="dashboard">
        <View style={styles.accessDenied}>
          <Shield size={64} color={neumorphicColors.semantic.error} />
          <Text style={styles.accessDeniedTitle}>Access Denied</Text>
          <Text style={styles.accessDeniedText}>
            You don't have permission to view this page.
          </Text>
          <NeumorphicButton
            title="Go Back"
            onPress={() => router.back()}
            variant="primary"
          />
        </View>
      </NeumorphicScreen>
    );
  }

  return (
    <NeumorphicScreen variant="dashboard">
      {/* Header */}
      <View style={styles.header}>
        <NeumorphicIconButton
          icon={<ArrowLeft size={24} color={neumorphicColors.text.primary} />}
          onPress={() => router.back()}
          variant="default"
          size="medium"
        />
        <View style={styles.headerText}>
          <Text style={styles.title}>Crop Tracker</Text>
          <Text style={styles.subtitle}>Track farmer harvests and schedules</Text>
        </View>
        <NeumorphicIconButton
          icon={<Plus size={22} color={neumorphicColors.primary[600]} />}
          onPress={openCreate}
          variant="default"
          size="medium"
        />
      </View>

      {feedback && (
        <NeumorphicCard
          variant="bordered"
          style={[
            styles.feedbackCard,
            feedback.type === "success"
              ? styles.feedbackSuccess
              : styles.feedbackError,
          ]}
          animated={false}
        >
          <Text
            style={[
              styles.feedbackText,
              feedback.type === "success"
                ? styles.feedbackTextSuccess
                : styles.feedbackTextError,
            ]}
          >
            {feedback.msg}
          </Text>
        </NeumorphicCard>
      )}

      {loading && entries.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={neumorphicColors.primary[600]} />
          <Text style={styles.loadingText}>Loading crop tracker...</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[neumorphicColors.primary[600]]}
            />
          }
        >
          {/* KPIs */}
          <View style={styles.kpiGrid}>
            <NeumorphicCard variant="stat" style={[styles.kpiCard, { width: kpiCardWidth }]}>
              <Text style={styles.kpiValue}>{kpis.total}</Text>
              <Text style={styles.kpiLabel}>Total Entries</Text>
            </NeumorphicCard>

            <NeumorphicCard variant="stat" style={[styles.kpiCard, { width: kpiCardWidth }]}>
              <Text style={styles.kpiValue}>{kpis.active}</Text>
              <Text style={styles.kpiLabel}>Active Crops</Text>
            </NeumorphicCard>

            <NeumorphicCard
              variant="stat"
              style={[
                styles.kpiCard,
                { width: kpiCardWidth },
                kpis.soonCount > 0 ? styles.kpiSoonBg : styles.kpiNeutralBg,
              ]}
            >
              <Text
                style={[
                  styles.kpiValue,
                  kpis.soonCount > 0
                    ? styles.kpiSoonText
                    : styles.kpiNeutralText,
                ]}
              >
                {kpis.soonCount}
              </Text>
              <Text style={styles.kpiLabel}>Harvesting ≤7 days</Text>
            </NeumorphicCard>

            <NeumorphicCard variant="stat" style={[styles.kpiCard, { width: kpiCardWidth }]}>
              <Text style={styles.kpiValue}>{kpis.categoryCount}</Text>
              <Text style={styles.kpiLabel}>Crop Categories</Text>
            </NeumorphicCard>
          </View>

          {/* Filters */}
          <Text style={styles.sectionTitle}>Filters</Text>
          <NeumorphicCard variant="standard" style={styles.filtersCard}>
            <NeumorphicInput
              label="Crop Category"
              placeholder="All categories"
              value={filters.category}
              onChangeText={onCategoryFilterChange}
            />

            <NeumorphicInput
              label="Farmer"
              placeholder="Search farmer name..."
              value={selectedFarmer ? selectedFarmer.full_name : farmerFilterSearch}
              onFocus={() => {
                // Clear selected farmer and allow searching
                if (filters.farmer_id) {
                  setFarmerFilterSearch("");
                  setFarmerResults([]);
                  setSelectedFarmer(null);
                  applyFilters({ ...filters, farmer_id: "" });
                }
              }}
              onChangeText={(text) => {
                setFarmerFilterSearch(text);
                setFarmerResults([]);
              }}
              helperText={
                selectedFarmer
                  ? "Selected farmer (tap to clear and search)"
                  : "Type to search and select"
              }
            />

            {!selectedFarmer && farmerFilterSearch.trim().length > 0 && (
              <View style={styles.suggestions}>
                {farmerResults.slice(0, 6).map((f) => (
                  <TouchableOpacity
                    key={f.id}
                    onPress={() => {
                      setSelectedFarmer(f);
                      setFarmerFilterSearch("");
                      setFarmerResults([]);
                      applyFilters({ ...filters, farmer_id: f.id });
                    }}
                    style={styles.suggestionItem}
                  >
                    <Text style={styles.suggestionTitle}>{f.full_name}</Text>
                    <Text style={styles.suggestionSubtitle}>{f.email}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <Text style={styles.filterLabel}>Status</Text>
            <View style={styles.statusChips}>
              <TouchableOpacity
                onPress={() => applyFilters({ ...filters, status: "" })}
                style={styles.statusChip}
              >
                <NeumorphicBadge
                  label="All"
                  variant={filters.status === "" ? "primary" : "neutral"}
                  size="small"
                />
              </TouchableOpacity>
              {STATUS_META.map((s) => (
                <TouchableOpacity
                  key={s.value}
                  onPress={() => applyFilters({ ...filters, status: s.value })}
                  style={styles.statusChip}
                >
                  <NeumorphicBadge
                    label={s.label}
                    variant={filters.status === s.value ? "primary" : s.badge}
                    size="small"
                  />
                </TouchableOpacity>
              ))}
            </View>

            <NeumorphicButton
              title="Clear Filters"
              onPress={() => {
                setSelectedFarmer(null);
                setFarmerFilterSearch("");
                setFarmerResults([]);
                applyFilters({ category: "", farmer_id: "", status: "" });
              }}
              variant="secondary"
              size="small"
              fullWidth
            />
          </NeumorphicCard>

          {/* Entries */}
          <Text style={styles.sectionTitle}>Entries</Text>

          {entries.length === 0 ? (
            <NeumorphicCard variant="standard" style={styles.emptyCard}>
              <Text style={styles.emptyEmoji}>🌱</Text>
              <Text style={styles.emptyTitle}>No crop entries yet</Text>
              <Text style={styles.emptyText}>Tap "+" to start tracking</Text>
            </NeumorphicCard>
          ) : (
            <View style={styles.listContainer}>
              {entries.map((entry) => {
                const soon = isHarvestingSoon(entry.harvest_date);
                const overdue = isOverdue(entry.harvest_date, entry.status);

                return (
                  <NeumorphicCard
                    key={entry.id}
                    variant="standard"
                    style={[
                      styles.entryCard,
                      overdue
                        ? styles.entryOverdue
                        : soon
                          ? styles.entrySoon
                          : null,
                    ]}
                  >
                    <View style={styles.entryHeader}>
                      <View style={styles.entryHeaderLeft}>
                        <Text style={styles.entryFarmer}>{entry.farmer_name}</Text>
                        <Text style={styles.entryEmail}>{entry.farmer_email}</Text>
                      </View>

                      <View style={styles.entryBadges}>
                        <NeumorphicBadge
                          label={entry.crop_category}
                          variant="primary"
                          size="small"
                        />
                        <TouchableOpacity
                          onPress={() => handleQuickStatus(entry.id, entry.status)}
                          style={styles.statusBadgePressable}
                        >
                          <NeumorphicBadge
                            label={statusLabel(entry.status)}
                            variant={statusBadgeVariant(entry.status)}
                            size="small"
                          />
                        </TouchableOpacity>
                      </View>
                    </View>

                    <View style={styles.entryRow}>
                      <Text style={styles.entryKey}>Quantity</Text>
                      <Text style={styles.entryValue}>
                        {formatQuantity(entry.quantity, entry.unit)}
                      </Text>
                    </View>

                    <View style={styles.entryRow}>
                      <Text style={styles.entryKey}>Harvest Date</Text>
                      <View style={styles.harvestDateRight}>
                        <Text
                          style={[
                            styles.entryValue,
                            overdue
                              ? styles.dateOverdue
                              : soon
                                ? styles.dateSoon
                                : null,
                          ]}
                        >
                          {formatDate(entry.harvest_date)}
                        </Text>
                        {overdue && <Text style={styles.dateBadgeOverdue}>Overdue</Text>}
                        {soon && !overdue && (
                          <Text style={styles.dateBadgeSoon}>≤7 days</Text>
                        )}
                      </View>
                    </View>

                    <View style={styles.entryRow}>
                      <Text style={styles.entryKey}>Notes</Text>
                      <Text style={styles.entryValue} numberOfLines={2}>
                        {entry.notes?.trim() ? entry.notes.trim() : "—"}
                      </Text>
                    </View>

                    <View style={styles.entryActions}>
                      <NeumorphicButton
                        title="Edit"
                        onPress={() => openEdit(entry)}
                        variant="secondary"
                        size="small"
                        style={styles.entryActionButton}
                      />
                      <NeumorphicButton
                        title="Delete"
                        onPress={() => handleDelete(entry.id)}
                        variant="danger"
                        size="small"
                        style={styles.entryActionButton}
                      />
                    </View>
                  </NeumorphicCard>
                );
              })}
            </View>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <NeumorphicCard variant="bordered" style={styles.paginationCard}>
              <Text style={styles.paginationText}>
                Page {pagination.page} of {pagination.totalPages}
              </Text>
              <View style={styles.paginationButtons}>
                <NeumorphicButton
                  title="Previous"
                  onPress={() => {
                    const next = Math.max(1, pagination.page - 1);
                    cancelCategoryFilterDebounce();
                    setPagination((p) => ({ ...p, page: next }));
                    setLoading(true);
                    loadEntries(next);
                  }}
                  variant="secondary"
                  size="small"
                  disabled={pagination.page === 1}
                  style={styles.paginationButton}
                />
                <NeumorphicButton
                  title="Next"
                  onPress={() => {
                    const next = Math.min(
                      pagination.totalPages,
                      pagination.page + 1,
                    );
                    cancelCategoryFilterDebounce();
                    setPagination((p) => ({ ...p, page: next }));
                    setLoading(true);
                    loadEntries(next);
                  }}
                  variant="secondary"
                  size="small"
                  disabled={pagination.page === pagination.totalPages}
                  style={styles.paginationButton}
                />
              </View>
            </NeumorphicCard>
          )}

          <View style={styles.bottomPadding} />
        </ScrollView>
      )}

      {/* Add/Edit Modal */}
      <Modal
        visible={modalOpen}
        transparent
        animationType="slide"
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalWrapper}>
            <NeumorphicCard
              variant="elevated"
              style={styles.modalCard}
              shadowLevel={5}
              animated={false}
            >
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {editingId ? "Edit Crop Entry" : "Add Crop Entry"}
                </Text>
                <NeumorphicIconButton
                  icon={<X size={20} color={neumorphicColors.text.primary} />}
                  onPress={closeModal}
                  variant="default"
                  size="small"
                />
              </View>

              <ScrollView
                style={styles.modalBody}
                showsVerticalScrollIndicator={false}
              >
                {/* Farmer */}
                {editingId ? (
                  <NeumorphicCard variant="bordered" style={styles.readonlyFarmer}>
                    <Text style={styles.readonlyFarmerText}>
                      {entries.find((e) => e.id === editingId)?.farmer_name ?? "—"}
                      <Text style={styles.readonlyFarmerHint}> (cannot change)</Text>
                    </Text>
                  </NeumorphicCard>
                ) : (
                  <>
                    <NeumorphicInput
                      label="Farmer *"
                      placeholder="Search farmer name..."
                      value={farmerSearch}
                      onChangeText={(text) => {
                        setFarmerSearch(text);
                        setForm((prev) => ({ ...prev, farmer_id: "" }));
                      }}
                      helperText="Select a farmer from suggestions"
                    />

                    {(farmerSearch.trim() ? farmerResults : farmers).length > 0 && (
                      <View style={styles.suggestions}>
                        {(farmerSearch.trim() ? farmerResults : farmers)
                          .slice(0, 6)
                          .map((f) => (
                          <TouchableOpacity
                            key={f.id}
                            onPress={() => {
                              setForm((prev) => ({ ...prev, farmer_id: f.id }));
                              setFarmerSearch(`${f.full_name}`);
                            }}
                            style={styles.suggestionItem}
                          >
                            <Text style={styles.suggestionTitle}>{f.full_name}</Text>
                            <Text style={styles.suggestionSubtitle}>{f.email}</Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    )}

                    {form.farmer_id ? (
                      <Text style={styles.selectedFarmerText}>
                        Selected farmer id: {form.farmer_id}
                      </Text>
                    ) : null}
                  </>
                )}

                {/* Crop Category */}
                <NeumorphicInput
                  label="Crop Category *"
                  placeholder="e.g. Tomatoes, Bananas, Maize..."
                  value={form.crop_category}
                  onChangeText={(text) =>
                    setForm((prev) => ({ ...prev, crop_category: text }))
                  }
                  helperText="Use an existing category or type a new one"
                />

                {form.crop_category.trim().length > 0 && categories.length > 0 && (
                  <View style={styles.categorySuggestions}>
                    {categories
                      .filter((c) =>
                        c.toLowerCase().includes(form.crop_category.toLowerCase()),
                      )
                      .slice(0, 8)
                      .map((c) => (
                        <TouchableOpacity
                          key={c}
                          onPress={() => setForm((p) => ({ ...p, crop_category: c }))}
                          style={styles.categoryChip}
                        >
                          <NeumorphicBadge label={c} variant="primary" size="small" />
                        </TouchableOpacity>
                      ))}
                  </View>
                )}

                {/* Quantity */}
                <NeumorphicInput
                  label="Quantity"
                  placeholder="e.g. 50"
                  keyboardType="decimal-pad"
                  value={form.quantity}
                  onChangeText={(text) =>
                    setForm((prev) => ({ ...prev, quantity: text }))
                  }
                />

                {/* Unit */}
                <Text style={styles.filterLabel}>Unit</Text>
                <View style={styles.unitChips}>
                  <TouchableOpacity
                    onPress={() => setForm((p) => ({ ...p, unit: "" }))}
                    style={styles.unitChip}
                  >
                    <NeumorphicBadge
                      label="None"
                      variant={form.unit ? "neutral" : "primary"}
                      size="small"
                    />
                  </TouchableOpacity>
                  {UNITS.map((u) => (
                    <TouchableOpacity
                      key={u}
                      onPress={() => setForm((p) => ({ ...p, unit: u }))}
                      style={styles.unitChip}
                    >
                      <NeumorphicBadge
                        label={u}
                        variant={form.unit === u ? "primary" : "neutral"}
                        size="small"
                      />
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Harvest Date */}
                <NeumorphicInput
                  label="Expected Harvest Date"
                  placeholder="YYYY-MM-DD"
                  value={form.harvest_date}
                  onChangeText={(text) =>
                    setForm((prev) => ({ ...prev, harvest_date: text }))
                  }
                  helperText="Admin and farmer will be notified on this date"
                />

                {/* Status */}
                <Text style={styles.filterLabel}>Status</Text>
                <View style={styles.statusChips}>
                  {STATUS_META.map((s) => (
                    <TouchableOpacity
                      key={s.value}
                      onPress={() => setForm((p) => ({ ...p, status: s.value }))}
                      style={styles.statusChip}
                    >
                      <NeumorphicBadge
                        label={s.label}
                        variant={form.status === s.value ? "primary" : s.badge}
                        size="small"
                      />
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Notes */}
                <NeumorphicInput
                  label="Notes"
                  placeholder="Any additional notes, observations, or reminders..."
                  value={form.notes}
                  onChangeText={(text) => setForm((p) => ({ ...p, notes: text }))}
                  variant="textarea"
                />

                <View style={styles.modalButtons}>
                  <NeumorphicButton
                    title="Cancel"
                    onPress={closeModal}
                    variant="secondary"
                    fullWidth
                    style={styles.modalButton}
                  />
                  <NeumorphicButton
                    title={editingId ? "Save Changes" : "Add Entry"}
                    onPress={handleSave}
                    variant="primary"
                    loading={saving}
                    disabled={saving}
                    fullWidth
                    style={styles.modalButton}
                  />
                </View>
              </ScrollView>
            </NeumorphicCard>
          </View>
        </View>
      </Modal>
    </NeumorphicScreen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
    gap: spacing.md,
  },
  headerText: {
    flex: 1,
  },
  title: {
    ...typography.h1,
    color: neumorphicColors.text.primary,
    letterSpacing: -0.5,
  },
  subtitle: {
    ...typography.bodySmall,
    color: neumorphicColors.text.secondary,
    marginTop: spacing.xs,
  },
  accessDenied: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.xl,
  },
  accessDeniedTitle: {
    ...typography.h2,
    color: neumorphicColors.text.primary,
    marginTop: spacing.lg,
  },
  accessDeniedText: {
    ...typography.body,
    color: neumorphicColors.text.secondary,
    textAlign: "center",
    marginVertical: spacing.lg,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: spacing.md,
    ...typography.body,
    color: neumorphicColors.text.secondary,
  },
  scrollView: {
    flex: 1,
  },
  sectionTitle: {
    ...typography.h5,
    color: neumorphicColors.text.primary,
    paddingHorizontal: spacing.xl,
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  feedbackCard: {
    marginHorizontal: spacing.xl,
    marginBottom: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  feedbackSuccess: {
    backgroundColor: neumorphicColors.badge.success.bg,
    borderColor: neumorphicColors.badge.success.text + "40",
  },
  feedbackError: {
    backgroundColor: neumorphicColors.badge.error.bg,
    borderColor: neumorphicColors.badge.error.text + "40",
  },
  feedbackText: {
    ...typography.bodySmall,
    fontWeight: "600",
  },
  feedbackTextSuccess: {
    color: neumorphicColors.badge.success.text,
  },
  feedbackTextError: {
    color: neumorphicColors.badge.error.text,
  },
  kpiGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: spacing.xl,
    gap: spacing.md,
  },
  kpiCard: {
    alignItems: "center",
  },
  kpiValue: {
    ...typography.h3,
    color: neumorphicColors.text.primary,
    marginBottom: spacing.xs,
  },
  kpiLabel: {
    ...typography.bodySmall,
    color: neumorphicColors.text.secondary,
    textAlign: "center",
  },
  kpiSoonBg: {
    backgroundColor: neumorphicColors.badge.warning.bg,
  },
  kpiNeutralBg: {
    backgroundColor: neumorphicColors.base.card,
  },
  kpiSoonText: {
    color: neumorphicColors.badge.warning.text,
  },
  kpiNeutralText: {
    color: neumorphicColors.text.tertiary,
  },
  filtersCard: {
    marginHorizontal: spacing.xl,
  },
  filterLabel: {
    ...typography.bodySmall,
    fontWeight: "500",
    color: neumorphicColors.text.secondary,
    marginBottom: spacing.sm,
  },
  statusChips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  statusChip: {
    alignSelf: "flex-start",
  },
  suggestions: {
    backgroundColor: neumorphicColors.base.card,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: neumorphicColors.base.pressed,
  },
  suggestionItem: {
    paddingVertical: spacing.sm,
  },
  suggestionTitle: {
    ...typography.body,
    fontWeight: "600",
    color: neumorphicColors.text.primary,
  },
  suggestionSubtitle: {
    ...typography.caption,
    color: neumorphicColors.text.secondary,
    marginTop: spacing.xs,
  },
  listContainer: {
    paddingHorizontal: spacing.xl,
    gap: spacing.md,
  },
  entryCard: {
    padding: spacing.lg,
  },
  entrySoon: {
    backgroundColor: neumorphicColors.badge.warning.bg,
  },
  entryOverdue: {
    backgroundColor: neumorphicColors.badge.error.bg,
  },
  entryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  entryHeaderLeft: {
    flex: 1,
  },
  entryBadges: {
    alignItems: "flex-end",
    gap: spacing.xs,
  },
  entryFarmer: {
    ...typography.h5,
    color: neumorphicColors.text.primary,
  },
  entryEmail: {
    ...typography.caption,
    color: neumorphicColors.text.secondary,
    marginTop: spacing.xs,
  },
  statusBadgePressable: {
    alignSelf: "flex-end",
  },
  entryRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  entryKey: {
    ...typography.bodySmall,
    color: neumorphicColors.text.secondary,
    width: 100,
  },
  entryValue: {
    ...typography.bodySmall,
    color: neumorphicColors.text.primary,
    flex: 1,
    textAlign: "right",
  },
  harvestDateRight: {
    alignItems: "flex-end",
    flex: 1,
  },
  dateSoon: {
    color: neumorphicColors.badge.warning.text,
    fontWeight: "700",
  },
  dateOverdue: {
    color: neumorphicColors.badge.error.text,
    fontWeight: "700",
  },
  dateBadgeSoon: {
    ...typography.caption,
    color: neumorphicColors.badge.warning.text,
    marginTop: spacing.xs,
  },
  dateBadgeOverdue: {
    ...typography.caption,
    color: neumorphicColors.badge.error.text,
    marginTop: spacing.xs,
  },
  entryActions: {
    flexDirection: "row",
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  entryActionButton: {
    flex: 1,
  },
  emptyCard: {
    marginHorizontal: spacing.xl,
    alignItems: "center",
    paddingVertical: spacing.xl,
  },
  emptyEmoji: {
    fontSize: 44,
    marginBottom: spacing.md,
  },
  emptyTitle: {
    ...typography.h4,
    color: neumorphicColors.text.primary,
  },
  emptyText: {
    ...typography.bodySmall,
    color: neumorphicColors.text.secondary,
    marginTop: spacing.xs,
  },
  paginationCard: {
    marginHorizontal: spacing.xl,
    marginTop: spacing.lg,
    padding: spacing.lg,
    alignItems: "center",
  },
  paginationText: {
    ...typography.bodySmall,
    color: neumorphicColors.text.secondary,
    marginBottom: spacing.md,
  },
  paginationButtons: {
    flexDirection: "row",
    gap: spacing.md,
  },
  paginationButton: {
    flex: 1,
  },
  bottomPadding: {
    height: spacing["2xl"],
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.lg,
  },
  modalWrapper: {
    width: "100%",
  },
  modalCard: {
    width: "100%",
    maxHeight: "90%",
    padding: spacing.lg,
    ...getNeumorphicShadow(5),
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.md,
  },
  modalTitle: {
    ...typography.h3,
    color: neumorphicColors.text.primary,
  },
  modalBody: {
    flexGrow: 0,
  },
  modalButtons: {
    gap: spacing.sm,
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  modalButton: {
    marginTop: spacing.sm,
  },
  readonlyFarmer: {
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  readonlyFarmerText: {
    ...typography.body,
    color: neumorphicColors.text.primary,
  },
  readonlyFarmerHint: {
    color: neumorphicColors.text.tertiary,
  },
  selectedFarmerText: {
    ...typography.caption,
    color: neumorphicColors.text.secondary,
    marginBottom: spacing.md,
  },
  categorySuggestions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  categoryChip: {
    alignSelf: "flex-start",
  },
  unitChips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  unitChip: {
    alignSelf: "flex-start",
  },
});
