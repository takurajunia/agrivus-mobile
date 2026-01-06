import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import {
  neumorphicColors,
  spacing,
  getNeumorphicShadow,
} from "../theme/neumorphic";

type HeaderProps = {
  title: string;
  showBack?: boolean;
  rightComponent?: React.ReactNode;
};

const Header: React.FC<HeaderProps> = ({
  title,
  showBack = true,
  rightComponent,
}) => {
  const router = useRouter();

  return (
    <View style={styles.header}>
      <View style={styles.leftContainer}>
        {showBack && (
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <ArrowLeft
              size={24}
              color={neumorphicColors.text.primary}
              strokeWidth={2}
            />
          </TouchableOpacity>
        )}
      </View>

      <Text style={styles.title} numberOfLines={1}>
        {title}
      </Text>

      <View style={styles.rightContainer}>{rightComponent}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: neumorphicColors.base.background,
    paddingTop: Platform.OS === "ios" ? 50 : 40,
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.md,
    ...getNeumorphicShadow(1),
  },
  leftContainer: {
    width: 48,
    alignItems: "flex-start",
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: neumorphicColors.base.card,
    alignItems: "center",
    justifyContent: "center",
    ...getNeumorphicShadow(1),
  },
  title: {
    flex: 1,
    fontSize: 20,
    fontWeight: "700",
    color: neumorphicColors.text.primary,
    textAlign: "center",
  },
  rightContainer: {
    width: 48,
    alignItems: "flex-end",
  },
});

export default Header;
