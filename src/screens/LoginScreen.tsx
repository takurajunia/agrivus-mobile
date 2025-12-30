import React, { useState, useEffect } from "react";
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
import { Mail, Lock, Leaf } from "lucide-react-native";
import LoadingSpinner from "../components/LoadingSpinner";
import ModernInput from "../components/ModernInput";
import AnimatedButton from "../components/AnimatedButton";
import { theme } from "../theme/tokens";
import type { LoginCredentials } from "../types";

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
    return <LoadingSpinner />;
  }

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
          <View style={styles.logoContainer}>
            <Leaf
              size={40}
              color={theme.colors.primary[600]}
              strokeWidth={2.5}
            />
          </View>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Sign in to continue to Agrivus</Text>
        </View>

        <View style={styles.formContainer}>
          <ModernInput
            label="Email Address"
            placeholder="Enter your email"
            value={credentials.email}
            onChangeText={(text: string) =>
              setCredentials((prev: LoginCredentials) => ({
                ...prev,
                email: text,
              }))
            }
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            leftIcon={<Mail size={20} color={theme.colors.text.tertiary} />}
            style={styles.inputSpacing}
          />

          <ModernInput
            label="Password"
            placeholder="Enter your password"
            value={credentials.password}
            onChangeText={(text: string) =>
              setCredentials((prev: LoginCredentials) => ({
                ...prev,
                password: text,
              }))
            }
            secureTextEntry
            autoCapitalize="none"
            leftIcon={<Lock size={20} color={theme.colors.text.tertiary} />}
            style={styles.inputSpacing}
          />

          <TouchableOpacity style={styles.forgotPasswordContainer}>
            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
          </TouchableOpacity>

          <AnimatedButton
            title="Sign In"
            onPress={handleLogin}
            loading={isLoading}
            variant="primary"
            size="lg"
            style={styles.signInButton}
          />

          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>

          <View style={styles.footerContainer}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <TouchableOpacity onPress={navigateToRegister}>
              <Text style={styles.signUpText}>Create Account</Text>
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
    justifyContent: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: theme.spacing["2xl"],
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.primary[50],
    justifyContent: "center",
    alignItems: "center",
    marginBottom: theme.spacing.lg,
    ...theme.shadows.sm,
  },
  title: {
    fontSize: theme.typography.fontSize["3xl"],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.secondary,
    textAlign: "center",
  },
  formContainer: {
    width: "100%",
  },
  inputSpacing: {
    marginBottom: theme.spacing.md,
  },
  forgotPasswordContainer: {
    alignSelf: "flex-end",
    marginBottom: theme.spacing.xl,
  },
  forgotPasswordText: {
    color: theme.colors.primary[600],
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  signInButton: {
    marginBottom: theme.spacing.xl,
    ...theme.shadows.colored,
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: theme.spacing.xl,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: theme.colors.border.light,
  },
  dividerText: {
    paddingHorizontal: theme.spacing.md,
    color: theme.colors.text.tertiary,
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
  },
  footerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  footerText: {
    color: theme.colors.text.secondary,
    fontSize: theme.typography.fontSize.md,
  },
  signUpText: {
    color: theme.colors.primary[600],
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.bold,
  },
});
