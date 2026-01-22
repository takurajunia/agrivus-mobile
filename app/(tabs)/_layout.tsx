import React from "react";
import { Tabs } from "expo-router";
import { NeumorphicTabBar } from "../../src/components/neumorphic/NeumorphicTabBar";

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <NeumorphicTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarHideOnKeyboard: true,
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Home" }} />
      <Tabs.Screen name="marketplace" options={{ title: "Market" }} />
      <Tabs.Screen name="agrimall" options={{ title: "Agri-Mall" }} />
      <Tabs.Screen name="my-listings" options={{ title: "My Listings" }} />
      <Tabs.Screen name="export-gateway" options={{ title: "Export" }} />
      <Tabs.Screen name="wallet" options={{ title: "Wallet" }} />
      <Tabs.Screen name="orders" options={{ title: "Orders" }} />
    </Tabs>
  );
}
