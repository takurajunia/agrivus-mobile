# Agrivus Mobile Implementation Guide

## Neumorphic Design System - Step-by-Step Integration

---

## Table of Contents

1. [Quick Start](#1-quick-start)
2. [Screen Backgrounds](#2-screen-backgrounds)
3. [Cards Implementation](#3-cards-implementation)
4. [Buttons Implementation](#4-buttons-implementation)
5. [Input Fields](#5-input-fields)
6. [Leaf Patterns](#6-leaf-patterns)
7. [Typography](#7-typography)
8. [Badges & Status](#8-badges--status)
9. [Complete Screen Examples](#9-complete-screen-examples)

---

## 1. Quick Start

### Importing the Design System

```tsx
// Import everything
import neumorphic from "../theme/neumorphic";

// Or import specific utilities
import {
  neumorphicColors,
  cardStyles,
  buttonStyles,
  inputStyles,
  getNeumorphicShadow,
  typography,
  spacing,
} from "../theme/neumorphic";
```

### Basic Usage

```tsx
import { View, Text, TouchableOpacity } from "react-native";
import {
  cardStyles,
  buttonStyles,
  buttonTextStyles,
  typography,
} from "../theme/neumorphic";

const MyComponent = () => (
  <View style={cardStyles.standard}>
    <Text style={typography.h4}>Card Title</Text>
    <TouchableOpacity style={buttonStyles.primary.default}>
      <Text style={buttonTextStyles.primary}>Press Me</Text>
    </TouchableOpacity>
  </View>
);
```

---

## 2. Screen Backgrounds

### Before (Flat Design)

```tsx
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
});
```

### After (Neumorphic)

```tsx
import { screenBackgrounds, neumorphicColors } from "../theme/neumorphic";
import { LinearGradient } from "expo-linear-gradient";

// Option 1: Simple solid background
const styles = StyleSheet.create({
  container: {
    flex: 1,
    ...screenBackgrounds.default,
  },
});

// Option 2: Gradient background (recommended for auth screens)
const AuthScreen = () => (
  <LinearGradient
    colors={[neumorphicColors.primary[50], neumorphicColors.base.background]}
    locations={[0, 0.3]}
    style={{ flex: 1 }}
  >
    {/* Screen content */}
  </LinearGradient>
);

// Option 3: Full gradient
const GradientScreen = () => (
  <LinearGradient
    colors={["#E8E8EC", "#F0F0F4", "#E8E8EC"]}
    start={{ x: 0, y: 0 }}
    end={{ x: 1, y: 1 }}
    style={{ flex: 1 }}
  >
    {/* Screen content */}
  </LinearGradient>
);
```

---

## 3. Cards Implementation

### Before (Flat Design)

```tsx
const styles = StyleSheet.create({
  card: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
});
```

### After (Neumorphic)

```tsx
import { cardStyles, getNeumorphicShadow } from "../theme/neumorphic";

// Use pre-built styles
<View style={cardStyles.standard}>{/* Card content */}</View>;

// Or build custom cards
const styles = StyleSheet.create({
  customCard: {
    backgroundColor: "#FAFAFA",
    borderRadius: 16,
    padding: 20,
    ...getNeumorphicShadow(2), // Level 2 shadow
  },
  elevatedCard: {
    backgroundColor: "#FAFAFA",
    borderRadius: 16,
    padding: 20,
    ...getNeumorphicShadow(3), // More prominent
  },
});
```

### Interactive Cards with Press State

```tsx
import { useState } from "react";
import { Pressable, View, Text } from "react-native";
import { cardStyles, typography } from "../theme/neumorphic";

const InteractiveCard = ({ title, onPress }) => {
  const [isPressed, setIsPressed] = useState(false);

  return (
    <Pressable
      onPressIn={() => setIsPressed(true)}
      onPressOut={() => setIsPressed(false)}
      onPress={onPress}
      style={isPressed ? cardStyles.pressed : cardStyles.standard}
    >
      <Text style={typography.h5}>{title}</Text>
    </Pressable>
  );
};
```

### Stat Cards

```tsx
import { View, Text } from "react-native";
import {
  cardStyles,
  typography,
  neumorphicColors,
  spacing,
} from "../theme/neumorphic";

const StatCard = ({ icon, label, value }) => (
  <View style={cardStyles.stat}>
    <View
      style={{
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: `${neumorphicColors.primary[500]}15`, // 15% opacity
        alignItems: "center",
        justifyContent: "center",
        marginBottom: spacing.sm,
      }}
    >
      {icon}
    </View>
    <Text style={typography.caption}>{label}</Text>
    <Text style={typography.h3}>{value}</Text>
  </View>
);
```

---

## 4. Buttons Implementation

### Before (Flat Design)

```tsx
<TouchableOpacity
  style={{
    backgroundColor: "#4CAF50",
    borderRadius: 8,
    padding: 16,
  }}
>
  <Text style={{ color: "white", textAlign: "center" }}>Submit</Text>
</TouchableOpacity>
```

### After (Neumorphic) - Primary Button

```tsx
import { useState } from "react";
import { Pressable, Text, ActivityIndicator } from "react-native";
import {
  buttonStyles,
  buttonTextStyles,
  neumorphicColors,
} from "../theme/neumorphic";

const PrimaryButton = ({ title, onPress, disabled, loading }) => {
  const [isPressed, setIsPressed] = useState(false);

  const getButtonStyle = () => {
    if (disabled || loading) return buttonStyles.primary.disabled;
    if (isPressed) return buttonStyles.primary.pressed;
    return buttonStyles.primary.default;
  };

  return (
    <Pressable
      onPressIn={() => !disabled && setIsPressed(true)}
      onPressOut={() => setIsPressed(false)}
      onPress={!disabled && !loading ? onPress : undefined}
      style={getButtonStyle()}
    >
      {loading ? (
        <ActivityIndicator color={neumorphicColors.text.inverse} />
      ) : (
        <Text style={buttonTextStyles.primary}>{title}</Text>
      )}
    </Pressable>
  );
};
```

### Secondary Button (Outlined)

```tsx
const SecondaryButton = ({ title, onPress }) => {
  const [isPressed, setIsPressed] = useState(false);

  return (
    <Pressable
      onPressIn={() => setIsPressed(true)}
      onPressOut={() => setIsPressed(false)}
      onPress={onPress}
      style={
        isPressed
          ? buttonStyles.secondary.pressed
          : buttonStyles.secondary.default
      }
    >
      <Text style={buttonTextStyles.secondary}>{title}</Text>
    </Pressable>
  );
};
```

### Icon Button

```tsx
import { Feather } from "@expo/vector-icons";

const IconButton = ({ icon, onPress }) => {
  const [isPressed, setIsPressed] = useState(false);

  return (
    <Pressable
      onPressIn={() => setIsPressed(true)}
      onPressOut={() => setIsPressed(false)}
      onPress={onPress}
      style={isPressed ? buttonStyles.icon.pressed : buttonStyles.icon.default}
    >
      <Feather name={icon} size={24} color={neumorphicColors.text.primary} />
    </Pressable>
  );
};
```

### Button Sizes

```tsx
const buttonSizes = {
  small: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  medium: {
    paddingVertical: 18,
    paddingHorizontal: 24,
  },
  large: {
    paddingVertical: 22,
    paddingHorizontal: 32,
  },
};

// Usage
<Pressable style={[buttonStyles.primary.default, buttonSizes.large]}>
  <Text style={[buttonTextStyles.primary, { fontSize: 18 }]}>Large Button</Text>
</Pressable>;
```

---

## 5. Input Fields

### Before (Flat Design)

```tsx
<TextInput
  style={{
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
  }}
  placeholder="Enter text"
/>
```

### After (Neumorphic) - Standard Input

```tsx
import { useState } from "react";
import { View, TextInput, Text } from "react-native";
import {
  inputStyles,
  typography,
  neumorphicColors,
  spacing,
} from "../theme/neumorphic";

const NeumorphicInput = ({
  label,
  placeholder,
  value,
  onChangeText,
  error,
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const getInputStyle = () => {
    if (error) return inputStyles.error;
    if (isFocused) return inputStyles.focused;
    return inputStyles.default;
  };

  return (
    <View style={{ marginBottom: spacing.md }}>
      {label && (
        <Text style={[typography.bodySmall, { marginBottom: spacing.xs }]}>
          {label}
        </Text>
      )}
      <TextInput
        style={getInputStyle()}
        placeholder={placeholder}
        placeholderTextColor={neumorphicColors.text.tertiary}
        value={value}
        onChangeText={onChangeText}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      />
      {error && (
        <Text
          style={[
            typography.caption,
            { color: neumorphicColors.semantic.error, marginTop: spacing.xs },
          ]}
        >
          {error}
        </Text>
      )}
    </View>
  );
};
```

### Password Input with Toggle

```tsx
import { Feather } from "@expo/vector-icons";

const PasswordInput = ({ label, value, onChangeText, error }) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View style={{ marginBottom: spacing.md }}>
      {label && (
        <Text style={[typography.bodySmall, { marginBottom: spacing.xs }]}>
          {label}
        </Text>
      )}
      <View style={{ position: "relative" }}>
        <TextInput
          style={[
            error
              ? inputStyles.error
              : isFocused
              ? inputStyles.focused
              : inputStyles.default,
            { paddingRight: 48 },
          ]}
          placeholder="Enter password"
          placeholderTextColor={neumorphicColors.text.tertiary}
          value={value}
          onChangeText={onChangeText}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          secureTextEntry={!showPassword}
        />
        <Pressable
          onPress={() => setShowPassword(!showPassword)}
          style={{
            position: "absolute",
            right: 16,
            top: "50%",
            transform: [{ translateY: -12 }],
          }}
        >
          <Feather
            name={showPassword ? "eye-off" : "eye"}
            size={24}
            color={neumorphicColors.text.tertiary}
          />
        </Pressable>
      </View>
      {error && (
        <Text
          style={[
            typography.caption,
            { color: neumorphicColors.semantic.error, marginTop: spacing.xs },
          ]}
        >
          {error}
        </Text>
      )}
    </View>
  );
};
```

### Search Input

```tsx
import { Feather } from "@expo/vector-icons";

const SearchInput = ({ value, onChangeText, placeholder = "Search..." }) => (
  <View style={{ position: "relative" }}>
    <TextInput
      style={inputStyles.search}
      placeholder={placeholder}
      placeholderTextColor={neumorphicColors.text.tertiary}
      value={value}
      onChangeText={onChangeText}
    />
    <Feather
      name="search"
      size={20}
      color={neumorphicColors.text.tertiary}
      style={{
        position: "absolute",
        left: 16,
        top: "50%",
        transform: [{ translateY: -10 }],
      }}
    />
  </View>
);
```

---

## 6. Leaf Patterns

### Background Leaf Component

```tsx
import { View, Image, StyleSheet } from "react-native";
import { leafPatterns } from "../theme/neumorphic";

// SVG Leaf (using react-native-svg)
import Svg, { Path } from "react-native-svg";

const LeafIcon = ({ size, color, rotation }) => (
  <Svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    style={{ transform: [{ rotate: `${rotation}deg` }] }}
  >
    <Path
      d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22L6.66 19.7C7.14 19.87 7.64 20 8.17 20C12 20 15.18 17.47 16.32 14H17.5C19.43 14 21 12.43 21 10.5C21 10.18 20.96 9.87 20.89 9.57L17 8ZM17.27 12H15.62C15.87 11.38 16 10.71 16 10C16 9.46 15.93 8.92 15.8 8.41L17.88 9.1C17.96 9.56 18 10.03 18 10.5C18 10.99 17.71 11.53 17.27 12Z"
      fill={color}
    />
  </Svg>
);

// Background leaves wrapper
const LeafBackground = ({ pattern = "dashboard", children }) => {
  const config = leafPatterns[pattern];

  return (
    <View style={{ flex: 1 }}>
      {/* Leaf decorations */}
      {config.positions.map((pos, index) => (
        <View
          key={index}
          style={[
            styles.leafContainer,
            {
              opacity: config.opacity,
              ...(pos.top !== undefined && { top: pos.top }),
              ...(pos.bottom !== undefined && { bottom: pos.bottom }),
              ...(pos.left !== undefined && { left: pos.left }),
              ...(pos.right !== undefined && { right: pos.right }),
            },
          ]}
        >
          <LeafIcon size={pos.size} color="#4CAF50" rotation={pos.rotation} />
        </View>
      ))}

      {/* Actual content */}
      <View style={{ flex: 1, zIndex: 1 }}>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  leafContainer: {
    position: "absolute",
    zIndex: 0,
  },
});

// Usage
const DashboardScreen = () => (
  <View style={screenBackgrounds.default}>
    <LeafBackground pattern="dashboard">
      {/* Your screen content */}
    </LeafBackground>
  </View>
);
```

---

## 7. Typography

### Before (Inconsistent)

```tsx
<Text style={{ fontSize: 24, fontWeight: 'bold' }}>Title</Text>
<Text style={{ fontSize: 14, color: '#666' }}>Description</Text>
```

### After (Systematic)

```tsx
import { typography, neumorphicColors } from '../theme/neumorphic';

// Headings
<Text style={typography.h1}>Main Title</Text>
<Text style={typography.h2}>Section Header</Text>
<Text style={typography.h3}>Card Title</Text>
<Text style={typography.h4}>Subsection</Text>

// Body text
<Text style={typography.bodyLarge}>Important text</Text>
<Text style={typography.body}>Regular text</Text>
<Text style={typography.bodySmall}>Secondary info</Text>

// Small text
<Text style={typography.caption}>Timestamp or hint</Text>
<Text style={typography.overline}>CATEGORY</Text>

// With color variations
<Text style={[typography.body, { color: neumorphicColors.text.secondary }]}>
  Secondary colored text
</Text>
<Text style={[typography.h4, { color: neumorphicColors.primary[600] }]}>
  Accent heading
</Text>
```

---

## 8. Badges & Status

### Status Badges

```tsx
import { View, Text } from 'react-native';
import { badgeStyles, badgeTextStyles } from '../theme/neumorphic';

const StatusBadge = ({ status, text }) => {
  const backgroundStyle = badgeStyles[status] || badgeStyles.neutral;
  const textStyle = badgeTextStyles[status] || badgeTextStyles.neutral;

  return (
    <View style={[badgeStyles.base, backgroundStyle]}>
      <Text style={[badgeTextStyles.base, textStyle]}>{text}</Text>
    </View>
  );
};

// Usage
<StatusBadge status="success" text="Active" />
<StatusBadge status="warning" text="Pending" />
<StatusBadge status="error" text="Expired" />
<StatusBadge status="info" text="New" />
```

### Avatars with Status

```tsx
import { View, Image } from "react-native";
import { avatarStyles, neumorphicColors } from "../theme/neumorphic";

const Avatar = ({ source, size = "medium", status }) => {
  const statusColors = {
    online: neumorphicColors.semantic.success,
    offline: neumorphicColors.text.tertiary,
    busy: neumorphicColors.semantic.error,
    away: neumorphicColors.semantic.warning,
  };

  return (
    <View style={{ position: "relative" }}>
      <Image source={source} style={avatarStyles[size]} />
      {status && (
        <View
          style={[
            avatarStyles.statusDot,
            { backgroundColor: statusColors[status] },
          ]}
        />
      )}
    </View>
  );
};

// Usage
<Avatar source={{ uri: "https://..." }} size="large" status="online" />;
```

---

## 9. Complete Screen Examples

### Login Screen

```tsx
import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import {
  neumorphicColors,
  typography,
  spacing,
  cardStyles,
  buttonStyles,
  buttonTextStyles,
} from "../theme/neumorphic";

const LoginScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  return (
    <LinearGradient
      colors={[neumorphicColors.primary[50], neumorphicColors.base.background]}
      locations={[0, 0.3]}
      style={{ flex: 1 }}
    >
      <LeafBackground pattern="auth">
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <ScrollView
            contentContainerStyle={{
              flexGrow: 1,
              justifyContent: "center",
              padding: spacing.xl,
            }}
          >
            {/* Logo */}
            <View
              style={{ alignItems: "center", marginBottom: spacing["2xl"] }}
            >
              <Text
                style={[
                  typography.h1,
                  { color: neumorphicColors.primary[600] },
                ]}
              >
                Agrivus
              </Text>
              <Text
                style={[
                  typography.body,
                  { color: neumorphicColors.text.secondary },
                ]}
              >
                Farm to Market Platform
              </Text>
            </View>

            {/* Login Card */}
            <View style={[cardStyles.elevated, { padding: spacing.lg }]}>
              <Text style={[typography.h4, { marginBottom: spacing.lg }]}>
                Welcome Back
              </Text>

              <NeumorphicInput
                label="Email"
                placeholder="Enter your email"
                value={email}
                onChangeText={setEmail}
              />

              <PasswordInput
                label="Password"
                value={password}
                onChangeText={setPassword}
              />

              <Pressable
                style={[
                  buttonStyles.primary.default,
                  { marginTop: spacing.md },
                ]}
                onPress={() => {}}
              >
                <Text style={buttonTextStyles.primary}>Sign In</Text>
              </Pressable>

              <Pressable
                style={[
                  buttonStyles.tertiary.default,
                  { marginTop: spacing.sm },
                ]}
              >
                <Text style={buttonTextStyles.tertiary}>Forgot Password?</Text>
              </Pressable>
            </View>

            {/* Register Link */}
            <View style={{ alignItems: "center", marginTop: spacing.lg }}>
              <Text style={typography.body}>
                Don't have an account?{" "}
                <Text
                  style={{
                    color: neumorphicColors.primary[600],
                    fontWeight: "600",
                  }}
                >
                  Sign Up
                </Text>
              </Text>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LeafBackground>
    </LinearGradient>
  );
};
```

### Dashboard Screen

```tsx
const DashboardScreen = () => {
  return (
    <View style={screenBackgrounds.default}>
      <LeafBackground pattern="dashboard">
        <ScrollView style={{ flex: 1, padding: spacing.md }}>
          {/* Header */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: spacing.lg,
            }}
          >
            <View>
              <Text style={typography.h3}>Welcome, John</Text>
              <Text style={typography.bodySmall}>Today's overview</Text>
            </View>
            <IconButton icon="bell" onPress={() => {}} />
          </View>

          {/* Stats Grid */}
          <View
            style={{
              flexDirection: "row",
              gap: spacing.md,
              marginBottom: spacing.lg,
            }}
          >
            <View style={{ flex: 1 }}>
              <StatCard
                icon={
                  <Feather
                    name="package"
                    size={24}
                    color={neumorphicColors.primary[600]}
                  />
                }
                label="Total Listings"
                value="24"
              />
            </View>
            <View style={{ flex: 1 }}>
              <StatCard
                icon={
                  <Feather
                    name="dollar-sign"
                    size={24}
                    color={neumorphicColors.primary[600]}
                  />
                }
                label="Revenue"
                value="₦45,200"
              />
            </View>
          </View>

          {/* Recent Activity */}
          <View style={cardStyles.standard}>
            <Text style={[typography.h5, { marginBottom: spacing.md }]}>
              Recent Activity
            </Text>
            {/* Activity items */}
          </View>
        </ScrollView>
      </LeafBackground>
    </View>
  );
};
```

### List Screen

```tsx
const ListingsScreen = () => {
  return (
    <View style={screenBackgrounds.default}>
      <LeafBackground pattern="list">
        <View style={{ padding: spacing.md }}>
          <SearchInput
            placeholder="Search listings..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <FlatList
          data={listings}
          contentContainerStyle={{ padding: spacing.md, gap: spacing.md }}
          renderItem={({ item }) => (
            <InteractiveCard
              onPress={() => navigate("detail", { id: item.id })}
            >
              <View style={{ flexDirection: "row", gap: spacing.md }}>
                <Image
                  source={{ uri: item.image }}
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: 12,
                  }}
                />
                <View style={{ flex: 1 }}>
                  <Text style={typography.h5}>{item.title}</Text>
                  <Text style={typography.bodySmall}>{item.description}</Text>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      marginTop: spacing.xs,
                    }}
                  >
                    <Text
                      style={[
                        typography.h6,
                        { color: neumorphicColors.primary[600] },
                      ]}
                    >
                      ₦{item.price}
                    </Text>
                    <StatusBadge status="success" text="Available" />
                  </View>
                </View>
              </View>
            </InteractiveCard>
          )}
        />
      </LeafBackground>
    </View>
  );
};
```

---

## Migration Checklist

Use this checklist when converting screens to neumorphic design:

- [ ] Import neumorphic utilities
- [ ] Update screen background color to `#E8E8EC`
- [ ] Replace card styles with `cardStyles.standard`
- [ ] Update button styles with pill radius (28px)
- [ ] Apply appropriate shadow level (1-5)
- [ ] Update input fields with neumorphic styling
- [ ] Add leaf pattern appropriate for screen type
- [ ] Update typography to use system tokens
- [ ] Ensure proper text colors from palette
- [ ] Add press states to interactive elements
- [ ] Verify touch targets are 44x44px minimum
- [ ] Test accessibility contrast ratios

---

_Implementation Guide v1.0_
