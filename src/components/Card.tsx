import React, { ReactNode, useState } from "react";
import { View, StyleSheet, StyleProp, ViewStyle, Pressable } from "react-native";
import { theme } from "../theme/tokens";

type CardVariant = "standard" | "elevated" | "stat" | "flat";

type CardProps = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  variant?: CardVariant;
  onPress?: () => void;
  disabled?: boolean;
};

const Card: React.FC<CardProps> = ({
  children,
  style,
  variant = "standard",
  onPress,
  disabled = false,
}) => {
  const [isPressed, setIsPressed] = useState(false);

  const getCardStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      backgroundColor: theme.colors.neumorphic.card,
      borderRadius: theme.borderRadius.xl,
      padding: theme.spacing.md,
      marginVertical: theme.spacing.sm,
    };

    switch (variant) {
      case "elevated":
        return {
          ...baseStyle,
          ...theme.neumorphicShadows.level3,
        };
      case "stat":
        return {
          ...baseStyle,
          borderRadius: theme.borderRadius["2xl"],
          padding: theme.spacing.lg,
          ...theme.neumorphicShadows.level2,
        };
      case "flat":
        return {
          ...baseStyle,
          elevation: 0,
          shadowOpacity: 0,
        };
      default:
        return {
          ...baseStyle,
          ...theme.neumorphicShadows.level2,
        };
    }
  };

  const getPressedStyle = (): ViewStyle => ({
    backgroundColor: theme.colors.neumorphic.pressed,
    transform: [{ scale: 0.98 }],
  });

  if (onPress) {
    return (
      <Pressable
        onPressIn={() => setIsPressed(true)}
        onPressOut={() => setIsPressed(false)}
        onPress={onPress}
        disabled={disabled}
        style={[
          getCardStyle(),
          isPressed && getPressedStyle(),
          disabled && styles.disabled,
          style,
        ]}
      >
        {children}
      </Pressable>
    );
  }

  return (
    <View style={[getCardStyle(), style]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  disabled: {
    opacity: 0.6,
  },
});

export default Card;
