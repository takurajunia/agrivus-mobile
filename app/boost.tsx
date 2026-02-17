import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import NeumorphicScreen from "../src/components/neumorphic/NeumorphicScreen";
import NeumorphicCard from "../src/components/neumorphic/NeumorphicCard";
import Header from "../src/components/Header";
import BoostBadge from "../src/components/BoostBadge";
import { useAuth } from "../src/contexts/AuthContext";
import {
  neumorphicColors,
  spacing,
  typography,
  borderRadius,
} from "../src/theme/neumorphic";

export default function BoostScreen() {
  const { user } = useAuth();
  const boostMultiplier = user?.boostMultiplier
    ? parseFloat(user.boostMultiplier)
    : 1;
  const totalTransactions = user?.totalTransactions ?? 0;
  const totalVolume = user?.totalVolume
    ? parseFloat(user.totalVolume)
    : 0;
  const streakDays = user?.streakDays ?? 0;
  const platformScore = user?.platformScore ?? 0;
  const recentTransactions7d = user?.recentTransactions7d ?? 0;

  return (
    <NeumorphicScreen variant="dashboard" showLeaves={true}>
      <Header title="Activity Boost" />
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <NeumorphicCard style={styles.boostCard} shadowLevel={2}>
          <Text style={styles.title}>🚀 Your Activity Boost</Text>
          <BoostBadge label={`${boostMultiplier.toFixed(1)}x Boost`} />
          <Text style={styles.subtitle}>
            Your visibility increases when you stay active, respond quickly,
            and complete more transactions.
          </Text>

          <View style={styles.metricsGrid}>
            <NeumorphicCard style={styles.metricCard} shadowLevel={1}>
              <Text style={styles.metricLabel}>📈 Total Transactions</Text>
              <Text style={styles.metricValue}>{totalTransactions}</Text>
            </NeumorphicCard>

            <NeumorphicCard style={styles.metricCard} shadowLevel={1}>
              <Text style={styles.metricLabel}>💰 Total Volume</Text>
              <Text style={styles.metricValue}>
                ${totalVolume.toLocaleString("en-US", {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                })}
              </Text>
            </NeumorphicCard>

            <NeumorphicCard style={styles.metricCard} shadowLevel={1}>
              <Text style={styles.metricLabel}>🔥 Current Streak</Text>
              <Text style={styles.metricValue}>{streakDays} days</Text>
            </NeumorphicCard>
          </View>

          <View style={styles.scoreRow}>
            <Text style={styles.scoreLabel}>Platform Score</Text>
            <Text style={styles.scoreValue}>{platformScore}/100</Text>
          </View>
          <View style={styles.scoreRow}>
            <Text style={styles.scoreLabel}>Recent Activity (7d)</Text>
            <Text style={styles.scoreValue}>{recentTransactions7d}</Text>
          </View>
        </NeumorphicCard>

        <NeumorphicCard style={styles.tipsCard} shadowLevel={1}>
          <Text style={styles.tipsTitle}>💡 How to Increase Your Boost</Text>
          <View style={styles.tipList}>
            <Text style={styles.tipItem}>
              • Complete more transactions (biggest impact)
            </Text>
            <Text style={styles.tipItem}>
              • Stay active daily to build your streak
            </Text>
            <Text style={styles.tipItem}>• Maintain high quality ratings</Text>
            <Text style={styles.tipItem}>
              • Be active in the last 7 to 30 days
            </Text>
          </View>
        </NeumorphicCard>
      </ScrollView>
    </NeumorphicScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  boostCard: {
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.h3,
    color: neumorphicColors.text.primary,
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.body,
    color: neumorphicColors.text.secondary,
    marginTop: spacing.xs,
  },
  metricsGrid: {
    marginTop: spacing.lg,
    gap: spacing.md,
  },
  metricCard: {
    padding: spacing.md,
    borderRadius: borderRadius.lg,
  },
  metricLabel: {
    ...typography.caption,
    color: neumorphicColors.text.secondary,
    marginBottom: spacing.xs,
  },
  metricValue: {
    ...typography.h4,
    color: neumorphicColors.text.primary,
  },
  scoreRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: spacing.md,
  },
  scoreLabel: {
    ...typography.body,
    color: neumorphicColors.text.secondary,
  },
  scoreValue: {
    ...typography.body,
    color: neumorphicColors.text.primary,
    fontWeight: "700",
  },
  tipsCard: {
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
  },
  tipsTitle: {
    ...typography.h4,
    color: neumorphicColors.text.primary,
    marginBottom: spacing.sm,
  },
  tipList: {
    gap: spacing.xs,
  },
  tipItem: {
    ...typography.body,
    color: neumorphicColors.text.secondary,
  },
});
