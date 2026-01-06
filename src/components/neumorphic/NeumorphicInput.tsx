/**
 * NeumorphicInput Component
 *
 * Text input with neumorphic styling, focus states,
 * and validation feedback.
 */

import React, { useState, useRef, useCallback } from "react";
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  Animated,
  TextInputProps,
  ViewStyle,
  TouchableOpacity,
} from "react-native";
import { Eye, EyeOff } from "lucide-react-native";
import {
  neumorphicColors,
  inputStyles,
  typography,
  spacing,
  borderRadius,
} from "../../theme/neumorphic";

interface NeumorphicInputProps extends Omit<TextInputProps, "style"> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerStyle?: ViewStyle;
  inputStyle?: ViewStyle;
  variant?: "default" | "search" | "textarea";
  showPasswordToggle?: boolean;
}

const NeumorphicInput: React.FC<NeumorphicInputProps> = ({
  label,
  error,
  hint,
  leftIcon,
  rightIcon,
  containerStyle,
  inputStyle,
  variant = "default",
  showPasswordToggle = false,
  secureTextEntry,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const focusAnim = useRef(new Animated.Value(0)).current;

  const handleFocus = useCallback(
    (e: any) => {
      setIsFocused(true);
      Animated.timing(focusAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: false,
      }).start();
      props.onFocus?.(e);
    },
    [focusAnim, props.onFocus]
  );

  const handleBlur = useCallback(
    (e: any) => {
      setIsFocused(false);
      Animated.timing(focusAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }).start();
      props.onBlur?.(e);
    },
    [focusAnim, props.onBlur]
  );

  const borderColor = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [
      error ? neumorphicColors.semantic.error : "transparent",
      error ? neumorphicColors.semantic.error : neumorphicColors.primary[500],
    ],
  });

  const borderWidth = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [error ? 2 : 1, 2],
  });

  const getInputContainerStyle = (): ViewStyle => {
    switch (variant) {
      case "search":
        return {
          backgroundColor: neumorphicColors.base.card,
          borderRadius: borderRadius.pill,
          paddingHorizontal: spacing.md,
          paddingVertical: spacing.sm,
          flexDirection: "row",
          alignItems: "center",
        };
      case "textarea":
        return {
          backgroundColor: neumorphicColors.base.input,
          borderRadius: borderRadius.md,
          padding: spacing.md,
          minHeight: 120,
        };
      default:
        return {
          backgroundColor: neumorphicColors.base.input,
          borderRadius: borderRadius.md,
          paddingHorizontal: spacing.md,
          paddingVertical: spacing.md,
          flexDirection: "row",
          alignItems: "center",
        };
    }
  };

  const renderPasswordToggle = () => {
    if (!showPasswordToggle) return null;

    return (
      <TouchableOpacity
        onPress={() => setIsPasswordVisible(!isPasswordVisible)}
        style={styles.passwordToggle}
      >
        {isPasswordVisible ? (
          <EyeOff size={20} color={neumorphicColors.text.tertiary} />
        ) : (
          <Eye size={20} color={neumorphicColors.text.tertiary} />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text
          style={[
            styles.label,
            isFocused && styles.labelFocused,
            error && styles.labelError,
          ]}
        >
          {label}
        </Text>
      )}

      <Animated.View
        style={[
          getInputContainerStyle(),
          {
            borderWidth,
            borderColor,
          },
          isFocused && styles.focusedShadow,
          inputStyle,
        ]}
      >
        {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}

        <TextInput
          {...props}
          style={[
            styles.input,
            variant === "textarea" && styles.textareaInput,
            { flex: 1 },
          ]}
          placeholderTextColor={neumorphicColors.text.tertiary}
          onFocus={handleFocus}
          onBlur={handleBlur}
          secureTextEntry={
            showPasswordToggle ? !isPasswordVisible : secureTextEntry
          }
          multiline={variant === "textarea"}
          textAlignVertical={variant === "textarea" ? "top" : "center"}
        />

        {renderPasswordToggle()}
        {rightIcon && !showPasswordToggle && (
          <View style={styles.rightIcon}>{rightIcon}</View>
        )}
      </Animated.View>

      {(error || hint) && (
        <Text style={[styles.helperText, error && styles.errorText]}>
          {error || hint}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  label: {
    ...typography.bodySmall,
    fontWeight: "500",
    color: neumorphicColors.text.secondary,
    marginBottom: spacing.sm,
  },
  labelFocused: {
    color: neumorphicColors.primary[600],
  },
  labelError: {
    color: neumorphicColors.semantic.error,
  },
  input: {
    ...typography.body,
    color: neumorphicColors.text.primary,
    padding: 0,
  },
  textareaInput: {
    minHeight: 100,
  },
  leftIcon: {
    marginRight: spacing.sm,
  },
  rightIcon: {
    marginLeft: spacing.sm,
  },
  passwordToggle: {
    marginLeft: spacing.sm,
    padding: spacing.xs,
  },
  helperText: {
    ...typography.caption,
    color: neumorphicColors.text.tertiary,
    marginTop: spacing.xs,
  },
  errorText: {
    color: neumorphicColors.semantic.error,
  },
  focusedShadow: {
    shadowColor: neumorphicColors.primary[500],
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
});

export default NeumorphicInput;
