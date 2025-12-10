import React from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  Pressable,
  Image,
  Text,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { Feather } from "@expo/vector-icons";

import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Colors, Fonts } from "@/constants/theme";

const logoImage = require("../../attached_assets/WhatsApp_Image_2025-12-09_at_11.41.04-removebg-preview_1765394422474.png");

function ChevronUpDownIcon() {
  return (
    <View style={styles.chevronIconContainer}>
      <Feather name="chevron-up" size={14} color={Colors.dark.textSecondary} style={{ marginBottom: -5 }} />
      <Feather name="chevron-down" size={14} color={Colors.dark.textSecondary} style={{ marginTop: -5 }} />
    </View>
  );
}

function MicrophoneIcon() {
  return (
    <View style={styles.micIconContainer}>
      <Feather name="mic" size={18} color="#FFFFFF" />
    </View>
  );
}

function WizardSearchField({
  label,
  type,
  onPress,
}: {
  label: string;
  type: "chevron" | "mic";
  onPress?: () => void;
}) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.wizardField,
        pressed && styles.wizardFieldPressed,
      ]}
      onPress={onPress}
    >
      <Text style={styles.wizardFieldLabel}>{label}</Text>
      {type === "chevron" ? <ChevronUpDownIcon /> : <MicrophoneIcon />}
    </Pressable>
  );
}

export default function DiscoverScreen() {
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      contentContainerStyle={{
        paddingTop: Spacing.md,
        paddingBottom: tabBarHeight + Spacing.xl,
      }}
      scrollIndicatorInsets={{ bottom: insets.bottom }}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.heroSection}>
        <Image
          source={logoImage}
          style={styles.logo}
          resizeMode="contain"
        />

        <Text style={styles.brandName}>
          <Text style={styles.brandRed}>B</Text>
          <Text style={styles.brandGray}>ORA</Text>
          <Text style={styles.brandRed}>B</Text>
          <Text style={styles.brandGray}>AILAR</Text>
        </Text>

        <Text style={styles.tagline}>PRA SAIR, DANÇAR E SE DIVERTIR!</Text>
      </View>

      <View style={styles.wizardSection}>
        <View style={styles.wizardContainer}>
          <WizardSearchField label="Onde" type="chevron" />
          <WizardSearchField label="Quando" type="chevron" />
          <WizardSearchField label="Com quem" type="mic" />
          
          <View style={styles.helperTextContainer}>
            <Text style={styles.helperText}>
              É só{" "}
              <Text style={styles.helperHighlight}>falar</Text>
              {" "}que a gente te{" "}
              <Text style={styles.helperHighlight}>entende</Text>!
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  heroSection: {
    alignItems: "center",
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xl,
    paddingHorizontal: Spacing.lg,
  },
  logo: {
    width: 140,
    height: 100,
    marginBottom: Spacing.sm,
  },
  brandName: {
    fontSize: 32,
    fontFamily: Fonts?.serif,
    letterSpacing: 2,
    marginBottom: Spacing.sm,
  },
  brandRed: {
    color: Colors.dark.brand,
    fontWeight: "700",
  },
  brandGray: {
    color: Colors.dark.textSecondary,
    fontWeight: "400",
  },
  tagline: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.dark.brand,
    textAlign: "center",
    letterSpacing: 0.5,
  },
  wizardSection: {
    paddingHorizontal: Spacing.lg,
  },
  wizardContainer: {
    backgroundColor: Colors.dark.wizardBackground,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    gap: Spacing.md,
  },
  wizardField: {
    backgroundColor: "#FFFFFF",
    borderRadius: 30,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  wizardFieldPressed: {
    backgroundColor: "#F9FAFB",
  },
  wizardFieldLabel: {
    fontSize: 16,
    color: Colors.dark.textSecondary,
    fontWeight: "400",
  },
  chevronIconContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  micIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.dark.brand,
    alignItems: "center",
    justifyContent: "center",
  },
  helperTextContainer: {
    alignItems: "center",
    marginTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  helperText: {
    fontSize: 15,
    color: Colors.dark.text,
    textAlign: "center",
  },
  helperHighlight: {
    color: Colors.dark.brand,
    fontWeight: "700",
  },
});
