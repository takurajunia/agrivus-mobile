import React, { useRef, useEffect } from "react";
import {
  View,
  StyleSheet,
  StyleProp,
  ViewStyle,
  Animated,
  TouchableOpacity,
  GestureResponderEvent,
} from "react-native";
import { theme } from "../theme/tokens";

type AnimatedCardProps = {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: (event: GestureResponderEvent) => void;
  variant?: "default" | "elevated" | "glass" | "bordered";
  animated?: boolean;
  delay?: number;
  [key: string]: any;
};

const AnimatedCard: React.FC<AnimatedCardProps> = ({
  children,
  style,
  onPress,
  variant = "default",
  animated = true,
  delay = 0,
  ...props
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateYAnim = useRef(new Animated.Value(20)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (animated) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: theme.animation.duration.normal,
          delay,
          useNativeDriver: true,
        }),
        Animated.timing(translateYAnim, {
          toValue: 0,
          duration: theme.animation.duration.normal,
          delay,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [animated, delay]);

  const handlePressIn = () => {
    if (onPress) {
      Animated.timing(scaleAnim, {
        toValue: 0.98,
        duration: theme.animation.duration.fast,
        useNativeDriver: true,
      }).start();
    }
  };

  const handlePressOut = () => {
    if (onPress) {
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: theme.animation.duration.fast,
        useNativeDriver: true,
      }).start();
    }
  };

  const getCardStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.lg,
      marginVertical: theme.spacing.sm,
      ...getVariantStyle(),
    };

    return baseStyle;
  };

  const getVariantStyle = (): ViewStyle => {
    switch (variant) {
      case "elevated":
        return {
          backgroundColor: theme.colors.background.primary,
          ...theme.shadows.lg,
        };
      case "glass":
        return {
          backgroundColor: theme.colors.glass.medium,
          borderWidth: 1,
          borderColor: theme.colors.glass.border,
        };
      case "bordered":
        return {
          backgroundColor: theme.colors.background.primary,
          borderWidth: 1,
          borderColor: theme.colors.border.light,
        };
      default:
        return {
          backgroundColor: theme.colors.background.primary,
          ...theme.shadows.md,
        };
    }
  };

  const CardContent = () => (
    <Animated.View
      style={[
        getCardStyle(),
        animated && {
          opacity: fadeAnim,
          transform: [{ translateY: translateYAnim }, { scale: scaleAnim }],
        },
        style,
      ]}
      {...props}
    >
      {children}
    </Animated.View>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
      >
        <CardContent />
      </TouchableOpacity>
    );
  }

  return <CardContent />;
};

export default AnimatedCard;
