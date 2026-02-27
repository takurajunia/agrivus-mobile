import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  Linking,
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../contexts/AuthContext";
import {
  User,
  Lock,
  Phone,
  Mail,
  ChevronDown,
  Check,
} from "lucide-react-native";
import {
  neumorphicColors,
  typography,
  spacing,
  borderRadius,
  getNeumorphicShadow,
} from "../theme/neumorphic";
import NeumorphicScreen from "../components/neumorphic/NeumorphicScreen";
import NeumorphicCard from "../components/neumorphic/NeumorphicCard";
import NeumorphicButton from "../components/neumorphic/NeumorphicButton";
import NeumorphicInput from "../components/neumorphic/NeumorphicInput";
import type { RegisterData, UserRole } from "../types";

const userRoles: { label: string; value: UserRole; description: string }[] = [
  { label: "Farmer", value: "farmer", description: "I want to sell produce" },
  { label: "Buyer", value: "buyer", description: "I want to buy produce" },
  {
    label: "Transporter",
    value: "transporter",
    description: "I provide logistics",
  },
  {
    label: "Agro Supplier",
    value: "agro_supplier",
    description: "I sell supplies",
  },
];

export default function RegisterScreen() {
  const [formData, setFormData] = useState<RegisterData>({
    email: "",
    phone: "",
    password: "",
    fullName: "",
    role: "farmer",
  });
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showRolePicker, setShowRolePicker] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const router = useRouter();
  const { register } = useAuth();

  const termsUrl =
    "https://www.privacypolicies.com/live/177285ff-e311-474c-98e4-79f73cc3ed8e";

  const handleRegister = async () => {
    if (
      !formData.email ||
      !formData.phone ||
      !formData.password ||
      !formData.fullName
    ) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    if (formData.password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    if (formData.password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters");
      return;
    }

    if (!acceptedTerms) {
      Alert.alert(
        "Terms & Conditions Required",
        "Please agree to the Terms & Conditions and Privacy Policy to create your account."
      );
      return;
    }

    setIsLoading(true);
    try {
      await register(formData);
      Alert.alert("Success", "Account created successfully!", [
        { text: "OK", onPress: () => router.replace("/(tabs)") },
      ]);
    } catch (error: any) {
      Alert.alert("Registration Failed", error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const navigateToLogin = () => {
    router.back();
  };

  const openTerms = async () => {
    try {
      await Linking.openURL(termsUrl);
    } catch (error) {
      Alert.alert("Error", "Unable to open Terms & Conditions right now.");
    }
  };

  const selectedRole = userRoles.find((role) => role.value === formData.role);

  return (
    <NeumorphicScreen variant="auth" showLeaves={true}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Image
                source={require("../../assets/noBackgroundLogo.png")}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>
              Join the Agrivus community today
            </Text>
          </View>

          <View style={styles.formContainer}>
            <NeumorphicInput
              label="Full Name"
              placeholder="John Doe"
              value={formData.fullName}
              onChangeText={(text: string) =>
                setFormData((prev: RegisterData) => ({
                  ...prev,
                  fullName: text,
                }))
              }
              autoCapitalize="words"
              leftIcon={
                <User size={20} color={neumorphicColors.text.tertiary} />
              }
              containerStyle={styles.inputSpacing}
            />

            <NeumorphicInput
              label="Email Address"
              placeholder="john@example.com"
              value={formData.email}
              onChangeText={(text: string) =>
                setFormData((prev: RegisterData) => ({ ...prev, email: text }))
              }
              keyboardType="email-address"
              autoCapitalize="none"
              leftIcon={
                <Mail size={20} color={neumorphicColors.text.tertiary} />
              }
              containerStyle={styles.inputSpacing}
            />

            <NeumorphicInput
              label="Phone Number"
              placeholder="+1 234 567 890"
              value={formData.phone}
              onChangeText={(text: string) =>
                setFormData((prev: RegisterData) => ({ ...prev, phone: text }))
              }
              keyboardType="phone-pad"
              leftIcon={
                <Phone size={20} color={neumorphicColors.text.tertiary} />
              }
              containerStyle={styles.inputSpacing}
            />

            {/* Custom Role Selector */}
            <View style={styles.roleContainer}>
              <Text style={styles.roleLabel}>I am a...</Text>
              <TouchableOpacity
                style={[
                  styles.roleSelector,
                  showRolePicker && styles.roleSelectorActive,
                ]}
                onPress={() => setShowRolePicker(!showRolePicker)}
                activeOpacity={0.7}
              >
                <View>
                  <Text style={styles.roleSelectorText}>
                    {selectedRole?.label}
                  </Text>
                  <Text style={styles.roleSelectorSubtext}>
                    {selectedRole?.description}
                  </Text>
                </View>
                <ChevronDown
                  size={20}
                  color={neumorphicColors.text.tertiary}
                  style={{
                    transform: [{ rotate: showRolePicker ? "180deg" : "0deg" }],
                  }}
                />
              </TouchableOpacity>

              {showRolePicker && (
                <NeumorphicCard
                  variant="elevated"
                  style={styles.roleDropdown}
                  animated={false}
                >
                  {userRoles.map((role, index) => (
                    <TouchableOpacity
                      key={role.value}
                      style={[
                        styles.roleOption,
                        index === userRoles.length - 1 && styles.roleOptionLast,
                        formData.role === role.value &&
                          styles.roleOptionSelected,
                      ]}
                      onPress={() => {
                        setFormData((prev: RegisterData) => ({
                          ...prev,
                          role: role.value,
                        }));
                        setShowRolePicker(false);
                      }}
                    >
                      <View style={styles.roleOptionContent}>
                        <Text
                          style={[
                            styles.roleOptionText,
                            formData.role === role.value &&
                              styles.roleOptionTextSelected,
                          ]}
                        >
                          {role.label}
                        </Text>
                        <Text style={styles.roleOptionDescription}>
                          {role.description}
                        </Text>
                      </View>
                      {formData.role === role.value && (
                        <Check
                          size={18}
                          color={neumorphicColors.primary[600]}
                        />
                      )}
                    </TouchableOpacity>
                  ))}
                </NeumorphicCard>
              )}
            </View>

            <NeumorphicInput
              label="Password"
              placeholder="Create a password"
              value={formData.password}
              onChangeText={(text: string) =>
                setFormData((prev: RegisterData) => ({
                  ...prev,
                  password: text,
                }))
              }
              secureTextEntry
              showPasswordToggle
              autoCapitalize="none"
              leftIcon={
                <Lock size={20} color={neumorphicColors.text.tertiary} />
              }
              containerStyle={styles.inputSpacing}
            />

            <NeumorphicInput
              label="Confirm Password"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              showPasswordToggle
              autoCapitalize="none"
              leftIcon={
                <Lock size={20} color={neumorphicColors.text.tertiary} />
              }
              containerStyle={styles.inputSpacing}
            />

            <View style={styles.termsContainer}>
              <TouchableOpacity
                style={styles.termsCheckRow}
                onPress={() => setAcceptedTerms((previous) => !previous)}
                activeOpacity={0.8}
              >
                <View
                  style={[
                    styles.checkbox,
                    acceptedTerms && styles.checkboxChecked,
                  ]}
                >
                  {acceptedTerms && (
                    <Check size={14} color={neumorphicColors.text.inverse} />
                  )}
                </View>
                <Text style={styles.termsText}>
                  I agree to the Terms & Conditions and Privacy Policy.
                </Text>
              </TouchableOpacity>

              <Text style={styles.termsSummary}>
                By agreeing, you consent to Agrivus collecting and using your
                personal data to provide services, manage your account,
                communicate important updates, and improve platform performance
                in line with applicable laws and our retention policy.
              </Text>

              <TouchableOpacity onPress={openTerms}>
                <Text style={styles.termsLink}>Read full Terms & Conditions</Text>
              </TouchableOpacity>
            </View>

            <NeumorphicButton
              title="Create Account"
              onPress={handleRegister}
              loading={isLoading}
              variant="primary"
              size="large"
              fullWidth
              style={styles.registerButton}
            />

            <View style={styles.footerContainer}>
              <Text style={styles.footerText}>Already have an account? </Text>
              <TouchableOpacity onPress={navigateToLogin}>
                <Text style={styles.loginText}>Sign In</Text>
              </TouchableOpacity>
            </View>
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
  scrollContent: {
    flexGrow: 1,
    padding: spacing.xl,
    paddingTop: spacing["2xl"],
  },
  header: {
    alignItems: "center",
    marginBottom: spacing["2xl"],
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.full,
    backgroundColor: neumorphicColors.base.card,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.lg,
    ...getNeumorphicShadow(3),
  },
  logo: {
    width: 70,
    height: 70,
  },
  title: {
    ...typography.h1,
    color: neumorphicColors.text.primary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.body,
    color: neumorphicColors.text.secondary,
  },
  formContainer: {
    width: "100%",
  },
  inputSpacing: {
    marginBottom: spacing.sm,
  },
  roleContainer: {
    marginBottom: spacing.md,
    zIndex: 100,
  },
  roleLabel: {
    ...typography.caption,
    color: neumorphicColors.text.tertiary,
    marginBottom: spacing.xs,
    marginLeft: spacing.xs,
  },
  roleSelector: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: neumorphicColors.base.input,
    borderWidth: 1,
    borderColor: neumorphicColors.base.background,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    minHeight: 64,
  },
  roleSelectorActive: {
    borderColor: neumorphicColors.primary[500],
    backgroundColor: neumorphicColors.primary[50],
  },
  roleSelectorText: {
    ...typography.body,
    fontWeight: "600",
    color: neumorphicColors.text.primary,
  },
  roleSelectorSubtext: {
    ...typography.caption,
    color: neumorphicColors.text.tertiary,
    marginTop: 2,
  },
  roleDropdown: {
    position: "absolute",
    top: "100%",
    left: 0,
    right: 0,
    marginTop: spacing.xs,
    padding: 0,
    zIndex: 1000,
  },
  roleOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: neumorphicColors.base.background,
  },
  roleOptionLast: {
    borderBottomWidth: 0,
  },
  roleOptionSelected: {
    backgroundColor: neumorphicColors.primary[50],
  },
  roleOptionContent: {
    flex: 1,
  },
  roleOptionText: {
    ...typography.body,
    color: neumorphicColors.text.primary,
    fontWeight: "500",
  },
  roleOptionTextSelected: {
    color: neumorphicColors.primary[700],
    fontWeight: "700",
  },
  roleOptionDescription: {
    ...typography.caption,
    color: neumorphicColors.text.tertiary,
    marginTop: 2,
  },
  termsContainer: {
    marginVertical: spacing.lg,
  },
  termsCheckRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: neumorphicColors.base.border,
    backgroundColor: neumorphicColors.base.input,
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.sm,
  },
  checkboxChecked: {
    backgroundColor: neumorphicColors.primary[600],
    borderColor: neumorphicColors.primary[600],
  },
  termsText: {
    ...typography.caption,
    color: neumorphicColors.text.tertiary,
    flex: 1,
    lineHeight: 18,
  },
  termsSummary: {
    ...typography.caption,
    color: neumorphicColors.text.secondary,
    lineHeight: 18,
    marginBottom: spacing.sm,
  },
  termsLink: {
    ...typography.caption,
    color: neumorphicColors.primary[600],
    fontWeight: "700",
  },
  registerButton: {
    marginBottom: spacing.xl,
  },
  footerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.xl,
  },
  footerText: {
    ...typography.body,
    color: neumorphicColors.text.secondary,
  },
  loginText: {
    ...typography.body,
    color: neumorphicColors.primary[600],
    fontWeight: "700",
  },
});
