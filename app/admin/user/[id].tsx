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
import AnimatedCard from "../../../src/components/AnimatedCard";
import AnimatedButton from "../../../src/components/AnimatedButton";
import GlassCard from "../../../src/components/GlassCard";
import BoostBadge from "../../../src/components/BoostBadge";
import { theme } from "../../../src/theme/tokens";
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

  const handleStatusChange = async (newStatus: string) => {
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
              const response = await adminService.updateUserStatus(
                user.id,
                newStatus
              );

              if (response.success) {
                setUser((prev) =>
                  prev ? { ...prev, status: newStatus } : null
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
    return date.toLocaleDateString("en-NG", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatCurrency = (amount?: number) => {
    if (amount === undefined) return "₦0";
    return `₦${amount.toLocaleString()}`;
  };

  const getRoleColor = (role?: string) => {
    switch (role?.toLowerCase()) {
      case "admin":
        return theme.colors.error;
      case "vendor":
        return theme.colors.primary[600];
      case "transporter":
        return theme.colors.warning;
      default:
        return theme.colors.info;
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status?.toLowerCase()) {
      case "active":
        return theme.colors.success;
      case "suspended":
        return theme.colors.error;
      case "pending":
        return theme.colors.warning;
      default:
        return theme.colors.text.tertiary;
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary[600]} />
          <Text style={styles.loadingText}>Loading user details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <ArrowLeft size={24} color={theme.colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.title}>User Details</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.errorContainer}>
          <User size={64} color={theme.colors.text.tertiary} strokeWidth={1} />
          <Text style={styles.errorTitle}>User Not Found</Text>
          <Text style={styles.errorSubtitle}>
            The user you're looking for doesn't exist or has been removed.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

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
            colors={[theme.colors.primary[600]]}
            tintColor={theme.colors.primary[600]}
          />
        }
      >
        {/* Profile Card */}
        <GlassCard style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <User
                size={40}
                color={theme.colors.primary[600]}
                strokeWidth={2}
              />
            </View>
            {user.boostTier && user.boostTier !== "none" && (
              <View style={styles.boostBadgeContainer}>
                <BoostBadge tier={user.boostTier} size="sm" />
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
              <Award size={16} color={theme.colors.primary[600]} />
              <Text style={styles.verifiedText}>Verified Account</Text>
            </View>
          )}

          {/* Quick Actions */}
          <View style={styles.quickActions}>
            <TouchableOpacity style={styles.actionButton} onPress={handleCall}>
              <Phone size={20} color={theme.colors.primary[600]} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={handleEmail}>
              <Mail size={20} color={theme.colors.primary[600]} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={handleChat}>
              <MessageSquare size={20} color={theme.colors.primary[600]} />
            </TouchableOpacity>
          </View>
        </GlassCard>

        {/* Contact Information */}
        <Text style={styles.sectionTitle}>Contact Information</Text>
        <AnimatedCard style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Mail size={18} color={theme.colors.text.tertiary} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValue}>{user.email}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Phone size={18} color={theme.colors.text.tertiary} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Phone</Text>
              <Text style={styles.infoValue}>
                {user.phone || "Not provided"}
              </Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <MapPin size={18} color={theme.colors.text.tertiary} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Location</Text>
              <Text style={styles.infoValue}>
                {user.location || "Not provided"}
              </Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Calendar size={18} color={theme.colors.text.tertiary} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Joined</Text>
              <Text style={styles.infoValue}>{formatDate(user.createdAt)}</Text>
            </View>
          </View>
        </AnimatedCard>

        {/* Statistics */}
        <Text style={styles.sectionTitle}>Statistics</Text>
        <View style={styles.statsGrid}>
          <AnimatedCard style={styles.statCard}>
            <Star size={24} color={theme.colors.warning} />
            <Text style={styles.statValue}>
              {user.rating?.toFixed(1) || "0.0"}
            </Text>
            <Text style={styles.statLabel}>Rating</Text>
          </AnimatedCard>

          <AnimatedCard style={styles.statCard}>
            <Package size={24} color={theme.colors.primary[600]} />
            <Text style={styles.statValue}>{user.totalProducts || 0}</Text>
            <Text style={styles.statLabel}>Products</Text>
          </AnimatedCard>

          <AnimatedCard style={styles.statCard}>
            <ShoppingCart size={24} color={theme.colors.info} />
            <Text style={styles.statValue}>{user.totalOrders || 0}</Text>
            <Text style={styles.statLabel}>Orders</Text>
          </AnimatedCard>

          <AnimatedCard style={styles.statCard}>
            <DollarSign size={24} color={theme.colors.success} />
            <Text style={styles.statValue}>
              {formatCurrency(user.totalRevenue)}
            </Text>
            <Text style={styles.statLabel}>Revenue</Text>
          </AnimatedCard>
        </View>

        {/* Boost Information */}
        {user.boostTier && user.boostTier !== "none" && (
          <>
            <Text style={styles.sectionTitle}>Boost Status</Text>
            <AnimatedCard style={styles.boostCard}>
              <View style={styles.boostHeader}>
                <Zap size={24} color={theme.colors.warning} />
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
                  <TrendingUp size={16} color={theme.colors.success} />
                  <Text style={styles.boostStatText}>
                    {user.boostMultiplier || 1}x visibility boost
                  </Text>
                </View>
              </View>
            </AnimatedCard>
          </>
        )}

        {/* Recent Activity */}
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        <AnimatedCard style={styles.activityCard}>
          <View style={styles.activityRow}>
            <Clock size={18} color={theme.colors.text.tertiary} />
            <View style={styles.activityContent}>
              <Text style={styles.activityLabel}>Last Active</Text>
              <Text style={styles.activityValue}>
                {user.lastActiveAt ? formatDate(user.lastActiveAt) : "Never"}
              </Text>
            </View>
          </View>

          <View style={styles.activityRow}>
            <ShoppingCart size={18} color={theme.colors.text.tertiary} />
            <View style={styles.activityContent}>
              <Text style={styles.activityLabel}>Last Order</Text>
              <Text style={styles.activityValue}>
                {user.lastOrderAt
                  ? formatDate(user.lastOrderAt)
                  : "No orders yet"}
              </Text>
            </View>
          </View>
        </AnimatedCard>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          {user.status === "active" ? (
            <AnimatedButton
              title="Suspend User"
              variant="danger"
              size="lg"
              loading={actionLoading}
              onPress={() => handleStatusChange("suspended")}
            >
              <Ban size={20} color={theme.colors.text.inverse} />
            </AnimatedButton>
          ) : (
            <AnimatedButton
              title="Activate User"
              variant="primary"
              size="lg"
              loading={actionLoading}
              onPress={() => handleStatusChange("active")}
            >
              <UserCheck size={20} color={theme.colors.text.inverse} />
            </AnimatedButton>
          )}
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
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
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: theme.spacing.lg,
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
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: theme.spacing.xl,
  },
  errorTitle: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
  },
  errorSubtitle: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.secondary,
    textAlign: "center",
  },
  profileCard: {
    alignItems: "center",
    padding: theme.spacing.xl,
  },
  avatarContainer: {
    position: "relative",
    marginBottom: theme.spacing.lg,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.primary[50],
    justifyContent: "center",
    alignItems: "center",
  },
  boostBadgeContainer: {
    position: "absolute",
    bottom: -4,
    right: -4,
  },
  userName: {
    fontSize: theme.typography.fontSize["2xl"],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
  },
  badges: {
    flexDirection: "row",
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  roleBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
    gap: theme.spacing.xs,
  },
  roleText: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.bold,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
    gap: theme.spacing.xs,
  },
  statusText: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.bold,
  },
  verifiedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
  },
  verifiedText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.primary[600],
    fontWeight: theme.typography.fontWeight.medium,
  },
  quickActions: {
    flexDirection: "row",
    gap: theme.spacing.md,
  },
  actionButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.primary[50],
    justifyContent: "center",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    marginTop: theme.spacing.xl,
    marginBottom: theme.spacing.md,
  },
  infoCard: {
    padding: theme.spacing.lg,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.tertiary,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.primary,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.md,
  },
  statCard: {
    width: "47%",
    alignItems: "center",
    padding: theme.spacing.lg,
  },
  statValue: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    marginTop: theme.spacing.sm,
  },
  statLabel: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.xs,
  },
  boostCard: {
    padding: theme.spacing.lg,
  },
  boostHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  boostInfo: {
    flex: 1,
  },
  boostTier: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.warning,
  },
  boostExpiry: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    marginTop: 2,
  },
  boostStats: {
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.light,
  },
  boostStatItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
  },
  boostStatText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
  },
  activityCard: {
    padding: theme.spacing.lg,
  },
  activityRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
  },
  activityContent: {
    flex: 1,
  },
  activityLabel: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.tertiary,
    marginBottom: 2,
  },
  activityValue: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.primary,
  },
  actionButtons: {
    marginTop: theme.spacing.xl,
  },
  bottomPadding: {
    height: theme.spacing["2xl"],
  },
});
