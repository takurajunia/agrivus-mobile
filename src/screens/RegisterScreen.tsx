import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from "react-native";
import { useAuth } from "../contexts/AuthContext";
import Input from "../components/Input";
import Button from "../components/Button";
import LoadingSpinner from "../components/LoadingSpinner";
import type { RegisterData, UserRole } from "../types";

const userRoles: { label: string; value: UserRole }[] = [
  { label: "Farmer", value: "farmer" },
  { label: "Buyer", value: "buyer" },
  { label: "Transporter", value: "transporter" },
  { label: "Agro Supplier", value: "agro_supplier" },
];

const RegisterScreen: React.FC = () => {
  const { register } = useAuth();
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
      Alert.alert("Success", "Account created successfully!");
    } catch (error: any) {
      Alert.alert("Registration Failed", error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const selectedRoleLabel =
    userRoles.find((role) => role.value === formData.role)?.label ||
    "Select Role";

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.content}>
          <Text style={styles.title}>Join Agrivus</Text>
          <Text style={styles.subtitle}>Create your account</Text>

          <View style={styles.form}>
            <Input
              placeholder="Full Name"
              value={formData.fullName}
              onChangeText={(text: string) =>
                setFormData((prev) => ({ ...prev, fullName: text }))
              }
              autoCapitalize="words"
            />

            <Input
              placeholder="Email"
              value={formData.email}
              onChangeText={(text: string) =>
                setFormData((prev) => ({ ...prev, email: text }))
              }
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />

            <Input
              placeholder="Phone Number"
              value={formData.phone}
              onChangeText={(text: string) =>
                setFormData((prev) => ({ ...prev, phone: text }))
              }
              keyboardType="phone-pad"
            />

            <TouchableOpacity
              style={styles.roleSelector}
              onPress={() => setShowRolePicker(!showRolePicker)}
            >
              <Text style={styles.roleSelectorText}>{selectedRoleLabel}</Text>
              <Text style={styles.arrow}>{showRolePicker ? "▲" : "▼"}</Text>
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

            <Input
              placeholder="Password"
              value={formData.password}
              onChangeText={(text: string) =>
                setFormData((prev) => ({ ...prev, password: text }))
              }
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
            />

            <Input
              placeholder="Confirm Password"
              value={confirmPassword}
              onChangeText={(text: string) => setConfirmPassword(text)}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
            />

            <Button
              title={isLoading ? "Creating Account..." : "Sign Up"}
              onPress={handleRegister}
              disabled={isLoading}
              style={styles.registerButton}
            />
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
  },
  content: {
    padding: 20,
    justifyContent: "center",
    minHeight: "100%",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
    color: "#333",
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 40,
    color: "#666",
  },
  form: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  roleSelector: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    padding: 10,
    marginVertical: 8,
    backgroundColor: "#fff",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  roleSelectorText: {
    fontSize: 16,
    color: "#333",
  },
  arrow: {
    fontSize: 16,
    color: "#666",
  },
  roleOptions: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    marginTop: 4,
    backgroundColor: "#fff",
  },
  roleOption: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  roleOptionText: {
    fontSize: 16,
    color: "#333",
  },
  registerButton: {
    backgroundColor: "#4CAF50",
    marginTop: 20,
  },
});

export default RegisterScreen;
