import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, Alert } from "react-native";
import { useRouter } from "expo-router";
import {
  ArrowLeft,
  Package,
  DollarSign,
  CheckCircle,
  ChevronRight,
} from "lucide-react-native";
import {
  NeumorphicScreen,
  NeumorphicCard,
  NeumorphicButton,
  NeumorphicIconButton,
  NeumorphicInput,
} from "../../src/components/neumorphic";
import {
  neumorphicColors,
  typography,
  spacing,
  borderRadius,
  getNeumorphicShadow,
} from "../../src/theme/neumorphic";
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
          <NeumorphicCard
            key={type}
            variant={productType === type ? "elevated" : "standard"}
            onPress={() => setProductType(type)}
            style={[
              styles.optionCard,
              productType === type && styles.optionCardSelected,
            ]}
          >
            <View style={styles.optionContent}>
              <Package
                size={24}
                color={
                  productType === type
                    ? neumorphicColors.primary[600]
                    : neumorphicColors.text.secondary
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
                  color={neumorphicColors.primary[600]}
                  style={styles.checkIcon}
                />
              )}
            </View>
          </NeumorphicCard>
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
          <NeumorphicCard
            key={market.id}
            variant={
              targetMarkets.includes(market.id) ? "elevated" : "standard"
            }
            onPress={() => toggleMarket(market.id)}
            style={[
              styles.marketCard,
              targetMarkets.includes(market.id) && styles.marketCardSelected,
            ]}
          >
            <View style={styles.marketContent}>
              <Text style={styles.marketFlag}>{market.flag}</Text>
              <Text
                style={[
                  styles.marketName,
                  targetMarkets.includes(market.id) &&
                    styles.marketNameSelected,
                ]}
              >
                {market.name}
              </Text>
              {targetMarkets.includes(market.id) && (
                <CheckCircle size={16} color={neumorphicColors.primary[600]} />
              )}
            </View>
          </NeumorphicCard>
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

      <NeumorphicInput
        label="Monthly Production Capacity"
        placeholder="e.g., 10 tonnes per month"
        value={productionCapacity}
        onChangeText={setProductionCapacity}
        leftIcon={<Package size={20} color={neumorphicColors.text.tertiary} />}
      />

      <Text style={styles.fieldLabel}>
        Certifications (Select all that apply)
      </Text>
      <View style={styles.certificationsGrid}>
        {CERTIFICATIONS.map((cert) => (
          <NeumorphicButton
            key={cert}
            title={cert}
            variant={certifications.includes(cert) ? "primary" : "secondary"}
            size="small"
            onPress={() => toggleCertification(cert)}
            style={styles.certificationChip}
          />
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

      <NeumorphicCard variant="standard" style={styles.questionCard}>
        <Text style={styles.questionText}>
          Do you have export-grade packaging capabilities?
        </Text>
        <View style={styles.booleanOptions}>
          <NeumorphicButton
            title="Yes"
            variant={packagingCapability === true ? "primary" : "secondary"}
            size="medium"
            onPress={() => setPackagingCapability(true)}
            style={styles.booleanOption}
          />
          <NeumorphicButton
            title="No"
            variant={packagingCapability === false ? "primary" : "secondary"}
            size="medium"
            onPress={() => setPackagingCapability(false)}
            style={styles.booleanOption}
          />
        </View>
      </NeumorphicCard>

      <NeumorphicCard variant="standard" style={styles.questionCard}>
        <Text style={styles.questionText}>
          Do you have quality control processes in place?
        </Text>
        <View style={styles.booleanOptions}>
          <NeumorphicButton
            title="Yes"
            variant={qualityControls === true ? "primary" : "secondary"}
            size="medium"
            onPress={() => setQualityControls(true)}
            style={styles.booleanOption}
          />
          <NeumorphicButton
            title="No"
            variant={qualityControls === false ? "primary" : "secondary"}
            size="medium"
            onPress={() => setQualityControls(false)}
            style={styles.booleanOption}
          />
        </View>
      </NeumorphicCard>

      <NeumorphicInput
        label="Financial Capacity for Export Operations"
        placeholder="e.g., $10,000 - $50,000"
        value={financialCapacity}
        onChangeText={setFinancialCapacity}
        leftIcon={
          <DollarSign size={20} color={neumorphicColors.text.tertiary} />
        }
      />
    </View>
  );

  return (
    <NeumorphicScreen variant="form" safeArea={true}>
      {/* Header */}
      <View style={styles.header}>
        <NeumorphicIconButton
          icon={<ArrowLeft size={24} color={neumorphicColors.text.primary} />}
          onPress={handleBack}
          variant="default"
          size="medium"
        />
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
          <NeumorphicButton
            title="Continue"
            variant="primary"
            size="large"
            onPress={handleNext}
            icon={
              <ChevronRight size={20} color={neumorphicColors.text.inverse} />
            }
            iconPosition="right"
            fullWidth
          />
        ) : (
          <NeumorphicButton
            title="Submit Assessment"
            variant="primary"
            size="large"
            loading={loading}
            onPress={handleSubmit}
            icon={
              <CheckCircle size={20} color={neumorphicColors.text.inverse} />
            }
            iconPosition="right"
            fullWidth
          />
        )}
      </View>
    </NeumorphicScreen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: neumorphicColors.base.background,
  },
  title: {
    ...typography.h4,
    color: neumorphicColors.text.primary,
  },
  placeholder: {
    width: 48,
  },
  progressContainer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: neumorphicColors.base.background,
  },
  progressBar: {
    height: 4,
    backgroundColor: neumorphicColors.base.input,
    borderRadius: borderRadius.xs,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: neumorphicColors.primary[600],
    borderRadius: borderRadius.xs,
  },
  progressText: {
    ...typography.bodySmall,
    color: neumorphicColors.text.secondary,
    marginTop: spacing.sm,
    textAlign: "center",
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: spacing.lg,
    paddingBottom: spacing["2xl"],
  },
  stepTitle: {
    ...typography.h4,
    color: neumorphicColors.text.primary,
    marginBottom: spacing.sm,
  },
  stepSubtitle: {
    ...typography.body,
    color: neumorphicColors.text.secondary,
    marginBottom: spacing.xl,
  },
  optionsGrid: {
    gap: spacing.md,
  },
  optionCard: {
    padding: 0,
  },
  optionCardSelected: {
    borderWidth: 2,
    borderColor: neumorphicColors.primary[600],
  },
  optionContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  optionText: {
    flex: 1,
    ...typography.body,
    color: neumorphicColors.text.primary,
  },
  optionTextSelected: {
    color: neumorphicColors.primary[600],
    fontWeight: "600",
  },
  checkIcon: {
    marginLeft: "auto",
  },
  marketsGrid: {
    gap: spacing.md,
  },
  marketCard: {
    padding: 0,
  },
  marketCardSelected: {
    borderWidth: 2,
    borderColor: neumorphicColors.primary[600],
  },
  marketContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  marketFlag: {
    fontSize: 24,
  },
  marketName: {
    flex: 1,
    ...typography.body,
    color: neumorphicColors.text.primary,
  },
  marketNameSelected: {
    color: neumorphicColors.primary[600],
    fontWeight: "600",
  },
  fieldLabel: {
    ...typography.h6,
    color: neumorphicColors.text.primary,
    marginTop: spacing.xl,
    marginBottom: spacing.md,
  },
  certificationsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  certificationChip: {
    marginBottom: spacing.xs,
  },
  questionCard: {
    marginBottom: spacing.lg,
  },
  questionText: {
    ...typography.body,
    color: neumorphicColors.text.primary,
    marginBottom: spacing.md,
  },
  booleanOptions: {
    flexDirection: "row",
    gap: spacing.md,
  },
  booleanOption: {
    flex: 1,
  },
  footer: {
    padding: spacing.lg,
    backgroundColor: neumorphicColors.base.card,
    ...getNeumorphicShadow(3),
  },
});
