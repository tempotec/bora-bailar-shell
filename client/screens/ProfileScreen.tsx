import React from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  Pressable,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<any>>();

  const handleSignUp = () => {
    navigation.navigate("SignUp");
  };

  const handleLogIn = () => {
    navigation.navigate("Login");
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      contentContainerStyle={{
        paddingTop: headerHeight + Spacing.lg,
        paddingBottom: tabBarHeight + Spacing.xl,
        flexGrow: 1,
      }}
      scrollIndicatorInsets={{ bottom: insets.bottom }}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.emptyStateContainer}>
        <View style={styles.iconContainer}>
          <Feather name="user" size={48} color={Colors.dark.primary} />
        </View>
        
        <ThemedText type="h3" style={styles.emptyTitle}>
          Entre na sua conta
        </ThemedText>
        
        <ThemedText style={styles.emptyDescription}>
          Faca login ou crie uma conta para salvar seus eventos favoritos, seguir amigos e muito mais.
        </ThemedText>

        <View style={styles.buttonsContainer}>
          <Pressable
            style={({ pressed }) => [
              styles.signUpButton,
              pressed && styles.pressed,
            ]}
            onPress={handleSignUp}
          >
            <ThemedText style={styles.signUpButtonText}>Criar conta</ThemedText>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.logInButton,
              pressed && styles.pressed,
            ]}
            onPress={handleLogIn}
          >
            <ThemedText style={styles.logInButtonText}>Entrar</ThemedText>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: Spacing.xl,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.dark.primary + "15",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  emptyTitle: {
    marginBottom: Spacing.md,
    textAlign: "center",
  },
  emptyDescription: {
    color: Colors.dark.textSecondary,
    textAlign: "center",
    marginBottom: Spacing.xl,
    lineHeight: 22,
  },
  buttonsContainer: {
    width: "100%",
    gap: Spacing.md,
  },
  signUpButton: {
    backgroundColor: Colors.dark.primary,
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.lg,
    alignItems: "center",
  },
  signUpButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },
  logInButton: {
    backgroundColor: "transparent",
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.dark.primary,
    alignItems: "center",
  },
  logInButtonText: {
    color: Colors.dark.primary,
    fontSize: 16,
    fontWeight: "600",
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
});
