import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import {
  ArrowLeft,
  Shield,
  AlertTriangle,
  Ban,
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  Search,
  User,
  MapPin,
  Calendar,
  Smartphone,
  Globe,
  ChevronRight,
} from "lucide-react-native";
import AnimatedCard from "../../src/components/AnimatedCard";
import AnimatedButton from "../../src/components/AnimatedButton";
import ModernInput from "../../src/components/ModernInput";
import { theme } from "../../src/theme/tokens";
import adminService, {
  SecurityIncident,
} from "../../src/services/adminService";

type SeverityLevel = "all" | "low" | "medium" | "high" | "critical";
type IncidentStatus =
  | "all"
  | "open"
  | "investigating"
  | "resolved"
  | "dismissed";

export default function AdminSecurityScreen() {
  const router = useRouter();
  const [incidents, setIncidents] = useState<SecurityIncident[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [severityFilter, setSeverityFilter] = useState<SeverityLevel>("all");
  const [statusFilter, setStatusFilter] = useState<IncidentStatus>("all");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    open: 0,
    resolved: 0,
    critical: 0,
  });

  const severityTabs: { key: SeverityLevel; label: string }[] = [
    { key: "all", label: "All" },
    { key: "critical", label: "Critical" },
    { key: "high", label: "High" },
    { key: "medium", label: "Medium" },
    { key: "low", label: "Low" },
  ];

  const fetchIncidents = useCallback(
    async (refresh = false) => {
      try {
        if (refresh) {
          setRefreshing(true);
          setPage(1);
        }

        const params: any = {
          page: refresh ? 1 : page,
          limit: 20,
        };

        if (severityFilter !== "all") {
          params.severity = severityFilter;
        }

        if (statusFilter !== "all") {
          params.status = statusFilter;
        }

        if (searchQuery.trim()) {
          params.search = searchQuery.trim();
        }

        const response = await adminService.getSecurityIncidents(params);

        if (response.success) {
          const newIncidents = response.data.incidents || [];
          if (refresh || page === 1) {
            setIncidents(newIncidents);
          } else {
            setIncidents((prev) => [...prev, ...newIncidents]);
          }
          setHasMore(newIncidents.length === 20);
          setStats(response.data.stats || stats);
        }
      } catch (error) {
        console.error("Failed to fetch security incidents:", error);
        Alert.alert("Error", "Failed to load security incidents");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [page, severityFilter, statusFilter, searchQuery]
  );

  useEffect(() => {
    setLoading(true);
    setPage(1);
    fetchIncidents(true);
  }, [severityFilter, statusFilter, searchQuery]);

  const handleRefresh = useCallback(() => {
    fetchIncidents(true);
  }, [fetchIncidents]);

  const getSeverityIcon = (severity: string) => {
    switch (severity.toLowerCase()) {
      case "critical":
        return <Ban size={16} color={theme.colors.error} />;
      case "high":
        return <AlertTriangle size={16} color={theme.colors.warning} />;
      case "medium":
        return <Eye size={16} color={theme.colors.info} />;
      case "low":
        return <Shield size={16} color={theme.colors.success} />;
      default:
        return <Shield size={16} color={theme.colors.text.tertiary} />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case "critical":
        return theme.colors.error;
      case "high":
        return theme.colors.warning;
      case "medium":
        return theme.colors.info;
      case "low":
        return theme.colors.success;
      default:
        return theme.colors.text.tertiary;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "open":
        return <AlertTriangle size={14} color={theme.colors.error} />;
      case "investigating":
        return <Eye size={14} color={theme.colors.warning} />;
      case "resolved":
        return <CheckCircle size={14} color={theme.colors.success} />;
      case "dismissed":
        return <XCircle size={14} color={theme.colors.text.tertiary} />;
      default:
        return <Clock size={14} color={theme.colors.text.tertiary} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "open":
        return theme.colors.error;
      case "investigating":
        return theme.colors.warning;
      case "resolved":
        return theme.colors.success;
      case "dismissed":
        return theme.colors.text.tertiary;
      default:
        return theme.colors.text.tertiary;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-NG", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const renderStatCard = (label: string, value: number, color: string) => (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );

  const renderIncident = (incident: SecurityIncident, index: number) => (
    <AnimatedCard
      key={incident.id}
      style={styles.incidentCard}
      delay={index * 50}
    >
      <View style={styles.incidentHeader}>
        <View style={styles.severityContainer}>
          <View
            style={[
              styles.severityIcon,
              { backgroundColor: `${getSeverityColor(incident.severity)}15` },
            ]}
          >
            {getSeverityIcon(incident.severity)}
          </View>
          <View style={styles.incidentInfo}>
            <Text style={styles.incidentType}>{incident.type}</Text>
            <Text
              style={[
                styles.severityText,
                { color: getSeverityColor(incident.severity) },
              ]}
            >
              {incident.severity.toUpperCase()}
            </Text>
          </View>
        </View>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: `${getStatusColor(incident.status)}15` },
          ]}
        >
          {getStatusIcon(incident.status)}
          <Text
            style={[
              styles.statusText,
              { color: getStatusColor(incident.status) },
            ]}
          >
            {incident.status}
          </Text>
        </View>
      </View>

      <Text style={styles.description} numberOfLines={2}>
        {incident.description}
      </Text>

      <View style={styles.incidentDetails}>
        {incident.userId && (
          <View style={styles.detailRow}>
            <User size={14} color={theme.colors.text.tertiary} />
            <Text style={styles.detailText}>User: {incident.userId}</Text>
          </View>
        )}

        {incident.ipAddress && (
          <View style={styles.detailRow}>
            <Globe size={14} color={theme.colors.text.tertiary} />
            <Text style={styles.detailText}>{incident.ipAddress}</Text>
          </View>
        )}

        {incident.userAgent && (
          <View style={styles.detailRow}>
            <Smartphone size={14} color={theme.colors.text.tertiary} />
            <Text style={styles.detailText} numberOfLines={1}>
              {incident.userAgent}
            </Text>
          </View>
        )}

        {incident.location && (
          <View style={styles.detailRow}>
            <MapPin size={14} color={theme.colors.text.tertiary} />
            <Text style={styles.detailText}>{incident.location}</Text>
          </View>
        )}
      </View>

      <View style={styles.incidentFooter}>
        <View style={styles.detailRow}>
          <Calendar size={14} color={theme.colors.text.tertiary} />
          <Text style={styles.dateText}>{formatDate(incident.createdAt)}</Text>
        </View>
        <ChevronRight size={20} color={theme.colors.text.tertiary} />
      </View>
    </AnimatedCard>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <ArrowLeft size={24} color={theme.colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>Security</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Stats Overview */}
      <View style={styles.statsContainer}>
        {renderStatCard("Total", stats.total, theme.colors.primary[600])}
        {renderStatCard("Open", stats.open, theme.colors.error)}
        {renderStatCard("Resolved", stats.resolved, theme.colors.success)}
        {renderStatCard("Critical", stats.critical, theme.colors.warning)}
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <ModernInput
          placeholder="Search incidents..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          leftIcon={<Search size={20} color={theme.colors.text.tertiary} />}
        />
      </View>

      {/* Severity Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabsContainer}
        contentContainerStyle={styles.tabsContent}
      >
        {severityTabs.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, severityFilter === tab.key && styles.activeTab]}
            onPress={() => setSeverityFilter(tab.key)}
          >
            <Text
              style={[
                styles.tabText,
                severityFilter === tab.key && styles.activeTabText,
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Status Filter */}
      <View style={styles.statusFilterContainer}>
        <Text style={styles.filterLabel}>Status:</Text>
        {(
          [
            "all",
            "open",
            "investigating",
            "resolved",
            "dismissed",
          ] as IncidentStatus[]
        ).map((status) => (
          <TouchableOpacity
            key={status}
            style={[
              styles.statusFilterChip,
              statusFilter === status && styles.activeStatusFilter,
            ]}
            onPress={() => setStatusFilter(status)}
          >
            <Text
              style={[
                styles.statusFilterText,
                statusFilter === status && styles.activeStatusFilterText,
              ]}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Incidents List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary[600]} />
          <Text style={styles.loadingText}>Loading incidents...</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[theme.colors.primary[600]]}
              tintColor={theme.colors.primary[600]}
            />
          }
        >
          {incidents.length === 0 ? (
            <View style={styles.emptyState}>
              <Shield size={64} color={theme.colors.success} strokeWidth={1} />
              <Text style={styles.emptyTitle}>All Clear!</Text>
              <Text style={styles.emptySubtitle}>
                {searchQuery
                  ? "No incidents match your search criteria"
                  : "No security incidents to report"}
              </Text>
            </View>
          ) : (
            <>
              {incidents.map((incident, index) =>
                renderIncident(incident, index)
              )}

              {hasMore && (
                <AnimatedButton
                  title="Load More"
                  variant="outline"
                  size="md"
                  style={styles.loadMoreButton}
                  onPress={() => {
                    setPage((prev) => prev + 1);
                    fetchIncidents();
                  }}
                />
              )}
            </>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.secondary,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.background.primary,
  },
  backButton: {
    padding: theme.spacing.xs,
  },
  title: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
  },
  placeholder: {
    width: 32,
  },
  statsContainer: {
    flexDirection: "row",
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  statCard: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    borderLeftWidth: 3,
    ...theme.shadows.sm,
  },
  statValue: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
  },
  statLabel: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.secondary,
    marginTop: 2,
  },
  searchContainer: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
  },
  tabsContainer: {
    maxHeight: 50,
  },
  tabsContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  tab: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.background.tertiary,
    marginRight: theme.spacing.sm,
  },
  activeTab: {
    backgroundColor: theme.colors.primary[600],
  },
  tabText: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.text.secondary,
  },
  activeTabText: {
    color: theme.colors.text.inverse,
  },
  statusFilterContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
    gap: theme.spacing.xs,
    flexWrap: "wrap",
  },
  filterLabel: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    marginRight: theme.spacing.xs,
  },
  statusFilterChip: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.background.tertiary,
  },
  activeStatusFilter: {
    backgroundColor: theme.colors.secondary[600],
  },
  statusFilterText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.secondary,
  },
  activeStatusFilterText: {
    color: theme.colors.text.inverse,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing["2xl"],
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: theme.spacing.md,
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.secondary,
  },
  incidentCard: {
    marginBottom: theme.spacing.md,
    padding: theme.spacing.lg,
  },
  incidentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: theme.spacing.md,
  },
  severityContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.md,
  },
  severityIcon: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.full,
    justifyContent: "center",
    alignItems: "center",
  },
  incidentInfo: {
    gap: 2,
  },
  incidentType: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
  },
  severityText: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.bold,
    letterSpacing: 0.5,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
    gap: theme.spacing.xs,
  },
  statusText: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.semibold,
    textTransform: "capitalize",
  },
  description: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    lineHeight: 20,
    marginBottom: theme.spacing.md,
  },
  incidentDetails: {
    gap: theme.spacing.sm,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
    flex: 1,
  },
  detailText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.tertiary,
    flex: 1,
  },
  incidentFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: theme.spacing.md,
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.light,
  },
  dateText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.tertiary,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: theme.spacing["4xl"],
  },
  emptyTitle: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
  },
  emptySubtitle: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.secondary,
    textAlign: "center",
  },
  loadMoreButton: {
    marginTop: theme.spacing.md,
  },
});
