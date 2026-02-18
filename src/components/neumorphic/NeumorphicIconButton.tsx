/**
 * NeumorphicIconButton Component
 *
 * Circular icon button with neumorphic styling.
 */

import React, { useRef, useCallback } from "react";
import {
  TouchableOpacity,
  StyleSheet,
  Animated,
  StyleProp,
  ViewStyle,
} from "react-native";
import {
  neumorphicColors,
  getNeumorphicShadow,
  spacing,
} from "../../theme/neumorphic";

type ButtonSize = "small" | "medium" | "large" | "sm" | "md" | "lg";
type ButtonVariant =
  | "default"
  | "primary"
  | "secondary"
  | "ghost"
  | "flat";

interface NeumorphicIconButtonProps {
  icon: React.ReactNode;
  onPress: () => void;
  size?: ButtonSize;
  variant?: ButtonVariant;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  badge?: number;
}

const NeumorphicIconButton: React.FC<NeumorphicIconButtonProps> = ({
  icon,
  onPress,
  size = "medium",
  variant = "default",
  disabled = false,
  style,
  badge,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 0.9,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  }, [scaleAnim]);

  const handlePressOut = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  }, [scaleAnim]);

  const getSizeStyles = () => {
    const normalizedSize: "small" | "medium" | "large" =
      size === "sm" ? "small" : size === "md" ? "medium" : size === "lg" ? "large" : size;

    const sizes: Record<ButtonSize, number> = {
      small: 36,
      medium: 48,
      large: 56,
      sm: 36,
      md: 48,
      lg: 56,
    };
    return sizes[normalizedSize];
  };

  const getVariantStyles = (): ViewStyle => {
    switch (variant) {
      case "primary":
        return {
          backgroundColor: neumorphicColors.primary[600],
          ...getNeumorphicShadow(2),
        };
      case "secondary":
        return {
          backgroundColor: neumorphicColors.primary[50],
          ...getNeumorphicShadow(1),
        };
      case "ghost":
      case "flat":
        return {
          backgroundColor: "transparent",
        };
      default:
        return {
          backgroundColor: neumorphicColors.base.card,
          ...getNeumorphicShadow(2),
        };
    }
  };

  const buttonSize = getSizeStyles();

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        activeOpacity={1}
        style={[
          styles.button,
          {
            width: buttonSize,
            height: buttonSize,
            borderRadius: buttonSize / 2,
          },
          getVariantStyles(),
          disabled && styles.disabled,
          style,
        ]}
      >
        {icon}

        {badge !== undefined && badge > 0 && (
          <Animated.View style={styles.badge}>
            <Animated.Text style={styles.badgeText}>
              {badge > 99 ? "99+" : badge}
            </Animated.Text>
          </Animated.View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  button: {
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  disabled: {
    opacity: 0.5,
  },
  badge: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: neumorphicColors.semantic.error,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 6,
    borderWidth: 2,
    borderColor: neumorphicColors.base.card,
  },
  badgeText: {
    color: neumorphicColors.text.inverse,
    fontSize: 10,
    fontWeight: "700",
  },
});

export default NeumorphicIconButton;
