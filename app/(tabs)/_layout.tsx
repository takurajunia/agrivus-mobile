import { Tabs } from "expo-router";
import { useAuth } from "../../src/contexts/AuthContext";
import { Home, ShoppingBag, Store, Wallet } from "lucide-react-native";
import {
  neumorphicColors,
  spacing,
  borderRadius as neumorphicBorderRadius,
} from "../../src/theme/neumorphic";
import LoadingSpinner from "../../src/components/LoadingSpinner";
import { View, Text, StyleSheet, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function TabLayout() {
  const { isAuthenticated, loading } = useAuth();
  const insets = useSafeAreaInsets();

  // Calculate bottom padding - ensure tabs don't fall under navigation buttons
  const bottomPadding = Math.max(
    insets.bottom,
    Platform.OS === "android" ? 10 : 0
  );

  // Show loading while auth state is being determined
  if (loading) {
    return <LoadingSpinner />;
  }

  // If not authenticated, show nothing - the root layout will handle navigation
  // This prevents infinite redirect loops
  if (!isAuthenticated) {
    return (
      <View style={styles.container}>
        <LoadingSpinner />
        <Text style={styles.text}>Redirecting...</Text>
      </View>
    );
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: neumorphicColors.primary[600],
        tabBarInactiveTintColor: neumorphicColors.text.tertiary,
        tabBarStyle: {
          backgroundColor: neumorphicColors.base.card,
          borderTopWidth: 0,
          paddingTop: spacing.sm,
          paddingBottom: bottomPadding + spacing.sm,
          height: 60 + bottomPadding,
          // Neumorphic shadow
          shadowColor: neumorphicColors.base.shadowDark,
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.15,
          shadowRadius: 8,
          elevation: 10,
          borderTopLeftRadius: neumorphicBorderRadius.xl,
          borderTopRightRadius: neumorphicBorderRadius.xl,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
          marginTop: 4,
        },
        tabBarItemStyle: {
          paddingVertical: spacing.xs,
        },
        tabBarActiveBackgroundColor: `${neumorphicColors.primary[500]}15`,
        tabBarIconStyle: {
          marginTop: 2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ size, color, focused }) => (
            <Home size={size} color={color} strokeWidth={focused ? 2.5 : 2} />
          ),
        }}
      />
      <Tabs.Screen
        name="marketplace"
        options={{
          title: "Market",
          tabBarIcon: ({ size, color, focused }) => (
            <Store size={size} color={color} strokeWidth={focused ? 2.5 : 2} />
          ),
        }}
      />
      <Tabs.Screen
        name="wallet"
        options={{
          title: "Wallet",
          tabBarIcon: ({ size, color, focused }) => (
            <Wallet size={size} color={color} strokeWidth={focused ? 2.5 : 2} />
          ),
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: "Orders",
          tabBarIcon: ({ size, color, focused }) => (
            <ShoppingBag
              size={size}
              color={color}
              strokeWidth={focused ? 2.5 : 2}
            />
          ),
        }}
      />

      {/* Hidden tabs - accessible via TopNavBar */}
      <Tabs.Screen
        name="auctions"
        options={{
          href: null, // Hide from tab bar
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          href: null, // Hide from tab bar
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          href: null, // Hide from tab bar
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          href: null, // Hide from tab bar
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: neumorphicColors.base.background,
  },
  text: {
    marginTop: 16,
    color: neumorphicColors.text.secondary,
    fontSize: 14,
  },
});
