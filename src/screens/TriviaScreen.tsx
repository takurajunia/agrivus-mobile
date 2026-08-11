import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Modal,
} from "react-native";
import { useRouter } from "expo-router";
import { ArrowLeft, Lightbulb, X } from "lucide-react-native";
import {
  neumorphicColors,
  typography,
  spacing,
  borderRadius,
} from "../theme/neumorphic";
import { agriTriviaService } from "../services/agriTriviaService";
import type { TriviaItem } from "../services/agriTriviaService";
import LoadingSpinner from "../components/LoadingSpinner";
import { NeumorphicScreen, NeumorphicCard } from "../components/neumorphic";

const CATEGORY_ICON: Record<string, string> = {
  crop: "🌽",
  poultry: "🐔",
  season: "🌦️",
  agtech: "🛰️",
  general: "🌍",
};

const formatDate = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export default function TriviaScreen() {
  const router = useRouter();
  const [items, setItems] = useState<TriviaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selected, setSelected] = useState<TriviaItem | null>(null);

  const loadTrivia = useCallback(async () => {
    try {
      const response = await agriTriviaService.getHistory(100);
      if (response.success) {
        setItems(response.data.items || []);
      }
    } catch (error) {
      console.error("Failed to load trivia history:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadTrivia();
  }, [loadTrivia]);

  const onRefresh = () => {
    setRefreshing(true);
    loadTrivia();
  };

  if (loading) {
    return (
      <NeumorphicScreen variant="dashboard">
        <View style={styles.loadingContainer}>
          <LoadingSpinner />
        </View>
      </NeumorphicScreen>
    );
  }

  return (
    <NeumorphicScreen variant="dashboard">
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color={neumorphicColors.text.primary} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.title}>Trivia</Text>
          <Text style={styles.subtitle}>
            Agriculture, poultry, seasons & agri-tech facts
          </Text>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[neumorphicColors.primary[600]]}
          />
        }
      >
        {items.length === 0 ? (
          <NeumorphicCard variant="standard" style={styles.emptyCard}>
            <Lightbulb
              size={48}
              color={neumorphicColors.text.tertiary}
              style={styles.emptyIcon}
            />
            <Text style={styles.emptyTitle}>No trivia yet</Text>
            <Text style={styles.emptyText}>
              Agri tips and facts will show up here as they arrive
            </Text>
          </NeumorphicCard>
        ) : (
          items.map((item) => (
            <TouchableOpacity
              key={item.id}
              activeOpacity={0.7}
              onPress={() => setSelected(item)}
            >
              <NeumorphicCard variant="standard" style={styles.triviaCard}>
                <View style={styles.triviaRow}>
                  <View style={styles.iconChip}>
                    <Text style={styles.iconChipText}>
                      {CATEGORY_ICON[item.category || ""] || "💡"}
                    </Text>
                  </View>
                  <View style={styles.triviaContent}>
                    <Text style={styles.triviaTitle} numberOfLines={1}>
                      {item.title}
                    </Text>
                    <Text style={styles.triviaBody} numberOfLines={2}>
                      {item.body}
                    </Text>
                    <Text style={styles.triviaDate}>
                      {formatDate(item.sentAt)}
                    </Text>
                  </View>
                </View>
              </NeumorphicCard>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      <Modal
        visible={!!selected}
        transparent
        animationType="fade"
        onRequestClose={() => setSelected(null)}
      >
        <View style={styles.modalOverlay}>
          <NeumorphicCard variant="elevated" style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalIcon}>
                {CATEGORY_ICON[selected?.category || ""] || "💡"}
              </Text>
              <TouchableOpacity
                style={styles.closeIconButton}
                onPress={() => setSelected(null)}
              >
                <X size={20} color={neumorphicColors.text.secondary} />
              </TouchableOpacity>
            </View>
            <Text style={styles.modalTitle}>{selected?.title}</Text>
            <Text style={styles.modalDate}>
              {selected ? formatDate(selected.sentAt) : ""}
            </Text>
            <ScrollView style={styles.modalBodyScroll}>
              <Text style={styles.modalBody}>{selected?.body}</Text>
            </ScrollView>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setSelected(null)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </NeumorphicCard>
        </View>
      </Modal>
    </NeumorphicScreen>
  );
}

const styles = StyleSheet.create({
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },

  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: neumorphicColors.base.input,
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.md,
    marginTop: spacing.xs,
  },
  headerContent: { flex: 1 },
  title: { ...typography.h2, color: neumorphicColors.text.primary },
  subtitle: {
    ...typography.bodySmall,
    color: neumorphicColors.text.secondary,
    marginTop: spacing.xs,
  },

  scrollView: { flex: 1 },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing["3xl"],
  },

  emptyCard: { padding: spacing.xl, alignItems: "center" },
  emptyIcon: { marginBottom: spacing.md },
  emptyTitle: {
    ...typography.h4,
    color: neumorphicColors.text.secondary,
    textAlign: "center",
  },
  emptyText: {
    ...typography.bodySmall,
    color: neumorphicColors.text.tertiary,
    textAlign: "center",
    marginTop: spacing.xs,
  },

  triviaCard: { padding: spacing.md, marginBottom: spacing.md },
  triviaRow: { flexDirection: "row", alignItems: "flex-start", gap: spacing.md },
  iconChip: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: neumorphicColors.primary[50],
    justifyContent: "center",
    alignItems: "center",
  },
  iconChipText: { fontSize: 22 },
  triviaContent: { flex: 1 },
  triviaTitle: {
    ...typography.body,
    fontWeight: "700",
    color: neumorphicColors.text.primary,
  },
  triviaBody: {
    ...typography.bodySmall,
    color: neumorphicColors.text.secondary,
    marginTop: 2,
  },
  triviaDate: {
    ...typography.caption,
    color: neumorphicColors.text.tertiary,
    marginTop: spacing.xs,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.lg,
  },
  modalCard: {
    width: "100%",
    maxWidth: 420,
    maxHeight: "80%",
    padding: spacing.lg,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  modalIcon: { fontSize: 32 },
  closeIconButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: neumorphicColors.base.input,
    justifyContent: "center",
    alignItems: "center",
  },
  modalTitle: {
    ...typography.h3,
    color: neumorphicColors.text.primary,
    marginTop: spacing.md,
  },
  modalDate: {
    ...typography.caption,
    color: neumorphicColors.text.tertiary,
    marginTop: spacing.xs,
    marginBottom: spacing.md,
  },
  modalBodyScroll: { marginBottom: spacing.lg },
  modalBody: {
    ...typography.body,
    color: neumorphicColors.text.secondary,
    lineHeight: 22,
  },
  closeButton: {
    backgroundColor: neumorphicColors.primary[600],
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    alignItems: "center",
  },
  closeButtonText: {
    ...typography.body,
    fontWeight: "700",
    color: neumorphicColors.text.inverse,
  },
});
