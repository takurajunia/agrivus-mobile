import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  SafeAreaView,
  Platform,
  Dimensions,
} from "react-native";
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
  Home,
  Wallet,
  Receipt,
} from "lucide-react-native";

// Import our textured leaf background
import {
  LeafBackground,
  BACKGROUND_COLOR,
} from "../../src/components/LeafBackground";

const { width } = Dimensions.get("window");

// --- THEME ---
const COLORS = {
  textDark: "#2D3436",
  textGray: "#95A5A6",
  shadowLight: "#FFFFFF",
  shadowDark: "#BCC5D1",
  greenGradient: ["#4CD964", "#2E7D32"] as const,
  // Specific colors for the "Dent" background
  insetDark: "#E1E4EA", // Slightly darker than main BG to look "inside"
  insetLight: "#FFFFFF",
};

// --- COMPONENT: Neumorphic Floating "Pillow" (Header Buttons) ---
const FloatPillow = ({ children, style, borderRadius = 18, onPress }: any) => {
  const Container = onPress ? TouchableOpacity : View;

  return (
    <Container
      activeOpacity={0.7}
      onPress={onPress}
      style={[styles.pillowOuter, { borderRadius }, style]}
    >
      <View style={[styles.pillowInner, { borderRadius }]}>{children}</View>
    </Container>
  );
};

// --- COMPONENT: Neumorphic "Dent" (Grid Icons) ---
const InsetDent = ({ icon: Icon, color, isOrange }: any) => (
  <View style={styles.dentContainer}>
    {/* The Hole Background */}
    <View style={styles.dentBackground}>
      {/* Colored Glow "emitting" from the hole */}
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

      {/* The Icon sitting deep in the hole */}
      <Icon size={26} color={color} strokeWidth={2.5} />
    </View>

    {/* Inner Shadow Simulation (Borders) */}
    {/* Top/Left is Dark (Shadow cast by top edge) */}
    <View style={styles.dentShadowTop} />
    {/* Bottom/Right is Light (Light hitting bottom edge) */}
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
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1500);
  };

  return (
    <View style={styles.container}>
      <LeafBackground />

      <SafeAreaView style={styles.safeArea}>
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
          {/* ================= TOP NAVBAR ================= */}
          <View style={styles.headerContainer}>
            {/* 1. LEFT ISLAND: Profile Pill */}
            <FloatPillow
              style={styles.profilePill}
              borderRadius={30}
              onPress={() => router.push("/(tabs)/profile")}
            >
              <View style={styles.profileContent}>
                {/* Convex Avatar */}
                <View style={styles.avatarWrapper}>
                  <LinearGradient
                    colors={COLORS.greenGradient}
                    style={styles.avatarGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <Text style={styles.avatarText}>SD</Text>
                  </LinearGradient>
                  {/* Internal shadow ring to create dome effect */}
                  <View style={styles.avatarInnerShadow} />
                </View>

                <View style={styles.greetingStack}>
                  <Text style={styles.greetingLight}>Good day,</Text>
                  <Text style={styles.greetingBold}>Sam</Text>
                </View>
              </View>
            </FloatPillow>

            {/* 2. RIGHT ISLANDS: Utility Squares */}
            <View style={styles.utilityRow}>
              {/* Notification Bell */}
              <FloatPillow
                style={styles.utilityButton}
                onPress={() => router.push("/(tabs)/notifications")}
              >
                <Bell size={24} color="#555" strokeWidth={2} />
              </FloatPillow>

              {/* Chat Bubble */}
              <FloatPillow
                style={styles.utilityButton}
                onPress={() => router.push("/(tabs)/chat")}
              >
                <MessageSquare size={24} color="#555" strokeWidth={2} />
              </FloatPillow>
            </View>
          </View>

          {/* --- Secondary Nav (Pills) --- */}
          <View style={styles.pillsRow}>
            {["Auctions", "AgriMall", "Export"].map((item) => (
              <TouchableOpacity
                key={item}
                style={styles.pillButton}
                onPress={() => {
                  if (item === "Auctions") router.push("/(tabs)/auctions");
                  if (item === "AgriMall") router.push("/agrimall");
                  if (item === "Export") router.push("/export-gateway");
                }}
              >
                <Text style={styles.pillText}>{item}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* --- CTA Banner --- */}
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

          {/* --- Stats Grid --- */}
          <View style={styles.gridContainer}>
            <View style={styles.gridRow}>
              {/* Card 1: Active Orders */}
              <View style={styles.statCard}>
                <View style={styles.statHeader}>
                  <InsetDent icon={ShoppingCart} color="#4CD964" />
                </View>
                <Text style={styles.statLabel}>Active Orders</Text>
                <Text style={styles.statMain}>0</Text>
                <Text style={styles.statSub}>– 0%</Text>
              </View>

              {/* Card 2: Revenue */}
              <View style={styles.statCard}>
                <View style={styles.statHeader}>
                  <InsetDent icon={DollarSign} color="#4CD964" />
                </View>
                <Text style={styles.statLabel}>Revenue</Text>
                <Text style={styles.statMain}>$0.00</Text>
                <Text style={styles.statSub}>– 0%</Text>
              </View>
            </View>

            <View style={styles.gridRow}>
              {/* Card 3: Live Auctions (Orange) */}
              <View style={styles.statCard}>
                <View style={styles.statHeader}>
                  <InsetDent icon={Gavel} color="#FF9800" isOrange />
                </View>
                <Text style={styles.statLabel}>Live Auctions</Text>
                <Text style={styles.statMain}>0</Text>
                <Text style={styles.statSub}>– 0%</Text>
              </View>

              {/* Card 4: Products */}
              <View style={styles.statCard}>
                <View style={styles.statHeader}>
                  <InsetDent icon={Package} color="#4CD964" />
                </View>
                <Text style={styles.statLabel}>Products</Text>
                <Text style={styles.statMain}>2</Text>
                <Text style={styles.statSub}>– 0%</Text>
              </View>
            </View>
          </View>

          {/* --- Quick Actions --- */}
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
                  onPress={() => router.push("/my-listings")}
                >
                  <View style={styles.qaInactiveIcon}>
                    <FileText size={22} color="#7F8C8D" />
                  </View>
                  <Text style={styles.qaLabel}>My Listings</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.qaItem}
                  onPress={() => router.push("/agrimall")}
                >
                  <View style={styles.qaInactiveIcon}>
                    <Store size={22} color="#7F8C8D" />
                  </View>
                  <Text style={styles.qaLabel}>AgriMall</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.qaItem}
                  onPress={() => router.push("/export-gateway")}
                >
                  <View style={styles.qaInactiveIcon}>
                    <Upload size={22} color="#7F8C8D" />
                  </View>
                  <Text style={styles.qaLabel}>Export</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <View style={{ height: 100 }} />
        </ScrollView>
      </SafeAreaView>

      {/* --- Bottom Nav Placeholder --- */}
      <View style={styles.bottomNavContainer}>
        <View style={styles.bottomNav}>
          <View style={styles.navItemActive}>
            <Home size={24} color="#FFF" />
          </View>
          <Store size={24} color="#95A5A6" />
          <Wallet size={24} color="#95A5A6" />
          <Receipt size={24} color="#95A5A6" />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1, paddingTop: Platform.OS === "android" ? 40 : 0 },
  scrollContent: { paddingBottom: 100 },

  // --- Header "Pillows" ---
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
    height: 68,
  },
  profileContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  avatarWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 4,
  },
  avatarGradient: {
    flex: 1,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarInnerShadow: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.25)",
  },
  avatarText: { color: "#FFF", fontSize: 18, fontWeight: "700" },
  greetingStack: { justifyContent: "center" },
  greetingLight: {
    fontSize: 13,
    color: COLORS.textGray,
    fontWeight: "500",
    marginBottom: 2,
  },
  greetingBold: { fontSize: 20, color: COLORS.textDark, fontWeight: "800" },

  // Utility Buttons
  utilityRow: { flexDirection: "row", gap: 14 },
  utilityButton: {
    width: 54,
    height: 54,
    alignItems: "center",
    justifyContent: "center",
  },

  // --- Shared Pillow Style ---
  pillowOuter: {
    backgroundColor: BACKGROUND_COLOR,
    // Drop Shadow (Bottom Right)
    shadowColor: COLORS.shadowDark,
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 8,
  },
  pillowInner: {
    flex: 1,
    backgroundColor: BACKGROUND_COLOR,
    // Highlight (Top Left)
    borderTopWidth: 1.5,
    borderLeftWidth: 1.5,
    borderColor: "rgba(255,255,255, 0.9)",
    borderBottomWidth: 0,
    borderRightWidth: 0,
    overflow: "hidden",
  },

  // --- "Dent" Styles (Grid Icons) ---
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
    backgroundColor: COLORS.insetDark, // Darker "Hole" color
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
    elevation: 0, // Glow handles opacity
  },
  dentShadowTop: {
    // Simulates shadow cast by the top-left edge of the hole onto the floor
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 26,
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderColor: "rgba(0,0,0, 0.08)", // Soft dark shadow
  },
  dentHighlightBottom: {
    // Simulates light hitting the bottom-right edge of the hole
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 26,
    borderBottomWidth: 2,
    borderRightWidth: 2,
    borderColor: "rgba(255,255,255, 0.7)", // Bright highlight
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

  bottomNavContainer: {
    position: "absolute",
    bottom: 30,
    left: 24,
    right: 24,
    alignItems: "center",
  },
  bottomNav: {
    flexDirection: "row",
    backgroundColor: "#F0F0F3",
    paddingVertical: 18,
    paddingHorizontal: 30,
    borderRadius: 35,
    width: "100%",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: COLORS.shadowDark,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
    borderTopWidth: 1,
    borderColor: "rgba(255,255,255,0.5)",
  },
  navItemActive: {
    width: 48,
    height: 48,
    borderRadius: 18,
    backgroundColor: "#4CD964",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#4CD964",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
});
