import React, { useRef } from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  StyleProp,
  ViewStyle,
  Animated,
  GestureResponderEvent,
  ActivityIndicator,
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
        toValue: 0.98,
        duration: theme.animation.duration.fast,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0.9,
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
      borderRadius: theme.borderRadius.pill,
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
            ? theme.colors.primary[100]
            : theme.colors.primary[600],
          ...(disabled ? {} : theme.neumorphicShadows.primaryGlow),
        };
      case "secondary":
        return {
          ...baseStyle,
          backgroundColor: disabled
            ? theme.colors.secondary[100]
            : theme.colors.secondary[600],
          ...(disabled ? {} : theme.neumorphicShadows.level3),
        };
      case "outline":
        return {
          ...baseStyle,
          backgroundColor: "transparent",
          borderWidth: 2,
          borderColor: disabled
            ? theme.colors.neutral[400]
            : theme.colors.primary[500],
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
          ...(disabled
            ? {}
            : {
                shadowColor: theme.colors.error,
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: 0.3,
                shadowRadius: 12,
                elevation: 6,
              }),
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
          minHeight: 40,
        };
      case "lg":
        return {
          paddingHorizontal: theme.spacing.xl,
          paddingVertical: 18,
          minHeight: 56,
        };
      default:
        return {
          paddingHorizontal: theme.spacing.lg,
          paddingVertical: theme.spacing.md,
          minHeight: 48,
        };
    }
  };

  const getTextStyle = () => {
    const baseTextStyle = {
      fontWeight: theme.typography.fontWeight.semibold,
      ...getSizeTextStyle(),
    };

    switch (variant) {
      case "primary":
      case "secondary":
      case "danger":
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
        {loading ? (
          <ActivityIndicator
            color={
              variant === "primary" ||
              variant === "secondary" ||
              variant === "danger"
                ? theme.colors.text.inverse
                : theme.colors.primary[600]
            }
            size="small"
          />
        ) : (
          <Text style={getTextStyle()}>{title}</Text>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

export default AnimatedButton;
