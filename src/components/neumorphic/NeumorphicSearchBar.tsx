/**
 * NeumorphicSearchBar Component
 *
 * Search input with neumorphic styling and filter support.
 */

import React, { useState, useRef, useCallback } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Animated,
  ViewStyle,
} from "react-native";
import { Search, X, SlidersHorizontal } from "lucide-react-native";
import {
  neumorphicColors,
  getNeumorphicShadow,
  spacing,
  borderRadius,
  typography,
} from "../../theme/neumorphic";

interface NeumorphicSearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onFilterPress?: () => void;
  showFilter?: boolean;
  style?: ViewStyle;
  autoFocus?: boolean;
}

const NeumorphicSearchBar: React.FC<NeumorphicSearchBarProps> = ({
  value,
  onChangeText,
  placeholder = "Search...",
  onFilterPress,
  showFilter = false,
  style,
  autoFocus = false,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const focusAnim = useRef(new Animated.Value(0)).current;

  const handleFocus = useCallback(() => {
    setIsFocused(true);
    Animated.timing(focusAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [focusAnim]);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
    Animated.timing(focusAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [focusAnim]);

  const handleClear = useCallback(() => {
    onChangeText("");
  }, [onChangeText]);

  const borderColor = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["transparent", neumorphicColors.primary[500]],
  });

  return (
    <Animated.View
      style={[
        styles.container,
        getNeumorphicShadow(isFocused ? 3 : 2),
        { borderColor, borderWidth: isFocused ? 2 : 0 },
        style,
      ]}
    >
      <Search
        size={20}
        color={
          isFocused
            ? neumorphicColors.primary[600]
            : neumorphicColors.text.tertiary
        }
      />

      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={neumorphicColors.text.tertiary}
        style={styles.input}
        onFocus={handleFocus}
        onBlur={handleBlur}
        autoFocus={autoFocus}
        returnKeyType="search"
      />

      {value.length > 0 && (
        <TouchableOpacity onPress={handleClear} style={styles.clearButton}>
          <X size={18} color={neumorphicColors.text.tertiary} />
        </TouchableOpacity>
      )}

      {showFilter && (
        <>
          <View style={styles.divider} />
          <TouchableOpacity onPress={onFilterPress} style={styles.filterButton}>
            <SlidersHorizontal
              size={20}
              color={neumorphicColors.text.secondary}
            />
          </TouchableOpacity>
        </>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: neumorphicColors.base.card,
    borderRadius: borderRadius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    height: 48,
  },
  input: {
    flex: 1,
    marginLeft: spacing.sm,
    ...typography.body,
    color: neumorphicColors.text.primary,
    padding: 0,
  },
  clearButton: {
    padding: spacing.xs,
  },
  divider: {
    width: 1,
    height: 24,
    backgroundColor: neumorphicColors.base.shadowDark + "30",
    marginHorizontal: spacing.sm,
  },
  filterButton: {
    padding: spacing.xs,
  },
});

export default NeumorphicSearchBar;
