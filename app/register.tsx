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
import { User, Lock, Phone, Mail, Leaf, ChevronDown } from "lucide-react-native";
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
      <View style={styles.backgroundPattern}>
        <View style={[styles.leafPattern, styles.leafPattern1]} />
        <View style={[styles.leafPattern, styles.leafPattern2]} />
        <View style={[styles.leafPattern, styles.leafPattern3]} />
        <View style={[styles.leafPattern, styles.leafPattern4]} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.logoWrapper}>
            <View style={styles.logoGlow} />
            <View style={styles.logoContainer}>
              <Leaf size={40} color="#4CAF50" strokeWidth={2.5} />
            </View>
          </View>
          <Text style={styles.title}>Join Agrivus</Text>
          <Text style={styles.subtitle}>Create your account</Text>
        </View>

        <View style={styles.formCard}>
          <View style={styles.inputWrapper}>
            <View style={styles.inputContainer}>
              <User size={20} color="#9E9E9E" strokeWidth={2} />
              <TextInput
                style={styles.input}
                placeholder="Full Name"
                placeholderTextColor="#BDBDBD"
                value={formData.fullName}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, fullName: text }))
                }
                autoCapitalize="words"
              />
            </View>
          </View>

          <View style={styles.inputWrapper}>
            <View style={styles.inputContainer}>
              <User size={20} color="#9E9E9E" strokeWidth={2} />
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor="#BDBDBD"
                value={formData.email}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, email: text }))
                }
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
              />
            </View>
          </View>

          <View style={styles.inputWrapper}>
            <View style={styles.inputContainer}>
              <Phone size={20} color="#9E9E9E" strokeWidth={2} />
              <TextInput
                style={styles.input}
                placeholder="Phone Number"
                placeholderTextColor="#BDBDBD"
                value={formData.phone}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, phone: text }))
                }
                keyboardType="phone-pad"
              />
            </View>
          </View>

          <View style={styles.inputWrapper}>
            <TouchableOpacity
              style={styles.roleSelector}
              onPress={() => setShowRolePicker(!showRolePicker)}
              activeOpacity={0.8}
            >
              <Text style={styles.roleSelectorText}>{selectedRoleLabel}</Text>
              <ChevronDown size={20} color="#9E9E9E" strokeWidth={2} />
            </TouchableOpacity>
          </View>

          {showRolePicker && (
            <View style={styles.roleDropdown}>
              {userRoles.map((role, index) => (
                <TouchableOpacity
                  key={role.value}
                  style={[
                    styles.roleOption,
                    index === userRoles.length - 1 && styles.roleOptionLast,
                  ]}
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

          <View style={styles.inputWrapper}>
            <View style={styles.inputContainer}>
              <Lock size={20} color="#9E9E9E" strokeWidth={2} />
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor="#BDBDBD"
                value={formData.password}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, password: text }))
                }
                secureTextEntry
                autoCapitalize="none"
              />
            </View>
          </View>

          <View style={styles.inputWrapper}>
            <View style={styles.inputContainer}>
              <Lock size={20} color="#9E9E9E" strokeWidth={2} />
              <TextInput
                style={styles.input}
                placeholder="Confirm Password"
                placeholderTextColor="#BDBDBD"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                autoCapitalize="none"
              />
            </View>
          </View>

          <TouchableOpacity
            style={[
              styles.createButton,
              isLoading && styles.createButtonDisabled,
            ]}
            onPress={handleRegister}
            disabled={isLoading}
            activeOpacity={0.9}
          >
            <Text style={styles.createButtonText}>
              {isLoading ? "Creating Account..." : "Create Account"}
            </Text>
          </TouchableOpacity>

          <View style={styles.divider}>
            <Text style={styles.dividerText}>OR</Text>
          </View>

          <TouchableOpacity
            style={styles.signInButton}
            onPress={navigateToLogin}
            activeOpacity={0.8}
          >
            <Text style={styles.signInButtonText}>Sign In</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E8E8EC",
  },
  backgroundPattern: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  leafPattern: {
    position: "absolute",
    backgroundColor: "#D8D8DC",
    opacity: 0.3,
  },
  leafPattern1: {
    top: 60,
    left: 20,
    width: 150,
    height: 200,
    borderTopLeftRadius: 100,
    borderTopRightRadius: 80,
    borderBottomLeftRadius: 100,
    borderBottomRightRadius: 20,
    transform: [{ rotate: "-15deg" }],
  },
  leafPattern2: {
    top: 80,
    right: -20,
    width: 180,
    height: 220,
    borderTopLeftRadius: 90,
    borderTopRightRadius: 100,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 100,
    transform: [{ rotate: "25deg" }],
  },
  leafPattern3: {
    bottom: 150,
    left: -30,
    width: 160,
    height: 190,
    borderTopLeftRadius: 80,
    borderTopRightRadius: 100,
    borderBottomLeftRadius: 100,
    borderBottomRightRadius: 25,
    transform: [{ rotate: "10deg" }],
  },
  leafPattern4: {
    bottom: 100,
    right: 30,
    width: 140,
    height: 180,
    borderTopLeftRadius: 100,
    borderTopRightRadius: 70,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 100,
    transform: [{ rotate: "-20deg" }],
  },
  scrollContent: {
    flexGrow: 1,
    paddingTop: 40,
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  header: {
    alignItems: "center",
    marginBottom: 32,
    paddingTop: 20,
  },
  logoWrapper: {
    position: "relative",
    marginBottom: 20,
  },
  logoGlow: {
    position: "absolute",
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "#C8E6C9",
    opacity: 0.6,
    top: -20,
    left: -20,
    shadowColor: "#4CAF50",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 30,
    elevation: 8,
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#E8F5E9",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  title: {
    fontSize: 36,
    fontWeight: "700",
    color: "#2C2C2C",
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: "#8E8E93",
    fontWeight: "400",
  },
  formCard: {
    backgroundColor: "#FAFAFA",
    borderRadius: 32,
    padding: 28,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 8,
  },
  inputWrapper: {
    marginBottom: 16,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E8E8EC",
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 16,
    shadowColor: "#000",
    shadowOffset: { width: -3, height: -3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 1,
  },
  input: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: "#2C2C2C",
    fontWeight: "400",
  },
  roleSelector: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#E8E8EC",
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 16,
    shadowColor: "#000",
    shadowOffset: { width: -3, height: -3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 1,
  },
  roleSelectorText: {
    fontSize: 16,
    color: "#2C2C2C",
    fontWeight: "400",
  },
  roleDropdown: {
    backgroundColor: "#FAFAFA",
    borderRadius: 20,
    marginTop: 8,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    overflow: "hidden",
  },
  roleOption: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E8E8EC",
  },
  roleOptionLast: {
    borderBottomWidth: 0,
  },
  roleOptionText: {
    fontSize: 16,
    color: "#2C2C2C",
  },
  createButton: {
    backgroundColor: "#4CAF50",
    borderRadius: 28,
    paddingVertical: 18,
    alignItems: "center",
    marginTop: 8,
    marginBottom: 20,
    shadowColor: "#4CAF50",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  createButtonDisabled: {
    opacity: 0.6,
  },
  createButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  divider: {
    alignItems: "center",
    marginVertical: 20,
  },
  dividerText: {
    color: "#BDBDBD",
    fontSize: 14,
    fontWeight: "500",
  },
  signInButton: {
    backgroundColor: "#E8E8EC",
    borderRadius: 28,
    paddingVertical: 18,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: -3, height: -3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 2,
  },
  signInButtonText: {
    color: "#4CAF50",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  bottomPadding: {
    height: 20,
  },
});
