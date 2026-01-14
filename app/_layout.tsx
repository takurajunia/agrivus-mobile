import { useEffect, useRef } from "react";
import {
  Stack,
  useRouter,
  useSegments,
  useRootNavigationState,
} from "expo-router";
import { StatusBar } from "expo-status-bar";
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
  const isNavigatingRef = useRef(false);
  const lastAuthStateRef = useRef<boolean | null>(null);

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

    // Prevent concurrent navigation attempts
    if (isNavigatingRef.current) {
      console.log("Navigation in progress, skipping...");
      return;
    }

    // Get current segment - treat empty segments as being on the login page (index)
    const currentSegment = segments[0] ?? "index";

    // Skip navigation logic if we're on the not-found page - it's a transient state
    if (currentSegment === "+not-found") {
      console.log("On not-found page, skipping navigation logic");
      return;
    }

    const inTabsGroup = currentSegment === "(tabs)";
    const inProtectedRoute =
      inTabsGroup ||
      currentSegment === "create-listing" ||
      currentSegment === "my-listings" ||
      currentSegment === "create-auction" ||
      currentSegment === "my-bids" ||
      currentSegment === "agrimall" ||
      currentSegment === "cart" ||
      currentSegment === "checkout" ||
      currentSegment === "export-gateway" ||
      currentSegment === "listing" ||
      currentSegment === "auction" ||
      currentSegment === "order" ||
      currentSegment === "chat" ||
      currentSegment === "admin" ||
      currentSegment === "create-order" ||
      currentSegment === "export";

    const onLoginPage = currentSegment === "index" || currentSegment === "";

    console.log("Navigation decision:", {
      currentSegment,
      inProtectedRoute,
      onLoginPage,
      isAuthenticated,
    });

    // Handle logout: not authenticated but on protected route
    if (!isAuthenticated && inProtectedRoute) {
      console.log(
        "Redirecting to login - not authenticated on protected route"
      );
      isNavigatingRef.current = true;

      // Use dismissAll to clear the stack, then navigate to login
      try {
        if (router.canDismiss()) {
          router.dismissAll();
        }
      } catch (e) {
        // Ignore errors from dismissAll
      }

      // Navigate to login after a short delay to allow stack to clear
      setTimeout(() => {
        router.replace("/");
        // Reset navigation flag after navigation completes
        setTimeout(() => {
          isNavigatingRef.current = false;
          lastAuthStateRef.current = isAuthenticated;
        }, 300);
      }, 50);
      return;
    }

    // Handle login: authenticated but on login page
    if (isAuthenticated && onLoginPage) {
      // Only redirect if auth state actually changed to authenticated
      if (lastAuthStateRef.current === isAuthenticated) {
        console.log("Already on correct auth state, skipping...");
        return;
      }

      console.log("Redirecting to tabs - authenticated on login page");
      isNavigatingRef.current = true;

      router.replace("/(tabs)");

      // Reset navigation flag after a delay
      setTimeout(() => {
        isNavigatingRef.current = false;
        lastAuthStateRef.current = isAuthenticated;
      }, 500);
      return;
    }

    // Update last auth state when no navigation needed
    lastAuthStateRef.current = isAuthenticated;
  }, [isAuthenticated, segments, loading, navigationState?.key]);

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" options={{ headerShown: false }} />
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
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </>
  );
}

export default function RootLayout() {
  useFrameworkReady();

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <ChatProvider>
          <NotificationsProvider>
            <AuthNavigator />
          </NotificationsProvider>
        </ChatProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
