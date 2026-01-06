import { Tabs } from "expo-router";
import { useEffect } from "react";
import { useRouter } from "expo-router";
import { useAuth } from "../../src/contexts/AuthContext";
import {
  Home,
  ShoppingBag,
  MessageCircle,
  User,
  Bell,
  Store,
  Gavel,
  Wallet,
} from "lucide-react-native";
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
          paddingBottom: spacing.sm,
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
          fontSize: 10,
          fontWeight: "600",
          marginTop: 2,
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
        name="auctions"
        options={{
          title: "Auctions",
          tabBarIcon: ({ size, color, focused }) => (
            <Gavel size={size} color={color} strokeWidth={focused ? 2.5 : 2} />
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
      <Tabs.Screen
        name="chat"
        options={{
          title: "Chat",
          tabBarIcon: ({ size, color, focused }) => (
            <MessageCircle
              size={size}
              color={color}
              strokeWidth={focused ? 2.5 : 2}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: "Alerts",
          tabBarIcon: ({ size, color, focused }) => (
            <Bell size={size} color={color} strokeWidth={focused ? 2.5 : 2} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ size, color, focused }) => (
            <User size={size} color={color} strokeWidth={focused ? 2.5 : 2} />
          ),
        }}
      />
    </Tabs>
  );
}
