import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../../src/contexts/AuthContext";
import {
  User,
  Settings,
  CreditCard,
  Bell,
  Shield,
  HelpCircle,
  LogOut,
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

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    // Just call logout - AuthNavigator will handle the redirect
    logout();
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
      ],
    },
    {
      title: "Preferences",
      items: [
        {
          label: "Payment Methods",
          icon: CreditCard,
          color: neumorphicColors.secondary[600],
          route: "/payment-methods",
        },
        {
          label: "Notifications",
          icon: Bell,
          color: neumorphicColors.semantic.error,
          route: "/notifications-settings",
        },
        {
          label: "Privacy & Security",
          icon: Shield,
          color: neumorphicColors.primary[700],
          route: "/privacy-security",
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
          route: "/help",
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
      : baseMenuSections;

  const stats = [
    { label: "Orders", value: "156", icon: ShoppingBag },
    { label: "Rating", value: "4.8", icon: Star },
    { label: "Products", value: "24", icon: Package },
  ];

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
          <TouchableOpacity onPress={() => router.push("/settings" as any)}>
            <Settings size={24} color={neumorphicColors.text.secondary} />
          </TouchableOpacity>
        </View>

        {/* Profile Card */}
        <NeumorphicCard variant="elevated" style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <NeumorphicAvatar
              name={user?.fullName}
              size="xlarge"
              status="online"
              showStatus
            />
            <TouchableOpacity style={styles.editAvatarButton}>
              <Edit size={16} color={neumorphicColors.text.inverse} />
            </TouchableOpacity>
          </View>

          <Text style={styles.userName}>{user?.fullName || "Demo User"}</Text>
          <Text style={styles.userEmail}>
            {user?.email || "demo@agrivus.com"}
          </Text>

          <NeumorphicBadge
            label={user?.role || "Farmer"}
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
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
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
                onPress={() =>
                  item.route
                    ? router.push(item.route as any)
                    : console.log(`${item.label} pressed`)
                }
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
