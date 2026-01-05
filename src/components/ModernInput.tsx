import React, { useRef, useState } from "react";
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  StyleProp,
  TextStyle,
  ViewStyle,
  Animated,
  TouchableOpacity,
} from "react-native";
import { Eye, EyeOff, Search, X } from "lucide-react-native";
import { theme } from "../theme/tokens";

type ModernInputProps = {
  label?: string;
  placeholder?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  error?: string;
  helperText?: string;
  style?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
  variant?: "default" | "outlined" | "filled" | "search";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  secureTextEntry?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  clearable?: boolean;
  [key: string]: any;
};

const ModernInput: React.FC<ModernInputProps> = ({
  label,
  placeholder,
  value,
  onChangeText,
  error,
  helperText,
  style,
  inputStyle,
  variant = "outlined",
  size = "md",
  disabled = false,
  secureTextEntry = false,
  leftIcon,
  rightIcon,
  clearable = false,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const labelAnim = useRef(new Animated.Value(value ? 1 : 0)).current;
  const borderAnim = useRef(new Animated.Value(0)).current;

  const handleFocus = () => {
    setIsFocused(true);
    Animated.parallel([
      Animated.timing(labelAnim, {
        toValue: 1,
        duration: theme.animation.duration.normal,
        useNativeDriver: false,
      }),
      Animated.timing(borderAnim, {
        toValue: 1,
        duration: theme.animation.duration.fast,
        useNativeDriver: false,
      }),
    ]).start();
  };

  const handleBlur = () => {
    setIsFocused(false);
    if (!value) {
      Animated.timing(labelAnim, {
        toValue: 0,
        duration: theme.animation.duration.normal,
        useNativeDriver: false,
      }).start();
    }
    Animated.timing(borderAnim, {
      toValue: 0,
      duration: theme.animation.duration.fast,
      useNativeDriver: false,
    }).start();
  };

  const handleClear = () => {
    onChangeText?.("");
  };

  const getContainerStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      marginVertical: theme.spacing.sm,
      ...getSizeStyle(),
    };

    return baseStyle;
  };

  const getInputContainerStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      flexDirection: "row",
      alignItems: "center",
      borderRadius: theme.borderRadius.lg,
      ...getVariantStyle(),
      ...getSizeInputStyle(),
    };

    if (error) {
      baseStyle.borderColor = theme.colors.error;
      baseStyle.borderWidth = 2;
    } else if (isFocused) {
      baseStyle.borderColor = theme.colors.primary[500];
      baseStyle.borderWidth = 2;
      // Add focus glow effect
      baseStyle.shadowColor = theme.colors.primary[500];
      baseStyle.shadowOffset = { width: 0, height: 0 };
      baseStyle.shadowOpacity = 0.15;
      baseStyle.shadowRadius = 8;
    }

    return baseStyle;
  };

  const getVariantStyle = (): ViewStyle => {
    switch (variant) {
      case "filled":
        return {
          backgroundColor: theme.colors.neumorphic.input,
          borderWidth: 1,
          borderColor: "transparent",
        };
      case "search":
        return {
          backgroundColor: theme.colors.neumorphic.card,
          borderWidth: 1,
          borderColor: "transparent",
          borderRadius: theme.borderRadius["3xl"],
          paddingHorizontal: theme.spacing.md,
          ...theme.neumorphicShadows.level1,
        };
      default:
        return {
          backgroundColor: theme.colors.neumorphic.input,
          borderWidth: 1,
          borderColor: "transparent",
        };
    }
  };

  const getSizeStyle = (): ViewStyle => {
    switch (size) {
      case "sm":
        return { minHeight: 44 };
      case "lg":
        return { minHeight: 56 };
      default:
        return { minHeight: 52 };
    }
  };

  const getSizeInputStyle = (): ViewStyle => {
    switch (size) {
      case "sm":
        return { paddingHorizontal: theme.spacing.sm };
      case "lg":
        return { paddingHorizontal: theme.spacing.lg };
      default:
        return { paddingHorizontal: theme.spacing.md };
    }
  };

  const getInputStyle = (): TextStyle => {
    const baseStyle: TextStyle = {
      flex: 1,
      fontSize: theme.typography.fontSize.md,
      color: disabled ? theme.colors.text.tertiary : theme.colors.text.primary,
      paddingVertical: theme.spacing.sm,
    };

    return baseStyle;
  };

  const getLabelStyle = () => {
    const interpolatedColor = labelAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [theme.colors.text.tertiary, theme.colors.primary[600]],
    });

    return {
      position: "absolute" as const,
      left: theme.spacing.md,
      top: labelAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [theme.spacing.md, -theme.spacing.xs],
      }),
      fontSize: labelAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [
          theme.typography.fontSize.md,
          theme.typography.fontSize.sm,
        ],
      }),
      color: interpolatedColor,
      backgroundColor:
        variant === "outlined"
          ? theme.colors.background.primary
          : "transparent",
      paddingHorizontal: variant === "outlined" ? theme.spacing.xs : 0,
    };
  };

  const renderRightIcon = () => {
    if (secureTextEntry) {
      return (
        <TouchableOpacity
          onPress={() => setShowPassword(!showPassword)}
          style={styles.iconContainer}
        >
          {showPassword ? (
            <EyeOff size={20} color={theme.colors.text.tertiary} />
          ) : (
            <Eye size={20} color={theme.colors.text.tertiary} />
          )}
        </TouchableOpacity>
      );
    }

    if (clearable && value) {
      return (
        <TouchableOpacity onPress={handleClear} style={styles.iconContainer}>
          <X size={16} color={theme.colors.text.tertiary} />
        </TouchableOpacity>
      );
    }

    if (variant === "search") {
      return <Search size={20} color={theme.colors.text.tertiary} />;
    }

    return rightIcon;
  };

  return (
    <View style={[getContainerStyle(), style]}>
      {label && <Animated.Text style={getLabelStyle()}>{label}</Animated.Text>}

      <View style={getInputContainerStyle()}>
        {leftIcon && <View style={styles.iconContainer}>{leftIcon}</View>}

        <TextInput
          style={[getInputStyle(), inputStyle]}
          placeholder={label ? undefined : placeholder}
          placeholderTextColor={theme.colors.text.tertiary}
          value={value}
          onChangeText={onChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          editable={!disabled}
          secureTextEntry={secureTextEntry && !showPassword}
          {...props}
        />

        {renderRightIcon()}
      </View>

      {(error || helperText) && (
        <Text style={[styles.helperText, error && styles.errorText]}>
          {error || helperText}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  iconContainer: {
    padding: theme.spacing.xs,
    marginHorizontal: theme.spacing.xs,
  },
  helperText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.xs,
    marginLeft: theme.spacing.xs,
  },
  errorText: {
    color: theme.colors.error,
  },
});

export default ModernInput;
