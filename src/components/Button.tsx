import React, { useState } from "react";
import {
  Pressable,
  Text,
  StyleSheet,
  StyleProp,
  ViewStyle,
  GestureResponderEvent,
  ActivityIndicator,
} from "react-native";
import { theme } from "../theme/tokens";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

type ButtonProps = {
  title: string;
  onPress: (event: GestureResponderEvent) => void;
  style?: StyleProp<ViewStyle>;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  [key: string]: any;
};

const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  style,
  variant = "primary",
  size = "md",
  disabled = false,
  loading = false,
  ...props
}) => {
  const [isPressed, setIsPressed] = useState(false);

  const getSizeStyle = (): ViewStyle => {
    switch (size) {
      case "sm":
        return {
          paddingVertical: 12,
          paddingHorizontal: 16,
          minHeight: 40,
        };
      case "lg":
        return {
          paddingVertical: 18,
          paddingHorizontal: 32,
          minHeight: 56,
        };
      default:
        return {
          paddingVertical: 16,
          paddingHorizontal: 24,
          minHeight: 48,
        };
    }
  };

  const getButtonStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      borderRadius: theme.borderRadius.pill,
      alignItems: "center",
      justifyContent: "center",
      ...getSizeStyle(),
    };

    if (disabled || loading) {
      switch (variant) {
        case "primary":
          return {
            ...baseStyle,
            backgroundColor: theme.colors.primary[100],
            opacity: 0.6,
          };
        case "secondary":
          return {
            ...baseStyle,
            backgroundColor: theme.colors.secondary[100],
            opacity: 0.6,
          };
        case "outline":
          return {
            ...baseStyle,
            backgroundColor: "transparent",
            borderWidth: 2,
            borderColor: theme.colors.neutral[400],
          };
        default:
          return {
            ...baseStyle,
            backgroundColor: "transparent",
            opacity: 0.6,
          };
      }
    }

    if (isPressed) {
      switch (variant) {
        case "primary":
          return {
            ...baseStyle,
            backgroundColor: theme.colors.primary[700],
            transform: [{ scale: 0.98 }],
            ...theme.neumorphicShadows.level1,
          };
        case "secondary":
          return {
            ...baseStyle,
            backgroundColor: theme.colors.secondary[700],
            transform: [{ scale: 0.98 }],
          };
        case "outline":
          return {
            ...baseStyle,
            backgroundColor: `${theme.colors.primary[500]}1A`,
            borderWidth: 2,
            borderColor: theme.colors.primary[500],
            transform: [{ scale: 0.98 }],
          };
        default:
          return {
            ...baseStyle,
            backgroundColor: `${theme.colors.primary[500]}1A`,
            transform: [{ scale: 0.98 }],
          };
      }
    }

    switch (variant) {
      case "primary":
        return {
          ...baseStyle,
          backgroundColor: theme.colors.primary[600],
          ...theme.neumorphicShadows.primaryGlow,
        };
      case "secondary":
        return {
          ...baseStyle,
          backgroundColor: theme.colors.secondary[600],
          ...theme.neumorphicShadows.level3,
        };
      case "outline":
        return {
          ...baseStyle,
          backgroundColor: "transparent",
          borderWidth: 2,
          borderColor: theme.colors.primary[500],
        };
      case "ghost":
        return {
          ...baseStyle,
          backgroundColor: "transparent",
        };
      default:
        return baseStyle;
    }
  };

  const getTextStyle = () => {
    const baseTextStyle = {
      fontWeight: theme.typography.fontWeight.semibold,
      fontSize: size === "sm" ? 14 : size === "lg" ? 18 : 16,
    };

    switch (variant) {
      case "primary":
      case "secondary":
        return {
          ...baseTextStyle,
          color: theme.colors.text.inverse,
        };
      case "outline":
      case "ghost":
        return {
          ...baseTextStyle,
          color: disabled ? theme.colors.neutral[400] : theme.colors.primary[600],
        };
      default:
        return baseTextStyle;
    }
  };

  return (
    <Pressable
      style={[getButtonStyle(), style]}
      onPress={onPress}
      onPressIn={() => setIsPressed(true)}
      onPressOut={() => setIsPressed(false)}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === "primary" || variant === "secondary"
            ? theme.colors.text.inverse
            : theme.colors.primary[600]
          }
          size="small"
        />
      ) : (
        <Text style={getTextStyle()}>{title}</Text>
      )}
    </Pressable>
  );
};

export default Button;
