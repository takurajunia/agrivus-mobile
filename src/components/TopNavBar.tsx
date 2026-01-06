/**
 * TopNavBar Component
 *
 * Spotify-inspired top navigation bar with profile avatar,
 * chat, notifications, and auctions navigation.
 */

import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { MessageCircle, Bell } from "lucide-react-native";
import { useAuth } from "../contexts/AuthContext";
import { useNotifications } from "../contexts/NotificationsContext";
import {
  neumorphicColors,
  spacing,
  borderRadius,
  getNeumorphicShadow,
} from "../theme/neumorphic";

interface TopNavBarProps {
  title?: string;
  showGreeting?: boolean;
  unreadChats?: number;
}

const TopNavBar: React.FC<TopNavBarProps> = ({
  title,
  showGreeting = true,
  unreadChats = 0,
}) => {
  const router = useRouter();
  const { user } = useAuth();
  const { unreadCount: notificationCount } = useNotifications();

  // Get user initials for avatar placeholder
  const getInitials = (fullName?: string) => {
    if (!fullName) return "U";
    const names = fullName.split(" ");
    if (names.length >= 2) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return names[0][0]?.toUpperCase() || "U";
  };

  const handleProfilePress = () => {
    router.push("/(tabs)/profile");
  };

  const handleChatPress = () => {
    router.push("/(tabs)/chat");
  };

  const handleNotificationsPress = () => {
    router.push("/(tabs)/notifications");
  };

  const handleAuctionsPress = () => {
    router.push("/(tabs)/auctions");
  };

  return (
    <View style={styles.container}>
      {/* Top Row: Profile, Title/Greeting, and Icons */}
      <View style={styles.topRow}>
        {/* Left: Profile Avatar */}
        <TouchableOpacity
          style={styles.avatarButton}
          onPress={handleProfilePress}
          activeOpacity={0.7}
        >
          {(user as any)?.profilePicture ? (
            <Image
              source={{ uri: (user as any).profilePicture }}
              style={styles.avatarImage}
            />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarInitials}>
                {getInitials(user?.fullName)}
              </Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Center: Title or Greeting */}
        <View style={styles.titleContainer}>
          {showGreeting ? (
            <>
              <Text style={styles.greetingText}>Good day,</Text>
              <Text style={styles.userName} numberOfLines={1}>
                {user?.fullName?.split(" ")[0] || "User"}
              </Text>
            </>
          ) : title ? (
            <Text style={styles.titleText}>{title}</Text>
          ) : null}
        </View>

        {/* Right: Action Icons */}
        <View style={styles.actionsContainer}>
          {/* Notifications */}
          <TouchableOpacity
            style={styles.iconButton}
            onPress={handleNotificationsPress}
            activeOpacity={0.7}
          >
            <Bell
              size={24}
              color={neumorphicColors.text.primary}
              strokeWidth={1.8}
            />
            {notificationCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {notificationCount > 9 ? "9+" : notificationCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Chat */}
          <TouchableOpacity
            style={styles.iconButton}
            onPress={handleChatPress}
            activeOpacity={0.7}
          >
            <MessageCircle
              size={24}
              color={neumorphicColors.text.primary}
              strokeWidth={1.8}
            />
            {unreadChats > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {unreadChats > 9 ? "9+" : unreadChats}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Bottom Row: Navigation Pills */}
      <View style={styles.navPillsContainer}>
        <TouchableOpacity
          style={styles.navPill}
          onPress={handleAuctionsPress}
          activeOpacity={0.7}
        >
          <Text style={styles.navPillText}>Auctions</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navPill}
          onPress={() => router.push("/agrimall")}
          activeOpacity={0.7}
        >
          <Text style={styles.navPillText}>AgriMall</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navPill}
          onPress={() => router.push("/export-gateway")}
          activeOpacity={0.7}
        >
          <Text style={styles.navPillText}>Export</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: neumorphicColors.base.background,
    paddingTop: Platform.OS === "ios" ? 50 : 40,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
    ...getNeumorphicShadow(1),
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.md,
  },
  avatarButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: "hidden",
    ...getNeumorphicShadow(2),
  },
  avatarImage: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  avatarPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: neumorphicColors.primary[600],
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitials: {
    color: neumorphicColors.text.inverse,
    fontSize: 16,
    fontWeight: "700",
  },
  titleContainer: {
    flex: 1,
    marginHorizontal: spacing.md,
  },
  greetingText: {
    fontSize: 13,
    color: neumorphicColors.text.secondary,
    fontWeight: "500",
  },
  userName: {
    fontSize: 20,
    fontWeight: "700",
    color: neumorphicColors.text.primary,
    marginTop: 2,
  },
  titleText: {
    fontSize: 22,
    fontWeight: "700",
    color: neumorphicColors.text.primary,
  },
  actionsContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: neumorphicColors.base.card,
    alignItems: "center",
    justifyContent: "center",
    ...getNeumorphicShadow(1),
  },
  badge: {
    position: "absolute",
    top: 0,
    right: 0,
    backgroundColor: neumorphicColors.semantic.error,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: neumorphicColors.base.card,
  },
  badgeText: {
    color: neumorphicColors.text.inverse,
    fontSize: 10,
    fontWeight: "700",
  },
  navPillsContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  navPill: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: neumorphicColors.base.card,
    borderRadius: borderRadius.full,
    ...getNeumorphicShadow(1),
  },
  navPillText: {
    fontSize: 14,
    fontWeight: "600",
    color: neumorphicColors.text.primary,
  },
});

export default TopNavBar;
