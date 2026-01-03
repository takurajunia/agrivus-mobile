import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from "react-native";
import {
  ArrowLeft,
  Search,
  User,
  UserCheck,
  UserX,
  Filter,
  ChevronRight,
  Shield,
  Star,
} from "lucide-react-native";
import { useRouter } from "expo-router";
import AnimatedCard from "../../src/components/AnimatedCard";
import ModernInput from "../../src/components/ModernInput";
import AnimatedButton from "../../src/components/AnimatedButton";
import { theme } from "../../src/theme/tokens";
import adminService, { UserWithDetails } from "../../src/services/adminService";
import { useAuth } from "../../src/contexts/AuthContext";

export default function AdminUsersScreen() {
  const router = useRouter();
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<UserWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState<string>("all");
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
  });

  const fetchUsers = useCallback(async () => {
    try {
      const response = await adminService.getAllUsers({
        role: selectedRole === "all" ? undefined : selectedRole,
        page: pagination.page,
        limit: pagination.limit,
        search: searchQuery || undefined,
      });
      if (response.success && response.data) {
        setUsers(response.data.users);
        setPagination(response.data.pagination);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedRole, pagination.page, pagination.limit, searchQuery]);

  useEffect(() => {
    if (currentUser?.role === "admin") {
      fetchUsers();
    }
  }, [fetchUsers, currentUser]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchUsers();
  }, [fetchUsers]);

  const handleToggleUserStatus = async (
    userId: string,
    currentStatus: boolean
  ) => {
    const action = currentStatus ? "suspend" : "activate";
    Alert.alert(
      `${currentStatus ? "Suspend" : "Activate"} User`,
      `Are you sure you want to ${action} this user?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Confirm",
          style: currentStatus ? "destructive" : "default",
          onPress: async () => {
            try {
              await adminService.updateUserStatus(userId, !currentStatus);
              setUsers(
                users.map((u) =>
                  u.id === userId ? { ...u, isActive: !currentStatus } : u
                )
              );
              Alert.alert("Success", `User ${action}d successfully`);
            } catch (error) {
              console.error("Error updating user status:", error);
              Alert.alert("Error", `Failed to ${action} user`);
            }
          },
        },
      ]
    );
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return theme.colors.error;
      case "farmer":
        return theme.colors.success;
      case "buyer":
        return theme.colors.info;
      case "transporter":
        return theme.colors.warning;
      case "agro_supplier":
        return theme.colors.secondary[600];
      default:
        return theme.colors.text.secondary;
    }
  };

  const getRoleLabel = (role: string) => {
    return role
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const getBoostTier = (multiplier: string | undefined) => {
    if (!multiplier) return null;
    const mult = parseFloat(multiplier);
    if (mult >= 2.0) return { label: "Elite", color: theme.colors.warning };
    if (mult >= 1.5)
      return { label: "Gold", color: theme.colors.secondary[500] };
    if (mult >= 1.25)
      return { label: "Silver", color: theme.colors.text.secondary };
    if (mult >= 1.1) return { label: "Bronze", color: "#CD7F32" };
    return null;
  };

  const roles = [
    { key: "all", label: "All" },
    { key: "farmer", label: "Farmers" },
    { key: "buyer", label: "Buyers" },
    { key: "transporter", label: "Transporters" },
    { key: "agro_supplier", label: "Suppliers" },
    { key: "admin", label: "Admins" },
  ];

  if (currentUser?.role !== "admin") {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.accessDenied}>
          <Shield size={64} color={theme.colors.error} />
          <Text style={styles.accessDeniedTitle}>Access Denied</Text>
          <AnimatedButton
            title="Go Back"
            onPress={() => router.back()}
            variant="primary"
          />
        </View>
      </SafeAreaView>
    );
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary[600]} />
          <Text style={styles.loadingText}>Loading users...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <ArrowLeft size={24} color={theme.colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>User Management</Text>
        <Text style={styles.totalCount}>{pagination.total} users</Text>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <ModernInput
          placeholder="Search users..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          leftIcon={<Search size={20} color={theme.colors.text.tertiary} />}
        />
      </View>

      {/* Role Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabsContainer}
      >
        <View style={styles.tabs}>
          {roles.map((role) => (
            <TouchableOpacity
              key={role.key}
              style={[
                styles.tab,
                selectedRole === role.key && styles.activeTab,
              ]}
              onPress={() => setSelectedRole(role.key)}
            >
              <Text
                style={[
                  styles.tabText,
                  selectedRole === role.key && styles.activeTabText,
                ]}
              >
                {role.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Users List */}
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primary[600]]}
          />
        }
      >
        {users.length === 0 ? (
          <View style={styles.emptyState}>
            <User size={64} color={theme.colors.text.tertiary} />
            <Text style={styles.emptyTitle}>No users found</Text>
            <Text style={styles.emptyText}>
              Try adjusting your search or filters
            </Text>
          </View>
        ) : (
          users.map((user, index) => {
            const boostTier = getBoostTier(user.boostMultiplier);

            return (
              <AnimatedCard
                key={user.id}
                style={styles.userCard}
                delay={index * 50}
                onPress={() => router.push(`/admin/user/${user.id}`)}
              >
                <View style={styles.userRow}>
                  <View style={styles.avatarContainer}>
                    <View
                      style={[
                        styles.avatar,
                        !user.isActive && styles.avatarInactive,
                      ]}
                    >
                      <User
                        size={24}
                        color={
                          user.isActive
                            ? theme.colors.primary[600]
                            : theme.colors.text.tertiary
                        }
                      />
                    </View>
                    {!user.isActive && (
                      <View style={styles.inactiveBadge}>
                        <UserX size={12} color={theme.colors.error} />
                      </View>
                    )}
                  </View>

                  <View style={styles.userInfo}>
                    <View style={styles.nameRow}>
                      <Text style={styles.userName}>{user.fullName}</Text>
                      {boostTier && (
                        <View
                          style={[
                            styles.boostBadge,
                            { backgroundColor: boostTier.color + "20" },
                          ]}
                        >
                          <Star size={10} color={boostTier.color} />
                          <Text
                            style={[
                              styles.boostText,
                              { color: boostTier.color },
                            ]}
                          >
                            {boostTier.label}
                          </Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.userEmail}>{user.email}</Text>
                    <View style={styles.userMeta}>
                      <View
                        style={[
                          styles.roleBadge,
                          { backgroundColor: getRoleColor(user.role) + "20" },
                        ]}
                      >
                        <Text
                          style={[
                            styles.roleText,
                            { color: getRoleColor(user.role) },
                          ]}
                        >
                          {getRoleLabel(user.role)}
                        </Text>
                      </View>
                      <Text style={styles.userScore}>
                        Score: {user.platformScore}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.userActions}>
                    <TouchableOpacity
                      style={[
                        styles.statusButton,
                        user.isActive
                          ? styles.suspendButton
                          : styles.activateButton,
                      ]}
                      onPress={() =>
                        handleToggleUserStatus(user.id, user.isActive || false)
                      }
                    >
                      {user.isActive ? (
                        <UserX size={16} color={theme.colors.error} />
                      ) : (
                        <UserCheck size={16} color={theme.colors.success} />
                      )}
                    </TouchableOpacity>
                    <ChevronRight
                      size={16}
                      color={theme.colors.text.tertiary}
                    />
                  </View>
                </View>
              </AnimatedCard>
            );
          })
        )}

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
  accessDenied: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: theme.spacing.xl,
  },
  accessDeniedTitle: {
    fontSize: theme.typography.fontSize["2xl"],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    marginVertical: theme.spacing.lg,
  },
  header: {
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
  },
  backButton: {
    padding: theme.spacing.sm,
    marginLeft: -theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  title: {
    fontSize: theme.typography.fontSize["3xl"],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    letterSpacing: -0.5,
  },
  totalCount: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.xs,
  },
  searchContainer: {
    paddingHorizontal: theme.spacing.xl,
    marginBottom: theme.spacing.md,
  },
  tabsContainer: {
    maxHeight: 56,
    marginBottom: theme.spacing.md,
  },
  tabs: {
    paddingHorizontal: theme.spacing.xl,
    flexDirection: "row",
    gap: theme.spacing.sm,
  },
  tab: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.xl,
    backgroundColor: theme.colors.background.primary,
  },
  activeTab: {
    backgroundColor: theme.colors.primary[600],
  },
  tabText: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.secondary,
  },
  activeTabText: {
    color: theme.colors.text.inverse,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: theme.spacing.xl,
  },
  userCard: {
    marginBottom: theme.spacing.md,
  },
  userRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarContainer: {
    position: "relative",
    marginRight: theme.spacing.md,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.primary[100],
    justifyContent: "center",
    alignItems: "center",
  },
  avatarInactive: {
    backgroundColor: theme.colors.background.tertiary,
  },
  inactiveBadge: {
    position: "absolute",
    bottom: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: theme.colors.background.primary,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: theme.colors.error,
  },
  userInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
  },
  userName: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
  },
  boostBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.sm,
    gap: 2,
  },
  boostText: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.bold,
  },
  userEmail: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    marginTop: 2,
  },
  userMeta: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: theme.spacing.xs,
    gap: theme.spacing.md,
  },
  roleBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.sm,
  },
  roleText: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  userScore: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.tertiary,
  },
  userActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
  },
  statusButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  suspendButton: {
    backgroundColor: theme.colors.error + "20",
  },
  activateButton: {
    backgroundColor: theme.colors.success + "20",
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
  },
  emptyText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.tertiary,
    marginTop: theme.spacing.sm,
  },
  bottomPadding: {
    height: theme.spacing["4xl"],
  },
});
