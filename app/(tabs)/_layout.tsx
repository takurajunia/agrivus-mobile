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
} from "lucide-react-native";
import { theme } from "../../src/theme/tokens";
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
        tabBarActiveTintColor: theme.colors.primary[600],
        tabBarInactiveTintColor: theme.colors.text.tertiary,
        tabBarStyle: {
          backgroundColor: theme.colors.background.primary,
          borderTopWidth: 1,
          borderTopColor: theme.colors.border.light,
          paddingTop: theme.spacing.sm,
          paddingBottom: theme.spacing.sm,
          height: 70,
          ...theme.shadows.lg,
          borderTopLeftRadius: theme.borderRadius.lg,
          borderTopRightRadius: theme.borderRadius.lg,
        },
        tabBarLabelStyle: {
          fontSize: theme.typography.fontSize.xs,
          fontWeight: theme.typography.fontWeight.medium,
          marginTop: 2,
        },
        tabBarItemStyle: {
          paddingVertical: theme.spacing.xs,
        },
        tabBarActiveBackgroundColor: theme.colors.primary[50],
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
