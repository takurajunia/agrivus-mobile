import React, { useState } from "react";
import {
  StyleSheet,
  ScrollView,
  View,
  Text,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

// Theme & Colors
import { neumorphicColors } from "../theme/neumorphic";

// Neumorphic Components
import {
  NeumorphicView,
  NeumorphicSearchBar,
  NeumorphicStatCard,
  NeumorphicCard,
  NeumorphicButton,
  NeumorphicAvatar,
} from "../components/neumorphic";

// Fallback/Standard Components
import Header from "../components/Header";

const { width } = Dimensions.get("window");

const DashboardScreen = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  // Mock data - Replace with your actual data hooks
  const stats = [
    { label: "Total Revenue", value: "$12,450", icon: "dollar-sign" },
    { label: "Active Orders", value: "24", icon: "box" },
  ];

  const recentListings = [
    { id: "1", title: "Organic Maize", price: "$150/ton", status: "Active" },
    {
      id: "2",
      title: "Premium Soybeans",
      price: "$400/ton",
      status: "Pending",
    },
    { id: "3", title: "Fertilizer Batch A", price: "$80/bag", status: "Sold" },
  ];

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header Section */}
        <View style={styles.headerContainer}>
          <View>
            <Text style={styles.greetingText}>Welcome back,</Text>
            <Text style={styles.userNameText}>Takura</Text>
          </View>
          <TouchableOpacity onPress={() => router.push("/(tabs)/profile")}>
            <NeumorphicAvatar size="large" />
            {/* If NeumorphicAvatar requires an image source, add source={{ uri: '...' }} */}
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <NeumorphicSearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search listings, orders..."
          />
        </View>

        {/* Stats Grid */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Overview</Text>
          <View style={styles.statsGrid}>
            {stats.map((stat, index) => (
              <View key={index} style={styles.statWrapper}>
                <NeumorphicStatCard
                  title={stat.label}
                  value={stat.value}
                  // Add specific styling props if your component supports them
                />
              </View>
            ))}
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionRow}>
            <NeumorphicButton
              onPress={() => router.push("/create-listing")}
              title="New Listing"
              variant="primary"
              style={{ flex: 1, marginRight: 10 }}
            />
            <NeumorphicButton
              onPress={() => router.push("/(tabs)/wallet")}
              title="Wallet"
              variant="secondary"
              style={{ flex: 1, marginLeft: 10 }}
            />
          </View>
        </View>

        {/* Recent Listings */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Recent Listings</Text>
            <TouchableOpacity onPress={() => router.push("/my-listings")}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>

          {recentListings.map((item) => (
            <NeumorphicCard key={item.id} style={styles.listingCard}>
              <View style={styles.listingRow}>
                <View style={styles.listingInfo}>
                  <Text style={styles.listingTitle}>{item.title}</Text>
                  <Text style={styles.listingPrice}>{item.price}</Text>
                </View>
                <View
                  style={[
                    styles.statusBadge,
                    item.status === "Active"
                      ? styles.statusActive
                      : styles.statusInactive,
                  ]}
                >
                  <Text style={styles.statusText}>{item.status}</Text>
                </View>
              </View>
            </NeumorphicCard>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: neumorphicColors.base.background,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 10,
    marginBottom: 24,
  },
  greetingText: {
    fontSize: 16,
    color: neumorphicColors.text.secondary,
    fontWeight: "500",
  },
  userNameText: {
    fontSize: 24,
    color: neumorphicColors.text.primary,
    fontWeight: "700",
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionContainer: {
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: neumorphicColors.text.primary,
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 16,
  },
  statWrapper: {
    flex: 1,
  },
  actionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  seeAllText: {
    fontSize: 14,
    color: neumorphicColors.primary[600],
    fontWeight: "600",
  },
  listingCard: {
    marginBottom: 16,
    padding: 16,
  },
  listingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  listingInfo: {
    flex: 1,
  },
  listingTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: neumorphicColors.text.primary,
    marginBottom: 4,
  },
  listingPrice: {
    fontSize: 14,
    color: neumorphicColors.text.secondary,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusActive: {
    backgroundColor: "rgba(72, 187, 120, 0.2)",
  },
  statusInactive: {
    backgroundColor: "rgba(160, 174, 192, 0.2)",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    color: neumorphicColors.text.primary,
  },
});

export default DashboardScreen;
