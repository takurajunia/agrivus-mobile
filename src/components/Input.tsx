import React, { useState } from "react";
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  StyleProp,
  TextStyle,
  ViewStyle,
  TouchableOpacity,
} from "react-native";
import { Eye, EyeOff } from "lucide-react-native";
import { theme } from "../theme/tokens";

type InputProps = {
  label?: string;
  placeholder?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  error?: string;
  style?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
  secureTextEntry?: boolean;
  disabled?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  [key: string]: any;
};

const Input: React.FC<InputProps> = ({
  label,
  placeholder,
  value,
  onChangeText,
  error,
  style,
  inputStyle,
  secureTextEntry = false,
  disabled = false,
  leftIcon,
  rightIcon,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const getContainerStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      backgroundColor: theme.colors.neumorphic.input,
      borderRadius: theme.borderRadius.lg,
      borderWidth: error ? 2 : isFocused ? 2 : 1,
      borderColor: error
        ? theme.colors.error
        : isFocused
        ? theme.colors.primary[500]
        : "transparent",
      flexDirection: "row",
      alignItems: "center",
      minHeight: 52,
      paddingHorizontal: theme.spacing.md,
    };

    if (isFocused && !error) {
      return {
        ...baseStyle,
        shadowColor: theme.colors.primary[500],
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      };
    }

    return baseStyle;
  };

  const renderPasswordToggle = () => {
    if (!secureTextEntry) return rightIcon;

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
  };

  return (
    <View style={[styles.wrapper, style]}>
      {label && <Text style={styles.label}>{label}</Text>}

      <View style={getContainerStyle()}>
        {leftIcon && <View style={styles.iconContainer}>{leftIcon}</View>}

        <TextInput
          style={[styles.input, inputStyle]}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.text.tertiary}
          value={value}
          onChangeText={onChangeText}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          editable={!disabled}
          secureTextEntry={secureTextEntry && !showPassword}
          {...props}
        />

        {renderPasswordToggle()}
      </View>

      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginVertical: theme.spacing.sm,
  },
  label: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xs,
    marginLeft: theme.spacing.xs,
  },
  input: {
    flex: 1,
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.primary,
    paddingVertical: theme.spacing.md,
  },
  iconContainer: {
    padding: theme.spacing.xs,
    marginRight: theme.spacing.xs,
  },
  errorText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.error,
    marginTop: theme.spacing.xs,
    marginLeft: theme.spacing.xs,
  },
});

export default Input;
