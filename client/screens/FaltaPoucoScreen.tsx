import React, { useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Platform,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import Svg, { Path, G, Circle, Rect } from "react-native-svg";
import { Colors, Spacing, BorderRadius, Fonts } from "@/constants/theme";
import { RootStackParamList } from "@/navigation/RootStackNavigator";

const logoImage = require("../../attached_assets/WhatsApp_Image_2025-12-09_at_11.41.04-removebg-preview_1765394422474.png");

function TicketIcon() {
  return (
    <Svg width={64} height={64} viewBox="0 0 24 24" fill="none">
      <G>
        <Path
          d="M3 7.5V5a2 2 0 012-2h14a2 2 0 012 2v2.5a2 2 0 110 4V14a2 2 0 01-2 2H5a2 2 0 01-2-2V9.5a2 2 0 100-4z"
          stroke={Colors.dark.brand}
          strokeWidth={1.5}
          fill="none"
        />
        <Path
          d="M9 3v13M15 6v7"
          stroke={Colors.dark.brand}
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeDasharray="3 2"
        />
      </G>
    </Svg>
  );
}

function GoogleIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24">
      <Path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <Path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <Path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <Path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </Svg>
  );
}

export default function FaltaPoucoScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const handleBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const showComingSoonAlert = useCallback((provider: string) => {
    const message = `Em breve! Login com ${provider} em desenvolvimento. Por favor, use o cadastro com e-mail.`;
    if (Platform.OS === "web") {
      window.alert(message);
    } else {
      Alert.alert("Em breve!", message);
    }
  }, []);

  const handleGoogleLogin = useCallback(() => {
    showComingSoonAlert("Google");
  }, [showComingSoonAlert]);

  const handleFacebookLogin = useCallback(() => {
    showComingSoonAlert("Facebook");
  }, [showComingSoonAlert]);

  const handleAppleLogin = useCallback(() => {
    showComingSoonAlert("Apple");
  }, [showComingSoonAlert]);

  const handleEmailLogin = useCallback(() => {
    navigation.navigate("RegisterStep1");
  }, [navigation]);

  const handleCadastrar = useCallback(() => {
    navigation.navigate("RegisterStep1");
  }, [navigation]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={handleBack}>
          <Feather name="chevron-left" size={28} color={Colors.dark.text} />
        </Pressable>
        
        <View style={styles.headerCenter}>
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

      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <TicketIcon />
        </View>
        
        <Text style={styles.title}>Falta pouco!</Text>
        <Text style={styles.subtitle}>
          Para conseguir garantir seu ingresso,{"\n"}faça login ou se cadastre
        </Text>

        <View style={styles.buttonsContainer}>
          <Pressable 
            style={({ pressed }) => [styles.socialButton, styles.googleButton, pressed && { opacity: 0.9 }]}
            onPress={handleGoogleLogin}
          >
            <GoogleIcon />
            <Text style={styles.socialButtonText}>Continuar com Google</Text>
          </Pressable>

          <Pressable 
            style={({ pressed }) => [styles.socialButton, styles.facebookButton, pressed && { opacity: 0.9 }]}
            onPress={handleFacebookLogin}
          >
            <Feather name="facebook" size={20} color="#FFFFFF" />
            <Text style={[styles.socialButtonText, styles.facebookButtonText]}>Continuar com Facebook</Text>
          </Pressable>

          <Pressable 
            style={({ pressed }) => [styles.socialButton, styles.appleButton, pressed && { opacity: 0.9 }]}
            onPress={handleAppleLogin}
          >
            <Feather name="smartphone" size={20} color="#000000" />
            <Text style={[styles.socialButtonText, styles.appleButtonText]}>Continuar com Apple</Text>
          </Pressable>

          <View style={styles.orContainer}>
            <View style={styles.orLine} />
            <Text style={styles.orText}>ou</Text>
            <View style={styles.orLine} />
          </View>

          <Pressable 
            style={({ pressed }) => [styles.socialButton, styles.emailButton, pressed && { opacity: 0.9 }]}
            onPress={handleEmailLogin}
          >
            <Feather name="mail" size={20} color={Colors.dark.textSecondary} />
            <Text style={[styles.socialButtonText, styles.emailButtonText]}>Continuar com e-mail</Text>
          </Pressable>
        </View>

        <View style={styles.footerContainer}>
          <Text style={styles.footerText}>Não possui uma conta? </Text>
          <Pressable onPress={handleCadastrar}>
            <Text style={styles.footerLink}>Cadastre-se</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  backButton: {
    padding: Spacing.xs,
  },
  headerCenter: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
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
  content: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl * 2,
  },
  iconContainer: {
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: Colors.dark.text,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: 15,
    color: Colors.dark.textSecondary,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: Spacing.xl * 2,
  },
  buttonsContainer: {
    width: "100%",
    gap: Spacing.md,
  },
  socialButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.md + 2,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.lg,
    gap: Spacing.md,
  },
  googleButton: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  facebookButton: {
    backgroundColor: "#1877F2",
  },
  appleButton: {
    backgroundColor: "#000000",
  },
  emailButton: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  socialButtonText: {
    fontSize: 16,
    fontWeight: "500",
    color: Colors.dark.text,
  },
  facebookButtonText: {
    color: "#FFFFFF",
  },
  appleButtonText: {
    color: "#FFFFFF",
  },
  emailButtonText: {
    color: Colors.dark.text,
  },
  orContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: Spacing.sm,
  },
  orLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#E0E0E0",
  },
  orText: {
    paddingHorizontal: Spacing.md,
    color: Colors.dark.textSecondary,
    fontSize: 14,
  },
  footerContainer: {
    flexDirection: "row",
    marginTop: Spacing.xl * 2,
  },
  footerText: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
  },
  footerLink: {
    fontSize: 14,
    color: Colors.dark.brand,
    fontWeight: "600",
  },
});
