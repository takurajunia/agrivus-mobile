/**
 * NeumorphicView Component
 *
 * Base container with neumorphic shadow effects.
 * Supports multiple shadow levels and inset (pressed) state.
 */

import React from "react";
import { View, ViewStyle, StyleSheet, Platform } from "react-native";
import {
  neumorphicColors,
  shadowLevels,
  getNeumorphicShadow,
} from "../../theme/neumorphic";

type ShadowLevel = 1 | 2 | 3 | 4 | 5;

interface NeumorphicViewProps {
  children?: React.ReactNode;
  style?: ViewStyle;
  level?: ShadowLevel;
  inset?: boolean;
  backgroundColor?: string;
  borderRadius?: number;
}

const NeumorphicView: React.FC<NeumorphicViewProps> = ({
  children,
  style,
  level = 2,
  inset = false,
  backgroundColor = neumorphicColors.base.card,
  borderRadius = 16,
}) => {
  // For true neumorphic effect on iOS, we need two shadow layers
  // On Android, we use elevation as a fallback

  if (Platform.OS === "ios" && !inset) {
    const shadow = shadowLevels[level];

    return (
      <View style={[styles.outerShadow, { borderRadius }]}>
        {/* Light shadow layer */}
        <View
          style={[
            styles.shadowLayer,
            {
              borderRadius,
              shadowColor: shadow.light.shadowColor,
              shadowOffset: shadow.light.shadowOffset,
              shadowOpacity: shadow.light.shadowOpacity,
              shadowRadius: shadow.light.shadowRadius,
            },
          ]}
        >
          {/* Dark shadow layer */}
          <View
            style={[
              styles.innerContainer,
              {
                backgroundColor,
                borderRadius,
                shadowColor: shadow.dark.shadowColor,
                shadowOffset: shadow.dark.shadowOffset,
                shadowOpacity: shadow.dark.shadowOpacity,
                shadowRadius: shadow.dark.shadowRadius,
              },
              style,
            ]}
          >
            {children}
          </View>
        </View>
      </View>
    );
  }

  // Inset style for pressed states
  if (inset) {
    return (
      <View
        style={[
          styles.insetContainer,
          {
            backgroundColor: neumorphicColors.base.pressed,
            borderRadius,
          },
          style,
        ]}
      >
        {children}
      </View>
    );
  }

  // Android fallback with elevation
  return (
    <View
      style={[
        {
          backgroundColor,
          borderRadius,
          ...getNeumorphicShadow(level),
        },
        style,
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  outerShadow: {
    overflow: "visible",
  },
  shadowLayer: {
    overflow: "visible",
  },
  innerContainer: {
    overflow: "hidden",
  },
  insetContainer: {
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.05)",
  },
});

export default NeumorphicView;
