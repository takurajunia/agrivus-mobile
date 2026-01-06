/**
 * NeumorphicAvatar Component
 *
 * User avatar with neumorphic shadow, status indicator,
 * and placeholder support.
 */

import React from "react";
import { View, Image, Text, StyleSheet, ViewStyle } from "react-native";
import { User } from "lucide-react-native";
import {
  neumorphicColors,
  avatarStyles,
  getNeumorphicShadow,
  spacing,
} from "../../theme/neumorphic";

type AvatarSize = "small" | "medium" | "large" | "xlarge";
type StatusType = "online" | "offline" | "busy" | "away";

interface NeumorphicAvatarProps {
  source?: { uri: string } | number;
  name?: string;
  size?: AvatarSize;
  status?: StatusType;
  showStatus?: boolean;
  style?: ViewStyle;
}

const NeumorphicAvatar: React.FC<NeumorphicAvatarProps> = ({
  source,
  name,
  size = "medium",
  status,
  showStatus = false,
  style,
}) => {
  const getSizeStyles = () => {
    const sizes: Record<
      AvatarSize,
      { container: number; font: number; icon: number }
    > = {
      small: { container: 40, font: 14, icon: 20 },
      medium: { container: 56, font: 18, icon: 28 },
      large: { container: 80, font: 28, icon: 40 },
      xlarge: { container: 120, font: 40, icon: 60 },
    };
    return sizes[size];
  };

  const getStatusColor = () => {
    const statusColors: Record<StatusType, string> = {
      online: neumorphicColors.semantic.success,
      offline: neumorphicColors.text.tertiary,
      busy: neumorphicColors.semantic.error,
      away: neumorphicColors.semantic.warning,
    };
    return status ? statusColors[status] : neumorphicColors.semantic.success;
  };

  const getInitials = (fullName?: string) => {
    if (!fullName) return "";
    const names = fullName.split(" ");
    if (names.length >= 2) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return names[0][0]?.toUpperCase() || "";
  };

  const sizeStyles = getSizeStyles();
  const containerSize = sizeStyles.container;

  const renderContent = () => {
    if (source) {
      return (
        <Image
          source={source}
          style={[
            styles.image,
            {
              width: containerSize,
              height: containerSize,
              borderRadius: containerSize / 2,
            },
          ]}
        />
      );
    }

    if (name) {
      return (
        <View
          style={[
            styles.placeholder,
            {
              width: containerSize,
              height: containerSize,
              borderRadius: containerSize / 2,
            },
          ]}
        >
          <Text style={[styles.initials, { fontSize: sizeStyles.font }]}>
            {getInitials(name)}
          </Text>
        </View>
      );
    }

    return (
      <View
        style={[
          styles.placeholder,
          {
            width: containerSize,
            height: containerSize,
            borderRadius: containerSize / 2,
          },
        ]}
      >
        <User size={sizeStyles.icon} color={neumorphicColors.primary[600]} />
      </View>
    );
  };

  const statusDotSize = Math.max(12, containerSize * 0.25);

  return (
    <View
      style={[
        styles.container,
        {
          width: containerSize,
          height: containerSize,
          borderRadius: containerSize / 2,
        },
        getNeumorphicShadow(2),
        style,
      ]}
    >
      <View
        style={[
          styles.border,
          {
            width: containerSize,
            height: containerSize,
            borderRadius: containerSize / 2,
          },
        ]}
      >
        {renderContent()}
      </View>

      {showStatus && status && (
        <View
          style={[
            styles.statusDot,
            {
              width: statusDotSize,
              height: statusDotSize,
              borderRadius: statusDotSize / 2,
              backgroundColor: getStatusColor(),
              borderWidth: statusDotSize * 0.15,
            },
          ]}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: neumorphicColors.base.card,
    overflow: "visible",
  },
  border: {
    borderWidth: 3,
    borderColor: neumorphicColors.base.card,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  placeholder: {
    backgroundColor: neumorphicColors.primary[50],
    justifyContent: "center",
    alignItems: "center",
  },
  initials: {
    fontWeight: "600",
    color: neumorphicColors.primary[700],
  },
  statusDot: {
    position: "absolute",
    bottom: 0,
    right: 0,
    borderColor: neumorphicColors.base.card,
  },
});

export default NeumorphicAvatar;
