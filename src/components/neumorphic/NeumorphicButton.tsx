/**
 * NeumorphicButton Component
 *
 * Fully styled button with neumorphic effects, multiple variants,
 * and proper press animations.
 */

import React, { useRef, useCallback } from "react";
import {
  TouchableOpacity,
  Text,
  View,
  StyleSheet,
  Animated,
  ActivityIndicator,
  StyleProp,
  ViewStyle,
  TextStyle,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import {
  neumorphicColors,
  buttonStyles,
  buttonTextStyles,
  primaryGlow,
  getNeumorphicShadow,
  spacing,
} from "../../theme/neumorphic";

type ButtonVariant = "primary" | "secondary" | "tertiary" | "icon" | "danger";
type ButtonSize = "small" | "medium" | "large" | "sm" | "md" | "lg";

interface NeumorphicButtonProps {
  title?: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  style?: StyleProp<ViewStyle>;
  textStyle?: TextStyle;
  fullWidth?: boolean;
}

const NeumorphicButton: React.FC<NeumorphicButtonProps> = ({
  title,
  onPress,
  variant = "primary",
  size = "medium",
  disabled = false,
  loading = false,
  icon,
  iconPosition = "left",
  style,
  textStyle,
  fullWidth = false,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = useCallback(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 0.96,
        useNativeDriver: true,
        speed: 50,
        bounciness: 4,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  }, [scaleAnim, opacityAnim]);

  const handlePressOut = useCallback(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        speed: 50,
        bounciness: 4,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  }, [scaleAnim, opacityAnim]);

  const getSizeStyles = (): {
    button: ViewStyle;
    text: TextStyle;
    iconSize: number;
  } => {
    const normalizedSize: "small" | "medium" | "large" =
      size === "sm" ? "small" : size === "md" ? "medium" : size === "lg" ? "large" : size;

    switch (normalizedSize) {
      case "small":
        return {
          button: { height: 40, paddingHorizontal: 16 },
          text: { fontSize: 14 },
          iconSize: 18,
        };
      case "large":
        return {
          button: { height: 56, paddingHorizontal: 32 },
          text: { fontSize: 18 },
          iconSize: 24,
        };
      default:
        return {
          button: { height: 48, paddingHorizontal: 24 },
          text: { fontSize: 16 },
          iconSize: 20,
        };
    }
  };

  const sizeStyles = getSizeStyles();

  const getButtonStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      borderRadius: 28,
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "row",
      ...sizeStyles.button,
      ...(fullWidth && { width: "100%" }),
    };

    if (disabled) {
      return {
        ...baseStyle,
        backgroundColor: neumorphicColors.primary[100],
        opacity: 0.6,
      };
    }

    switch (variant) {
      case "primary":
        return {
          ...baseStyle,
          backgroundColor: neumorphicColors.primary[600],
          ...primaryGlow,
        };
      case "secondary":
        return {
          ...baseStyle,
          backgroundColor: "transparent",
          borderWidth: 2,
          borderColor: neumorphicColors.primary[500],
        };
      case "tertiary":
        return {
          ...baseStyle,
          backgroundColor: "transparent",
        };
      case "danger":
        return {
          ...baseStyle,
          backgroundColor: neumorphicColors.semantic.error,
          shadowColor: neumorphicColors.semantic.error,
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.3,
          shadowRadius: 12,
          elevation: 6,
        };
      case "icon":
        return {
          ...baseStyle,
          width: sizeStyles.button.height,
          height: sizeStyles.button.height,
          paddingHorizontal: 0,
          backgroundColor: neumorphicColors.base.card,
          borderRadius: (sizeStyles.button.height as number) / 2,
          ...getNeumorphicShadow(2),
        };
      default:
        return baseStyle;
    }
  };

  const getTextStyle = (): TextStyle => {
    const baseStyle: TextStyle = {
      fontWeight: "600",
      ...sizeStyles.text,
    };

    if (disabled) {
      return {
        ...baseStyle,
        color: neumorphicColors.text.tertiary,
      };
    }

    switch (variant) {
      case "primary":
      case "danger":
        return {
          ...baseStyle,
          color: neumorphicColors.text.inverse,
        };
      case "secondary":
      case "tertiary":
        return {
          ...baseStyle,
          color: neumorphicColors.primary[600],
        };
      default:
        return baseStyle;
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <ActivityIndicator
          color={
            variant === "primary" || variant === "danger"
              ? neumorphicColors.text.inverse
              : neumorphicColors.primary[600]
          }
          size="small"
        />
      );
    }

    return (
      <>
        {icon && iconPosition === "left" && (
          <View style={styles.iconLeft}>{icon}</View>
        )}
        {title && <Text style={[getTextStyle(), textStyle]}>{title}</Text>}
        {icon && iconPosition === "right" && (
          <View style={styles.iconRight}>{icon}</View>
        )}
      </>
    );
  };

  // Primary button with gradient
  if (variant === "primary" && !disabled) {
    return (
      <Animated.View
        style={[
          { transform: [{ scale: scaleAnim }], opacity: opacityAnim },
          fullWidth && { width: "100%" },
        ]}
      >
        <TouchableOpacity
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          disabled={disabled || loading}
          activeOpacity={1}
          style={style}
        >
          <LinearGradient
            colors={[
              neumorphicColors.primary[500],
              neumorphicColors.primary[600],
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[getButtonStyle(), styles.gradientButton]}
          >
            {renderContent()}
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    );
  }

  return (
    <Animated.View
      style={[
        { transform: [{ scale: scaleAnim }], opacity: opacityAnim },
        fullWidth && { width: "100%" },
      ]}
    >
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        activeOpacity={0.8}
        style={[getButtonStyle(), style]}
      >
        {renderContent()}
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  gradientButton: {
    overflow: "hidden",
  },
  iconLeft: {
    marginRight: spacing.sm,
  },
  iconRight: {
    marginLeft: spacing.sm,
  },
});

export default NeumorphicButton;
