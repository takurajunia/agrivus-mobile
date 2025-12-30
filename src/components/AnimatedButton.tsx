import React, { useRef } from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  StyleProp,
  ViewStyle,
  Animated,
  GestureResponderEvent,
} from "react-native";
import { theme } from "../theme/tokens";

type AnimatedButtonProps = {
  title: string;
  onPress: (event: GestureResponderEvent) => void;
  style?: StyleProp<ViewStyle>;
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  loading?: boolean;
  [key: string]: any;
};

const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  title,
  onPress,
  style,
  variant = "primary",
  size = "md",
  disabled = false,
  loading = false,
  ...props
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: theme.animation.duration.fast,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0.8,
        duration: theme.animation.duration.fast,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handlePressOut = () => {
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: theme.animation.duration.fast,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: theme.animation.duration.fast,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const getButtonStyle = () => {
    const baseStyle: ViewStyle = {
      borderRadius: theme.borderRadius.md,
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "row",
      ...getSizeStyle(),
    };

    switch (variant) {
      case "primary":
        return {
          ...baseStyle,
          backgroundColor: disabled
            ? theme.colors.neutral[400]
            : theme.colors.primary[600],
        };
      case "secondary":
        return {
          ...baseStyle,
          backgroundColor: disabled
            ? theme.colors.neutral[400]
            : theme.colors.secondary[600],
        };
      case "outline":
        return {
          ...baseStyle,
          backgroundColor: "transparent",
          borderWidth: 1,
          borderColor: disabled
            ? theme.colors.neutral[400]
            : theme.colors.primary[600],
        };
      case "ghost":
        return {
          ...baseStyle,
          backgroundColor: "transparent",
        };
      case "danger":
        return {
          ...baseStyle,
          backgroundColor: disabled
            ? theme.colors.neutral[400]
            : theme.colors.error,
        };
      default:
        return baseStyle;
    }
  };

  const getSizeStyle = (): ViewStyle => {
    switch (size) {
      case "sm":
        return {
          paddingHorizontal: theme.spacing.md,
          paddingVertical: theme.spacing.sm,
          minHeight: 36,
        };
      case "lg":
        return {
          paddingHorizontal: theme.spacing.xl,
          paddingVertical: theme.spacing.md,
          minHeight: 52,
        };
      default:
        return {
          paddingHorizontal: theme.spacing.lg,
          paddingVertical: theme.spacing.md,
          minHeight: 44,
        };
    }
  };

  const getTextStyle = () => {
    const baseTextStyle = {
      fontWeight: theme.typography.fontWeight.medium,
      ...getSizeTextStyle(),
    };

    switch (variant) {
      case "primary":
      case "secondary":
        return {
          ...baseTextStyle,
          color: theme.colors.text.inverse,
        };
      case "outline":
        return {
          ...baseTextStyle,
          color: disabled
            ? theme.colors.neutral[400]
            : theme.colors.primary[600],
        };
      case "ghost":
        return {
          ...baseTextStyle,
          color: disabled
            ? theme.colors.neutral[400]
            : theme.colors.primary[600],
        };
      default:
        return baseTextStyle;
    }
  };

  const getSizeTextStyle = () => {
    switch (size) {
      case "sm":
        return { fontSize: theme.typography.fontSize.sm };
      case "lg":
        return { fontSize: theme.typography.fontSize.lg };
      default:
        return { fontSize: theme.typography.fontSize.md };
    }
  };

  return (
    <Animated.View
      style={[
        {
          transform: [{ scale: scaleAnim }],
          opacity: opacityAnim,
        },
        style,
      ]}
    >
      <TouchableOpacity
        style={getButtonStyle()}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        activeOpacity={1}
        {...props}
      >
        <Text style={getTextStyle()}>{loading ? "Loading..." : title}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default AnimatedButton;
