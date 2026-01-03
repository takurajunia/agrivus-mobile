import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '../hooks/useFrameworkReady';
import { AuthProvider } from '../src/contexts/AuthContext';
import { ChatProvider } from '../src/contexts/ChatContext';
import { NotificationsProvider } from '../src/contexts/NotificationsContext';

export default function RootLayout() {
  useFrameworkReady();

  return (
    <AuthProvider>
      <ChatProvider>
        <NotificationsProvider>
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
        </NotificationsProvider>
      </ChatProvider>
    </AuthProvider>
  );
}
