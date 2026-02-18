import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Dimensions,
} from "react-native";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { Home, Store, Wallet, Receipt } from "lucide-react-native";

const { width } = Dimensions.get("window");

// Define exactly which routes should be visible
const VISIBLE_ROUTES = ["index", "marketplace", "wallet", "orders"];

export const NeumorphicTabBar = ({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) => {
  return (
    <View style={styles.container}>
      <View style={styles.floatingBar}>
        {state.routes.map((route, index) => {
          // 1. FILTER: If the route is not in our visible list, do not render it.
          if (!VISIBLE_ROUTES.includes(route.name)) {
            return null;
          }

          const { options } = descriptors[route.key];
          const label =
            options.tabBarLabel !== undefined
              ? options.tabBarLabel
              : options.title !== undefined
                ? options.title
                : route.name;

          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          };

          // Icon Mapping
          let IconComponent = Home;
          if (route.name === "index") IconComponent = Home;
          if (route.name === "marketplace") IconComponent = Store;
          if (route.name === "wallet") IconComponent = Wallet;
          if (route.name === "orders") IconComponent = Receipt;

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              onPress={onPress}
              style={styles.tabItem}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.iconContainer,
                  isFocused && styles.activeIconContainer,
                ]}
              >
                <IconComponent
                  size={24}
                  color={isFocused ? "#FFFFFF" : "#95A5A6"}
                  strokeWidth={isFocused ? 2.5 : 2}
                />
              </View>
              {/* Text Label */}
              <Text style={[styles.label, isFocused && styles.activeLabel]}>
                {label as string}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: "center",
    paddingBottom: Platform.OS === "ios" ? 30 : 20,
    backgroundColor: "transparent",
    pointerEvents: "box-none",
  },
  floatingBar: {
    flexDirection: "row",
    backgroundColor: "#F0F0F3",
    width: width - 48,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 35,
    justifyContent: "space-between",
    alignItems: "center",
    // The "Levitating" Shadow
    shadowColor: "#BCC5D1",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 10,
    // Top Highlight Border
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderColor: "rgba(255,255,255,0.8)",
    borderRightWidth: 1,
    borderBottomWidth: 0,
  },
  tabItem: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  iconContainer: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 16,
    marginBottom: 4,
  },
  activeIconContainer: {
    backgroundColor: "#4CD964",
    // Active Glow
    shadowColor: "#4CD964",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  label: {
    fontSize: 10,
    fontWeight: "600",
    color: "#95A5A6",
  },
  activeLabel: {
    color: "#2D3436",
    fontWeight: "700",
  },
});

export default NeumorphicTabBar;
