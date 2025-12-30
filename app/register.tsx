import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../src/contexts/AuthContext";
import { User, Lock, Phone, Leaf, ChevronDown } from "lucide-react-native";
import LoadingSpinner from "../src/components/LoadingSpinner";
import type { RegisterData, UserRole } from "../src/types";

const userRoles: { label: string; value: UserRole }[] = [
  { label: "Farmer", value: "farmer" },
  { label: "Buyer", value: "buyer" },
  { label: "Transporter", value: "transporter" },
  { label: "Agro Supplier", value: "agro_supplier" },
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
    router.push("/");
  };

  const selectedRoleLabel =
    userRoles.find((role) => role.value === formData.role)?.label ||
    "Select Role";

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Leaf size={48} color="#2E7D32" strokeWidth={2.5} />
          </View>
          <Text style={styles.title}>Join Agrivus</Text>
          <Text style={styles.subtitle}>Create your account</Text>
        </View>

        <View style={styles.formContainer}>
          <View style={styles.inputContainer}>
            <View style={styles.inputIcon}>
              <User size={20} color="#666" />
            </View>
            <TextInput
              style={styles.input}
              placeholder="Full Name"
              placeholderTextColor="#999"
              value={formData.fullName}
              onChangeText={(text) =>
                setFormData((prev) => ({ ...prev, fullName: text }))
              }
              autoCapitalize="words"
            />
          </View>

          <View style={styles.inputContainer}>
            <View style={styles.inputIcon}>
              <User size={20} color="#666" />
            </View>
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#999"
              value={formData.email}
              onChangeText={(text) =>
                setFormData((prev) => ({ ...prev, email: text }))
              }
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />
          </View>

          <View style={styles.inputContainer}>
            <View style={styles.inputIcon}>
              <Phone size={20} color="#666" />
            </View>
            <TextInput
              style={styles.input}
              placeholder="Phone Number"
              placeholderTextColor="#999"
              value={formData.phone}
              onChangeText={(text) =>
                setFormData((prev) => ({ ...prev, phone: text }))
              }
              keyboardType="phone-pad"
            />
          </View>

          <TouchableOpacity
            style={styles.roleSelector}
            onPress={() => setShowRolePicker(!showRolePicker)}
          >
            <Text style={styles.roleSelectorText}>{selectedRoleLabel}</Text>
            <ChevronDown size={20} color="#666" />
          </TouchableOpacity>

          {showRolePicker && (
            <View style={styles.roleOptions}>
              {userRoles.map((role) => (
                <TouchableOpacity
                  key={role.value}
                  style={styles.roleOption}
                  onPress={() => {
                    setFormData((prev) => ({ ...prev, role: role.value }));
                    setShowRolePicker(false);
                  }}
                >
                  <Text style={styles.roleOptionText}>{role.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <View style={styles.inputContainer}>
            <View style={styles.inputIcon}>
              <Lock size={20} color="#666" />
            </View>
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#999"
              value={formData.password}
              onChangeText={(text) =>
                setFormData((prev) => ({ ...prev, password: text }))
              }
              secureTextEntry
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputContainer}>
            <View style={styles.inputIcon}>
              <Lock size={20} color="#666" />
            </View>
            <TextInput
              style={styles.input}
              placeholder="Confirm Password"
              placeholderTextColor="#999"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              autoCapitalize="none"
            />
          </View>

          <TouchableOpacity
            style={[
              styles.registerButton,
              isLoading && styles.registerButtonDisabled,
            ]}
            onPress={handleRegister}
            disabled={isLoading}
          >
            <Text style={styles.registerButtonText}>
              {isLoading ? "Creating Account..." : "Create Account"}
            </Text>
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity
            style={styles.loginButton}
            onPress={navigateToLogin}
          >
            <Text style={styles.loginButtonText}>Sign In</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.footer}>
          By continuing, you agree to our Terms of Service and Privacy Policy
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 24,
  },
  header: {
    alignItems: "center",
    marginBottom: 32,
  },
  logoContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "#E8F5E9",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    shadowColor: "#2E7D32",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    color: "#1A1A1A",
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
  formContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 12,
    marginBottom: 16,
    backgroundColor: "#FAFAFA",
  },
  inputIcon: {
    paddingLeft: 16,
    paddingRight: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 16,
    paddingRight: 16,
    fontSize: 16,
    color: "#1A1A1A",
  },
  roleSelector: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 12,
    marginBottom: 16,
    padding: 16,
    backgroundColor: "#FAFAFA",
  },
  roleSelectorText: {
    fontSize: 16,
    color: "#1A1A1A",
  },
  roleOptions: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 12,
    marginBottom: 16,
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  roleOption: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  roleOptionText: {
    fontSize: 16,
    color: "#1A1A1A",
  },
  forgotPassword: {
    alignSelf: "flex-end",
    color: "#2E7D32",
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 24,
  },
  registerButton: {
    backgroundColor: "#2E7D32",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginBottom: 24,
    shadowColor: "#2E7D32",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  registerButtonDisabled: {
    opacity: 0.6,
  },
  registerButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#E0E0E0",
  },
  dividerText: {
    paddingHorizontal: 16,
    color: "#666",
    fontSize: 14,
  },
  loginButton: {
    borderWidth: 1,
    borderColor: "#2E7D32",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  loginButtonText: {
    color: "#2E7D32",
    fontSize: 16,
    fontWeight: "600",
  },
  footer: {
    textAlign: "center",
    color: "#666",
    fontSize: 12,
    lineHeight: 18,
    marginTop: 24,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
