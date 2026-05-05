import { useEffect, useRef } from "react";
import {
  Stack,
  useRouter,
  useSegments,
  useRootNavigationState,
} from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useFrameworkReady } from "../hooks/useFrameworkReady";
import { AuthProvider, useAuth } from "../src/contexts/AuthContext";
import { ChatProvider } from "../src/contexts/ChatContext";
import { NotificationsProvider } from "../src/contexts/NotificationsContext";

// Separate component to handle auth-based navigation
function AuthNavigator() {
  const { isAuthenticated, loading, user, token } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const navigationState = useRootNavigationState();
  const lastRedirectRef = useRef<string | null>(null);

  useEffect(() => {
    console.log("AuthNavigator state:", {
      isAuthenticated,
      loading,
      hasUser: !!user,
      hasToken: !!token,
      segments,
      navigationKey: navigationState?.key,
    });

    // Don't do anything if navigation isn't ready or still loading auth
    if (!navigationState?.key || loading) return;

    // Get current segment - treat empty segments as being on the login page (index)
    const segmentsArray = Array.from(segments);
    const currentSegment = segmentsArray[0] ?? "index";

    // Skip navigation logic if we're on the not-found page - it's a transient state
    if (currentSegment === "+not-found") {
      console.log("On not-found page, skipping navigation logic");
      return;
    }

    const inTabsGroup = currentSegment === "(tabs)";
    const tabSegment = inTabsGroup ? (segmentsArray[1] ?? "index") : null;

    const onAuthPage =
      currentSegment === "index" ||
      currentSegment === "" ||
      currentSegment === "login" ||
      currentSegment === "register";

    // Dedicated guest-only marketplace route (no bottom tabs).
    const isGuestMarketplace =
      currentSegment === "guest" && segmentsArray[1] === "marketplace";

    // Marketplace listing details are publicly viewable.
    const isPublicListing = currentSegment === "listing";

    // Allow viewing auction details without auth, but keep checkout/winning flows protected.
    const isPublicAuction =
      currentSegment === "auction" && segmentsArray[1] !== "checkout";

    // Allow browsing AgriMall and product details without auth; orders/cart/checkout require auth.
    const isPublicAgrimall =
      currentSegment === "agrimall" &&
      (segmentsArray.length === 1 || segmentsArray[1] === "product");

    const isPublicRoute =
      onAuthPage ||
      isGuestMarketplace ||
      isPublicListing ||
      isPublicAuction ||
      isPublicAgrimall;

    const inProtectedRoute = !isPublicRoute;

    console.log("Navigation decision:", {
      currentSegment,
      tabSegment,
      inProtectedRoute,
      onAuthPage,
      isAuthenticated,
    });

    // Handle logout: not authenticated but on protected route
    if (!isAuthenticated && inProtectedRoute) {
      console.log(
        "Redirecting to login - not authenticated on protected route",
      );
      if (lastRedirectRef.current !== "/login") {
        lastRedirectRef.current = "/login";
        router.replace("/login");
      }
      return;
    }

    // Handle login: authenticated but on auth pages
    if (isAuthenticated && onAuthPage) {
      console.log("Redirecting to tabs - authenticated on auth page");
      if (lastRedirectRef.current !== "/(tabs)") {
        lastRedirectRef.current = "/(tabs)";
        router.replace("/(tabs)");
      }
      return;
    }

    lastRedirectRef.current = null;
  }, [isAuthenticated, segments, loading, navigationState?.key]);

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="register" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="create-listing" options={{ headerShown: false }} />
        <Stack.Screen name="my-listings" options={{ headerShown: false }} />
        <Stack.Screen name="listing/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="auction/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="create-auction" options={{ headerShown: false }} />
        <Stack.Screen name="my-bids" options={{ headerShown: false }} />
        <Stack.Screen name="agrimall" options={{ headerShown: false }} />
        <Stack.Screen name="cart" options={{ headerShown: false }} />
        <Stack.Screen name="checkout" options={{ headerShown: false }} />
        <Stack.Screen name="export-gateway" options={{ headerShown: false }} />
        <Stack.Screen name="admin/index" options={{ headerShown: false }} />
        <Stack.Screen name="admin/users" options={{ headerShown: false }} />
        <Stack.Screen name="admin/orders" options={{ headerShown: false }} />
        <Stack.Screen name="admin/transactions" options={{ headerShown: false }} />
        <Stack.Screen name="admin/reports" options={{ headerShown: false }} />
        <Stack.Screen name="admin/security" options={{ headerShown: false }} />
        <Stack.Screen
          name="admin/crop-tracker"
          options={{ headerShown: false }}
        />
        <Stack.Screen name="moderator/index" options={{ headerShown: false }} />
        <Stack.Screen
          name="moderator/activity-log"
          options={{ headerShown: false }}
        />
        <Stack.Screen name="accounts/index" options={{ headerShown: false }} />
        <Stack.Screen
          name="admin/cash-deposits"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="payment/[paymentId]"
          options={{ headerShown: false }}
        />
        <Stack.Screen name="payment-history" options={{ headerShown: false }} />
        <Stack.Screen name="edit-profile" options={{ headerShown: false }} />
        <Stack.Screen name="delete-account" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </>
  );
}

export default function RootLayout() {
  useFrameworkReady();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AuthProvider>
          <ChatProvider>
            <NotificationsProvider>
              <AuthNavigator />
            </NotificationsProvider>
          </ChatProvider>
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
