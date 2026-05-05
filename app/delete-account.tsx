import React, { useCallback, useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { ArrowLeft, Trash2 } from "lucide-react-native";

import { useAuth } from "../src/contexts/AuthContext";
import { deleteAccount as deleteAccountRequest } from "../src/services/authService";
import {
  NeumorphicScreen,
  NeumorphicCard,
  NeumorphicButton,
} from "../src/components/neumorphic";
import { neumorphicColors, spacing, typography } from "../src/theme/neumorphic";

export default function DeleteAccountScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!user) {
      router.replace("/login");
    }
  }, [router, user]);

  const handleDelete = useCallback(async () => {
    if (!user?.id) {
      Alert.alert("Error", "You must be logged in to delete your account.");
      return;
    }

    try {
      setDeleting(true);
      await deleteAccountRequest();

      // Remove locally-stored profile photo (if any) for this user.
      await AsyncStorage.removeItem(`profile-photo:${user.id}`);

      Alert.alert(
        "Account deleted",
        "Your account has been deleted successfully.",
        [
          {
            text: "OK",
            onPress: () => {
              logout().finally(() => router.replace("/login"));
            },
          },
        ],
      );
    } catch (error: any) {
      Alert.alert(
        "Error",
        error?.message || "Unable to delete account right now. Please try again.",
      );
    } finally {
      setDeleting(false);
    }
  }, [logout, router, user?.id]);

  const confirmDelete = useCallback(() => {
    Alert.alert(
      "Delete account?",
      "This will permanently delete your account and remove your personal data. This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: handleDelete },
      ],
    );
  }, [handleDelete]);

  return (
    <NeumorphicScreen variant="profile" showLeaves={true}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            disabled={deleting}
          >
            <ArrowLeft size={22} color={neumorphicColors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.title}>Delete Account</Text>
          <View style={styles.headerSpacer} />
        </View>

        <NeumorphicCard variant="elevated" style={styles.card}>
          <Text style={styles.cardTitle}>This action is permanent</Text>
          <Text style={styles.cardText}>
            Deleting your account will:
          </Text>
          <Text style={styles.bullet}>• Sign you out of Agrivus</Text>
          <Text style={styles.bullet}>• Remove your personal details from our system</Text>
          <Text style={styles.bullet}>• Disable access to your account</Text>
        </NeumorphicCard>

        <NeumorphicButton
          title="Delete my account"
          variant="danger"
          onPress={confirmDelete}
          fullWidth
          loading={deleting}
          disabled={deleting}
          icon={<Trash2 size={20} color={neumorphicColors.text.inverse} />}
          style={styles.deleteButton}
        />

        <NeumorphicButton
          title="Cancel"
          variant="secondary"
          onPress={() => router.back()}
          fullWidth
          disabled={deleting}
        />
      </View>
    </NeumorphicScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.lg,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.lg,
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  headerSpacer: {
    width: 44,
    height: 44,
  },
  title: {
    ...typography.h2,
    color: neumorphicColors.text.primary,
    fontWeight: "700",
  },
  card: {
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  cardTitle: {
    ...typography.h3,
    color: neumorphicColors.semantic.error,
    marginBottom: spacing.sm,
    fontWeight: "700",
  },
  cardText: {
    ...typography.body,
    color: neumorphicColors.text.secondary,
    marginBottom: spacing.sm,
  },
  bullet: {
    ...typography.body,
    color: neumorphicColors.text.primary,
    marginBottom: spacing.xs,
  },
  deleteButton: {
    marginBottom: spacing.md,
  },
});
