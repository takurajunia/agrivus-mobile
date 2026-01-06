/**
 * NeumorphicTabBar Component
 *
 * Custom tab bar with neumorphic styling for bottom navigation.
 */

import React from "react";
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
} from "react-native";
import {
  neumorphicColors,
  getNeumorphicShadow,
  spacing,
  borderRadius,
} from "../../theme/neumorphic";

interface TabItem {
  key: string;
  label: string;
  icon: React.ReactNode;
  activeIcon?: React.ReactNode;
}

interface NeumorphicTabBarProps {
  tabs: TabItem[];
  activeTab: string;
  onTabPress: (key: string) => void;
  style?: ViewStyle;
}

const NeumorphicTabBar: React.FC<NeumorphicTabBarProps> = ({
  tabs,
  activeTab,
  onTabPress,
  style,
}) => {
  return (
    <View style={[styles.container, getNeumorphicShadow(3), style]}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.key;

        return (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, isActive && styles.activeTab]}
            onPress={() => onTabPress(tab.key)}
            activeOpacity={0.7}
          >
            <View
              style={[
                styles.iconContainer,
                isActive && styles.activeIconContainer,
              ]}
            >
              {isActive && tab.activeIcon ? tab.activeIcon : tab.icon}
            </View>
            <Text style={[styles.label, isActive && styles.activeLabel]}>
              {tab.label}
            </Text>

            {isActive && <View style={styles.indicator} />}
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: neumorphicColors.base.card,
    borderRadius: borderRadius.xl,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.sm,
    position: "relative",
  },
  activeTab: {
    // Active state styles handled by children
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  activeIconContainer: {
    backgroundColor: neumorphicColors.primary[50],
  },
  label: {
    fontSize: 11,
    fontWeight: "500",
    color: neumorphicColors.text.tertiary,
  },
  activeLabel: {
    color: neumorphicColors.primary[600],
    fontWeight: "600",
  },
  indicator: {
    position: "absolute",
    bottom: 0,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: neumorphicColors.primary[600],
  },
});

export default NeumorphicTabBar;
