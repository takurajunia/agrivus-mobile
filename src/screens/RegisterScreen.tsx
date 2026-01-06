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

  const router = useRouter();
  const { register } = useAuth();

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

  const selectedRole = userRoles.find((role) => role.value === formData.role);

  return (
    <NeumorphicScreen variant="default" showLeaves={true}>
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
                    transform: showRolePicker
                      ? "rotate(180deg)"
                      : "rotate(0deg)",
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
              <Text style={styles.termsText}>
                By creating an account, you agree to our Terms of Service and
                Privacy Policy.
              </Text>
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
    marginBottom: spacing.xl,
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
  termsText: {
    ...typography.caption,
    color: neumorphicColors.text.tertiary,
    textAlign: "center",
    lineHeight: 18,
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
