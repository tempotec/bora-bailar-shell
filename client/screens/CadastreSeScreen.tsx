import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Image,
  Dimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather, FontAwesome } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Path } from "react-native-svg";
import { Colors, Spacing, BorderRadius, Fonts } from "@/constants/theme";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/navigation/RootStackNavigator";

const logoImage = require("../../attached_assets/WhatsApp_Image_2025-12-09_at_11.41.04-removebg-preview_1765394422474.png");

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

type SocialButtonProps = {
  icon: React.ReactNode;
  label: string;
  variant: "google" | "facebook" | "apple" | "email";
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
      case "email":
        return styles.emailButton;
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
      case "email":
        return styles.emailButtonText;
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
      <Svg width={20} height={20} viewBox="0 0 24 24">
        <Path
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          fill="#4285F4"
        />
        <Path
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          fill="#34A853"
        />
        <Path
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          fill="#FBBC05"
        />
        <Path
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          fill="#EA4335"
        />
      </Svg>
    </View>
  );
}

function FacebookIcon() {
  return (
    <View style={styles.facebookIconContainer}>
      <FontAwesome name="facebook" size={20} color="#FFFFFF" />
    </View>
  );
}

function AppleIcon() {
  return (
    <View style={styles.appleIconContainer}>
      <FontAwesome name="apple" size={22} color="#FFFFFF" />
    </View>
  );
}

function EmailIcon() {
  return (
    <View style={styles.emailIconContainer}>
      <Feather name="mail" size={18} color={Colors.dark.textSecondary} />
    </View>
  );
}

export default function CadastreSeScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();

  const handleGoBack = () => {
    navigation.goBack();
  };

  const handleEmailSignUp = () => {
    navigation.navigate("RegisterStep1");
  };

  const handleGoogleSignUp = () => {
    navigation.navigate("RegisterStep1");
  };

  const handleFacebookSignUp = () => {
    navigation.navigate("RegisterStep1");
  };

  const handleAppleSignUp = () => {
    navigation.navigate("RegisterStep1");
  };

  return (
    <View style={styles.container}>
      <Pressable 
        style={[styles.closeButton, { top: insets.top + Spacing.md }]} 
        onPress={handleGoBack}
      >
        <Feather name="x" size={24} color="#FFFFFF" />
      </Pressable>

      <View style={styles.curtainSection}>
        <LinearGradient
          colors={["#1a0a0a", "#2d0f0f", "#1a0a0a"]}
          style={styles.curtainBackground}
        >
          <View style={styles.curtainLeft}>
            <LinearGradient
              colors={["#8B0000", "#C41E3A", "#8B0000"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.curtainFold}
            />
            <LinearGradient
              colors={["#5C0000", "#8B0000", "#5C0000"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.curtainShadow}
            />
          </View>
          <View style={styles.curtainRight}>
            <LinearGradient
              colors={["#8B0000", "#C41E3A", "#8B0000"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.curtainFold}
            />
            <LinearGradient
              colors={["#5C0000", "#8B0000", "#5C0000"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.curtainShadow}
            />
          </View>

          <View style={styles.stageContent}>
            <Image source={logoImage} style={styles.logo} resizeMode="contain" />
            <Text style={styles.welcomeText}>Pronto para entrar na comunidade</Text>
            <Text style={styles.brandName}>
              <Text style={styles.brandRed}>B</Text>
              <Text style={styles.brandBlue}>ORA</Text>
              <Text style={styles.brandRed}>B</Text>
              <Text style={styles.brandBlue}>AILAR</Text>
            </Text>
          </View>
        </LinearGradient>
      </View>

      <View style={styles.formSection}>
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + Spacing.xl }
          ]}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.title}>Cadastre-se</Text>

          <View style={styles.socialButtons}>
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

          <View style={styles.divider}>
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

          <Pressable style={styles.registerButton} onPress={handleEmailSignUp}>
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
    backgroundColor: "#FFFFFF",
  },
  closeButton: {
    position: "absolute",
    right: Spacing.lg,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
  curtainSection: {
    height: SCREEN_HEIGHT * 0.35,
    overflow: "hidden",
  },
  curtainBackground: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  curtainLeft: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 60,
    flexDirection: "row",
  },
  curtainRight: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    width: 60,
    flexDirection: "row",
  },
  curtainFold: {
    flex: 1,
    opacity: 0.8,
  },
  curtainShadow: {
    width: 20,
    opacity: 0.6,
  },
  stageContent: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing.xl,
  },
  logo: {
    width: 60,
    height: 60,
    marginBottom: Spacing.md,
  },
  welcomeText: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
    textAlign: "center",
    marginBottom: Spacing.sm,
  },
  brandName: {
    fontSize: 32,
    fontFamily: Fonts.serif,
    letterSpacing: 2,
  },
  brandRed: {
    color: Colors.dark.brand,
  },
  brandBlue: {
    color: "#1a2a4a",
  },
  formSection: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -24,
    paddingTop: Spacing.lg,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.xl,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: Colors.dark.text,
    marginBottom: Spacing.lg,
  },
  socialButtons: {
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  socialButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    gap: Spacing.md,
  },
  socialButtonText: {
    fontSize: 15,
    fontWeight: "500",
    flex: 1,
    textAlign: "center",
    marginRight: Spacing.xl,
  },
  googleButton: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  googleButtonText: {
    color: Colors.dark.text,
  },
  facebookButton: {
    backgroundColor: "#1877F2",
  },
  facebookButtonText: {
    color: "#FFFFFF",
  },
  appleButton: {
    backgroundColor: "#000000",
  },
  appleButtonText: {
    color: "#FFFFFF",
  },
  emailButton: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  emailButtonText: {
    color: Colors.dark.text,
  },
  googleIconContainer: {
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  facebookIconContainer: {
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  appleIconContainer: {
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  emailIconContainer: {
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: Spacing.md,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#E0E0E0",
  },
  dividerText: {
    marginHorizontal: Spacing.md,
    color: Colors.dark.textSecondary,
    fontSize: 14,
  },
  registerButton: {
    backgroundColor: Colors.dark.brand,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    marginTop: Spacing.lg,
  },
  registerButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
