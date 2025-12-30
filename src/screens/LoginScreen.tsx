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
import { Eye, EyeOff } from "lucide-react-native";
import { useAuth } from "../contexts/AuthContext";
import Input from "../components/Input";
import Button from "../components/Button";
import LoadingSpinner from "../components/LoadingSpinner";
import type { LoginCredentials } from "../types";

const LoginScreen: React.FC = () => {
  const { login, loading } = useAuth();
  const [credentials, setCredentials] = useState<LoginCredentials>({
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!credentials.email || !credentials.password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    setIsLoading(true);
    try {
      await login(credentials);
      // Navigation will be handled by the auth context
    } catch (error: any) {
      Alert.alert("Login Failed", error.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <LoadingSpinner />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.content}>
          <Text style={styles.title}>Welcome to Agrivus</Text>
          <Text style={styles.subtitle}>Sign in to your account</Text>

          <View style={styles.form}>
            <Input
              placeholder="Email"
              value={credentials.email}
              onChangeText={(text: string) =>
                setCredentials((prev) => ({ ...prev, email: text }))
              }
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />

            <View style={styles.passwordContainer}>
              <Input
                placeholder="Password"
                value={credentials.password}
                onChangeText={(text: string) =>
                  setCredentials((prev) => ({ ...prev, password: text }))
                }
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                style={styles.passwordInput}
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff size={20} color="#666" />
                ) : (
                  <Eye size={20} color="#666" />
                )}
              </TouchableOpacity>
            </View>

            <Button
              title={isLoading ? "Signing In..." : "Sign In"}
              onPress={handleLogin}
              disabled={isLoading}
              style={styles.loginButton}
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
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
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
  loginButton: {
    backgroundColor: "#4CAF50",
    marginTop: 20,
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 8,
  },
  passwordInput: {
    flex: 1,
    marginVertical: 0, // Override the default margin
  },
  eyeButton: {
    padding: 10,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default LoginScreen;
