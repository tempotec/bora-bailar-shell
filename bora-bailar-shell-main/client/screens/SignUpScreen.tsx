/**
 * SignUpScreen - Social login + email signup with premium stage background
 */
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Dimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/navigation/RootStackNavigator";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

type SocialButtonProps = {
  icon: React.ReactNode;
  label: string;
  variant: "google" | "facebook" | "apple" | "email";
  onPress?: () => void;
};

function SocialButton({ icon, label, variant, onPress }: SocialButtonProps) {
  const buttonStyle = {
    google: styles.googleButton,
    facebook: styles.facebookButton,
    apple: styles.appleButton,
    email: styles.emailButton,
  }[variant];

  const textStyle = {
    google: styles.googleButtonText,
    facebook: styles.facebookButtonText,
    apple: styles.appleButtonText,
    email: styles.emailButtonText,
  }[variant];

  return (
    <Pressable
      style={({ pressed }) => [
        styles.socialButton,
        buttonStyle,
        pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] },
      ]}
      onPress={onPress}
    >
      {icon}
      <Text style={[styles.socialButtonText, textStyle]}>{label}</Text>
    </Pressable>
  );
}

function GoogleIcon() {
  return (
    <View style={styles.socialIconContainer}>
      <Text style={{ fontSize: 16, fontWeight: "700", color: "#4285F4" }}>G</Text>
    </View>
  );
}

function FacebookIcon() {
  return (
    <View style={styles.socialIconContainer}>
      <Feather name="facebook" size={18} color="#1877F2" />
    </View>
  );
}

function AppleIcon() {
  return (
    <View style={styles.socialIconContainer}>
      <Feather name="smartphone" size={18} color="#000000" />
    </View>
  );
}

function EmailIcon() {
  return (
    <View style={styles.socialIconContainer}>
      <Feather name="mail" size={18} color={Colors.dark.brand} />
    </View>
  );
}

export default function SignUpScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();

  const handleGoBack = () => navigation.goBack();
  const handleGoogleSignUp = () => navigation.navigate("RegisterStep1");
  const handleFacebookSignUp = () => navigation.navigate("RegisterStep1");
  const handleAppleSignUp = () => navigation.navigate("RegisterStep1");
  const handleEmailSignUp = () => navigation.navigate("RegisterStep1");
  const handleLogin = () => navigation.navigate("Login");

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + Spacing.sm }]}>
        <Pressable style={styles.backButton} onPress={handleGoBack}>
          <Feather name="chevron-left" size={28} color="#FFFFFF" />
        </Pressable>

        <View style={styles.headerCenter}>
          <Text style={styles.headerBrandName}>
            <Text style={styles.brandRed}>B</Text>
            <Text style={styles.brandWhite}>ORABAILAR</Text>
          </Text>
        </View>

        <View style={{ width: 36 }} />
      </View>

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + Spacing.xl },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroSpacer} />

        {/* Title area */}
        <View style={styles.titleContainer}>
          <Text style={styles.title}>O palco é seu!</Text>
          <Text style={styles.subtitle}>
            Crie sua conta e entre no ritmo.{"\n"}Milhares de eventos esperando por você.
          </Text>
        </View>

        {/* Social buttons */}
        <View style={styles.socialButtonsContainer}>
          <SocialButton
            icon={<GoogleIcon />}
            label="Continuar com Google"
            variant="google"
            onPress={handleGoogleSignUp}
          />
          <SocialButton
            icon={<FacebookIcon />}
            label="Continuar com Facebook"
            variant="facebook"
            onPress={handleFacebookSignUp}
          />
          <SocialButton
            icon={<AppleIcon />}
            label="Continuar com Apple"
            variant="apple"
            onPress={handleAppleSignUp}
          />
        </View>

        <View style={styles.dividerContainer}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>ou</Text>
          <View style={styles.dividerLine} />
        </View>

        <SocialButton
          icon={<EmailIcon />}
          label="Continuar com e-mail"
          variant="email"
          onPress={handleEmailSignUp}
        />

        {/* Login link */}
        <View style={styles.loginContainer}>
          <Text style={styles.loginText}>Já tem uma conta? </Text>
          <Pressable onPress={handleLogin}>
            <Text style={styles.loginLink}>Entrar</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.brand,
  },
  backgroundImage: {
    flex: 1,
    width: "100%",
    height: "100%",
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
  headerCenter: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerBrandName: {
    fontSize: 20,
    fontFamily: "Montserrat_700Bold",
    letterSpacing: 1.5,
  },
  brandRed: {
    color: Colors.dark.brand,
    fontWeight: "700",
  },
  brandWhite: {
    color: "#FFFFFF",
    fontWeight: "400",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.xl,
    flexGrow: 1,
  },
  heroSpacer: {
    flex: 1,
    minHeight: SCREEN_HEIGHT * 0.2,
  },
  titleContainer: {
    marginBottom: Spacing.xl,
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    color: "#FFFFFF",
    marginBottom: Spacing.sm,
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 15,
    color: "rgba(255,255,255,0.85)",
    lineHeight: 22,
    textShadowColor: "rgba(0,0,0,0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  socialButtonsContainer: {
    gap: Spacing.sm,
  },
  socialButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.xl,
    gap: Spacing.sm,
  },
  socialButtonText: {
    fontSize: 15,
    fontWeight: "600",
  },
  socialIconContainer: {
    width: 22,
    height: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  googleButton: {
    backgroundColor: "#FFFFFF",
  },
  googleButtonText: {
    color: Colors.dark.text,
  },
  facebookButton: {
    backgroundColor: "#FFFFFF",
  },
  facebookButtonText: {
    color: Colors.dark.text,
  },
  appleButton: {
    backgroundColor: "#FFFFFF",
  },
  appleButtonText: {
    color: Colors.dark.text,
  },
  emailButton: {
    backgroundColor: "rgba(255,255,255,0.12)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.35)",
  },
  emailButtonText: {
    color: "#FFFFFF",
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: Spacing.md,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(255,255,255,0.3)",
  },
  dividerText: {
    paddingHorizontal: Spacing.md,
    fontSize: 14,
    color: "rgba(255,255,255,0.6)",
  },
  loginContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: Spacing.xl,
  },
  loginText: {
    fontSize: 14,
    color: "rgba(255,255,255,0.7)",
  },
  loginLink: {
    fontSize: 14,
    color: Colors.dark.brand,
    fontWeight: "700",
  },
});
