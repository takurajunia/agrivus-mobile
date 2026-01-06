/**
 * NeumorphicCard Component
 *
 * Interactive card with neumorphic shadows, press animations,
 * and multiple variants.
 */

import React, { useRef, useCallback, useEffect } from "react";
import {
  View,
  StyleSheet,
  Animated,
  TouchableOpacity,
  ViewStyle,
  Platform,
} from "react-native";
import {
  neumorphicColors,
  shadowLevels,
  getNeumorphicShadow,
  spacing,
  borderRadius as br,
} from "../../theme/neumorphic";

type CardVariant = "standard" | "elevated" | "stat" | "glass" | "bordered";

interface NeumorphicCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: CardVariant;
  onPress?: () => void;
  disabled?: boolean;
  animated?: boolean;
  animationDelay?: number;
  shadowLevel?: 1 | 2 | 3 | 4 | 5;
}

const NeumorphicCard: React.FC<NeumorphicCardProps> = ({
  children,
  style,
  variant = "standard",
  onPress,
  disabled = false,
  animated = true,
  animationDelay = 0,
  shadowLevel = 2,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(animated ? 0 : 1)).current;
  const translateYAnim = useRef(new Animated.Value(animated ? 20 : 0)).current;

  useEffect(() => {
    if (animated) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          delay: animationDelay,
          useNativeDriver: true,
        }),
        Animated.timing(translateYAnim, {
          toValue: 0,
          duration: 400,
          delay: animationDelay,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [animated, animationDelay, fadeAnim, translateYAnim]);

  const handlePressIn = useCallback(() => {
    if (onPress && !disabled) {
      Animated.spring(scaleAnim, {
        toValue: 0.97,
        useNativeDriver: true,
        speed: 50,
        bounciness: 4,
      }).start();
    }
  }, [onPress, disabled, scaleAnim]);

  const handlePressOut = useCallback(() => {
    if (onPress && !disabled) {
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        speed: 50,
        bounciness: 4,
      }).start();
    }
  }, [onPress, disabled, scaleAnim]);

  const getVariantStyle = (): ViewStyle => {
    switch (variant) {
      case "elevated":
        return {
          backgroundColor: neumorphicColors.base.card,
          borderRadius: br.lg,
          padding: spacing.md,
          ...getNeumorphicShadow(3),
        };
      case "stat":
        return {
          backgroundColor: neumorphicColors.base.card,
          borderRadius: br.xl,
          padding: spacing.lg,
          ...getNeumorphicShadow(2),
        };
      case "glass":
        return {
          backgroundColor: "rgba(255, 255, 255, 0.85)",
          borderRadius: br.lg,
          padding: spacing.md,
          borderWidth: 1,
          borderColor: "rgba(255, 255, 255, 0.5)",
          ...getNeumorphicShadow(1),
        };
      case "bordered":
        return {
          backgroundColor: neumorphicColors.base.card,
          borderRadius: br.lg,
          padding: spacing.md,
          borderWidth: 1,
          borderColor: neumorphicColors.base.shadowDark + "20",
        };
      default:
        return {
          backgroundColor: neumorphicColors.base.card,
          borderRadius: br.lg,
          padding: spacing.md,
          ...getNeumorphicShadow(shadowLevel),
        };
    }
  };

  const cardContent = (
    <Animated.View
      style={[
        styles.card,
        getVariantStyle(),
        {
          opacity: fadeAnim,
          transform: [{ translateY: translateYAnim }, { scale: scaleAnim }],
        },
        disabled && styles.disabled,
        style,
      ]}
    >
      {children}
    </Animated.View>
  );

  if (onPress && !disabled) {
    return (
      <TouchableOpacity
        activeOpacity={1}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        {cardContent}
      </TouchableOpacity>
    );
  }

  return cardContent;
};

const styles = StyleSheet.create({
  card: {
    overflow: "hidden",
  },
  disabled: {
    opacity: 0.5,
  },
});

export default NeumorphicCard;
