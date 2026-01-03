import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
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
import { theme } from "../theme/tokens";
import { listingsService } from "../services/listingsService";
import LoadingSpinner from "../components/LoadingSpinner";
import AnimatedCard from "../components/AnimatedCard";

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
    <SafeAreaView style={styles.container}>
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
            <Package size={28} color={theme.colors.primary[600]} />
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
                <ChevronDown size={20} color={theme.colors.text.secondary} />
              </TouchableOpacity>
              {errors.cropType && (
                <Text style={styles.errorText}>{errors.cropType}</Text>
              )}

              {showCropPicker && (
                <AnimatedCard style={styles.pickerOptions}>
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
                </AnimatedCard>
              )}
            </View>

            {/* Crop Name (Optional) */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Crop Name (Optional)</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., Hybrid Maize, Cherry Tomatoes"
                placeholderTextColor={theme.colors.text.tertiary}
                value={form.cropName}
                onChangeText={(text) => updateForm("cropName", text)}
              />
            </View>

            {/* Quantity & Unit */}
            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 2 }]}>
                <Text style={styles.label}>Quantity *</Text>
                <TextInput
                  style={[styles.input, errors.quantity && styles.inputError]}
                  placeholder="Enter quantity"
                  placeholderTextColor={theme.colors.text.tertiary}
                  keyboardType="decimal-pad"
                  value={form.quantity}
                  onChangeText={(text) => updateForm("quantity", text)}
                />
                {errors.quantity && (
                  <Text style={styles.errorText}>{errors.quantity}</Text>
                )}
              </View>

              <View
                style={[
                  styles.inputGroup,
                  { flex: 1, marginLeft: theme.spacing.md },
                ]}
              >
                <Text style={styles.label}>Unit *</Text>
                <TouchableOpacity
                  style={styles.picker}
                  onPress={() => setShowUnitPicker(!showUnitPicker)}
                >
                  <Text style={styles.pickerText}>{form.unit}</Text>
                  <ChevronDown size={16} color={theme.colors.text.secondary} />
                </TouchableOpacity>

                {showUnitPicker && (
                  <AnimatedCard style={styles.pickerOptions}>
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
                  </AnimatedCard>
                )}
              </View>
            </View>

            {/* Price */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Price per {form.unit} *</Text>
              <View
                style={[
                  styles.inputWithIcon,
                  errors.pricePerUnit && styles.inputError,
                ]}
              >
                <DollarSign size={20} color={theme.colors.text.secondary} />
                <TextInput
                  style={styles.inputInner}
                  placeholder="Enter price"
                  placeholderTextColor={theme.colors.text.tertiary}
                  keyboardType="decimal-pad"
                  value={form.pricePerUnit}
                  onChangeText={(text) => updateForm("pricePerUnit", text)}
                />
              </View>
              {errors.pricePerUnit && (
                <Text style={styles.errorText}>{errors.pricePerUnit}</Text>
              )}
            </View>

            {/* Location */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Location *</Text>
              <View
                style={[
                  styles.inputWithIcon,
                  errors.location && styles.inputError,
                ]}
              >
                <MapPin size={20} color={theme.colors.text.secondary} />
                <TextInput
                  style={styles.inputInner}
                  placeholder="e.g., Harare, Mashonaland East"
                  placeholderTextColor={theme.colors.text.tertiary}
                  value={form.location}
                  onChangeText={(text) => updateForm("location", text)}
                />
              </View>
              {errors.location && (
                <Text style={styles.errorText}>{errors.location}</Text>
              )}
            </View>

            {/* Harvest Date */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Harvest Date (Optional)</Text>
              <View style={styles.inputWithIcon}>
                <Calendar size={20} color={theme.colors.text.secondary} />
                <TextInput
                  style={styles.inputInner}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={theme.colors.text.tertiary}
                  value={form.harvestDate}
                  onChangeText={(text) => updateForm("harvestDate", text)}
                />
              </View>
            </View>

            {/* Description */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Description (Optional)</Text>
              <View style={styles.inputWithIcon}>
                <FileText size={20} color={theme.colors.text.secondary} />
                <TextInput
                  style={[styles.inputInner, styles.textArea]}
                  placeholder="Describe your produce, quality, certifications..."
                  placeholderTextColor={theme.colors.text.tertiary}
                  multiline
                  numberOfLines={4}
                  value={form.description}
                  onChangeText={(text) => updateForm("description", text)}
                />
              </View>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={[
                styles.submitButton,
                loading && styles.submitButtonDisabled,
              ]}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <LoadingSpinner size="small" />
              ) : (
                <Text style={styles.submitButtonText}>Create Listing</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.secondary,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: theme.typography.fontSize["2xl"],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
  },
  subtitle: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.xs,
  },
  form: {
    padding: theme.spacing.lg,
    paddingTop: 0,
  },
  inputGroup: {
    marginBottom: theme.spacing.lg,
  },
  label: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.sm,
  },
  input: {
    backgroundColor: theme.colors.background.primary,
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.primary,
    borderWidth: 1,
    borderColor: theme.colors.border.light,
  },
  inputWithIcon: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: theme.colors.background.primary,
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border.light,
    gap: theme.spacing.sm,
  },
  inputInner: {
    flex: 1,
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.primary,
    padding: 0,
  },
  inputError: {
    borderColor: theme.colors.error,
  },
  errorText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.error,
    marginTop: theme.spacing.xs,
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  row: {
    flexDirection: "row",
  },
  picker: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: theme.colors.background.primary,
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border.light,
  },
  pickerText: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.primary,
  },
  pickerPlaceholder: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.tertiary,
  },
  pickerOptions: {
    marginTop: theme.spacing.sm,
    backgroundColor: theme.colors.background.primary,
    borderRadius: theme.borderRadius.lg,
    ...theme.shadows.md,
    maxHeight: 200,
  },
  pickerOption: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
  },
  pickerOptionText: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.primary,
  },
  submitButton: {
    backgroundColor: theme.colors.primary[600],
    paddingVertical: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    alignItems: "center",
    marginTop: theme.spacing.lg,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.inverse,
  },
});
