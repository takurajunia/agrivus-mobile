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
import ModernInput from "../components/ModernInput";
import AnimatedButton from "../components/AnimatedButton";
import { theme } from "../theme/tokens";
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
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join the Agrivus community today</Text>
        </View>

        <View style={styles.formContainer}>
          <ModernInput
            label="Full Name"
            placeholder="John Doe"
            value={formData.fullName}
            onChangeText={(text: string) =>
              setFormData((prev: RegisterData) => ({ ...prev, fullName: text }))
            }
            autoCapitalize="words"
            leftIcon={<User size={20} color={theme.colors.text.tertiary} />}
            style={styles.inputSpacing}
          />

          <ModernInput
            label="Email Address"
            placeholder="john@example.com"
            value={formData.email}
            onChangeText={(text: string) =>
              setFormData((prev: RegisterData) => ({ ...prev, email: text }))
            }
            keyboardType="email-address"
            autoCapitalize="none"
            leftIcon={<Mail size={20} color={theme.colors.text.tertiary} />}
            style={styles.inputSpacing}
          />

          <ModernInput
            label="Phone Number"
            placeholder="+1 234 567 890"
            value={formData.phone}
            onChangeText={(text: string) =>
              setFormData((prev: RegisterData) => ({ ...prev, phone: text }))
            }
            keyboardType="phone-pad"
            leftIcon={<Phone size={20} color={theme.colors.text.tertiary} />}
            style={styles.inputSpacing}
          />

          {/* Custom Role Selector styled to match ModernInput */}
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
                color={theme.colors.text.tertiary}
                style={{
                  transform: showRolePicker ? "rotate(180deg)" : "rotate(0deg)",
                }}
              />
            </TouchableOpacity>

            {showRolePicker && (
              <View style={styles.roleDropdown}>
                {userRoles.map((role, index) => (
                  <TouchableOpacity
                    key={role.value}
                    style={[
                      styles.roleOption,
                      index === userRoles.length - 1 && styles.roleOptionLast,
                      formData.role === role.value && styles.roleOptionSelected,
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
                      <Check size={18} color={theme.colors.primary[600]} />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          <ModernInput
            label="Password"
            placeholder="Create a password"
            value={formData.password}
            onChangeText={(text: string) =>
              setFormData((prev: RegisterData) => ({ ...prev, password: text }))
            }
            secureTextEntry
            autoCapitalize="none"
            leftIcon={<Lock size={20} color={theme.colors.text.tertiary} />}
            style={styles.inputSpacing}
          />

          <ModernInput
            label="Confirm Password"
            placeholder="Confirm your password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            autoCapitalize="none"
            leftIcon={<Lock size={20} color={theme.colors.text.tertiary} />}
            style={styles.inputSpacing}
          />

          <View style={styles.termsContainer}>
            <Text style={styles.termsText}>
              By creating an account, you agree to our Terms of Service and
              Privacy Policy.
            </Text>
          </View>

          <AnimatedButton
            title="Create Account"
            onPress={handleRegister}
            loading={isLoading}
            variant="primary"
            size="lg"
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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.secondary,
  },
  scrollContent: {
    flexGrow: 1,
    padding: theme.spacing.xl,
    paddingTop: theme.spacing["3xl"],
  },
  header: {
    marginBottom: theme.spacing.xl,
  },
  title: {
    fontSize: theme.typography.fontSize["4xl"],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.secondary,
  },
  formContainer: {
    width: "100%",
  },
  inputSpacing: {
    marginBottom: theme.spacing.sm,
  },
  roleContainer: {
    marginBottom: theme.spacing.md,
    zIndex: theme.zIndex.dropdown,
  },
  roleLabel: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.tertiary,
    marginBottom: theme.spacing.xs,
    marginLeft: theme.spacing.xs,
  },
  roleSelector: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: theme.colors.background.primary,
    borderWidth: 1,
    borderColor: theme.colors.border.light,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    minHeight: 64,
  },
  roleSelectorActive: {
    borderColor: theme.colors.primary[500],
    backgroundColor: theme.colors.primary[50],
  },
  roleSelectorText: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
  },
  roleSelectorSubtext: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.tertiary,
    marginTop: 2,
  },
  roleDropdown: {
    position: "absolute",
    top: "100%",
    left: 0,
    right: 0,
    backgroundColor: theme.colors.background.primary,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border.light,
    marginTop: 4,
    ...theme.shadows.lg,
    zIndex: 1000,
  },
  roleOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.neutral[100],
  },
  roleOptionLast: {
    borderBottomWidth: 0,
  },
  roleOptionSelected: {
    backgroundColor: theme.colors.primary[50],
  },
  roleOptionContent: {
    flex: 1,
  },
  roleOptionText: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.primary,
    fontWeight: theme.typography.fontWeight.medium,
  },
  roleOptionTextSelected: {
    color: theme.colors.primary[700],
    fontWeight: theme.typography.fontWeight.bold,
  },
  roleOptionDescription: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.tertiary,
    marginTop: 2,
  },
  termsContainer: {
    marginVertical: theme.spacing.lg,
  },
  termsText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.tertiary,
    textAlign: "center",
    lineHeight: 18,
  },
  registerButton: {
    marginBottom: theme.spacing.xl,
    ...theme.shadows.colored,
  },
  footerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: theme.spacing.xl,
  },
  footerText: {
    color: theme.colors.text.secondary,
    fontSize: theme.typography.fontSize.md,
  },
  loginText: {
    color: theme.colors.primary[600],
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.bold,
  },
});
