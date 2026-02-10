/**
 * RegisterStep2Screen - Email and Password for registration
 */
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  ActivityIndicator,
  Alert,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";
import { useNavigation, useRoute, RouteProp, CommonActions } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { useAuth } from "@/contexts/AuthContext";
import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type RouteProps = RouteProp<RootStackParamList, "RegisterStep2">;

function EnvelopeIcon() {
  return (
    <View style={styles.iconContainer}>
      <Feather name="user-plus" size={32} color={Colors.dark.brand} />
    </View>
  );
}

export default function RegisterStep2Screen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  const { signUp } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const userName = route.params?.userName || "";

  const handleGoBack = () => {
    navigation.goBack();
  };

  const isValidEmail = (text: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(text);
  };

  const isFormValid = isValidEmail(email) && password.length >= 6;

  const handleComplete = async () => {
    if (!isFormValid) return;

    setError(null);
    setIsLoading(true);

    try {
      await signUp(userName, email.trim(), password);

      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: "Main" }],
        })
      );
    } catch (err: any) {
      const message = err.message || "Erro ao criar conta";
      setError(message);

      if (Platform.OS === "web") {
        window.alert(message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={handleGoBack}>
          <Feather name="chevron-left" size={28} color={Colors.dark.text} />
        </Pressable>

        <Text style={styles.stepIndicator}>Passo 2 de 2</Text>
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: "100%" }]} />
        </View>
      </View>

      <KeyboardAwareScrollViewCompat
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + Spacing.xl },
        ]}
      >
        <View style={styles.iconWrapper}>
          <EnvelopeIcon />
        </View>

        <Text style={styles.title}>Quase lá, {userName}!</Text>
        <Text style={styles.subtitle}>
          Agora crie seu acesso com{"\n"}e-mail e senha.
        </Text>

        {error && (
          <View style={styles.errorContainer}>
            <Feather name="alert-circle" size={16} color="#D32F2F" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>E-mail</Text>
          <TextInput
            style={styles.input}
            placeholder="seu@email.com"
            placeholderTextColor={Colors.dark.textSecondary}
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              setError(null);
            }}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            editable={!isLoading}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Senha</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Mínimo 6 caracteres"
              placeholderTextColor={Colors.dark.textSecondary}
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                setError(null);
              }}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoCorrect={false}
              editable={!isLoading}
            />
            <Pressable
              style={styles.eyeButton}
              onPress={() => setShowPassword(!showPassword)}
            >
              <Feather
                name={showPassword ? "eye-off" : "eye"}
                size={20}
                color={Colors.dark.textSecondary}
              />
            </Pressable>
          </View>
          {password.length > 0 && password.length < 6 && (
            <Text style={styles.hint}>Mínimo 6 caracteres</Text>
          )}
        </View>

        <View style={styles.spacer} />

        <Pressable
          style={[
            styles.nextButton,
            !isFormValid && styles.nextButtonDisabled,
          ]}
          onPress={handleComplete}
          disabled={!isFormValid || isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.nextButtonText}>Criar conta</Text>
          )}
        </Pressable>

        <View style={styles.loginContainer}>
          <Text style={styles.loginText}>Já tem conta? </Text>
          <Pressable onPress={() => navigation.navigate("Login")}>
            <Text style={styles.loginLink}>Entrar</Text>
          </Pressable>
        </View>
      </KeyboardAwareScrollViewCompat>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  backButton: {
    padding: Spacing.xs,
  },
  stepIndicator: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
    fontWeight: "500",
  },
  progressContainer: {
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.xl,
  },
  progressBar: {
    height: 4,
    backgroundColor: "#E0E0E0",
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: Colors.dark.brand,
    borderRadius: 2,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
    flexGrow: 1,
  },
  iconWrapper: {
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#FFF0F0",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: Colors.dark.text,
    textAlign: "center",
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: Spacing.xl,
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFEBEE",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.lg,
    gap: Spacing.sm,
  },
  errorText: {
    color: "#D32F2F",
    fontSize: 14,
    flex: 1,
  },
  inputContainer: {
    marginBottom: Spacing.md,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.dark.text,
    marginBottom: Spacing.xs,
  },
  input: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    fontSize: 16,
    color: Colors.dark.text,
    backgroundColor: "#FFFFFF",
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: BorderRadius.md,
    backgroundColor: "#FFFFFF",
  },
  passwordInput: {
    flex: 1,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    fontSize: 16,
    color: Colors.dark.text,
  },
  eyeButton: {
    padding: Spacing.md,
  },
  hint: {
    fontSize: 12,
    color: Colors.dark.textSecondary,
    marginTop: 4,
  },
  spacer: {
    flex: 1,
    minHeight: Spacing.xl * 2,
  },
  nextButton: {
    backgroundColor: Colors.dark.brand,
    borderRadius: BorderRadius.xl,
    paddingVertical: Spacing.md + 2,
    alignItems: "center",
    marginTop: Spacing.lg,
  },
  nextButtonDisabled: {
    backgroundColor: "#E0E0E0",
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: Spacing.lg,
  },
  loginText: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
  },
  loginLink: {
    fontSize: 14,
    color: Colors.dark.brand,
    fontWeight: "600",
  },
});
