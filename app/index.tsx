import React, { useState, useEffect } from "react";
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
import { User, Lock, Leaf } from "lucide-react-native";
import LoadingSpinner from "../src/components/LoadingSpinner";
import type { LoginCredentials } from "../src/types";

export default function LoginScreen() {
  const [credentials, setCredentials] = useState<LoginCredentials>({
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { login, isAuthenticated, loading } = useAuth();

  useEffect(() => {
    if (isAuthenticated && !loading) {
      router.replace("/(tabs)");
    }
  }, [isAuthenticated, loading, router]);

  const handleLogin = async () => {
    if (!credentials.email || !credentials.password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    setIsLoading(true);
    try {
      await login(credentials);
      router.replace("/(tabs)");
    } catch (error: any) {
      Alert.alert("Login Failed", error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const navigateToRegister = () => {
    router.push("/register");
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <LoadingSpinner />
      </View>
    );
  }

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
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Sign in to continue</Text>
        </View>

        <View style={styles.formCard}>
          <View style={styles.inputWrapper}>
            <View style={styles.inputContainer}>
              <User size={20} color="#9E9E9E" strokeWidth={2} />
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor="#BDBDBD"
                value={credentials.email}
                onChangeText={(text) =>
                  setCredentials((prev) => ({ ...prev, email: text }))
                }
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
              />
            </View>
          </View>

          <View style={styles.inputWrapper}>
            <View style={styles.inputContainer}>
              <Lock size={20} color="#9E9E9E" strokeWidth={2} />
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor="#BDBDBD"
                value={credentials.password}
                onChangeText={(text) =>
                  setCredentials((prev) => ({ ...prev, password: text }))
                }
                secureTextEntry
                autoCapitalize="none"
              />
            </View>
          </View>

          <TouchableOpacity style={styles.forgotPasswordContainer}>
            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.loginButton,
              isLoading && styles.loginButtonDisabled,
            ]}
            onPress={handleLogin}
            disabled={isLoading}
            activeOpacity={0.9}
          >
            <Text style={styles.loginButtonText}>
              {isLoading ? "Signing in..." : "Sign In"}
            </Text>
          </TouchableOpacity>

          <View style={styles.divider}>
            <Text style={styles.dividerText}>OR</Text>
          </View>

          <TouchableOpacity
            style={styles.createAccountButton}
            onPress={navigateToRegister}
            activeOpacity={0.8}
          >
            <Text style={styles.createAccountButtonText}>Create Account</Text>
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
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
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
  forgotPasswordContainer: {
    alignSelf: "flex-end",
    marginBottom: 20,
  },
  forgotPasswordText: {
    color: "#4CAF50",
    fontSize: 14,
    fontWeight: "600",
  },
  loginButton: {
    backgroundColor: "#4CAF50",
    borderRadius: 28,
    paddingVertical: 18,
    alignItems: "center",
    marginBottom: 20,
    shadowColor: "#4CAF50",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  loginButtonText: {
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
  createAccountButton: {
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
  createAccountButtonText: {
    color: "#4CAF50",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  bottomPadding: {
    height: 20,
  },
});
