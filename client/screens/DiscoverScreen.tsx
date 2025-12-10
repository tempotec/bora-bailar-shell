import React from "react";
import {
  View,
  StyleSheet,
  Pressable,
  Image,
  Text,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { Feather } from "@expo/vector-icons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedScrollHandler,
  interpolate,
  Extrapolation,
  withTiming,
} from "react-native-reanimated";

import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Colors, Fonts } from "@/constants/theme";

const logoImage = require("../../attached_assets/WhatsApp_Image_2025-12-09_at_11.41.04-removebg-preview_1765394422474.png");

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_WIDTH = (SCREEN_WIDTH - Spacing.lg * 3) / 2;
const SCROLL_THRESHOLD = 100;

const QUERER_DATA = [
  {
    id: "1",
    title: "SAIR PARA\nDANÇAR",
    description: "sair pra dançar e me divertir com alguém que tenha a ver comigo, mas sem compromissos.",
    image: "https://images.unsplash.com/photo-1504609813442-a8924e83f76e?w=400&h=300&fit=crop",
  },
  {
    id: "2",
    title: "SAIR EM\nGRUPO",
    description: "sair em grupo para dançar e conhecer gente educada e simpática que gosta do que eu gosto.",
    image: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=400&h=300&fit=crop",
  },
  {
    id: "3",
    title: "MELHORES\nBALADAS",
    description: "sair em grupo para dançar e conhecer gente educada e simpática que gosta do que eu gosto.",
    image: "https://images.unsplash.com/photo-1566737236500-c8ac43014a67?w=400&h=300&fit=crop",
  },
  {
    id: "4",
    title: "GENTE\nPROFISSA",
    description: "conhecer profissionais que sejam boa companhia e me levem para dançar.",
    image: "https://images.unsplash.com/photo-1545959570-a94084071b5d?w=400&h=300&fit=crop",
  },
  {
    id: "5",
    title: "ESCOLAS\nDE DANÇA",
    description: "conhecer profissionais que sejam boa companhia e me levem para dançar.",
    image: "https://images.unsplash.com/photo-1508700929628-666bc8bd84ea?w=400&h=300&fit=crop",
  },
  {
    id: "6",
    title: "ESCOLHA\nSUA TRIBO",
    description: "participar de comunidades de gente que ama dançar e se divertir de forma sadia e feliz.",
    image: "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=400&h=300&fit=crop",
  },
  {
    id: "7",
    title: "BORABAILAR\nTOP 10",
    description: "poder receber e mandar conteúdo para votar e ser votado no BB TOP 10 AWARD",
    image: "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400&h=300&fit=crop",
  },
  {
    id: "8",
    title: "FULL\nEXPERIENCE",
    description: "participar de eventos integrados de DANÇA, GASTRONOMIA e CONFRATERNIZAÇÃO.",
    image: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=400&h=300&fit=crop",
  },
];

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

function CollapsedSearchBar({ onPress }: { onPress?: () => void }) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.collapsedSearchBar,
        pressed && styles.wizardFieldPressed,
      ]}
      onPress={onPress}
    >
      <Feather name="search" size={18} color={Colors.dark.textSecondary} />
      <Text style={styles.collapsedSearchText}>Onde, quando e com quem?</Text>
    </Pressable>
  );
}

function QuererCard({
  title,
  description,
  image,
  onPress,
  onFavorite,
}: {
  title: string;
  description: string;
  image: string;
  onPress?: () => void;
  onFavorite?: () => void;
}) {
  return (
    <Pressable style={styles.quererCard} onPress={onPress}>
      <View style={styles.quererImageContainer}>
        <Image source={{ uri: image }} style={styles.quererImage} />
        <View style={styles.quererOverlay} />
        <Text style={styles.quererTitle}>{title}</Text>
        <Pressable style={styles.quererHeart} onPress={onFavorite}>
          <View style={styles.heartCircle}>
            <Feather name="heart" size={16} color="#FFFFFF" />
          </View>
        </Pressable>
      </View>
      <View style={styles.quererContent}>
        <Text style={styles.quererDescription}>
          <Text style={styles.queroPrefix}>QUERO </Text>
          {description}
        </Text>
      </View>
    </Pressable>
  );
}

export default function DiscoverScreen() {
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();
  
  const scrollY = useSharedValue(0);
  
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const heroAnimatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [0, SCROLL_THRESHOLD],
      [1, 0],
      Extrapolation.CLAMP
    );
    const scale = interpolate(
      scrollY.value,
      [0, SCROLL_THRESHOLD],
      [1, 0.8],
      Extrapolation.CLAMP
    );
    const translateY = interpolate(
      scrollY.value,
      [0, SCROLL_THRESHOLD],
      [0, -50],
      Extrapolation.CLAMP
    );
    return {
      opacity,
      transform: [{ scale }, { translateY }],
    };
  });

  const expandedWizardStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [0, SCROLL_THRESHOLD * 0.5],
      [1, 0],
      Extrapolation.CLAMP
    );
    return {
      opacity,
    };
  });

  const collapsedWizardStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [SCROLL_THRESHOLD * 0.3, SCROLL_THRESHOLD * 0.7],
      [0, 1],
      Extrapolation.CLAMP
    );
    return {
      opacity,
    };
  });

  const stickyHeaderStyle = useAnimatedStyle(() => {
    const translateY = interpolate(
      scrollY.value,
      [0, SCROLL_THRESHOLD],
      [-100, 0],
      Extrapolation.CLAMP
    );
    return {
      transform: [{ translateY }],
    };
  });

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <Animated.View style={[styles.stickyHeader, stickyHeaderStyle, { paddingTop: insets.top }]}>
        <View style={styles.stickyHeaderContent}>
          <Image source={logoImage} style={styles.stickyLogo} resizeMode="contain" />
          <Text style={styles.stickyBrandName}>
            <Text style={styles.brandRed}>B</Text>
            <Text style={styles.brandGray}>ora</Text>
            <Text style={styles.brandRed}>B</Text>
            <Text style={styles.brandGray}>ailar</Text>
          </Text>
        </View>
        <Animated.View style={[styles.collapsedWizardContainer, collapsedWizardStyle]}>
          <CollapsedSearchBar />
        </Animated.View>
      </Animated.View>

      <Animated.ScrollView
        style={styles.scrollView}
        contentContainerStyle={{
          paddingTop: insets.top + Spacing.md,
          paddingBottom: tabBarHeight + Spacing.xl,
        }}
        scrollIndicatorInsets={{ bottom: insets.bottom }}
        showsVerticalScrollIndicator={false}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
      >
        <Animated.View style={[styles.heroSection, heroAnimatedStyle]}>
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
        </Animated.View>

        <Animated.View style={[styles.wizardSection, expandedWizardStyle]}>
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
        </Animated.View>

        <View style={styles.quererSection}>
          <Text style={styles.sectionTitle}>
            O seu{" "}
            <Text style={styles.sectionTitleHighlight}>querer</Text>
            {" "}é que faz{" "}
            <Text style={styles.sectionTitleHighlight}>acontecer</Text>
          </Text>
          
          <View style={styles.quererGrid}>
            {QUERER_DATA.map((item) => (
              <QuererCard
                key={item.id}
                title={item.title}
                description={item.description}
                image={item.image}
              />
            ))}
          </View>

          <Text style={styles.momentoTitle}>
            Momento{" "}
            <Text style={styles.sectionTitleHighlight}>dança</Text>
            {" "}é momento{" "}
            <Text style={styles.sectionTitleHighlight}>feliz</Text>
          </Text>
        </View>
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  stickyHeader: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  stickyHeaderContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  stickyLogo: {
    width: 36,
    height: 26,
  },
  stickyBrandName: {
    fontSize: 20,
    fontFamily: Fonts?.serif,
    letterSpacing: 1,
  },
  collapsedWizardContainer: {
    marginTop: Spacing.xs,
  },
  collapsedSearchBar: {
    backgroundColor: "#F5F5F5",
    borderRadius: 25,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  collapsedSearchText: {
    fontSize: 15,
    color: Colors.dark.textSecondary,
    fontWeight: "400",
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
    paddingVertical: Spacing.xl + Spacing.lg,
    gap: Spacing.lg,
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
  quererSection: {
    paddingHorizontal: Spacing.lg,
    marginTop: Spacing.xl + Spacing.xl,
  },
  sectionTitle: {
    fontSize: 18,
    color: Colors.dark.text,
    marginBottom: Spacing.lg,
  },
  sectionTitleHighlight: {
    color: Colors.dark.brand,
    fontWeight: "700",
  },
  quererGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
    justifyContent: "space-between",
  },
  quererCard: {
    width: CARD_WIDTH,
    marginBottom: Spacing.md,
  },
  quererImageContainer: {
    width: "100%",
    height: CARD_WIDTH * 0.9,
    borderRadius: BorderRadius.lg,
    overflow: "hidden",
    position: "relative",
  },
  quererImage: {
    width: "100%",
    height: "100%",
  },
  quererOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  quererTitle: {
    position: "absolute",
    bottom: Spacing.md,
    left: Spacing.md,
    right: Spacing.md,
    fontSize: 16,
    fontWeight: "800",
    color: "#FFFFFF",
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  quererHeart: {
    position: "absolute",
    top: Spacing.sm,
    right: Spacing.sm,
  },
  heartCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.dark.brand,
    alignItems: "center",
    justifyContent: "center",
  },
  quererContent: {
    paddingTop: Spacing.sm,
  },
  quererDescription: {
    fontSize: 13,
    color: Colors.dark.text,
    lineHeight: 18,
  },
  queroPrefix: {
    color: Colors.dark.brand,
    fontWeight: "700",
  },
  momentoTitle: {
    fontSize: 18,
    color: Colors.dark.text,
    marginTop: Spacing.xl,
    textAlign: "center",
  },
});
