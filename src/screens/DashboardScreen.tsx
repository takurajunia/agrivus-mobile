import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useAuth } from "../contexts/AuthContext";
import { StackNavigationProp } from "@react-navigation/stack";
import { NeumorphicScreen } from "../components/neumorphic/NeumorphicScreen";
import { NeumorphicButton } from "../components/neumorphic/NeumorphicButton";
import { NeumorphicCard } from "../components/neumorphic/NeumorphicCard";
import { neumorphicColors, typography, spacing } from "../theme/neumorphic";

type DashboardScreenProps = {
  navigation: StackNavigationProp<any>;
};

const DashboardScreen: React.FC<DashboardScreenProps> = ({ navigation }) => {
  const auth = useAuth();

  return (
    <NeumorphicScreen variant="dashboard">
      <View style={styles.content}>
        <NeumorphicCard style={styles.welcomeCard}>
          <Text style={styles.title}>Dashboard</Text>
          <Text style={styles.subtitle}>Welcome to Agrivus</Text>
        </NeumorphicCard>

        <View style={styles.buttonContainer}>
          <NeumorphicButton
            title="Logout"
            onPress={auth.logout}
            variant="secondary"
            fullWidth
          />
        </View>
      </View>
    </NeumorphicScreen>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: spacing.md,
  },
  welcomeCard: {
    width: "100%",
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.h2,
    color: neumorphicColors.text.primary,
    marginBottom: spacing.sm,
    textAlign: "center",
  },
  subtitle: {
    ...typography.body,
    color: neumorphicColors.text.secondary,
    textAlign: "center",
  },
  buttonContainer: {
    width: "100%",
    paddingHorizontal: spacing.md,
  },
});

export default DashboardScreen;
