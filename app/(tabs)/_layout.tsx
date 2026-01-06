import { Tabs } from "expo-router";
import { useEffect } from "react";
import { useRouter } from "expo-router";
import { useAuth } from "../../src/contexts/AuthContext";
import { Home, ShoppingBag, Store, Wallet } from "lucide-react-native";
import {
  neumorphicColors,
  spacing,
  borderRadius as neumorphicBorderRadius,
} from "../../src/theme/neumorphic";
import LoadingSpinner from "../../src/components/LoadingSpinner";

export default function TabLayout() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace("/");
    }
  }, [isAuthenticated, loading, router]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return null; // Will redirect in useEffect
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
          paddingBottom: spacing.md,
          height: 70,
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
