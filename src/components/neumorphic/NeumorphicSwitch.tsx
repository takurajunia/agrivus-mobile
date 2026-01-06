/**
 * NeumorphicSwitch Component
 *
 * Toggle switch with neumorphic styling and smooth animations.
 */

import React, { useRef, useEffect } from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Animated,
  ViewStyle,
} from "react-native";
import {
  neumorphicColors,
  getNeumorphicShadow,
  spacing,
} from "../../theme/neumorphic";

interface NeumorphicSwitchProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
  style?: ViewStyle;
  size?: "small" | "medium" | "large";
}

const NeumorphicSwitch: React.FC<NeumorphicSwitchProps> = ({
  value,
  onValueChange,
  disabled = false,
  style,
  size = "medium",
}) => {
  const translateAnim = useRef(new Animated.Value(value ? 1 : 0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.spring(translateAnim, {
      toValue: value ? 1 : 0,
      useNativeDriver: true,
      speed: 20,
      bounciness: 8,
    }).start();
  }, [value, translateAnim]);

  const handlePress = () => {
    if (!disabled) {
      onValueChange(!value);
    }
  };

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.9,
      useNativeDriver: true,
      speed: 50,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
    }).start();
  };

  const getSizeStyles = () => {
    const sizes = {
      small: { track: { width: 40, height: 24 }, thumb: 18, padding: 3 },
      medium: { track: { width: 52, height: 32 }, thumb: 26, padding: 3 },
      large: { track: { width: 64, height: 38 }, thumb: 32, padding: 3 },
    };
    return sizes[size];
  };

  const sizeStyles = getSizeStyles();
  const translateDistance =
    sizeStyles.track.width - sizeStyles.thumb - sizeStyles.padding * 2;

  const translateX = translateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, translateDistance],
  });

  const backgroundColor = translateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [neumorphicColors.base.pressed, neumorphicColors.primary[500]],
  });

  return (
    <TouchableOpacity
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      activeOpacity={1}
      style={style}
    >
      <Animated.View
        style={[
          styles.track,
          sizeStyles.track,
          { backgroundColor },
          disabled && styles.disabled,
        ]}
      >
        <Animated.View
          style={[
            styles.thumb,
            {
              width: sizeStyles.thumb,
              height: sizeStyles.thumb,
              borderRadius: sizeStyles.thumb / 2,
              transform: [{ translateX }, { scale: scaleAnim }],
            },
            getNeumorphicShadow(2),
          ]}
        />
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  track: {
    borderRadius: 16,
    justifyContent: "center",
    paddingHorizontal: 3,
  },
  thumb: {
    backgroundColor: neumorphicColors.base.card,
  },
  disabled: {
    opacity: 0.5,
  },
});

export default NeumorphicSwitch;
