import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Image,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import { Colors, Spacing, BorderRadius, Fonts } from "@/constants/theme";
import { useNavigation } from "@react-navigation/native";

const logoImage = require("../../attached_assets/WhatsApp_Image_2025-12-09_at_11.41.04-removebg-preview_1765394422474.png");

type SocialButtonProps = {
  icon: React.ReactNode;
  label: string;
  variant: "google" | "facebook" | "apple";
  onPress?: () => void;
};

function SocialButton({ icon, label, variant, onPress }: SocialButtonProps) {
  const getButtonStyle = () => {
    switch (variant) {
      case "google":
        return styles.googleButton;
      case "facebook":
        return styles.facebookButton;
      case "apple":
        return styles.appleButton;
      default:
        return styles.googleButton;
    }
  };

  const getTextStyle = () => {
    switch (variant) {
      case "google":
        return styles.googleButtonText;
      case "facebook":
        return styles.facebookButtonText;
      case "apple":
        return styles.appleButtonText;
      default:
        return styles.googleButtonText;
    }
  };

  return (
    <Pressable
      style={[styles.socialButton, getButtonStyle()]}
      onPress={onPress}
    >
      {icon}
      <Text style={[styles.socialButtonText, getTextStyle()]}>{label}</Text>
    </Pressable>
  );
}

function GoogleIcon() {
  return (
    <View style={styles.googleIconContainer}>
      <Text style={styles.googleIconText}>G</Text>
    </View>
  );
}

function FacebookIcon() {
  return (
    <View style={styles.facebookIconContainer}>
      <Feather name="facebook" size={18} color="#FFFFFF" />
    </View>
  );
}

function AppleIcon() {
  return (
    <View style={styles.appleIconContainer}>
      <Feather name="smartphone" size={18} color="#000000" />
    </View>
  );
}

export default function SignUpScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  const handleGoBack = () => {
    navigation.goBack();
  };

  const handleGoogleSignUp = () => {
    console.log("Google sign up");
  };

  const handleFacebookSignUp = () => {
    console.log("Facebook sign up");
  };

  const handleAppleSignUp = () => {
    console.log("Apple sign up");
  };

  const handleEmailSignUp = () => {
    console.log("Email sign up");
  };

  const handleRegister = () => {
    console.log("Register");
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#8B0000", "#C41E3A", "#8B0000"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.heroBackground}
      >
        <View style={[styles.curtainOverlay, { paddingTop: insets.top }]}>
          <Pressable style={styles.backButton} onPress={handleGoBack}>
            <Feather name="arrow-left" size={24} color="#FFFFFF" />
          </Pressable>
          
          <View style={styles.heroContent}>
            <Image source={logoImage} style={styles.logo} resizeMode="contain" />
            <Text style={styles.tagline}>Pronto para entrar na comunidade</Text>
            <Text style={styles.brandName}>
              <Text style={styles.brandRed}>B</Text>
              <Text style={styles.brandWhite}>ORA</Text>
              <Text style={styles.brandRed}>B</Text>
              <Text style={styles.brandWhite}>AILAR</Text>
            </Text>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.cardContainer}>
        <ScrollView
          style={styles.cardScrollView}
          contentContainerStyle={[
            styles.cardContent,
            { paddingBottom: insets.bottom + Spacing.xl },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.cardTitle}>Cadastre-se</Text>

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

          <Pressable style={styles.emailButton} onPress={handleEmailSignUp}>
            <Feather name="mail" size={20} color={Colors.dark.textSecondary} />
            <Text style={styles.emailButtonText}>Continuar com e-mail</Text>
          </Pressable>

          <Pressable style={styles.registerButton} onPress={handleRegister}>
            <Text style={styles.registerButtonText}>Cadastrar</Text>
          </Pressable>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.backgroundRoot,
  },
  heroBackground: {
    height: "40%",
    minHeight: 280,
  },
  curtainOverlay: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    marginTop: Spacing.sm,
  },
  heroContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: Spacing.xl,
  },
  logo: {
    width: 60,
    height: 50,
    marginBottom: Spacing.md,
  },
  tagline: {
    fontSize: 14,
    color: "#FFFFFF",
    opacity: 0.9,
    marginBottom: Spacing.sm,
  },
  brandName: {
    fontSize: 32,
    fontFamily: Fonts?.serif,
    letterSpacing: 2,
  },
  brandRed: {
    color: Colors.dark.brand,
    fontWeight: "700",
  },
  brandWhite: {
    color: "#FFFFFF",
    fontWeight: "400",
  },
  cardContainer: {
    flex: 1,
    backgroundColor: Colors.dark.backgroundRoot,
    borderTopLeftRadius: BorderRadius["2xl"],
    borderTopRightRadius: BorderRadius["2xl"],
    marginTop: -Spacing.xl,
    overflow: "hidden",
  },
  cardScrollView: {
    flex: 1,
  },
  cardContent: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: Colors.dark.text,
    marginBottom: Spacing.xl,
  },
  socialButtonsContainer: {
    gap: Spacing.md,
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
    fontWeight: "500",
  },
  googleButton: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  googleButtonText: {
    color: Colors.dark.text,
  },
  googleIconContainer: {
    width: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  googleIconText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#4285F4",
  },
  facebookButton: {
    backgroundColor: "#1877F2",
  },
  facebookButtonText: {
    color: "#FFFFFF",
  },
  facebookIconContainer: {
    width: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  appleButton: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#000000",
  },
  appleButtonText: {
    color: "#000000",
  },
  appleIconContainer: {
    width: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: Spacing.xl,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#E0E0E0",
  },
  dividerText: {
    paddingHorizontal: Spacing.md,
    fontSize: 14,
    color: Colors.dark.textSecondary,
  },
  emailButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
  },
  emailButtonText: {
    fontSize: 15,
    color: Colors.dark.textSecondary,
    fontWeight: "500",
  },
  registerButton: {
    backgroundColor: Colors.dark.brand,
    borderRadius: BorderRadius.xl,
    paddingVertical: Spacing.md,
    alignItems: "center",
    justifyContent: "center",
    marginTop: Spacing.lg,
  },
  registerButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});
