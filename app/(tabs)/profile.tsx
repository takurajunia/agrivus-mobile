import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Linking,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useAuth } from "../../src/contexts/AuthContext";
import {
  User,
  Settings,
  Bell,
  Shield,
  DollarSign,
  HelpCircle,
  LogOut,
  Trash2,
  ChevronRight,
  Edit,
  Award,
  Star,
  Package,
  ShoppingBag,
} from "lucide-react-native";

// Neumorphic Components
import {
  NeumorphicScreen,
  NeumorphicCard,
  NeumorphicButton,
  NeumorphicAvatar,
  NeumorphicBadge,
} from "../../src/components/neumorphic";

import {
  neumorphicColors,
  typography,
  spacing,
  borderRadius,
  getNeumorphicShadow,
} from "../../src/theme/neumorphic";
import ordersService from "../../src/services/ordersService";
import listingsService from "../../src/services/listingsService";
import agrimallService from "../../src/services/agrimallService";
import adminService from "../../src/services/adminService";

type ProfileStat = {
  label: string;
  value: string;
  icon: any;
};

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [profilePhotoUri, setProfilePhotoUri] = useState<string | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [stats, setStats] = useState<ProfileStat[]>([
    { label: "Orders", value: "0", icon: ShoppingBag },
    { label: "Score", value: "0.0", icon: Star },
    { label: "Products", value: "0", icon: Package },
  ]);

  const handleLogout = async () => {
    try {
      await logout();
      router.replace("/login");
    } catch (error) {
      Alert.alert("Error", "Unable to log out right now. Please try again.");
    }
  };

  useEffect(() => {
    if (!user) {
      router.replace("/login");
    }
  }, [router, user]);

  useEffect(() => {
    const loadProfilePhoto = async () => {
      if (!user?.id) {
        setProfilePhotoUri(null);
        return;
      }

      try {
        const savedPhoto = await AsyncStorage.getItem(`profile-photo:${user.id}`);
        setProfilePhotoUri(savedPhoto);
      } catch (error) {
        console.error("Failed to load profile photo:", error);
        setProfilePhotoUri(null);
      }
    };

    loadProfilePhoto();
  }, [user?.id]);

  const handlePickProfilePhoto = async () => {
    if (!user?.id) {
      Alert.alert("Error", "Please log in to update your profile photo.");
      return;
    }

    try {
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        Alert.alert(
          "Permission required",
          "Please allow photo library access to set your profile picture."
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

      if (result.canceled || !result.assets?.length) {
        return;
      }

      const selectedPhotoUri = result.assets[0].uri;
      setProfilePhotoUri(selectedPhotoUri);
      await AsyncStorage.setItem(`profile-photo:${user.id}`, selectedPhotoUri);
    } catch (error) {
      console.error("Failed to set profile photo:", error);
      Alert.alert("Error", "Unable to update profile photo right now.");
    }
  };

  // Build menu sections dynamically based on user role
  const baseMenuSections = [
    {
      title: "Account",
      items: [
        {
          label: "Edit Profile",
          icon: Edit,
          color: neumorphicColors.semantic.success,
          route: "/edit-profile",
        },
        {
          label: "Account Settings",
          icon: Settings,
          color: neumorphicColors.semantic.info,
          route: "/settings",
        },
        {
          label: "Verification Badge",
          icon: Award,
          color: neumorphicColors.semantic.warning,
          route: "/verification",
        },
        {
          label: "Delete Account",
          icon: Trash2,
          color: neumorphicColors.semantic.error,
          route: "/delete-account",
        },
      ],
    },
    {
      title: "Preferences",
      items: [
        {
          label: "Notifications",
          icon: Bell,
          color: neumorphicColors.semantic.error,
          route: "/(tabs)/notifications",
        },
        {
          label: "Privacy & Security",
          icon: Shield,
          color: neumorphicColors.primary[700],
          route:
            "https://www.privacypolicies.com/live/177285ff-e311-474c-98e4-79f73cc3ed8e",
        },
      ],
    },
    {
      title: "Support",
      items: [
        {
          label: "Help Center",
          icon: HelpCircle,
          color: neumorphicColors.semantic.info,
          route:
            "https://www.privacypolicies.com/live/177285ff-e311-474c-98e4-79f73cc3ed8e#contact-us",
        },
      ],
    },
  ];

  // Add admin section if user is admin
  const menuSections =
    user?.role === "admin"
      ? [
          {
            title: "Administration",
            items: [
              {
                label: "Admin Dashboard",
                icon: Shield,
                color: neumorphicColors.semantic.error,
                route: "/admin",
              },
            ],
          },
          ...baseMenuSections,
        ]
      : user?.role === "accounts_officer"
        ? [
            {
              title: "Finance",
              items: [
                {
                  label: "Finance Dashboard",
                  icon: DollarSign,
                  color: neumorphicColors.semantic.success,
                  route: "/accounts",
                },
              ],
            },
            ...baseMenuSections,
          ]
        : baseMenuSections;

  const fetchProfileStats = useCallback(async () => {
    if (!user) {
      setStatsLoading(false);
      setStats([
        { label: "Orders", value: "0", icon: ShoppingBag },
        { label: "Score", value: "0.0", icon: Star },
        { label: "Products", value: "0", icon: Package },
      ]);
      return;
    }

    const role = user.role;
    const scoreValue = Number(user.platformScore || 0).toFixed(1);

    try {
      setStatsLoading(true);
      if (role === "admin") {
        const response = await adminService.getStatistics();
        const totalOrders = response.data?.overview?.totalOrders ?? 0;
        const totalUsers = response.data?.overview?.totalUsers ?? 0;

        setStats([
          { label: "Orders", value: String(totalOrders), icon: ShoppingBag },
          { label: "Score", value: scoreValue, icon: Star },
          { label: "Users", value: String(totalUsers), icon: User },
        ]);
        return;
      }

      const ordersResponse = await ordersService.getOrders({ page: 1, limit: 1 });
      const ordersCount = ordersResponse.data?.pagination?.total ?? 0;

      if (role === "farmer") {
        const listingsResponse = await listingsService.getMyListings();
        const productsCount = Array.isArray(listingsResponse.data)
          ? listingsResponse.data.length
          : 0;

        setStats([
          { label: "Orders", value: String(ordersCount), icon: ShoppingBag },
          { label: "Score", value: scoreValue, icon: Star },
          { label: "Products", value: String(productsCount), icon: Package },
        ]);
        return;
      }

      if (role === "transporter") {
        const deliveriesCount = (ordersResponse.data?.orders || []).filter(
          (order) =>
            order.status === "delivered" || order.status === "confirmed"
        ).length;

        setStats([
          { label: "Orders", value: String(ordersCount), icon: ShoppingBag },
          { label: "Score", value: scoreValue, icon: Star },
          { label: "Deliveries", value: String(deliveriesCount), icon: Package },
        ]);
        return;
      }

      if (role === "vendor" || role === "agro_supplier") {
        const vendorProductsResponse = await agrimallService.getVendorProducts();
        const vendorProducts = Array.isArray(vendorProductsResponse.data)
          ? vendorProductsResponse.data.length
          : Array.isArray(vendorProductsResponse.products)
          ? vendorProductsResponse.products.length
          : 0;

        setStats([
          { label: "Orders", value: String(ordersCount), icon: ShoppingBag },
          { label: "Score", value: scoreValue, icon: Star },
          { label: "Products", value: String(vendorProducts), icon: Package },
        ]);
        return;
      }

      if (role === "support_moderator") {
        const incidentsResponse = await adminService.getSecurityIncidents({
          status: "pending",
          page: 1,
          limit: 1,
        });
        const pendingCases = incidentsResponse.data?.pagination?.total ?? 0;

        setStats([
          { label: "Orders", value: String(ordersCount), icon: ShoppingBag },
          { label: "Score", value: scoreValue, icon: Star },
          { label: "Cases", value: String(pendingCases), icon: Shield },
        ]);
        return;
      }

      if (role === "buyer") {
        const agrimallOrdersResponse = await agrimallService.getOrders({
          page: 1,
          limit: 100,
        });
        const purchasesCount = Array.isArray(agrimallOrdersResponse.data)
          ? agrimallOrdersResponse.data.length
          : 0;

        setStats([
          { label: "Orders", value: String(ordersCount), icon: ShoppingBag },
          { label: "Score", value: scoreValue, icon: Star },
          { label: "Purchases", value: String(purchasesCount), icon: Package },
        ]);
        return;
      }

      setStats([
        { label: "Orders", value: String(ordersCount), icon: ShoppingBag },
        { label: "Score", value: scoreValue, icon: Star },
        { label: "Products", value: "0", icon: Package },
      ]);
    } catch (error) {
      console.error("Error loading profile stats:", error);
      setStats([
        { label: "Orders", value: "0", icon: ShoppingBag },
        { label: "Score", value: scoreValue, icon: Star },
        { label: "Products", value: "0", icon: Package },
      ]);
    } finally {
      setStatsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchProfileStats();
  }, [fetchProfileStats]);

  return (
    <NeumorphicScreen variant="profile" showLeaves={true}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Profile</Text>
          <TouchableOpacity
            onPress={() => Alert.alert("Coming soon", "Settings is coming soon.")}
          >
            <Settings size={24} color={neumorphicColors.text.secondary} />
          </TouchableOpacity>
        </View>

        {/* Profile Card */}
        <NeumorphicCard variant="elevated" style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <NeumorphicAvatar
              source={profilePhotoUri ? { uri: profilePhotoUri } : undefined}
              name={user?.fullName}
              size="xlarge"
              status="online"
              showStatus
            />
            <TouchableOpacity
              style={styles.editAvatarButton}
              onPress={handlePickProfilePhoto}
            >
              <Edit size={16} color={neumorphicColors.text.inverse} />
            </TouchableOpacity>
          </View>

          <Text style={styles.userName}>{user?.fullName || ""}</Text>
          <Text style={styles.userEmail}>{user?.email || ""}</Text>

          <NeumorphicBadge
            label={user?.role || ""}
            variant="primary"
            size="medium"
            style={styles.roleBadge}
          />

          <View style={styles.statsContainer}>
            {stats.map((stat, index) => (
              <View key={index} style={styles.statItem}>
                <View style={styles.statIconContainer}>
                  <stat.icon size={16} color={neumorphicColors.primary[600]} />
                </View>
                {statsLoading ? (
                  <>
                    <View style={styles.statValueSkeleton} />
                    <View style={styles.statLabelSkeleton} />
                  </>
                ) : (
                  <>
                    <Text style={styles.statValue}>{stat.value}</Text>
                    <Text style={styles.statLabel}>{stat.label}</Text>
                  </>
                )}
              </View>
            ))}
          </View>
        </NeumorphicCard>

        {/* Menu Sections */}
        {menuSections.map((section, sectionIndex) => (
          <View key={sectionIndex} style={styles.menuSection}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            {section.items.map((item, itemIndex) => (
              <NeumorphicCard
                key={itemIndex}
                variant="standard"
                style={styles.menuItem}
                onPress={() => {
                  if (section.title === "Account") {
                    if (item.label === "Edit Profile") {
                      if (user?.role === "buyer" || user?.role === "farmer") {
                        if (item.route) {
                          router.push(item.route as any);
                        }
                      } else {
                        Alert.alert(
                          "Not available",
                          "Edit Profile is currently available for buyers and farmers only."
                        );
                      }
                      return;
                    }

                    if (item.label === "Delete Account") {
                      if (item.route) {
                        router.push(item.route as any);
                      }
                      return;
                    }

                    Alert.alert("Coming soon", `${item.label} is coming soon.`);
                    return;
                  }

                  if (item.route?.startsWith("http")) {
                    Linking.openURL(item.route).catch(() => {
                      Alert.alert("Error", "Unable to open link right now.");
                    });
                    return;
                  }

                  if (item.route) {
                    router.push(item.route as any);
                    return;
                  }

                  console.log(`${item.label} pressed`);
                }}
                animationDelay={(sectionIndex * 3 + itemIndex) * 50}
              >
                <View style={styles.menuItemContent}>
                  <View
                    style={[
                      styles.menuIconContainer,
                      { backgroundColor: `${item.color}15` },
                    ]}
                  >
                    <item.icon size={20} color={item.color} strokeWidth={2} />
                  </View>
                  <Text style={styles.menuLabel}>{item.label}</Text>
                  <ChevronRight
                    size={20}
                    color={neumorphicColors.text.tertiary}
                  />
                </View>
              </NeumorphicCard>
            ))}
          </View>
        ))}

        {/* Logout Button */}
        <View style={styles.logoutContainer}>
          <NeumorphicButton
            title="Logout"
            variant="danger"
            onPress={handleLogout}
            icon={<LogOut size={20} color={neumorphicColors.text.inverse} />}
            fullWidth
          />
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </NeumorphicScreen>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xl,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
  },
  title: {
    ...typography.h2,
    color: neumorphicColors.text.primary,
    letterSpacing: -0.5,
  },
  profileCard: {
    marginHorizontal: spacing.xl,
    marginBottom: spacing.xl,
    alignItems: "center",
    padding: spacing.xl,
  },
  profileHeader: {
    position: "relative",
    marginBottom: spacing.lg,
  },
  editAvatarButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: borderRadius.full,
    backgroundColor: neumorphicColors.primary[600],
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: neumorphicColors.base.card,
  },
  userName: {
    ...typography.h3,
    color: neumorphicColors.text.primary,
    marginBottom: spacing.xs,
    letterSpacing: -0.3,
  },
  userEmail: {
    ...typography.body,
    color: neumorphicColors.text.secondary,
    marginBottom: spacing.md,
  },
  roleBadge: {
    marginBottom: spacing.xl,
  },
  statsContainer: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-around",
    paddingTop: spacing.xl,
    borderTopWidth: 1,
    borderTopColor: neumorphicColors.base.border,
  },
  statItem: {
    alignItems: "center",
  },
  statIconContainer: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.full,
    backgroundColor: `${neumorphicColors.primary[500]}15`,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  statValue: {
    ...typography.h4,
    color: neumorphicColors.primary[600],
    marginBottom: spacing.xs,
    letterSpacing: -0.3,
  },
  statLabel: {
    ...typography.caption,
    color: neumorphicColors.text.secondary,
    fontWeight: "500",
  },
  statValueSkeleton: {
    width: 34,
    height: 18,
    borderRadius: borderRadius.sm,
    backgroundColor: neumorphicColors.base.border,
    marginBottom: spacing.xs,
  },
  statLabelSkeleton: {
    width: 48,
    height: 12,
    borderRadius: borderRadius.sm,
    backgroundColor: neumorphicColors.base.border,
  },
  menuSection: {
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.xl,
  },
  sectionTitle: {
    ...typography.caption,
    fontWeight: "700",
    color: neumorphicColors.text.tertiary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: spacing.md,
  },
  menuItem: {
    marginBottom: spacing.sm,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
  },
  menuItemContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.md,
  },
  menuLabel: {
    flex: 1,
    ...typography.body,
    fontWeight: "600",
    color: neumorphicColors.text.primary,
  },
  logoutContainer: {
    paddingHorizontal: spacing.xl,
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  bottomPadding: {
    height: spacing.xl,
  },
});
