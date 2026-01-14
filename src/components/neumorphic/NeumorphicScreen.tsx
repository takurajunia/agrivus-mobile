/**
 * NeumorphicScreen Component
 *
 * Full screen wrapper with neumorphic background and
 * decorative leaf patterns.
 */

import React from "react";
import { View, StyleSheet, ViewStyle, StatusBar, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Leaf } from "lucide-react-native";
import {
  neumorphicColors,
  leafPatterns,
  LeafConfig,
} from "../../theme/neumorphic";

type ScreenVariant =
  | "default"
  | "auth"
  | "dashboard"
  | "list"
  | "detail"
  | "form"
  | "profile";

interface NeumorphicScreenProps {
  children: React.ReactNode;
  variant?: ScreenVariant;
  showLeaves?: boolean;
  style?: ViewStyle;
  safeArea?: boolean;
  statusBarStyle?: "light-content" | "dark-content";
  gradient?: boolean;
}

const NeumorphicScreen: React.FC<NeumorphicScreenProps> = ({
  children,
  variant = "default",
  showLeaves = true,
  style,
  safeArea = true,
  statusBarStyle = "dark-content",
  gradient = false,
}) => {
  const leafConfig: LeafConfig =
    leafPatterns[variant] || leafPatterns.dashboard;

  const getGradientColors = (): readonly [string, string, ...string[]] => {
    switch (variant) {
      case "auth":
        return [
          neumorphicColors.primary[50],
          neumorphicColors.base.background,
          neumorphicColors.base.background,
        ] as const;
      case "dashboard":
        return [
          neumorphicColors.base.background,
          "#F0F0F4",
          neumorphicColors.base.background,
        ] as const;
      default:
        return [
          neumorphicColors.base.background,
          "#F0F0F4",
          neumorphicColors.base.background,
        ] as const;
    }
  };

  const renderLeaves = () => {
    if (!showLeaves) return null;

    return leafConfig.positions.map((pos, index) => (
      <View
        key={index}
        style={[
          styles.leafContainer,
          {
            opacity: leafConfig.opacity,
            ...(pos.top !== undefined && { top: pos.top }),
            ...(pos.bottom !== undefined && { bottom: pos.bottom }),
            ...(pos.left !== undefined && { left: pos.left }),
            ...(pos.right !== undefined && { right: pos.right }),
            transform: [{ rotate: `${pos.rotation}deg` }],
          } as ViewStyle,
        ]}
      >
        <Leaf
          size={pos.size}
          color={neumorphicColors.primary[500]}
          strokeWidth={1.5}
        />
      </View>
    ));
  };

  const Container = safeArea ? SafeAreaView : View;

  const content = (
    <>
      <StatusBar
        barStyle={statusBarStyle}
        backgroundColor="transparent"
        translucent
      />
      {renderLeaves()}
      <View style={[styles.content, style]}>{children}</View>
    </>
  );

  if (gradient) {
    return (
      <Container style={styles.container}>
        <LinearGradient
          colors={getGradientColors()}
          style={styles.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {content}
        </LinearGradient>
      </Container>
    );
  }

  return (
    <Container
      style={[
        styles.container,
        { backgroundColor: neumorphicColors.base.background },
      ]}
    >
      {content}
    </Container>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  leafContainer: {
    position: "absolute",
    zIndex: 0,
  },
});

export default NeumorphicScreen;
