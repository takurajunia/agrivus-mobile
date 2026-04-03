import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { ArrowLeft, Shield, Activity as ActivityIcon } from "lucide-react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../../src/contexts/AuthContext";
import adminService, {
  ModeratorActivityLogEntry,
} from "../../src/services/adminService";
import {
  NeumorphicButton,
  NeumorphicCard,
  NeumorphicIconButton,
  NeumorphicScreen,
} from "../../src/components/neumorphic";
import {
  neumorphicColors,
  spacing,
  typography,
  borderRadius,
} from "../../src/theme/neumorphic";

function safeParseDetails(details: any): Record<string, any> | null {
  if (!details) return null;
  if (typeof details === "string") {
    try {
      return JSON.parse(details);
    } catch {
      return { raw: details };
    }
  }
  if (typeof details === "object") return details as Record<string, any>;
  return { value: String(details) };
}

function formatActionLabel(action: string) {
  return action
    .toLowerCase()
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export default function ModeratorActivityLogScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const isStaff = user?.role === "admin" || user?.role === "support_moderator";

  const [logs, setLogs] = useState<ModeratorActivityLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string>("");

  const fetchLogs = useCallback(async () => {
    try {
      setError("");
      const res = await adminService.getModeratorActivityLog({ page: 1, limit: 20 });
      if (res.success) setLogs(res.data.logs || []);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to load activity log");
    }
  }, []);

  useEffect(() => {
    if (!isStaff) return;
    (async () => {
      try {
        setLoading(true);
        await fetchLogs();
      } finally {
        setLoading(false);
      }
    })();
  }, [fetchLogs, isStaff]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchLogs();
    setRefreshing(false);
  }, [fetchLogs]);

  if (!isStaff) {
    return (
      <NeumorphicScreen variant="list" showLeaves={false}>
        <View style={styles.accessDenied}>
          <Shield size={64} color={neumorphicColors.semantic.error} />
          <Text style={styles.accessDeniedTitle}>Access Denied</Text>
          <Text style={styles.accessDeniedText}>
            You don't have permission to view the activity log.
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

  if (loading) {
    return (
      <NeumorphicScreen variant="list" showLeaves={false}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={neumorphicColors.primary[600]} />
          <Text style={styles.loadingText}>Loading activity log...</Text>
        </View>
      </NeumorphicScreen>
    );
  }

  return (
    <NeumorphicScreen variant="list" showLeaves={false}>
      <View style={styles.header}>
        <NeumorphicIconButton
          icon={<ArrowLeft size={24} color={neumorphicColors.text.primary} />}
          onPress={() => router.back()}
          variant="ghost"
          size="medium"
        />
        <View style={styles.headerText}>
          <Text style={styles.title}>My Activity Log</Text>
          <Text style={styles.subtitle}>Recent moderation actions</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[neumorphicColors.primary[600]]}
          />
        }
      >
        {error ? (
          <NeumorphicCard variant="bordered" style={styles.errorCard}>
            <Text style={styles.errorText}>⚠️ {error}</Text>
          </NeumorphicCard>
        ) : null}

        {!logs.length ? (
          <NeumorphicCard style={styles.emptyCard}>
            <View style={styles.emptyRow}>
              <ActivityIcon size={22} color={neumorphicColors.text.tertiary} />
              <Text style={styles.emptyText}>No activity yet.</Text>
            </View>
          </NeumorphicCard>
        ) : (
          <View style={styles.list}>
            {logs.map((log, idx) => {
              const details = safeParseDetails(log.details);
              const detailsLine =
                details?.reason ||
                details?.notes ||
                details?.resolutionNotes ||
                details?.targetUser ||
                null;

              return (
                <NeumorphicCard
                  key={`${log.timestamp}-${idx}`}
                  style={styles.logCard}
                  variant="standard"
                >
                  <Text style={styles.logAction}>{formatActionLabel(log.action)}</Text>
                  <Text style={styles.logMeta}>
                    {log.entity_type} • {log.entity_id?.substring(0, 10) || "—"}
                  </Text>
                  <Text style={styles.logTime}>{new Date(log.timestamp).toLocaleString()}</Text>
                  {detailsLine ? (
                    <Text style={styles.logDetails} numberOfLines={2}>
                      {String(detailsLine)}
                    </Text>
                  ) : null}
                </NeumorphicCard>
              );
            })}
          </View>
        )}
      </ScrollView>
    </NeumorphicScreen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    gap: spacing.md,
  },
  headerText: {
    flex: 1,
  },
  title: {
    ...typography.h3,
    color: neumorphicColors.text.primary,
  },
  subtitle: {
    ...typography.bodySmall,
    color: neumorphicColors.text.secondary,
    marginTop: 2,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing["3xl"],
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.xl,
  },
  loadingText: {
    ...typography.body,
    color: neumorphicColors.text.secondary,
    marginTop: spacing.md,
  },
  accessDenied: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.xl,
    gap: spacing.md,
  },
  accessDeniedTitle: {
    ...typography.h3,
    color: neumorphicColors.text.primary,
  },
  accessDeniedText: {
    ...typography.body,
    color: neumorphicColors.text.secondary,
    textAlign: "center",
  },
  errorCard: {
    borderColor: neumorphicColors.semantic.error + "40",
    borderWidth: 1,
    marginTop: spacing.md,
  },
  errorText: {
    ...typography.bodySmall,
    color: neumorphicColors.semantic.error,
  },
  emptyCard: {
    marginTop: spacing.md,
    padding: spacing.lg,
  },
  emptyRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  emptyText: {
    ...typography.body,
    color: neumorphicColors.text.secondary,
  },
  list: {
    marginTop: spacing.md,
    gap: spacing.md,
  },
  logCard: {
    padding: spacing.lg,
  },
  logAction: {
    ...typography.body,
    fontWeight: "700",
    color: neumorphicColors.text.primary,
  },
  logMeta: {
    ...typography.caption,
    color: neumorphicColors.text.tertiary,
    marginTop: 4,
  },
  logTime: {
    ...typography.caption,
    color: neumorphicColors.text.tertiary,
    marginTop: 2,
  },
  logDetails: {
    ...typography.bodySmall,
    color: neumorphicColors.text.secondary,
    marginTop: spacing.sm,
    backgroundColor: neumorphicColors.base.input,
    padding: spacing.sm,
    borderRadius: borderRadius.md,
  },
});
