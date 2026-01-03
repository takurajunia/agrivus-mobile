import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
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
import AnimatedCard from "../../src/components/AnimatedCard";
import ModernInput from "../../src/components/ModernInput";
import { theme } from "../../src/theme/tokens";
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
        return theme.colors.error;
      case "phytosanitary":
        return theme.colors.success;
      case "origin":
        return theme.colors.primary[600];
      case "shipping":
        return theme.colors.warning;
      case "financial":
        return theme.colors.info;
      default:
        return theme.colors.text.secondary;
    }
  };

  const renderDocument = (doc: DocumentTemplate, index: number) => {
    const IconComponent = getCategoryIcon(doc.category);
    const categoryColor = getCategoryColor(doc.category);

    return (
      <AnimatedCard
        key={doc.id}
        style={styles.documentCard}
        delay={index * 50}
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
          <TouchableOpacity
            style={styles.downloadButton}
            onPress={() => handleDownload(doc)}
          >
            <Download size={20} color={theme.colors.primary[600]} />
          </TouchableOpacity>
        </View>

        <Text style={styles.documentDescription} numberOfLines={2}>
          {doc.description}
        </Text>

        <View style={styles.documentFooter}>
          <View style={styles.fileInfo}>
            <File size={14} color={theme.colors.text.tertiary} />
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
      </AnimatedCard>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary[600]} />
          <Text style={styles.loadingText}>Loading documents...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <ArrowLeft size={24} color={theme.colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>Document Templates</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <ModernInput
          placeholder="Search documents..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          leftIcon={<Search size={20} color={theme.colors.text.tertiary} />}
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
          <TouchableOpacity
            key={cat.key}
            style={[styles.tab, activeCategory === cat.key && styles.activeTab]}
            onPress={() => setActiveCategory(cat.key)}
          >
            <cat.icon
              size={16}
              color={
                activeCategory === cat.key
                  ? theme.colors.text.inverse
                  : theme.colors.text.secondary
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
          </TouchableOpacity>
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
            colors={[theme.colors.primary[600]]}
            tintColor={theme.colors.primary[600]}
          />
        }
      >
        {filteredDocuments.length === 0 ? (
          <View style={styles.emptyState}>
            <FileText
              size={64}
              color={theme.colors.text.tertiary}
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.secondary,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.background.primary,
  },
  backButton: {
    padding: theme.spacing.xs,
  },
  title: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
  },
  placeholder: {
    width: 32,
  },
  searchContainer: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.background.primary,
  },
  tabsContainer: {
    backgroundColor: theme.colors.background.primary,
    maxHeight: 60,
  },
  tabsContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  tab: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.xs,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.background.tertiary,
    marginRight: theme.spacing.sm,
  },
  activeTab: {
    backgroundColor: theme.colors.primary[600],
  },
  tabText: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.text.secondary,
  },
  activeTabText: {
    color: theme.colors.text.inverse,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing["2xl"],
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: theme.spacing.md,
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.secondary,
  },
  documentCard: {
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  documentHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  categoryIcon: {
    width: 44,
    height: 44,
    borderRadius: theme.borderRadius.lg,
    justifyContent: "center",
    alignItems: "center",
  },
  documentInfo: {
    flex: 1,
  },
  documentName: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
  },
  documentCategory: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    marginTop: 2,
    textTransform: "capitalize",
  },
  downloadButton: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.primary[50],
    justifyContent: "center",
    alignItems: "center",
  },
  documentDescription: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    lineHeight: 20,
    marginBottom: theme.spacing.md,
  },
  documentFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.light,
  },
  fileInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.xs,
  },
  fileInfoText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.tertiary,
  },
  marketsContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.xs,
  },
  marketChip: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    backgroundColor: theme.colors.primary[50],
    borderRadius: theme.borderRadius.sm,
  },
  marketChipText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.primary[600],
  },
  moreMarkets: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.tertiary,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: theme.spacing["4xl"],
  },
  emptyTitle: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
  },
  emptySubtitle: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.secondary,
    textAlign: "center",
  },
});
