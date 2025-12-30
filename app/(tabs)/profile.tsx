import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
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
} from "lucide-react-native";
import AnimatedCard from "../../src/components/AnimatedCard";
import GlassCard from "../../src/components/GlassCard";
import AnimatedButton from "../../src/components/AnimatedButton";
import { theme } from "../../src/theme/tokens";

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.replace("/");
  };

  const menuSections = [
    {
      title: "Account",
      items: [
        { label: "Edit Profile", icon: Edit, color: theme.colors.success },
        { label: "Account Settings", icon: Settings, color: theme.colors.info },
        {
          label: "Verification Badge",
          icon: Award,
          color: theme.colors.warning,
        },
      ],
    },
    {
      title: "Preferences",
      items: [
        {
          label: "Payment Methods",
          icon: CreditCard,
          color: theme.colors.secondary[600],
        },
        { label: "Notifications", icon: Bell, color: theme.colors.error },
        {
          label: "Privacy & Security",
          icon: Shield,
          color: theme.colors.primary[700],
        },
      ],
    },
    {
      title: "Support",
      items: [
        { label: "Help Center", icon: HelpCircle, color: theme.colors.info },
      ],
    },
  ];

  const stats = [
    { label: "Orders", value: "156" },
    { label: "Rating", value: "4.8" },
    { label: "Products", value: "24" },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Profile</Text>
        </View>

        <GlassCard style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <User
                size={40}
                color={theme.colors.primary[600]}
                strokeWidth={2}
              />
            </View>
            <AnimatedButton
              title="Edit"
              variant="primary"
              size="sm"
              style={styles.editAvatarButton}
              onPress={() => console.log("Edit avatar pressed")}
            >
              <Edit size={16} color={theme.colors.text.inverse} />
            </AnimatedButton>
          </View>

          <Text style={styles.userName}>{user?.name || "Demo User"}</Text>
          <Text style={styles.userEmail}>
            {user?.email || "demo@agrivus.com"}
          </Text>

          <View style={styles.statsContainer}>
            {stats.map((stat, index) => (
              <View key={index} style={styles.statItem}>
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>
        </GlassCard>

        {menuSections.map((section, sectionIndex) => (
          <View key={sectionIndex} style={styles.menuSection}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            {section.items.map((item, itemIndex) => (
              <AnimatedCard
                key={itemIndex}
                style={styles.menuItem}
                delay={(sectionIndex * 3 + itemIndex) * 50}
                onPress={() => console.log(`${item.label} pressed`)}
              >
                <View
                  style={[
                    styles.menuIconContainer,
                    { backgroundColor: `${item.color}20` },
                  ]}
                >
                  <item.icon size={20} color={item.color} strokeWidth={2} />
                </View>
                <Text style={styles.menuLabel}>{item.label}</Text>
                <ChevronRight size={20} color={theme.colors.text.tertiary} />
              </AnimatedCard>
            ))}
          </View>
        ))}

        <AnimatedButton
          title="Logout"
          variant="danger"
          size="lg"
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <LogOut size={20} color={theme.colors.error} strokeWidth={2} />
        </AnimatedButton>

        <Text style={styles.version}>Version 1.0.0</Text>
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
  scrollView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.lg,
  },
  title: {
    fontSize: theme.typography.fontSize["4xl"],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    letterSpacing: -0.5,
  },
  profileCard: {
    marginHorizontal: theme.spacing.xl,
    marginBottom: theme.spacing.xl,
    alignItems: "center",
  },
  avatarContainer: {
    position: "relative",
    marginBottom: theme.spacing.lg,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.primary[50],
    justifyContent: "center",
    alignItems: "center",
  },
  editAvatarButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: theme.borderRadius.full,
    borderWidth: 3,
    borderColor: theme.colors.background.primary,
  },
  userName: {
    fontSize: theme.typography.fontSize["2xl"],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
    letterSpacing: -0.3,
  },
  userEmail: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xl,
  },
  statsContainer: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-around",
    paddingTop: theme.spacing.xl,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.light,
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    fontSize: theme.typography.fontSize["2xl"],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.primary[600],
    marginBottom: theme.spacing.xs,
    letterSpacing: -0.3,
  },
  statLabel: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    fontWeight: theme.typography.fontWeight.medium,
  },
  menuSection: {
    marginBottom: theme.spacing.xl,
    paddingHorizontal: theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.tertiary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: theme.spacing.md,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: theme.spacing.sm,
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.full,
    justifyContent: "center",
    alignItems: "center",
    marginRight: theme.spacing.md,
  },
  menuLabel: {
    flex: 1,
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
  },
  logoutButton: {
    marginHorizontal: theme.spacing.xl,
    marginBottom: theme.spacing.lg,
  },
  version: {
    textAlign: "center",
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.tertiary,
    marginBottom: theme.spacing.lg,
  },
  bottomPadding: {
    height: theme.spacing.xl,
  },
});
