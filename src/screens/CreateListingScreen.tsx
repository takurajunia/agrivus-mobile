import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import {
  Package,
  MapPin,
  DollarSign,
  Calendar,
  FileText,
  Image as ImageIcon,
  ChevronDown,
} from "lucide-react-native";
import {
  neumorphicColors,
  typography,
  spacing,
  borderRadius,
} from "../theme/neumorphic";
import { listingsService } from "../services/listingsService";
import LoadingSpinner from "../components/LoadingSpinner";
import NeumorphicScreen from "../components/neumorphic/NeumorphicScreen";
import NeumorphicCard from "../components/neumorphic/NeumorphicCard";
import NeumorphicButton from "../components/neumorphic/NeumorphicButton";
import NeumorphicInput from "../components/neumorphic/NeumorphicInput";

const CROP_TYPES = [
  "Maize",
  "Wheat",
  "Soybean",
  "Tobacco",
  "Cotton",
  "Groundnuts",
  "Sunflower",
  "Vegetables",
  "Fruits",
  "Coffee",
  "Tea",
  "Other",
];

const UNITS = ["kg", "ton", "bag", "crate", "bunch", "piece"];

export default function CreateListingScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showCropPicker, setShowCropPicker] = useState(false);
  const [showUnitPicker, setShowUnitPicker] = useState(false);

  const [form, setForm] = useState({
    cropType: "",
    cropName: "",
    quantity: "",
    unit: "kg",
    pricePerUnit: "",
    location: "",
    harvestDate: "",
    description: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!form.cropType) newErrors.cropType = "Crop type is required";
    if (!form.quantity || parseFloat(form.quantity) <= 0)
      newErrors.quantity = "Valid quantity is required";
    if (!form.pricePerUnit || parseFloat(form.pricePerUnit) <= 0)
      newErrors.pricePerUnit = "Valid price is required";
    if (!form.location) newErrors.location = "Location is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }

    try {
      setLoading(true);
      await listingsService.createListing({
        cropType: form.cropType,
        cropName: form.cropName || form.cropType,
        quantity: form.quantity,
        unit: form.unit,
        pricePerUnit: form.pricePerUnit,
        location: form.location,
        harvestDate: form.harvestDate || undefined,
        description: form.description || undefined,
        status: "active",
      });
      Alert.alert("Success", "Listing created successfully!", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (error: any) {
      Alert.alert(
        "Error",
        error.response?.data?.message || "Failed to create listing"
      );
    } finally {
      setLoading(false);
    }
  };

  const updateForm = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors((prev) => ({ ...prev, [key]: "" }));
    }
  };

  return (
    <NeumorphicScreen variant="default">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <Package size={28} color={neumorphicColors.primary.main} />
            <View style={styles.headerText}>
              <Text style={styles.title}>Create Listing</Text>
              <Text style={styles.subtitle}>
                List your produce for sale in the marketplace
              </Text>
            </View>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {/* Crop Type */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Crop Type *</Text>
              <TouchableOpacity
                style={[styles.picker, errors.cropType && styles.inputError]}
                onPress={() => setShowCropPicker(!showCropPicker)}
              >
                <Text
                  style={
                    form.cropType ? styles.pickerText : styles.pickerPlaceholder
                  }
                >
                  {form.cropType || "Select crop type"}
                </Text>
                <ChevronDown
                  size={20}
                  color={neumorphicColors.text.secondary}
                />
              </TouchableOpacity>
              {errors.cropType && (
                <Text style={styles.errorText}>{errors.cropType}</Text>
              )}

              {showCropPicker && (
                <NeumorphicCard style={styles.pickerOptions}>
                  <ScrollView style={{ maxHeight: 200 }} nestedScrollEnabled>
                    {CROP_TYPES.map((crop) => (
                      <TouchableOpacity
                        key={crop}
                        style={styles.pickerOption}
                        onPress={() => {
                          updateForm("cropType", crop);
                          setShowCropPicker(false);
                        }}
                      >
                        <Text style={styles.pickerOptionText}>{crop}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </NeumorphicCard>
              )}
            </View>

            {/* Crop Name (Optional) */}
            <NeumorphicInput
              label="Crop Name (Optional)"
              placeholder="e.g., Hybrid Maize, Cherry Tomatoes"
              value={form.cropName}
              onChangeText={(text) => updateForm("cropName", text)}
            />

            {/* Quantity & Unit */}
            <View style={styles.row}>
              <View style={{ flex: 2 }}>
                <NeumorphicInput
                  label="Quantity *"
                  placeholder="Enter quantity"
                  keyboardType="decimal-pad"
                  value={form.quantity}
                  onChangeText={(text) => updateForm("quantity", text)}
                  error={errors.quantity}
                />
              </View>

              <View style={{ flex: 1, marginLeft: spacing.md }}>
                <Text style={styles.label}>Unit *</Text>
                <TouchableOpacity
                  style={styles.picker}
                  onPress={() => setShowUnitPicker(!showUnitPicker)}
                >
                  <Text style={styles.pickerText}>{form.unit}</Text>
                  <ChevronDown
                    size={16}
                    color={neumorphicColors.text.secondary}
                  />
                </TouchableOpacity>

                {showUnitPicker && (
                  <NeumorphicCard style={styles.pickerOptions}>
                    {UNITS.map((unit) => (
                      <TouchableOpacity
                        key={unit}
                        style={styles.pickerOption}
                        onPress={() => {
                          updateForm("unit", unit);
                          setShowUnitPicker(false);
                        }}
                      >
                        <Text style={styles.pickerOptionText}>{unit}</Text>
                      </TouchableOpacity>
                    ))}
                  </NeumorphicCard>
                )}
              </View>
            </View>

            {/* Price */}
            <NeumorphicInput
              label={`Price per ${form.unit} *`}
              placeholder="Enter price"
              keyboardType="decimal-pad"
              value={form.pricePerUnit}
              onChangeText={(text) => updateForm("pricePerUnit", text)}
              error={errors.pricePerUnit}
              leftIcon={
                <DollarSign size={20} color={neumorphicColors.text.secondary} />
              }
            />

            {/* Location */}
            <NeumorphicInput
              label="Location *"
              placeholder="e.g., Harare, Mashonaland East"
              value={form.location}
              onChangeText={(text) => updateForm("location", text)}
              error={errors.location}
              leftIcon={
                <MapPin size={20} color={neumorphicColors.text.secondary} />
              }
            />

            {/* Harvest Date */}
            <NeumorphicInput
              label="Harvest Date (Optional)"
              placeholder="YYYY-MM-DD"
              value={form.harvestDate}
              onChangeText={(text) => updateForm("harvestDate", text)}
              leftIcon={
                <Calendar size={20} color={neumorphicColors.text.secondary} />
              }
            />

            {/* Description */}
            <NeumorphicInput
              label="Description (Optional)"
              placeholder="Describe your produce, quality, certifications..."
              multiline
              numberOfLines={4}
              value={form.description}
              onChangeText={(text) => updateForm("description", text)}
              leftIcon={
                <FileText size={20} color={neumorphicColors.text.secondary} />
              }
            />

            {/* Submit Button */}
            <NeumorphicButton
              title="Create Listing"
              onPress={handleSubmit}
              variant="primary"
              size="lg"
              loading={loading}
              disabled={loading}
              style={{ marginTop: spacing.lg }}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </NeumorphicScreen>
  );
}

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.lg,
    gap: spacing.md,
  },
  headerText: {
    flex: 1,
  },
  title: {
    ...typography.h2,
    color: neumorphicColors.text.primary,
  },
  subtitle: {
    ...typography.body,
    color: neumorphicColors.text.secondary,
    marginTop: spacing.xs,
  },
  form: {
    padding: spacing.lg,
    paddingTop: 0,
  },
  inputGroup: {
    marginBottom: spacing.lg,
  },
  label: {
    ...typography.caption,
    fontWeight: "500",
    color: neumorphicColors.text.secondary,
    marginBottom: spacing.sm,
  },
  inputError: {
    borderColor: neumorphicColors.semantic.error,
  },
  errorText: {
    ...typography.caption,
    color: neumorphicColors.semantic.error,
    marginTop: spacing.xs,
  },
  row: {
    flexDirection: "row",
  },
  picker: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: neumorphicColors.base.input,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderWidth: 1,
    borderColor: neumorphicColors.base.border,
  },
  pickerText: {
    ...typography.body,
    color: neumorphicColors.text.primary,
  },
  pickerPlaceholder: {
    ...typography.body,
    color: neumorphicColors.text.tertiary,
  },
  pickerOptions: {
    marginTop: spacing.sm,
    padding: 0,
  },
  pickerOption: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: neumorphicColors.base.border,
  },
  pickerOptionText: {
    ...typography.body,
    color: neumorphicColors.text.primary,
  },
});
