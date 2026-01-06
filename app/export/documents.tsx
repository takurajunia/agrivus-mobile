import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Linking,
} from "react-native";
import { useRouter } from "expo-router";
import {
  ArrowLeft,
  FileText,
  Download,
  ChevronRight,
  Search,
  File,
  FileCheck,
  Globe,
  Shield,
  Truck,
  DollarSign,
} from "lucide-react-native";
import {
  NeumorphicScreen,
  NeumorphicCard,
  NeumorphicIconButton,
  NeumorphicSearchBar,
} from "../../src/components/neumorphic";
import {
  neumorphicColors,
  typography,
  spacing,
  borderRadius,
} from "../../src/theme/neumorphic";
import exportService from "../../src/services/exportService";

interface DocumentTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  fileType: string;
  fileSize: string;
  downloadUrl: string;
  requiredFor: string[];
}

const CATEGORIES = [
  { key: "all", label: "All", icon: FileText },
  { key: "customs", label: "Customs", icon: Shield },
  { key: "phytosanitary", label: "Phytosanitary", icon: FileCheck },
  { key: "origin", label: "Certificate of Origin", icon: Globe },
  { key: "shipping", label: "Shipping", icon: Truck },
  { key: "financial", label: "Financial", icon: DollarSign },
];

export default function ExportDocumentsScreen() {
  const router = useRouter();
  const [documents, setDocuments] = useState<DocumentTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async (refresh = false) => {
    try {
      if (refresh) {
        setRefreshing(true);
      }
      const response = await exportService.getDocumentTemplates();
      if (response.success) {
        setDocuments(response.data.templates || []);
      }
    } catch (error) {
      console.error("Failed to fetch document templates:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    fetchDocuments(true);
  };

  const handleDownload = (doc: DocumentTemplate) => {
    if (doc.downloadUrl) {
      Linking.openURL(doc.downloadUrl);
    }
  };

  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch =
      doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      activeCategory === "all" ||
      doc.category.toLowerCase() === activeCategory.toLowerCase();

    return matchesSearch && matchesCategory;
  });

  const getCategoryIcon = (category: string) => {
    const cat = CATEGORIES.find((c) => c.key === category.toLowerCase());
    return cat?.icon || FileText;
  };

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case "customs":
        return neumorphicColors.semantic.error;
      case "phytosanitary":
        return neumorphicColors.semantic.success;
      case "origin":
        return neumorphicColors.primary[600];
      case "shipping":
        return neumorphicColors.semantic.warning;
      case "financial":
        return neumorphicColors.semantic.info;
      default:
        return neumorphicColors.text.secondary;
    }
  };

  const renderDocument = (doc: DocumentTemplate, index: number) => {
    const IconComponent = getCategoryIcon(doc.category);
    const categoryColor = getCategoryColor(doc.category);

    return (
      <NeumorphicCard
        key={doc.id}
        style={styles.documentCard}
        animationDelay={index * 50}
        onPress={() => handleDownload(doc)}
      >
        <View style={styles.documentHeader}>
          <View
            style={[
              styles.categoryIcon,
              { backgroundColor: `${categoryColor}15` },
            ]}
          >
            <IconComponent size={20} color={categoryColor} />
          </View>
          <View style={styles.documentInfo}>
            <Text style={styles.documentName}>{doc.name}</Text>
            <Text style={styles.documentCategory}>{doc.category}</Text>
          </View>
          <NeumorphicIconButton
            icon={<Download size={20} color={neumorphicColors.primary[600]} />}
            onPress={() => handleDownload(doc)}
            variant="secondary"
            size="medium"
          />
        </View>

        <Text style={styles.documentDescription} numberOfLines={2}>
          {doc.description}
        </Text>

        <View style={styles.documentFooter}>
          <View style={styles.fileInfo}>
            <File size={14} color={neumorphicColors.text.tertiary} />
            <Text style={styles.fileInfoText}>
              {doc.fileType?.toUpperCase()} • {doc.fileSize}
            </Text>
          </View>

          {doc.requiredFor && doc.requiredFor.length > 0 && (
            <View style={styles.marketsContainer}>
              {doc.requiredFor.slice(0, 2).map((market, idx) => (
                <View key={idx} style={styles.marketChip}>
                  <Text style={styles.marketChipText}>{market}</Text>
                </View>
              ))}
              {doc.requiredFor.length > 2 && (
                <Text style={styles.moreMarkets}>
                  +{doc.requiredFor.length - 2}
                </Text>
              )}
            </View>
          )}
        </View>
      </NeumorphicCard>
    );
  };

  if (loading) {
    return (
      <NeumorphicScreen variant="list" showLeaves={false}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator
            size="large"
            color={neumorphicColors.primary[600]}
          />
          <Text style={styles.loadingText}>Loading documents...</Text>
        </View>
      </NeumorphicScreen>
    );
  }

  return (
    <NeumorphicScreen variant="list" showLeaves={false}>
      {/* Header */}
      <View style={styles.header}>
        <NeumorphicIconButton
          icon={<ArrowLeft size={24} color={neumorphicColors.text.primary} />}
          onPress={() => router.back()}
          variant="default"
          size="medium"
        />
        <Text style={styles.title}>Document Templates</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <NeumorphicSearchBar
          placeholder="Search documents..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Category Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabsContainer}
        contentContainerStyle={styles.tabsContent}
      >
        {CATEGORIES.map((cat) => (
          <NeumorphicCard
            key={cat.key}
            style={[styles.tab, activeCategory === cat.key && styles.activeTab]}
            onPress={() => setActiveCategory(cat.key)}
            variant={activeCategory === cat.key ? "elevated" : "standard"}
            shadowLevel={1}
          >
            <cat.icon
              size={16}
              color={
                activeCategory === cat.key
                  ? neumorphicColors.text.inverse
                  : neumorphicColors.text.secondary
              }
            />
            <Text
              style={[
                styles.tabText,
                activeCategory === cat.key && styles.activeTabText,
              ]}
            >
              {cat.label}
            </Text>
          </NeumorphicCard>
        ))}
      </ScrollView>

      {/* Documents List */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[neumorphicColors.primary[600]]}
            tintColor={neumorphicColors.primary[600]}
          />
        }
      >
        {filteredDocuments.length === 0 ? (
          <View style={styles.emptyState}>
            <FileText
              size={64}
              color={neumorphicColors.text.tertiary}
              strokeWidth={1}
            />
            <Text style={styles.emptyTitle}>No Documents Found</Text>
            <Text style={styles.emptySubtitle}>
              {searchQuery
                ? "Try adjusting your search criteria"
                : "Document templates will appear here"}
            </Text>
          </View>
        ) : (
          filteredDocuments.map((doc, index) => renderDocument(doc, index))
        )}
      </ScrollView>
    </NeumorphicScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: neumorphicColors.base.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  title: {
    ...typography.h4,
  },
  placeholder: {
    width: 48,
  },
  searchContainer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  tabsContainer: {
    maxHeight: 60,
  },
  tabsContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    gap: spacing.sm,
  },
  tab: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginRight: spacing.sm,
  },
  activeTab: {
    backgroundColor: neumorphicColors.primary[600],
  },
  tabText: {
    ...typography.bodySmall,
    fontWeight: "500",
  },
  activeTabText: {
    color: neumorphicColors.text.inverse,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: spacing.lg,
    paddingBottom: spacing["2xl"],
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: spacing.md,
    ...typography.body,
    color: neumorphicColors.text.secondary,
  },
  documentCard: {
    marginBottom: spacing.md,
  },
  documentHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  categoryIcon: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.lg,
    justifyContent: "center",
    alignItems: "center",
  },
  documentInfo: {
    flex: 1,
  },
  documentName: {
    ...typography.body,
    fontWeight: "600",
  },
  documentCategory: {
    ...typography.bodySmall,
    marginTop: 2,
    textTransform: "capitalize",
  },
  documentDescription: {
    ...typography.bodySmall,
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  documentFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: neumorphicColors.base.shadowDark + "20",
  },
  fileInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  fileInfoText: {
    ...typography.caption,
  },
  marketsContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  marketChip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    backgroundColor: neumorphicColors.primary[50],
    borderRadius: borderRadius.sm,
  },
  marketChipText: {
    ...typography.caption,
    color: neumorphicColors.primary[600],
  },
  moreMarkets: {
    ...typography.caption,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: spacing["2xl"],
  },
  emptyTitle: {
    ...typography.h4,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  emptySubtitle: {
    ...typography.body,
    color: neumorphicColors.text.secondary,
    textAlign: "center",
  },
});
