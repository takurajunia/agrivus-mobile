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
      <Tabs.Screen name="wallet" options={{ title: "Wallet" }} />
      <Tabs.Screen name="orders" options={{ title: "Orders" }} />
    </Tabs>
  );
}
