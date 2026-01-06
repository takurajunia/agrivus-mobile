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
import NeumorphicScreen from "../components/neumorphic/NeumorphicScreen";
import NeumorphicCard from "../components/neumorphic/NeumorphicCard";
import NeumorphicButton from "../components/neumorphic/NeumorphicButton";
import NeumorphicInput from "../components/neumorphic/NeumorphicInput";
import {
  neumorphicColors,
  typography,
  spacing,
  borderRadius,
  getNeumorphicShadow,
} from "../theme/neumorphic";
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
              <Leaf
                size={40}
                color={neumorphicColors.primary[600]}
                strokeWidth={2.5}
              />
            </View>
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Sign in to continue to Agrivus</Text>
          </View>

          <NeumorphicCard variant="elevated" style={styles.formCard}>
            <NeumorphicInput
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
              leftIcon={
                <Mail size={20} color={neumorphicColors.text.tertiary} />
              }
              containerStyle={styles.inputSpacing}
            />

            <NeumorphicInput
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
              leftIcon={
                <Lock size={20} color={neumorphicColors.text.tertiary} />
              }
              showPasswordToggle={true}
              containerStyle={styles.inputSpacing}
            />

            <TouchableOpacity style={styles.forgotPasswordContainer}>
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>

            <NeumorphicButton
              title="Sign In"
              onPress={handleLogin}
              loading={isLoading}
              variant="primary"
              size="large"
              fullWidth
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
          </NeumorphicCard>
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
    justifyContent: "center",
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
  title: {
    ...typography.h2,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.body,
    color: neumorphicColors.text.secondary,
    textAlign: "center",
  },
  formCard: {
    padding: spacing.lg,
  },
  inputSpacing: {
    marginBottom: spacing.md,
  },
  forgotPasswordContainer: {
    alignSelf: "flex-end",
    marginBottom: spacing.xl,
  },
  forgotPasswordText: {
    ...typography.bodySmall,
    color: neumorphicColors.primary[600],
    fontWeight: "600",
  },
  signInButton: {
    marginBottom: spacing.xl,
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.xl,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: neumorphicColors.base.pressed,
  },
  dividerText: {
    ...typography.bodySmall,
    paddingHorizontal: spacing.md,
    color: neumorphicColors.text.tertiary,
  },
  footerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  footerText: {
    ...typography.body,
    color: neumorphicColors.text.secondary,
  },
  signUpText: {
    ...typography.body,
    color: neumorphicColors.primary[600],
    fontWeight: "700",
  },
});
