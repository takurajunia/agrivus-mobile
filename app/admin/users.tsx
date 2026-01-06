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
} from "../../src/theme/neumorphic";
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
        return neumorphicColors.semantic.error;
      case "farmer":
        return neumorphicColors.semantic.success;
      case "buyer":
        return neumorphicColors.semantic.info;
      case "transporter":
        return neumorphicColors.semantic.warning;
      case "agro_supplier":
        return neumorphicColors.secondary[600];
      default:
        return neumorphicColors.text.secondary;
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
    if (mult >= 2.0)
      return { label: "Elite", color: neumorphicColors.semantic.warning };
    if (mult >= 1.5)
      return { label: "Gold", color: neumorphicColors.secondary[500] };
    if (mult >= 1.25)
      return { label: "Silver", color: neumorphicColors.text.secondary };
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
      <NeumorphicScreen variant="list" showLeaves={false}>
        <View style={styles.accessDenied}>
          <Shield size={64} color={neumorphicColors.semantic.error} />
          <Text style={styles.accessDeniedTitle}>Access Denied</Text>
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
          <ActivityIndicator
            size="large"
            color={neumorphicColors.primary[600]}
          />
          <Text style={styles.loadingText}>Loading users...</Text>
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
          style={styles.backButton}
        />
        <Text style={styles.title}>User Management</Text>
        <Text style={styles.totalCount}>{pagination.total} users</Text>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <NeumorphicSearchBar
          placeholder="Search users..."
          value={searchQuery}
          onChangeText={setSearchQuery}
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
            <NeumorphicButton
              key={role.key}
              title={role.label}
              variant={selectedRole === role.key ? "primary" : "tertiary"}
              size="small"
              onPress={() => setSelectedRole(role.key)}
              style={styles.tab}
            />
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
            colors={[neumorphicColors.primary[600]]}
          />
        }
      >
        {users.length === 0 ? (
          <View style={styles.emptyState}>
            <User size={64} color={neumorphicColors.text.tertiary} />
            <Text style={styles.emptyTitle}>No users found</Text>
            <Text style={styles.emptyText}>
              Try adjusting your search or filters
            </Text>
          </View>
        ) : (
          users.map((user, index) => {
            const boostTier = getBoostTier(user.boostMultiplier);

            return (
              <NeumorphicCard
                key={user.id}
                style={styles.userCard}
                animationDelay={index * 50}
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
                            ? neumorphicColors.primary[600]
                            : neumorphicColors.text.tertiary
                        }
                      />
                    </View>
                    {!user.isActive && (
                      <View style={styles.inactiveBadge}>
                        <UserX
                          size={12}
                          color={neumorphicColors.semantic.error}
                        />
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
                    <NeumorphicIconButton
                      icon={
                        user.isActive ? (
                          <UserX
                            size={16}
                            color={neumorphicColors.semantic.error}
                          />
                        ) : (
                          <UserCheck
                            size={16}
                            color={neumorphicColors.semantic.success}
                          />
                        )
                      }
                      onPress={() =>
                        handleToggleUserStatus(user.id, user.isActive || false)
                      }
                      variant={user.isActive ? "secondary" : "secondary"}
                      size="small"
                      style={
                        user.isActive
                          ? styles.suspendButton
                          : styles.activateButton
                      }
                    />
                    <ChevronRight
                      size={16}
                      color={neumorphicColors.text.tertiary}
                    />
                  </View>
                </View>
              </NeumorphicCard>
            );
          })
        )}

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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: typography.sizes.md,
    color: neumorphicColors.text.secondary,
  },
  accessDenied: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.xl,
  },
  accessDeniedTitle: {
    fontSize: typography.sizes["2xl"],
    fontWeight: typography.weights.bold,
    color: neumorphicColors.text.primary,
    marginVertical: spacing.lg,
  },
  header: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  backButton: {
    marginLeft: -spacing.sm,
    marginBottom: spacing.sm,
  },
  title: {
    fontSize: typography.sizes["3xl"],
    fontWeight: typography.weights.bold,
    color: neumorphicColors.text.primary,
    letterSpacing: -0.5,
  },
  totalCount: {
    fontSize: typography.sizes.sm,
    color: neumorphicColors.text.secondary,
    marginTop: spacing.xs,
  },
  searchContainer: {
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.md,
  },
  tabsContainer: {
    maxHeight: 56,
    marginBottom: spacing.md,
  },
  tabs: {
    paddingHorizontal: spacing.xl,
    flexDirection: "row",
    gap: spacing.sm,
  },
  tab: {
    marginRight: spacing.xs,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: spacing.xl,
  },
  userCard: {
    marginBottom: spacing.md,
  },
  userRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarContainer: {
    position: "relative",
    marginRight: spacing.md,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: neumorphicColors.primary[100],
    justifyContent: "center",
    alignItems: "center",
  },
  avatarInactive: {
    backgroundColor: neumorphicColors.base.pressed,
  },
  inactiveBadge: {
    position: "absolute",
    bottom: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: neumorphicColors.base.card,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: neumorphicColors.semantic.error,
  },
  userInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  userName: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: neumorphicColors.text.primary,
  },
  boostBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    gap: 2,
  },
  boostText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
  },
  userEmail: {
    fontSize: typography.sizes.sm,
    color: neumorphicColors.text.secondary,
    marginTop: 2,
  },
  userMeta: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: spacing.xs,
    gap: spacing.md,
  },
  roleBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  roleText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
  },
  userScore: {
    fontSize: typography.sizes.xs,
    color: neumorphicColors.text.tertiary,
  },
  userActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  suspendButton: {
    backgroundColor: neumorphicColors.semantic.error + "20",
  },
  activateButton: {
    backgroundColor: neumorphicColors.semantic.success + "20",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: spacing["4xl"],
  },
  emptyTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: neumorphicColors.text.primary,
    marginTop: spacing.lg,
  },
  emptyText: {
    fontSize: typography.sizes.sm,
    color: neumorphicColors.text.tertiary,
    marginTop: spacing.sm,
  },
  bottomPadding: {
    height: spacing["4xl"],
  },
});
