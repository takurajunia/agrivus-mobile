import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
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
  User,
  MapPin,
  Calendar,
  Smartphone,
  Globe,
  ChevronRight,
} from "lucide-react-native";
import {
  NeumorphicScreen,
  NeumorphicCard,
  NeumorphicButton,
  NeumorphicIconButton,
  NeumorphicSearchBar,
} from "../../src/components/neumorphic";
import {
  neumorphicColors,
  typography,
  spacing,
  borderRadius,
  getNeumorphicShadow,
} from "../../src/theme/neumorphic";
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

  const getSeverityIcon = (severity: string | undefined) => {
    if (!severity) return <Shield size={16} color={neumorphicColors.text.tertiary} />;
    switch (severity.toLowerCase()) {
      case "critical":
        return <Ban size={16} color={neumorphicColors.semantic.error} />;
      case "high":
        return (
          <AlertTriangle size={16} color={neumorphicColors.semantic.warning} />
        );
      case "medium":
        return <Eye size={16} color={neumorphicColors.semantic.info} />;
      case "low":
        return <Shield size={16} color={neumorphicColors.semantic.success} />;
      default:
        return <Shield size={16} color={neumorphicColors.text.tertiary} />;
    }
  };

  const getSeverityColor = (severity: string | undefined) => {
    if (!severity) return neumorphicColors.text.tertiary;
    switch (severity.toLowerCase()) {
      case "critical":
        return neumorphicColors.semantic.error;
      case "high":
        return neumorphicColors.semantic.warning;
      case "medium":
        return neumorphicColors.semantic.info;
      case "low":
        return neumorphicColors.semantic.success;
      default:
        return neumorphicColors.text.tertiary;
    }
  };

  const getStatusIcon = (status: string | undefined) => {
    if (!status) return <Clock size={14} color={neumorphicColors.text.tertiary} />;
    switch (status.toLowerCase()) {
      case "open":
        return (
          <AlertTriangle size={14} color={neumorphicColors.semantic.error} />
        );
      case "investigating":
        return <Eye size={14} color={neumorphicColors.semantic.warning} />;
      case "resolved":
        return (
          <CheckCircle size={14} color={neumorphicColors.semantic.success} />
        );
      case "dismissed":
        return <XCircle size={14} color={neumorphicColors.text.tertiary} />;
      default:
        return <Clock size={14} color={neumorphicColors.text.tertiary} />;
    }
  };

  const getStatusColor = (status: string | undefined) => {
    if (!status) return neumorphicColors.text.tertiary;
    switch (status.toLowerCase()) {
      case "open":
        return neumorphicColors.semantic.error;
      case "investigating":
        return neumorphicColors.semantic.warning;
      case "resolved":
        return neumorphicColors.semantic.success;
      case "dismissed":
        return neumorphicColors.text.tertiary;
      default:
        return neumorphicColors.text.tertiary;
    }
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
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
    <NeumorphicCard
      key={incident.id}
      style={styles.incidentCard}
      animationDelay={index * 50}
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
              {incident.severity ? incident.severity.toUpperCase() : "UNKNOWN"}
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
            {incident.status || "UNKNOWN"}
          </Text>
        </View>
      </View>

      <Text style={styles.description} numberOfLines={2}>
        {incident.description}
      </Text>

      <View style={styles.incidentDetails}>
        {incident.userId && (
          <View style={styles.detailRow}>
            <User size={14} color={neumorphicColors.text.tertiary} />
            <Text style={styles.detailText}>User: {incident.userId}</Text>
          </View>
        )}

        {incident.ipAddress && (
          <View style={styles.detailRow}>
            <Globe size={14} color={neumorphicColors.text.tertiary} />
            <Text style={styles.detailText}>{incident.ipAddress}</Text>
          </View>
        )}

        {incident.userAgent && (
          <View style={styles.detailRow}>
            <Smartphone size={14} color={neumorphicColors.text.tertiary} />
            <Text style={styles.detailText} numberOfLines={1}>
              {incident.userAgent}
            </Text>
          </View>
        )}

        {incident.location && (
          <View style={styles.detailRow}>
            <MapPin size={14} color={neumorphicColors.text.tertiary} />
            <Text style={styles.detailText}>{incident.location}</Text>
          </View>
        )}
      </View>

      <View style={styles.incidentFooter}>
        <View style={styles.detailRow}>
          <Calendar size={14} color={neumorphicColors.text.tertiary} />
          <Text style={styles.dateText}>{formatDate(incident.createdAt)}</Text>
        </View>
        <ChevronRight size={20} color={neumorphicColors.text.tertiary} />
      </View>
    </NeumorphicCard>
  );

  return (
    <NeumorphicScreen variant="list" safeArea>
      {/* Header */}
      <View style={styles.header}>
        <NeumorphicIconButton
          icon={<ArrowLeft size={24} color={neumorphicColors.text.primary} />}
          onPress={() => router.back()}
          variant="ghost"
          size="medium"
        />
        <Text style={styles.title}>Security</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Stats Overview */}
      <View style={styles.statsContainer}>
        {renderStatCard("Total", stats.total, neumorphicColors.primary[600])}
        {renderStatCard("Open", stats.open, neumorphicColors.semantic.error)}
        {renderStatCard(
          "Resolved",
          stats.resolved,
          neumorphicColors.semantic.success
        )}
        {renderStatCard(
          "Critical",
          stats.critical,
          neumorphicColors.semantic.warning
        )}
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <NeumorphicSearchBar
          placeholder="Search incidents..."
          value={searchQuery}
          onChangeText={setSearchQuery}
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
          <NeumorphicButton
            key={tab.key}
            title={tab.label}
            variant={severityFilter === tab.key ? "primary" : "tertiary"}
            size="small"
            onPress={() => setSeverityFilter(tab.key)}
            style={styles.tabButton}
          />
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
          <NeumorphicButton
            key={status}
            title={status.charAt(0).toUpperCase() + status.slice(1)}
            variant={statusFilter === status ? "secondary" : "tertiary"}
            size="small"
            onPress={() => setStatusFilter(status)}
            style={styles.statusFilterButton}
          />
        ))}
      </View>

      {/* Incidents List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator
            size="large"
            color={neumorphicColors.primary[600]}
          />
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
              colors={[neumorphicColors.primary[600]]}
              tintColor={neumorphicColors.primary[600]}
            />
          }
        >
          {incidents.length === 0 ? (
            <View style={styles.emptyState}>
              <Shield
                size={64}
                color={neumorphicColors.semantic.success}
                strokeWidth={1}
              />
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
                <NeumorphicButton
                  title="Load More"
                  variant="tertiary"
                  size="medium"
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
    </NeumorphicScreen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  title: {
    ...typography.h4,
  },
  placeholder: {
    width: 48,
  },
  statsContainer: {
    flexDirection: "row",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  statCard: {
    flex: 1,
    backgroundColor: neumorphicColors.base.card,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderLeftWidth: 3,
    ...getNeumorphicShadow(2),
  },
  statValue: {
    ...typography.h4,
  },
  statLabel: {
    ...typography.caption,
    marginTop: 2,
  },
  searchContainer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  tabsContainer: {
    maxHeight: 50,
  },
  tabsContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    gap: spacing.sm,
  },
  tabButton: {
    marginRight: spacing.sm,
  },
  statusFilterContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    gap: spacing.xs,
    flexWrap: "wrap",
  },
  filterLabel: {
    ...typography.bodySmall,
    marginRight: spacing.xs,
  },
  statusFilterButton: {
    marginRight: spacing.xs,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: spacing.lg,
    paddingBottom: spacing["2xl"],
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
  incidentCard: {
    marginBottom: spacing.md,
  },
  incidentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: spacing.md,
  },
  severityContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  severityIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    justifyContent: "center",
    alignItems: "center",
  },
  incidentInfo: {
    gap: 2,
  },
  incidentType: {
    ...typography.h6,
  },
  severityText: {
    ...typography.overline,
    letterSpacing: 0.5,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    gap: spacing.xs,
  },
  statusText: {
    ...typography.caption,
    fontWeight: "600",
    textTransform: "capitalize",
  },
  description: {
    ...typography.bodySmall,
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  incidentDetails: {
    gap: spacing.sm,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    flex: 1,
  },
  detailText: {
    ...typography.bodySmall,
    color: neumorphicColors.text.tertiary,
    flex: 1,
  },
  incidentFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: neumorphicColors.base.shadowDark + "20",
  },
  dateText: {
    ...typography.caption,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: spacing["2xl"],
  },
  emptyTitle: {
    ...typography.h4,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  emptySubtitle: {
    ...typography.body,
    color: neumorphicColors.text.secondary,
    textAlign: "center",
  },
  loadMoreButton: {
    marginTop: spacing.md,
  },
});
