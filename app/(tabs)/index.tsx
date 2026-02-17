import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Platform,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import {
  Package,
  DollarSign,
  Gavel,
  ShoppingCart,
  Store,
  Upload,
  FileText,
  Bell,
  MessageSquare,
  Tag,
  Sparkles,
  Users,
  Shield,
  BarChart3,
  Settings,
  TrendingUp,
  AlertTriangle,
} from "lucide-react-native";

// Import our textured leaf background
import {
  LeafBackground,
  BACKGROUND_COLOR,
} from "../../src/components/LeafBackground";
import { useAuth } from "../../src/contexts/AuthContext";

const { width } = Dimensions.get("window");

// --- THEME ---
const COLORS = {
  textDark: "#2D3436",
  textGray: "#95A5A6",
  iconGrey: "#718096", // New Cool Grey for header icons
  shadowLight: "#FFFFFF",
  shadowDark: "#A3B1C6",
  greenGradient: ["#4CD964", "#2E7D32"] as const,
  insetDark: "#E1E4EA",
  insetLight: "#FFFFFF",
};

// --- COMPONENT: The "Marshmallow" Squaricle (Header Buttons) ---
// Updated to accept contentStyle for custom alignment
const FloatPillow = ({
  children,
  style,
  contentStyle,
  borderRadius = 20,
  onPress,
}: any) => {
  const Container = onPress ? TouchableOpacity : View;

  return (
    <Container
      activeOpacity={0.7}
      onPress={onPress}
      style={[styles.pillowOuter, { borderRadius }, style]}
    >
      <View style={[styles.pillowInner, { borderRadius }, contentStyle]}>
        {children}
      </View>
    </Container>
  );
};

// --- COMPONENT: Neumorphic "Dent" (Grid Icons) ---
const InsetDent = ({ icon: Icon, color, isOrange }: any) => (
  <View style={styles.dentContainer}>
    <View style={styles.dentBackground}>
      <View
        style={[
          styles.dentGlow,
          {
            backgroundColor: color,
            shadowColor: color,
            opacity: isOrange ? 0.15 : 0.12,
          },
        ]}
      />
      <Icon size={26} color={color} strokeWidth={2.5} />
    </View>
    <View style={styles.dentShadowTop} />
    <View style={styles.dentHighlightBottom} />
  </View>
);

const WaveLines = () => (
  <View style={StyleSheet.absoluteFill} pointerEvents="none">
    <View
      style={[
        styles.wave,
        { top: 20, left: -20, width: 300, height: 300, borderRadius: 150 },
      ]}
    />
    <View
      style={[
        styles.wave,
        {
          top: 40,
          left: -10,
          width: 300,
          height: 300,
          borderRadius: 150,
          opacity: 0.1,
        },
      ]}
    />
  </View>
);

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const canAccessExport = user?.role === "farmer" || user?.role === "admin";
  const isBuyer = user?.role === "buyer";
  const isAdmin = user?.role === "admin";
  const boostMultiplier = user?.boostMultiplier
    ? parseFloat(user.boostMultiplier)
    : 1;
  const [refreshing, setRefreshing] = useState(false);

  // Helper function to get user initials
  const getInitials = (fullName?: string): string => {
    if (!fullName) return "U";
    const names = fullName.trim().split(" ");
    return names.map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  };

  // Helper function to get first name
  const getFirstName = (fullName?: string): string => {
    if (!fullName) return "Guest";
    return fullName.trim().split(" ")[0];
  };

  const onRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1500);
  };

  return (
    <View style={styles.container}>
      <LeafBackground />

      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        {/* ================= TOP NAVBAR ================= */}
        <View style={styles.headerContainer}>
          {/* 1. LEFT ISLAND: Profile Pill */}
          <FloatPillow
            style={styles.profilePill}
            borderRadius={28}
            // Align LEFT: flex-start and extra padding
            contentStyle={{ alignItems: "flex-start", paddingLeft: 8 }}
            onPress={() => router.push("/(tabs)/profile")}
          >
            <View style={styles.profileContent}>
              <View style={styles.avatarWrapper}>
                <LinearGradient
                  colors={COLORS.greenGradient}
                  style={styles.avatarGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Text style={styles.avatarText}>{getInitials(user?.fullName)}</Text>
                </LinearGradient>
                <View style={styles.avatarInnerShadow} />
              </View>

              <View style={styles.greetingStack}>
                <Text style={styles.greetingLight}>Good day,</Text>
                <Text style={styles.greetingBold}>{getFirstName(user?.fullName)}</Text>
              </View>
            </View>
          </FloatPillow>

          {/* 2. RIGHT ISLANDS: The "Soft Tiles" */}
          <View style={styles.utilityRow}>
            {/* Notification Bell */}
            <FloatPillow
              style={styles.utilityButton}
              borderRadius={18}
              onPress={() => router.push("/(tabs)/notifications")}
            >
              {/* Thin, Grey, Hollow Bell */}
              <Bell size={24} color={COLORS.iconGrey} strokeWidth={1.8} />
            </FloatPillow>

            {/* Chat Bubble */}
            <FloatPillow
              style={styles.utilityButton}
              borderRadius={18}
              onPress={() => router.push("/(tabs)/chat")}
            >
              {/* Thin, Grey, Hollow Bubble */}
              <MessageSquare
                size={24}
                color={COLORS.iconGrey}
                strokeWidth={1.8}
              />
            </FloatPillow>
          </View>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#4CD964"
            />
          }
        >

          {/* --- Secondary Nav (Pills) --- */}
          {!isAdmin && (
            <View style={styles.pillsRow}>
              {[
                "Auctions",
                "AgriMall",
                ...(canAccessExport ? ["Export"] : []),
              ].map((item) => (
                <TouchableOpacity
                  key={item}
                  style={styles.pillButton}
                  onPress={() => {
                    if (item === "Auctions") router.push("/(tabs)/auctions");
                    if (item === "AgriMall") router.push("/(tabs)/agrimall");
                    if (item === "Export") router.push("/(tabs)/export-gateway");
                  }}
                >
                  <Text style={styles.pillText}>{item}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* --- CTA Banner --- */}
          {!isAdmin && (
            <TouchableOpacity
              activeOpacity={0.9}
              style={styles.ctaWrapper}
              onPress={() => router.push("/create-listing")}
            >
              <View style={styles.ctaShadowLayer}>
                <LinearGradient
                  colors={COLORS.greenGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.ctaGradient}
                >
                  <WaveLines />
                  <View style={styles.ctaContent}>
                    <Package
                      size={30}
                      color="#FFF"
                      style={{ marginRight: 14 }}
                      strokeWidth={2}
                    />
                    <Text style={styles.ctaText}>
                      List your products to start selling!
                    </Text>
                  </View>
                </LinearGradient>
              </View>
            </TouchableOpacity>
          )}

          {/* --- Admin CTA Banner --- */}
          {isAdmin && (
            <TouchableOpacity
              activeOpacity={0.9}
              style={styles.ctaWrapper}
              onPress={() => router.push("/admin")}
            >
              <View style={styles.ctaShadowLayer}>
                <LinearGradient
                  colors={["#667EEA", "#764BA2"] as const}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.ctaGradient}
                >
                  <WaveLines />
                  <View style={styles.ctaContent}>
                    <Shield
                      size={30}
                      color="#FFF"
                      style={{ marginRight: 14 }}
                      strokeWidth={2}
                    />
                    <Text style={styles.ctaText}>
                      View Full Admin Dashboard
                    </Text>
                  </View>
                </LinearGradient>
              </View>
            </TouchableOpacity>
          )}

          {/* --- Stats Grid --- */}
          {!isAdmin && (
            <View style={styles.gridContainer}>
              <View style={styles.gridRow}>
                {/* Card 1: Active Orders */}
                <TouchableOpacity
                  style={styles.statCard}
                  activeOpacity={0.85}
                  onPress={() => router.push("/(tabs)/orders")}
                >
                  <View style={styles.statHeader}>
                    <InsetDent icon={ShoppingCart} color="#4CD964" />
                  </View>
                  <Text style={styles.statLabel}>Active Orders</Text>
                  <Text style={styles.statMain}>0</Text>
                  <Text style={styles.statSub}>– 0%</Text>
                </TouchableOpacity>

                {/* Card 2: Boost */}
                <TouchableOpacity
                  style={styles.statCard}
                  activeOpacity={0.85}
                  onPress={() => router.push("/boost")}
                >
                  <View style={styles.statHeader}>
                    <InsetDent icon={Sparkles} color="#9C27B0" />
                  </View>
                  <Text style={styles.statLabel}>Boost</Text>
                  <Text style={styles.statMain}>
                    {boostMultiplier.toFixed(1)}x
                  </Text>
                  <Text style={styles.statSub}>Visibility</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.gridRow}>
                {/* Card 3: Live Auctions (Orange) */}
                {!isBuyer && (
                  <TouchableOpacity
                    style={styles.statCard}
                    activeOpacity={0.85}
                    onPress={() => router.push("/(tabs)/auctions")}
                  >
                    <View style={styles.statHeader}>
                      <InsetDent icon={Gavel} color="#FF9800" isOrange />
                    </View>
                    <Text style={styles.statLabel}>Live Auctions</Text>
                    <Text style={styles.statMain}>0</Text>
                    <Text style={styles.statSub}>– 0%</Text>
                  </TouchableOpacity>
                )}

                {/* Card 4: My Listings */}
                {!isBuyer && (
                  <TouchableOpacity
                    style={styles.statCard}
                    activeOpacity={0.85}
                    onPress={() => router.push("/(tabs)/my-listings")}
                  >
                    <View style={styles.statHeader}>
                      <InsetDent icon={Package} color="#4CD964" />
                    </View>
                    <Text style={styles.statLabel}>My Listings</Text>
                    <Text style={styles.statMain}>2</Text>
                    <Text style={styles.statSub}>– 0%</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}

          {/* --- Admin Stats Grid --- */}
          {isAdmin && (
            <View style={styles.gridContainer}>
              <View style={styles.gridRow}>
                {/* Card 1: Total Users */}
                <TouchableOpacity
                  style={styles.statCard}
                  activeOpacity={0.85}
                  onPress={() => router.push("/admin/users")}
                >
                  <View style={styles.statHeader}>
                    <InsetDent icon={Users} color="#667EEA" />
                  </View>
                  <Text style={styles.statLabel}>Total Users</Text>
                  <Text style={styles.statMain}>-</Text>
                  <Text style={styles.statSub}>Platform</Text>
                </TouchableOpacity>

                {/* Card 2: Platform Revenue */}
                <TouchableOpacity
                  style={styles.statCard}
                  activeOpacity={0.85}
                  onPress={() => router.push("/admin/transactions")}
                >
                  <View style={styles.statHeader}>
                    <InsetDent icon={DollarSign} color="#4CD964" />
                  </View>
                  <Text style={styles.statLabel}>Revenue</Text>
                  <Text style={styles.statMain}>-</Text>
                  <Text style={styles.statSub}>Total</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.gridRow}>
                {/* Card 3: All Orders */}
                <TouchableOpacity
                  style={styles.statCard}
                  activeOpacity={0.85}
                  onPress={() => router.push("/admin/orders")}
                >
                  <View style={styles.statHeader}>
                    <InsetDent icon={ShoppingCart} color="#FF9800" isOrange />
                  </View>
                  <Text style={styles.statLabel}>All Orders</Text>
                  <Text style={styles.statMain}>-</Text>
                  <Text style={styles.statSub}>Total</Text>
                </TouchableOpacity>

                {/* Card 4: Security */}
                <TouchableOpacity
                  style={styles.statCard}
                  activeOpacity={0.85}
                  onPress={() => router.push("/admin/security")}
                >
                  <View style={styles.statHeader}>
                    <InsetDent icon={Shield} color="#E53E3E" />
                  </View>
                  <Text style={styles.statLabel}>Security</Text>
                  <Text style={styles.statMain}>-</Text>
                  <Text style={styles.statSub}>Alerts</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* --- Quick Actions --- */}
          {!isBuyer && !isAdmin && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Quick Actions</Text>
              <View style={styles.quickActionsCard}>
                <View style={styles.qaRow}>
                  <TouchableOpacity
                    style={styles.qaItem}
                    onPress={() => router.push("/create-listing")}
                  >
                    <View style={styles.qaActiveIcon}>
                      <Tag size={22} color="#FFF" strokeWidth={2.5} />
                    </View>
                    <Text style={styles.qaLabel}>New Listing</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.qaItem}
                    onPress={() => router.push("/(tabs)/my-listings")}
                  >
                    <View style={styles.qaActiveIcon}>
                      <FileText size={22} color="#FFF" strokeWidth={2.5} />
                    </View>
                    <Text style={styles.qaLabel}>My Listings</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.qaItem}
                    onPress={() => router.push("/(tabs)/agrimall")}
                  >
                    <View style={styles.qaActiveIcon}>
                      <Store size={22} color="#FFF" strokeWidth={2.5} />
                    </View>
                    <Text style={styles.qaLabel}>AgriMall</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.qaItem}
                    onPress={() => router.push("/(tabs)/export-gateway")}
                  >
                    <View style={styles.qaActiveIcon}>
                      <Upload size={22} color="#FFF" strokeWidth={2.5} />
                    </View>
                    <Text style={styles.qaLabel}>Export</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}

          {/* --- Admin Quick Actions --- */}
          {isAdmin && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Admin Management</Text>
              <View style={styles.quickActionsCard}>
                <View style={styles.qaRow}>
                  <TouchableOpacity
                    style={styles.qaItem}
                    onPress={() => router.push("/admin/users")}
                  >
                    <View style={[styles.qaActiveIcon, { backgroundColor: "#667EEA" }]}>
                      <Users size={22} color="#FFF" strokeWidth={2.5} />
                    </View>
                    <Text style={styles.qaLabel}>Users</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.qaItem}
                    onPress={() => router.push("/admin/orders")}
                  >
                    <View style={[styles.qaActiveIcon, { backgroundColor: "#F59E0B" }]}>
                      <ShoppingCart size={22} color="#FFF" strokeWidth={2.5} />
                    </View>
                    <Text style={styles.qaLabel}>Orders</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.qaItem}
                    onPress={() => router.push("/admin/transactions")}
                  >
                    <View style={styles.qaActiveIcon}>
                      <DollarSign size={22} color="#FFF" strokeWidth={2.5} />
                    </View>
                    <Text style={styles.qaLabel}>Transactions</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.qaItem}
                    onPress={() => router.push("/admin/reports")}
                  >
                    <View style={[styles.qaActiveIcon, { backgroundColor: "#8B5CF6" }]}>
                      <BarChart3 size={22} color="#FFF" strokeWidth={2.5} />
                    </View>
                    <Text style={styles.qaLabel}>Reports</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}

          {/* --- Special Features --- */}
          {!isAdmin && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Special Features</Text>
              <View style={styles.quickActionsCard}>
                <View style={[styles.qaRow, { justifyContent: "flex-start" }]}>
                  <TouchableOpacity
                    style={styles.qaItem}
                    onPress={() => router.push("/recommendations")}
                  >
                    <View
                      style={[
                        styles.qaActiveIcon,
                        { backgroundColor: "#9C27B0" },
                      ]}
                    >
                      <Sparkles size={22} color="#FFF" strokeWidth={2.5} />
                    </View>
                    <Text style={styles.qaLabel}>AI Insights</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}

          {/* --- Admin System Monitoring --- */}
          {isAdmin && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>System Monitoring</Text>
              <View style={styles.quickActionsCard}>
                <View style={[styles.qaRow, { justifyContent: "flex-start" }]}>
                  <TouchableOpacity
                    style={styles.qaItem}
                    onPress={() => router.push("/admin/security")}
                  >
                    <View
                      style={[
                        styles.qaActiveIcon,
                        { backgroundColor: "#E53E3E" },
                      ]}
                    >
                      <Shield size={22} color="#FFF" strokeWidth={2.5} />
                    </View>
                    <Text style={styles.qaLabel}>Security</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.qaItem}
                    onPress={() => router.push("/admin/reports")}
                  >
                    <View
                      style={[
                        styles.qaActiveIcon,
                        { backgroundColor: "#059669" },
                      ]}
                    >
                      <TrendingUp size={22} color="#FFF" strokeWidth={2.5} />
                    </View>
                    <Text style={styles.qaLabel}>Analytics</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.qaItem}
                    onPress={() => router.push("/admin")}
                  >
                    <View
                      style={[
                        styles.qaActiveIcon,
                        { backgroundColor: "#6366F1" },
                      ]}
                    >
                      <Settings size={22} color="#FFF" strokeWidth={2.5} />
                    </View>
                    <Text style={styles.qaLabel}>Settings</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}

          {/* --- Recent Activity --- */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            <FloatPillow style={styles.activityCard} borderRadius={24}>
              <View style={styles.activityRow}>
                <View style={styles.activityIconBox}>
                  <View style={styles.activityGlow} />
                  {!isAdmin ? (
                    <Bell
                      size={24}
                      color={COLORS.greenGradient[1]}
                      strokeWidth={2.5}
                    />
                  ) : (
                    <AlertTriangle
                      size={24}
                      color="#667EEA"
                      strokeWidth={2.5}
                    />
                  )}
                </View>

                <View style={styles.activityContent}>
                  <Text style={styles.activityTitle}>
                    {!isAdmin ? "New Order Received!" : "Platform Activity"}
                  </Text>
                  <Text style={styles.activitySub}>
                    {!isAdmin
                      ? "You have a new order to process."
                      : "Monitor all platform activities from here."}
                  </Text>
                </View>

                <View style={styles.pressedBadge}>
                  <Text style={styles.pressedText}>{!isAdmin ? "New" : "Admin"}</Text>
                </View>
              </View>
            </FloatPillow>
          </View>

          <View style={{ height: 100 }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  scrollContent: { paddingBottom: 100 },

  // --- Header ---
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 15,
    marginBottom: 10,
  },

  // Profile Pill
  profilePill: {
    flex: 1,
    marginRight: 20,
    height: 60,
  },
  profileContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 6,
    height: "100%",
  },
  avatarWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 4,
  },
  avatarGradient: {
    flex: 1,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarInnerShadow: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.25)",
  },
  avatarText: { color: "#FFF", fontSize: 16, fontWeight: "700" },
  greetingStack: { justifyContent: "center" },
  greetingLight: {
    fontSize: 12,
    color: COLORS.textGray,
    fontWeight: "500",
    marginBottom: 1,
  },
  greetingBold: { fontSize: 18, color: COLORS.textDark, fontWeight: "800" },

  // Utility Buttons
  utilityRow: { flexDirection: "row", gap: 14 },
  utilityButton: {
    width: 52,
    height: 52,
    alignItems: "center",
    justifyContent: "center",
  },

  // --- Shared Pillow Style ---
  pillowOuter: {
    backgroundColor: BACKGROUND_COLOR,
    // Drop Shadow (Bottom Right)
    shadowColor: COLORS.shadowDark,
    shadowOffset: { width: 8, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  pillowInner: {
    flex: 1,
    backgroundColor: BACKGROUND_COLOR,
    alignItems: "center", // Default center
    justifyContent: "center", // Default center
    // Highlight (Top Left)
    borderTopWidth: 1.2,
    borderLeftWidth: 1.2,
    borderColor: "#FFFFFF",
    borderBottomWidth: 0,
    borderRightWidth: 0,
    overflow: "hidden",
  },

  // --- Dent Styles ---
  dentContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
  },
  dentBackground: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: COLORS.insetDark,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    position: "absolute",
  },
  dentGlow: {
    position: "absolute",
    width: 40,
    height: 40,
    borderRadius: 20,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 15,
    shadowOpacity: 1,
    elevation: 0,
  },
  dentShadowTop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 26,
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderColor: "rgba(0,0,0, 0.08)",
  },
  dentHighlightBottom: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 26,
    borderBottomWidth: 2,
    borderRightWidth: 2,
    borderColor: "rgba(255,255,255, 0.7)",
  },

  // --- Rest of Styles ---
  pillsRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 12,
    marginBottom: 28,
    paddingHorizontal: 24,
  },
  pillButton: {
    flex: 1,
    paddingVertical: 14,
    backgroundColor: "#F0F0F3",
    borderRadius: 25,
    alignItems: "center",
    shadowColor: COLORS.shadowDark,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderColor: "rgba(255,255,255,0.8)",
  },
  pillText: { fontSize: 14, fontWeight: "600", color: "#2D3436" },

  ctaWrapper: { marginHorizontal: 24, marginBottom: 30 },
  ctaShadowLayer: {
    borderRadius: 24,
    shadowColor: "#4CD964",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
    elevation: 10,
    backgroundColor: "#F0F0F3",
  },
  ctaGradient: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 24,
    paddingHorizontal: 24,
    borderRadius: 24,
    overflow: "hidden",
  },
  ctaContent: { flexDirection: "row", alignItems: "center" },
  ctaText: { color: "#FFF", fontSize: 16, fontWeight: "700" },
  wave: {
    position: "absolute",
    borderWidth: 30,
    borderColor: "rgba(255,255,255,0.08)",
  },

  gridContainer: { paddingHorizontal: 24, gap: 20, marginBottom: 30 },
  gridRow: { flexDirection: "row", gap: 20 },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 24,
    backgroundColor: "#F0F0F3",
    shadowColor: COLORS.shadowDark,
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderColor: "rgba(255,255,255,0.9)",
  },
  statHeader: { marginBottom: 16 },
  statLabel: {
    fontSize: 13,
    color: "#95A5A6",
    marginBottom: 6,
    fontWeight: "500",
  },
  statMain: {
    fontSize: 22,
    fontWeight: "800",
    color: "#2D3436",
    marginBottom: 2,
  },
  statSub: { fontSize: 12, color: "#BDC3C7" },

  section: { paddingHorizontal: 24, marginBottom: 24 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#2D3436",
    marginBottom: 16,
  },
  quickActionsCard: {
    padding: 24,
    borderRadius: 24,
    backgroundColor: "#F0F0F3",
    shadowColor: COLORS.shadowDark,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderColor: "rgba(255,255,255,0.9)",
  },
  qaRow: { flexDirection: "row", justifyContent: "space-between" },
  qaItem: { alignItems: "center", width: 70 },
  qaActiveIcon: {
    width: 56,
    height: 56,
    borderRadius: 20,
    backgroundColor: "#4CD964",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
    shadowColor: "#4CD964",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  qaInactiveIcon: {
    width: 56,
    height: 56,
    borderRadius: 20,
    backgroundColor: "#F0F0F3",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
    shadowColor: COLORS.shadowDark,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderColor: "#FFF",
  },
  qaLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "#2D3436",
    textAlign: "center",
  },

  // Recent Activity Styles
  activityCard: {
    padding: 20,
    width: "100%",
  },
  activityRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  activityIconBox: {
    width: 50,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
    position: "relative",
  },
  activityGlow: {
    position: "absolute",
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#4CD964",
    opacity: 0.2,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.textDark,
    marginBottom: 4,
  },
  activitySub: {
    fontSize: 12,
    color: COLORS.textGray,
  },
  pressedBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: COLORS.insetDark,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.5)",
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderTopColor: "rgba(0,0,0,0.05)",
    borderLeftColor: "rgba(0,0,0,0.05)",
  },
  pressedText: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.textGray,
  },
});
