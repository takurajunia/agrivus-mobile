import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { useAuth } from "../contexts/AuthContext";
import { getProfile } from "../services/authService";
import {
  NeumorphicScreen,
  NeumorphicCard,
  NeumorphicInput,
  NeumorphicButton,
} from "../components/neumorphic";
import { neumorphicColors, typography, spacing } from "../theme/neumorphic";

export default function EditProfileScreen() {
  const router = useRouter();
  const { user, updateProfile } = useAuth();

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [businessLocation, setBusinessLocation] = useState("");
  const [buyerType, setBuyerType] = useState("");
  const [purchaseVolume, setPurchaseVolume] = useState("");
  const [qualityRequirements, setQualityRequirements] = useState("");
  const [productsInterested, setProductsInterested] = useState("");
  const [farmLocation, setFarmLocation] = useState("");
  const [farmSize, setFarmSize] = useState("");
  const [productionMethod, setProductionMethod] = useState("");
  const [experienceYears, setExperienceYears] = useState("");
  const [harvestPeriod, setHarvestPeriod] = useState("");
  const [crops, setCrops] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const canEdit = useMemo(
    () => user?.role === "buyer" || user?.role === "farmer",
    [user?.role]
  );

  useEffect(() => {
    let mounted = true;

    const loadProfile = async () => {
      if (!user) {
        router.replace("/");
        return;
      }

      if (user.role !== "buyer" && user.role !== "farmer") {
        Alert.alert(
          "Not available",
          "This page is currently available for buyers and farmers only.",
          [{ text: "OK", onPress: () => router.back() }]
        );
        return;
      }

      try {
        setLoading(true);
        const profileResponse = await getProfile();
        if (!mounted) return;

        const profile = (profileResponse.profile ?? {}) as Record<string, any>;
        setFullName(profileResponse.user.fullName || user.fullName || "");
        setPhone(profileResponse.user.phone || user.phone || "");
        setBusinessLocation(profile.businessLocation || "");
        setBuyerType(profile.buyerType || "");
        setPurchaseVolume(profile.purchaseVolume || "");
        setQualityRequirements(profile.qualityRequirements || "");
        setProductsInterested(
          Array.isArray(profile.productsInterested)
            ? profile.productsInterested.join(", ")
            : ""
        );
        setFarmLocation(profile.farmLocation || "");
        setFarmSize(profile.farmSize || "");
        setProductionMethod(profile.productionMethod || "");
        setExperienceYears(profile.experienceYears || "");
        setHarvestPeriod(profile.harvestPeriod || "");
        setCrops(Array.isArray(profile.crops) ? profile.crops.join(", ") : "");
      } catch (error: any) {
        Alert.alert("Error", error.message || "Failed to load profile.");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadProfile();

    return () => {
      mounted = false;
    };
  }, [router, user]);

  const handleSave = async () => {
    if (!canEdit) {
      Alert.alert(
        "Not available",
        "This page is currently available for buyers and farmers only."
      );
      return;
    }

    if (!fullName.trim() || !phone.trim()) {
      Alert.alert("Missing fields", "Please complete full name and phone.");
      return;
    }

    if (user?.role === "buyer" && (!businessLocation.trim() || !buyerType.trim())) {
      Alert.alert("Missing fields", "Please complete all required buyer fields.");
      return;
    }

    if (user?.role === "farmer" && !farmLocation.trim()) {
      Alert.alert("Missing fields", "Please complete your farm location.");
      return;
    }

    const products = productsInterested
      .split(",")
      .map((item) => item.trim())
      .filter((item) => item.length > 0);

    const cropList = crops
      .split(",")
      .map((item) => item.trim())
      .filter((item) => item.length > 0);

    try {
      setSaving(true);
      await updateProfile({
        fullName: fullName.trim(),
        phone: phone.trim(),
        profile:
          user?.role === "farmer"
            ? {
                farmLocation: farmLocation.trim(),
                farmSize: farmSize.trim(),
                productionMethod: productionMethod.trim(),
                experienceYears: experienceYears.trim(),
                harvestPeriod: harvestPeriod.trim(),
                crops: cropList,
              }
            : {
                businessLocation: businessLocation.trim(),
                buyerType: buyerType.trim(),
                purchaseVolume: purchaseVolume.trim(),
                qualityRequirements: qualityRequirements.trim(),
                productsInterested: products,
              },
      });

      Alert.alert("Success", "Profile updated successfully.", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (error: any) {
      Alert.alert("Update failed", error.message || "Unable to update profile right now.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <NeumorphicScreen variant="profile" showLeaves={true}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={20} color={neumorphicColors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.title}>Edit Profile</Text>
          <View style={styles.headerSpacer} />
        </View>

        <NeumorphicCard variant="elevated" style={styles.formCard}>
          <NeumorphicInput
            label="Full Name"
            placeholder="Your full name"
            value={fullName}
            onChangeText={setFullName}
            autoCapitalize="words"
          />

          <NeumorphicInput
            label="Phone"
            placeholder="+263..."
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />

          {user?.role === "buyer" ? (
            <>
              <NeumorphicInput
                label="Business Location"
                placeholder="e.g. Harare"
                value={businessLocation}
                onChangeText={setBusinessLocation}
                autoCapitalize="words"
              />

              <NeumorphicInput
                label="Buyer Type"
                placeholder="e.g. Retailer"
                value={buyerType}
                onChangeText={setBuyerType}
                autoCapitalize="words"
              />

              <NeumorphicInput
                label="Purchase Volume"
                placeholder="e.g. 100kg weekly"
                value={purchaseVolume}
                onChangeText={setPurchaseVolume}
              />

              <NeumorphicInput
                label="Quality Requirements"
                placeholder="Describe your quality expectations"
                value={qualityRequirements}
                onChangeText={setQualityRequirements}
                variant="textarea"
              />

              <NeumorphicInput
                label="Products Interested"
                placeholder="maize, tomatoes, onions"
                value={productsInterested}
                onChangeText={setProductsInterested}
                helperText="Separate items with commas"
              />
            </>
          ) : (
            <>
              <NeumorphicInput
                label="Farm Location"
                placeholder="e.g. Marondera"
                value={farmLocation}
                onChangeText={setFarmLocation}
                autoCapitalize="words"
              />

              <NeumorphicInput
                label="Farm Size"
                placeholder="e.g. 10 hectares"
                value={farmSize}
                onChangeText={setFarmSize}
              />

              <NeumorphicInput
                label="Production Method"
                placeholder="e.g. Organic"
                value={productionMethod}
                onChangeText={setProductionMethod}
              />

              <NeumorphicInput
                label="Experience Years"
                placeholder="e.g. 8"
                value={experienceYears}
                onChangeText={setExperienceYears}
                keyboardType="number-pad"
              />

              <NeumorphicInput
                label="Harvest Period"
                placeholder="e.g. May - August"
                value={harvestPeriod}
                onChangeText={setHarvestPeriod}
              />

              <NeumorphicInput
                label="Crops"
                placeholder="maize, soybeans"
                value={crops}
                onChangeText={setCrops}
                helperText="Separate crops with commas"
              />
            </>
          )}

          <NeumorphicButton
            title={saving ? "Saving..." : "Save Changes"}
            onPress={handleSave}
            loading={saving}
            disabled={loading || saving}
            fullWidth
          />
        </NeumorphicCard>
      </ScrollView>
    </NeumorphicScreen>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xl,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: neumorphicColors.base.card,
  },
  title: {
    ...typography.h3,
    color: neumorphicColors.text.primary,
  },
  headerSpacer: {
    width: 36,
    height: 36,
  },
  formCard: {
    marginHorizontal: spacing.xl,
    padding: spacing.xl,
  },
});
