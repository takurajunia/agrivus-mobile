import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Alert,
  Linking,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Shield,
  Award,
  Star,
  Package,
  ShoppingCart,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  Ban,
  UserCheck,
  MessageSquare,
  TrendingUp,
  Zap,
} from "lucide-react-native";
import {
  NeumorphicScreen,
  NeumorphicCard,
  NeumorphicButton,
  NeumorphicIconButton,
} from "../../../src/components/neumorphic";
import BoostBadge from "../../../src/components/BoostBadge";
import {
  neumorphicColors,
  typography,
  spacing,
  borderRadius,
} from "../../../src/theme/neumorphic";
import adminService, {
  UserWithDetails,
} from "../../../src/services/adminService";

export default function AdminUserDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [user, setUser] = useState<UserWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchUserDetails = useCallback(
    async (refresh = false) => {
      if (!id) return;

      try {
        if (refresh) {
          setRefreshing(true);
        }

        const response = await adminService.getUserDetails(id);

        if (response.success) {
          setUser(response.data);
        }
      } catch (error) {
        console.error("Failed to fetch user details:", error);
        Alert.alert("Error", "Failed to load user details");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [id]
  );

  useEffect(() => {
    fetchUserDetails();
  }, [fetchUserDetails]);

  const handleRefresh = useCallback(() => {
    fetchUserDetails(true);
  }, [fetchUserDetails]);

  const handleStatusChange = async (newStatus: "active" | "suspended") => {
    if (!user) return;

    const action = newStatus === "active" ? "activate" : "suspend";

    Alert.alert(
      `${action.charAt(0).toUpperCase() + action.slice(1)} User`,
      `Are you sure you want to ${action} this user?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: action.charAt(0).toUpperCase() + action.slice(1),
          style: newStatus === "suspended" ? "destructive" : "default",
          onPress: async () => {
            try {
              setActionLoading(true);
              const isActive = newStatus === "active";
              const response = await adminService.updateUserStatus(
                user.id,
                isActive
              );

              if (response.success) {
                setUser((prev) =>
                  prev
                    ? {
                        ...prev,
                        status: newStatus,
                        isActive,
                      }
                    : null
                );
                Alert.alert("Success", `User has been ${action}d`);
              }
            } catch (error) {
              console.error("Failed to update user status:", error);
              Alert.alert("Error", "Failed to update user status");
            } finally {
              setActionLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleCall = () => {
    if (user?.phone) {
      Linking.openURL(`tel:${user.phone}`);
    }
  };

  const handleEmail = () => {
    if (user?.email) {
      Linking.openURL(`mailto:${user.email}`);
    }
  };

  const handleChat = () => {
    if (user?.id) {
      router.push(`/chat/${user.id}` as any);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatCurrency = (amount?: number) => {
    if (amount === undefined) return "$0";
    return `$${amount.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const getRoleColor = (role?: string) => {
    switch (role?.toLowerCase()) {
      case "admin":
        return neumorphicColors.semantic.error;
      case "vendor":
        return neumorphicColors.primary[600];
      case "transporter":
        return neumorphicColors.secondary[600];
      default:
        return neumorphicColors.semantic.info;
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status?.toLowerCase()) {
      case "active":
        return neumorphicColors.semantic.success;
      case "suspended":
        return neumorphicColors.semantic.error;
      case "pending":
        return neumorphicColors.semantic.warning;
      default:
        return neumorphicColors.text.tertiary;
    }
  };

  if (loading) {
    return (
      <NeumorphicScreen variant="detail">
        <View style={styles.loadingContainer}>
          <ActivityIndicator
            size="large"
            color={neumorphicColors.primary[600]}
          />
          <Text style={styles.loadingText}>Loading user details...</Text>
        </View>
      </NeumorphicScreen>
    );
  }

  if (!user) {
    return (
      <NeumorphicScreen variant="detail">
        <View style={styles.header}>
          <NeumorphicIconButton
            icon={<ArrowLeft size={24} color={neumorphicColors.text.primary} />}
            onPress={() => router.back()}
            variant="default"
          />
          <Text style={styles.title}>User Details</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.errorContainer}>
          <User
            size={64}
            color={neumorphicColors.text.tertiary}
            strokeWidth={1}
          />
          <Text style={styles.errorTitle}>User Not Found</Text>
          <Text style={styles.errorSubtitle}>
            The user you're looking for doesn't exist or has been removed.
          </Text>
        </View>
      </NeumorphicScreen>
    );
  }

  return (
    <NeumorphicScreen variant="detail">
      {/* Header */}
      <View style={styles.header}>
        <NeumorphicIconButton
          icon={<ArrowLeft size={24} color={neumorphicColors.text.primary} />}
          onPress={() => router.back()}
          variant="default"
        />
        <Text style={styles.title}>User Details</Text>
        <View style={styles.placeholder} />
      </View>

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
        {/* Profile Card */}
        <NeumorphicCard variant="elevated" style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <User
                size={40}
                color={neumorphicColors.primary[600]}
                strokeWidth={2}
              />
            </View>
            {user.boostTier && user.boostTier !== "none" && (
              <View style={styles.boostBadgeContainer}>
                <BoostBadge label={`${user.boostTier} boost`} />
              </View>
            )}
          </View>

          <Text style={styles.userName}>{user.name}</Text>

          <View style={styles.badges}>
            <View
              style={[
                styles.roleBadge,
                { backgroundColor: `${getRoleColor(user.role)}15` },
              ]}
            >
              <Shield size={14} color={getRoleColor(user.role)} />
              <Text
                style={[styles.roleText, { color: getRoleColor(user.role) }]}
              >
                {user.role?.toUpperCase()}
              </Text>
            </View>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: `${getStatusColor(user.status)}15` },
              ]}
            >
              {user.status === "active" ? (
                <CheckCircle size={14} color={getStatusColor(user.status)} />
              ) : (
                <XCircle size={14} color={getStatusColor(user.status)} />
              )}
              <Text
                style={[
                  styles.statusText,
                  { color: getStatusColor(user.status) },
                ]}
              >
                {user.status?.toUpperCase()}
              </Text>
            </View>
          </View>

          {user.isVerified && (
            <View style={styles.verifiedBadge}>
              <Award size={16} color={neumorphicColors.primary[600]} />
              <Text style={styles.verifiedText}>Verified Account</Text>
            </View>
          )}

          {/* Quick Actions */}
          <View style={styles.quickActions}>
            <NeumorphicIconButton
              icon={<Phone size={20} color={neumorphicColors.primary[600]} />}
              onPress={handleCall}
              variant="secondary"
            />
            <NeumorphicIconButton
              icon={<Mail size={20} color={neumorphicColors.primary[600]} />}
              onPress={handleEmail}
              variant="secondary"
            />
            <NeumorphicIconButton
              icon={
                <MessageSquare
                  size={20}
                  color={neumorphicColors.primary[600]}
                />
              }
              onPress={handleChat}
              variant="secondary"
            />
          </View>
        </NeumorphicCard>

        {/* Contact Information */}
        <Text style={styles.sectionTitle}>Contact Information</Text>
        <NeumorphicCard style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Mail size={18} color={neumorphicColors.text.tertiary} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValue}>{user.email}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Phone size={18} color={neumorphicColors.text.tertiary} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Phone</Text>
              <Text style={styles.infoValue}>
                {user.phone || "Not provided"}
              </Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <MapPin size={18} color={neumorphicColors.text.tertiary} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Location</Text>
              <Text style={styles.infoValue}>
                {user.location || "Not provided"}
              </Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Calendar size={18} color={neumorphicColors.text.tertiary} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Joined</Text>
              <Text style={styles.infoValue}>{formatDate(user.createdAt)}</Text>
            </View>
          </View>
        </NeumorphicCard>

        {/* Statistics */}
        <Text style={styles.sectionTitle}>Statistics</Text>
        <View style={styles.statsGrid}>
          <NeumorphicCard variant="stat" style={styles.statCard}>
            <Star size={24} color={neumorphicColors.secondary[600]} />
            <Text style={styles.statValue}>
              {user.rating?.toFixed(1) || "0.0"}
            </Text>
            <Text style={styles.statLabel}>Rating</Text>
          </NeumorphicCard>

          <NeumorphicCard variant="stat" style={styles.statCard}>
            <Package size={24} color={neumorphicColors.primary[600]} />
            <Text style={styles.statValue}>{user.totalProducts || 0}</Text>
            <Text style={styles.statLabel}>Products</Text>
          </NeumorphicCard>

          <NeumorphicCard variant="stat" style={styles.statCard}>
            <ShoppingCart size={24} color={neumorphicColors.semantic.info} />
            <Text style={styles.statValue}>{user.totalOrders || 0}</Text>
            <Text style={styles.statLabel}>Orders</Text>
          </NeumorphicCard>

          <NeumorphicCard variant="stat" style={styles.statCard}>
            <DollarSign size={24} color={neumorphicColors.semantic.success} />
            <Text style={styles.statValue}>
              {formatCurrency(user.totalRevenue)}
            </Text>
            <Text style={styles.statLabel}>Revenue</Text>
          </NeumorphicCard>
        </View>

        {/* Boost Information */}
        {user.boostTier && user.boostTier !== "none" && (
          <>
            <Text style={styles.sectionTitle}>Boost Status</Text>
            <NeumorphicCard style={styles.boostCard}>
              <View style={styles.boostHeader}>
                <Zap size={24} color={neumorphicColors.secondary[600]} />
                <View style={styles.boostInfo}>
                  <Text style={styles.boostTier}>
                    {user.boostTier.charAt(0).toUpperCase() +
                      user.boostTier.slice(1)}{" "}
                    Boost
                  </Text>
                  <Text style={styles.boostExpiry}>
                    Expires: {formatDate(user.boostExpiresAt)}
                  </Text>
                </View>
              </View>
              <View style={styles.boostStats}>
                <View style={styles.boostStatItem}>
                  <TrendingUp
                    size={16}
                    color={neumorphicColors.semantic.success}
                  />
                  <Text style={styles.boostStatText}>
                    {user.boostMultiplier || 1}x visibility boost
                  </Text>
                </View>
              </View>
            </NeumorphicCard>
          </>
        )}

        {/* Recent Activity */}
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        <NeumorphicCard style={styles.activityCard}>
          <View style={styles.activityRow}>
            <Clock size={18} color={neumorphicColors.text.tertiary} />
            <View style={styles.activityContent}>
              <Text style={styles.activityLabel}>Last Active</Text>
              <Text style={styles.activityValue}>
                {user.lastActiveAt ? formatDate(user.lastActiveAt) : "Never"}
              </Text>
            </View>
          </View>

          <View style={styles.activityRow}>
            <ShoppingCart size={18} color={neumorphicColors.text.tertiary} />
            <View style={styles.activityContent}>
              <Text style={styles.activityLabel}>Last Order</Text>
              <Text style={styles.activityValue}>
                {user.lastOrderAt
                  ? formatDate(user.lastOrderAt)
                  : "No orders yet"}
              </Text>
            </View>
          </View>
        </NeumorphicCard>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          {user.status === "active" ? (
            <NeumorphicButton
              title="Suspend User"
              variant="danger"
              size="large"
              loading={actionLoading}
              onPress={() => handleStatusChange("suspended")}
              icon={<Ban size={20} color={neumorphicColors.text.inverse} />}
              fullWidth
            />
          ) : (
            <NeumorphicButton
              title="Activate User"
              variant="primary"
              size="large"
              loading={actionLoading}
              onPress={() => handleStatusChange("active")}
              icon={
                <UserCheck size={20} color={neumorphicColors.text.inverse} />
              }
              fullWidth
            />
          )}
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </NeumorphicScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: neumorphicColors.base.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: neumorphicColors.base.background,
  },
  title: {
    ...typography.h4,
  },
  placeholder: {
    width: 48,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: spacing.lg,
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
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.xl,
  },
  errorTitle: {
    ...typography.h4,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  errorSubtitle: {
    ...typography.body,
    color: neumorphicColors.text.secondary,
    textAlign: "center",
  },
  profileCard: {
    alignItems: "center",
    padding: spacing.xl,
  },
  avatarContainer: {
    position: "relative",
    marginBottom: spacing.lg,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: neumorphicColors.primary[50],
    justifyContent: "center",
    alignItems: "center",
  },
  boostBadgeContainer: {
    position: "absolute",
    bottom: -4,
    right: -4,
  },
  userName: {
    ...typography.h3,
    marginBottom: spacing.md,
  },
  badges: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  roleBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    gap: spacing.xs,
  },
  roleText: {
    ...typography.caption,
    fontWeight: "700",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    gap: spacing.xs,
  },
  statusText: {
    ...typography.caption,
    fontWeight: "700",
  },
  verifiedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  verifiedText: {
    ...typography.bodySmall,
    color: neumorphicColors.primary[600],
    fontWeight: "500",
  },
  quickActions: {
    flexDirection: "row",
    gap: spacing.md,
  },
  sectionTitle: {
    ...typography.h5,
    marginTop: spacing.xl,
    marginBottom: spacing.md,
  },
  infoCard: {
    padding: spacing.lg,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: neumorphicColors.base.pressed,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    ...typography.caption,
    marginBottom: 2,
  },
  infoValue: {
    ...typography.body,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
  },
  statCard: {
    width: "47%",
    alignItems: "center",
    padding: spacing.lg,
  },
  statValue: {
    ...typography.h4,
    marginTop: spacing.sm,
  },
  statLabel: {
    ...typography.bodySmall,
    marginTop: spacing.xs,
  },
  boostCard: {
    padding: spacing.lg,
  },
  boostHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  boostInfo: {
    flex: 1,
  },
  boostTier: {
    ...typography.h5,
    color: neumorphicColors.secondary[600],
  },
  boostExpiry: {
    ...typography.bodySmall,
    marginTop: 2,
  },
  boostStats: {
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: neumorphicColors.base.pressed,
  },
  boostStatItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  boostStatText: {
    ...typography.bodySmall,
  },
  activityCard: {
    padding: spacing.lg,
  },
  activityRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: neumorphicColors.base.pressed,
  },
  activityContent: {
    flex: 1,
  },
  activityLabel: {
    ...typography.caption,
    marginBottom: 2,
  },
  activityValue: {
    ...typography.body,
  },
  actionButtons: {
    marginTop: spacing.xl,
  },
  bottomPadding: {
    height: spacing["2xl"],
  },
});
