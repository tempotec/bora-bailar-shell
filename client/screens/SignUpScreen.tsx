import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Image,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { Colors, Spacing, BorderRadius, Fonts } from "@/constants/theme";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/navigation/RootStackNavigator";

const logoImage = require("../../attached_assets/WhatsApp_Image_2025-12-09_at_11.41.04-removebg-preview_1765394422474.png");

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
      <Feather name="smartphone" size={18} color="#FFFFFF" />
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

function TicketIcon() {
  return (
    <View style={styles.ticketContainer}>
      <View style={styles.ticketTop}>
        <View style={styles.ticketTear} />
      </View>
      <View style={styles.ticketBody}>
        <View style={styles.ticketStripes}>
          <View style={styles.ticketStripe} />
          <View style={styles.ticketStripe} />
          <View style={styles.ticketStripe} />
        </View>
      </View>
    </View>
  );
}

export default function SignUpScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();

  const handleGoBack = () => {
    navigation.goBack();
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

  const handleEmailSignUp = () => {
    navigation.navigate("RegisterStep1");
  };

  const handleRegister = () => {
    navigation.navigate("RegisterStep1");
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={handleGoBack}>
          <Feather name="chevron-left" size={28} color={Colors.dark.text} />
        </Pressable>
        
        <View style={styles.headerCenter}>
          <Image source={logoImage} style={styles.headerLogo} resizeMode="contain" />
          <Text style={styles.headerBrandName}>
            <Text style={styles.brandRed}>B</Text>
            <Text style={styles.brandGray}>ORA</Text>
            <Text style={styles.brandRed}>B</Text>
            <Text style={styles.brandGray}>AILAR</Text>
          </Text>
        </View>
        
        <Pressable style={styles.bellButton}>
          <Feather name="bell" size={22} color={Colors.dark.textSecondary} />
        </Pressable>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + Spacing.xl },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.ticketIconContainer}>
          <TicketIcon />
        </View>

        <Text style={styles.title}>Falta pouco!</Text>
        <Text style={styles.subtitle}>
          Para conseguir garantir seu ingresso,{"\n"}faça login ou se cadastre
        </Text>

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

        <View style={styles.registerContainer}>
          <Text style={styles.registerText}>Não possui uma conta? </Text>
          <Pressable onPress={handleRegister}>
            <Text style={styles.registerLink}>Cadastre-se</Text>
          </Pressable>
        </View>
      </ScrollView>
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
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  backButton: {
    padding: Spacing.xs,
  },
  headerCenter: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  headerLogo: {
    width: 36,
    height: 28,
  },
  headerBrandName: {
    fontSize: 18,
    fontFamily: Fonts?.serif,
    letterSpacing: 1,
  },
  brandRed: {
    color: Colors.dark.brand,
    fontWeight: "700",
  },
  brandGray: {
    color: Colors.dark.textSecondary,
    fontWeight: "400",
  },
  bellButton: {
    padding: Spacing.xs,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
  },
  ticketIconContainer: {
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  ticketContainer: {
    width: 80,
    height: 80,
    alignItems: "center",
    justifyContent: "center",
  },
  ticketTop: {
    width: 60,
    height: 20,
    backgroundColor: Colors.dark.brand,
    borderTopLeftRadius: BorderRadius.md,
    borderTopRightRadius: BorderRadius.md,
    alignItems: "center",
    overflow: "hidden",
  },
  ticketTear: {
    position: "absolute",
    bottom: -8,
    width: 70,
    height: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 35,
  },
  ticketBody: {
    width: 60,
    height: 40,
    backgroundColor: Colors.dark.brand,
    borderBottomLeftRadius: BorderRadius.md,
    borderBottomRightRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
    marginTop: -2,
  },
  ticketStripes: {
    gap: 4,
  },
  ticketStripe: {
    width: 30,
    height: 3,
    backgroundColor: "#FFFFFF",
    borderRadius: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: Colors.dark.text,
    textAlign: "center",
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: 15,
    color: Colors.dark.textSecondary,
    textAlign: "center",
    lineHeight: 22,
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
    backgroundColor: "#000000",
  },
  appleButtonText: {
    color: "#FFFFFF",
  },
  appleIconContainer: {
    width: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  emailButton: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  emailButtonText: {
    color: Colors.dark.textSecondary,
  },
  emailIconContainer: {
    width: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: Spacing.lg,
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
  registerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: Spacing.xl,
  },
  registerText: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
  },
  registerLink: {
    fontSize: 14,
    color: Colors.dark.brand,
    fontWeight: "600",
  },
});
