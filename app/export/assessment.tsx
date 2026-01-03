import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import {
  ArrowLeft,
  Globe,
  Package,
  Award,
  Truck,
  DollarSign,
  CheckCircle,
  ChevronRight,
  AlertCircle,
} from "lucide-react-native";
import AnimatedCard from "../../src/components/AnimatedCard";
import AnimatedButton from "../../src/components/AnimatedButton";
import ModernInput from "../../src/components/ModernInput";
import GlassCard from "../../src/components/GlassCard";
import { theme } from "../../src/theme/tokens";
import exportService from "../../src/services/exportService";

const PRODUCT_TYPES = [
  "Grains & Cereals",
  "Fruits",
  "Vegetables",
  "Nuts",
  "Spices",
  "Coffee & Tea",
  "Flowers",
  "Livestock",
  "Dairy Products",
  "Other",
];

const TARGET_MARKETS = [
  { id: "eu", name: "European Union", flag: "🇪🇺" },
  { id: "uk", name: "United Kingdom", flag: "🇬🇧" },
  { id: "us", name: "United States", flag: "🇺🇸" },
  { id: "uae", name: "UAE", flag: "🇦🇪" },
  { id: "china", name: "China", flag: "🇨🇳" },
  { id: "japan", name: "Japan", flag: "🇯🇵" },
  { id: "sa", name: "South Africa", flag: "🇿🇦" },
  { id: "other", name: "Other", flag: "🌍" },
];

const CERTIFICATIONS = [
  "GlobalGAP",
  "HACCP",
  "ISO 22000",
  "Organic",
  "Fair Trade",
  "Rainforest Alliance",
  "BRC",
  "None",
];

export default function ExportAssessmentScreen() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Form state
  const [productType, setProductType] = useState("");
  const [targetMarkets, setTargetMarkets] = useState<string[]>([]);
  const [productionCapacity, setProductionCapacity] = useState("");
  const [certifications, setCertifications] = useState<string[]>([]);
  const [packagingCapability, setPackagingCapability] = useState<
    boolean | null
  >(null);
  const [qualityControls, setQualityControls] = useState<boolean | null>(null);
  const [financialCapacity, setFinancialCapacity] = useState("");

  const toggleMarket = (marketId: string) => {
    setTargetMarkets((prev) =>
      prev.includes(marketId)
        ? prev.filter((m) => m !== marketId)
        : [...prev, marketId]
    );
  };

  const toggleCertification = (cert: string) => {
    setCertifications((prev) =>
      prev.includes(cert) ? prev.filter((c) => c !== cert) : [...prev, cert]
    );
  };

  const validateStep = (currentStep: number): boolean => {
    switch (currentStep) {
      case 1:
        if (!productType) {
          Alert.alert("Required", "Please select a product type");
          return false;
        }
        return true;
      case 2:
        if (targetMarkets.length === 0) {
          Alert.alert("Required", "Please select at least one target market");
          return false;
        }
        return true;
      case 3:
        if (!productionCapacity) {
          Alert.alert("Required", "Please enter your production capacity");
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(step)) {
      if (step < 4) {
        setStep(step + 1);
      }
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      router.back();
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      const response = await exportService.createAssessment({
        productType,
        targetMarkets,
        productionCapacity,
        certifications: certifications.filter((c) => c !== "None"),
        packagingCapability: packagingCapability ?? false,
        qualityControls: qualityControls ?? false,
        financialCapacity,
      });

      if (response.success) {
        router.replace(`/export/results/${response.data.id}` as any);
      } else {
        Alert.alert("Error", "Failed to submit assessment");
      }
    } catch (error) {
      console.error("Assessment submission failed:", error);
      Alert.alert("Error", "Failed to submit assessment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <View>
      <Text style={styles.stepTitle}>What product do you want to export?</Text>
      <Text style={styles.stepSubtitle}>
        Select the main category of your product
      </Text>

      <View style={styles.optionsGrid}>
        {PRODUCT_TYPES.map((type, index) => (
          <TouchableOpacity
            key={type}
            style={[
              styles.optionCard,
              productType === type && styles.optionCardSelected,
            ]}
            onPress={() => setProductType(type)}
          >
            <Package
              size={24}
              color={
                productType === type
                  ? theme.colors.primary[600]
                  : theme.colors.text.secondary
              }
            />
            <Text
              style={[
                styles.optionText,
                productType === type && styles.optionTextSelected,
              ]}
            >
              {type}
            </Text>
            {productType === type && (
              <CheckCircle
                size={18}
                color={theme.colors.primary[600]}
                style={styles.checkIcon}
              />
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderStep2 = () => (
    <View>
      <Text style={styles.stepTitle}>Target Markets</Text>
      <Text style={styles.stepSubtitle}>
        Select the markets you want to export to
      </Text>

      <View style={styles.marketsGrid}>
        {TARGET_MARKETS.map((market) => (
          <TouchableOpacity
            key={market.id}
            style={[
              styles.marketCard,
              targetMarkets.includes(market.id) && styles.marketCardSelected,
            ]}
            onPress={() => toggleMarket(market.id)}
          >
            <Text style={styles.marketFlag}>{market.flag}</Text>
            <Text
              style={[
                styles.marketName,
                targetMarkets.includes(market.id) && styles.marketNameSelected,
              ]}
            >
              {market.name}
            </Text>
            {targetMarkets.includes(market.id) && (
              <CheckCircle size={16} color={theme.colors.primary[600]} />
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderStep3 = () => (
    <View>
      <Text style={styles.stepTitle}>Production & Certifications</Text>
      <Text style={styles.stepSubtitle}>
        Tell us about your production capabilities
      </Text>

      <ModernInput
        label="Monthly Production Capacity"
        placeholder="e.g., 10 tonnes per month"
        value={productionCapacity}
        onChangeText={setProductionCapacity}
        leftIcon={<Package size={20} color={theme.colors.text.tertiary} />}
      />

      <Text style={styles.fieldLabel}>
        Certifications (Select all that apply)
      </Text>
      <View style={styles.certificationsGrid}>
        {CERTIFICATIONS.map((cert) => (
          <TouchableOpacity
            key={cert}
            style={[
              styles.certificationChip,
              certifications.includes(cert) && styles.certificationChipSelected,
            ]}
            onPress={() => toggleCertification(cert)}
          >
            <Text
              style={[
                styles.certificationText,
                certifications.includes(cert) &&
                  styles.certificationTextSelected,
              ]}
            >
              {cert}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderStep4 = () => (
    <View>
      <Text style={styles.stepTitle}>Additional Capabilities</Text>
      <Text style={styles.stepSubtitle}>
        Help us understand your export readiness
      </Text>

      <View style={styles.questionCard}>
        <Text style={styles.questionText}>
          Do you have export-grade packaging capabilities?
        </Text>
        <View style={styles.booleanOptions}>
          <TouchableOpacity
            style={[
              styles.booleanOption,
              packagingCapability === true && styles.booleanOptionSelected,
            ]}
            onPress={() => setPackagingCapability(true)}
          >
            <Text
              style={[
                styles.booleanText,
                packagingCapability === true && styles.booleanTextSelected,
              ]}
            >
              Yes
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.booleanOption,
              packagingCapability === false && styles.booleanOptionSelected,
            ]}
            onPress={() => setPackagingCapability(false)}
          >
            <Text
              style={[
                styles.booleanText,
                packagingCapability === false && styles.booleanTextSelected,
              ]}
            >
              No
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.questionCard}>
        <Text style={styles.questionText}>
          Do you have quality control processes in place?
        </Text>
        <View style={styles.booleanOptions}>
          <TouchableOpacity
            style={[
              styles.booleanOption,
              qualityControls === true && styles.booleanOptionSelected,
            ]}
            onPress={() => setQualityControls(true)}
          >
            <Text
              style={[
                styles.booleanText,
                qualityControls === true && styles.booleanTextSelected,
              ]}
            >
              Yes
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.booleanOption,
              qualityControls === false && styles.booleanOptionSelected,
            ]}
            onPress={() => setQualityControls(false)}
          >
            <Text
              style={[
                styles.booleanText,
                qualityControls === false && styles.booleanTextSelected,
              ]}
            >
              No
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ModernInput
        label="Financial Capacity for Export Operations"
        placeholder="e.g., $10,000 - $50,000"
        value={financialCapacity}
        onChangeText={setFinancialCapacity}
        leftIcon={<DollarSign size={20} color={theme.colors.text.tertiary} />}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <ArrowLeft size={24} color={theme.colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>Export Assessment</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View
            style={[styles.progressFill, { width: `${(step / 4) * 100}%` }]}
          />
        </View>
        <Text style={styles.progressText}>Step {step} of 4</Text>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
        {step === 4 && renderStep4()}
      </ScrollView>

      {/* Navigation Buttons */}
      <View style={styles.footer}>
        {step < 4 ? (
          <AnimatedButton
            title="Continue"
            variant="primary"
            size="lg"
            onPress={handleNext}
          >
            <ChevronRight size={20} color={theme.colors.text.inverse} />
          </AnimatedButton>
        ) : (
          <AnimatedButton
            title="Submit Assessment"
            variant="primary"
            size="lg"
            loading={loading}
            onPress={handleSubmit}
          >
            <CheckCircle size={20} color={theme.colors.text.inverse} />
          </AnimatedButton>
        )}
      </View>
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
  progressContainer: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.background.primary,
  },
  progressBar: {
    height: 4,
    backgroundColor: theme.colors.background.tertiary,
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: theme.colors.primary[600],
    borderRadius: 2,
  },
  progressText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.sm,
    textAlign: "center",
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing["2xl"],
  },
  stepTitle: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
  },
  stepSubtitle: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xl,
  },
  optionsGrid: {
    gap: theme.spacing.md,
  },
  optionCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.background.primary,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 2,
    borderColor: theme.colors.border.light,
    gap: theme.spacing.md,
  },
  optionCardSelected: {
    borderColor: theme.colors.primary[600],
    backgroundColor: theme.colors.primary[50],
  },
  optionText: {
    flex: 1,
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.primary,
  },
  optionTextSelected: {
    color: theme.colors.primary[600],
    fontWeight: theme.typography.fontWeight.semibold,
  },
  checkIcon: {
    marginLeft: "auto",
  },
  marketsGrid: {
    gap: theme.spacing.md,
  },
  marketCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.background.primary,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 2,
    borderColor: theme.colors.border.light,
    gap: theme.spacing.md,
  },
  marketCardSelected: {
    borderColor: theme.colors.primary[600],
    backgroundColor: theme.colors.primary[50],
  },
  marketFlag: {
    fontSize: 24,
  },
  marketName: {
    flex: 1,
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.primary,
  },
  marketNameSelected: {
    color: theme.colors.primary[600],
    fontWeight: theme.typography.fontWeight.semibold,
  },
  fieldLabel: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
    marginTop: theme.spacing.xl,
    marginBottom: theme.spacing.md,
  },
  certificationsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.sm,
  },
  certificationChip: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.background.tertiary,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    borderColor: theme.colors.border.light,
  },
  certificationChipSelected: {
    backgroundColor: theme.colors.primary[600],
    borderColor: theme.colors.primary[600],
  },
  certificationText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
  },
  certificationTextSelected: {
    color: theme.colors.text.inverse,
    fontWeight: theme.typography.fontWeight.medium,
  },
  questionCard: {
    backgroundColor: theme.colors.background.primary,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  questionText: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
  },
  booleanOptions: {
    flexDirection: "row",
    gap: theme.spacing.md,
  },
  booleanOption: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    alignItems: "center",
    backgroundColor: theme.colors.background.tertiary,
    borderRadius: theme.borderRadius.md,
    borderWidth: 2,
    borderColor: theme.colors.border.light,
  },
  booleanOptionSelected: {
    borderColor: theme.colors.primary[600],
    backgroundColor: theme.colors.primary[50],
  },
  booleanText: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.secondary,
    fontWeight: theme.typography.fontWeight.medium,
  },
  booleanTextSelected: {
    color: theme.colors.primary[600],
  },
  footer: {
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.background.primary,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.light,
  },
});
