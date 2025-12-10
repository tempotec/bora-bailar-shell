import React from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  Pressable,
  FlatList,
  ActivityIndicator,
  Image,
  Text,
  Dimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { LinearGradient } from "expo-linear-gradient";
import { useQuery } from "@tanstack/react-query";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Colors, Fonts } from "@/constants/theme";
import { DiscoverStackParamList } from "@/navigation/DiscoverStackNavigator";
import type { Event } from "@shared/schema";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

type NavigationProp = NativeStackNavigationProp<DiscoverStackParamList>;

const logoImage = require("../../attached_assets/WhatsApp_Image_2025-12-09_at_11.41.04-removebg-preview_1765394422474.png");

function ChevronUpDownIcon() {
  return (
    <View style={styles.chevronIconContainer}>
      <Feather name="chevron-up" size={12} color={Colors.dark.textSecondary} style={{ marginBottom: -4 }} />
      <Feather name="chevron-down" size={12} color={Colors.dark.textSecondary} style={{ marginTop: -4 }} />
    </View>
  );
}

function MicrophoneIcon() {
  return (
    <View style={styles.micIconContainer}>
      <Feather name="mic" size={16} color="#FFFFFF" />
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

function EventThumbnail({ event, index }: { event: Event; index: number }) {
  const navigation = useNavigation<NavigationProp>();
  
  const gradients: [string, string][] = [
    ["#8B4513", "#D2691E"],
    ["#B22222", "#DC143C"],
    ["#2F4F4F", "#708090"],
    ["#800000", "#A52A2A"],
  ];
  
  const gradient = gradients[index % gradients.length];

  return (
    <Pressable
      style={({ pressed }) => [
        styles.eventThumbnail,
        pressed && styles.pressed,
      ]}
      onPress={() => navigation.navigate("EventDetails", { eventId: event.id })}
    >
      <LinearGradient
        colors={gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.thumbnailContent}>
        <View style={styles.thumbnailOverlay} />
      </View>
    </Pressable>
  );
}

function SectionHeader({
  title,
  highlightWords = [],
}: {
  title: string;
  highlightWords?: string[];
}) {
  const renderTitle = () => {
    if (highlightWords.length === 0) {
      return <ThemedText style={styles.sectionTitle}>{title}</ThemedText>;
    }

    const words = title.split(" ");
    return (
      <Text style={styles.sectionTitle}>
        {words.map((word, index) => {
          const isHighlight = highlightWords.some(
            (hw) => word.toLowerCase().includes(hw.toLowerCase())
          );
          return (
            <Text
              key={index}
              style={isHighlight ? styles.highlightWord : styles.normalWord}
            >
              {word}
              {index < words.length - 1 ? " " : ""}
            </Text>
          );
        })}
      </Text>
    );
  };

  return (
    <View style={styles.sectionHeader}>
      {renderTitle()}
    </View>
  );
}

export default function DiscoverScreen() {
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();
  const navigation = useNavigation<NavigationProp>();

  const { data: events = [], isLoading } = useQuery<Event[]>({
    queryKey: ["/api/events"],
  });

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.backgroundRoot }]}>
        <ActivityIndicator size="large" color={Colors.dark.brand} />
      </View>
    );
  }

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
          <Text style={styles.brandBora}>Bora</Text>
          <Text style={styles.brandBailar}>Bailar</Text>
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

      <View style={styles.contentSection}>
        <SectionHeader
          title="O seu querer é que faz acontecer"
          highlightWords={["querer", "acontecer"]}
        />

        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={events.slice(0, 4)}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.thumbnailList}
          renderItem={({ item, index }) => <EventThumbnail event={item} index={index} />}
        />
      </View>

      <View style={styles.eventsSection}>
        <View style={styles.eventsSectionHeader}>
          <ThemedText style={styles.eventsSectionTitle}>Eventos em Destaque</ThemedText>
          <Pressable hitSlop={8}>
            <ThemedText style={styles.seeAll}>Ver todos</ThemedText>
          </Pressable>
        </View>

        {events.slice(0, 5).map((event) => (
          <Pressable
            key={event.id}
            style={({ pressed }) => [
              styles.eventListItem,
              pressed && styles.pressed,
            ]}
            onPress={() => navigation.navigate("EventDetails", { eventId: event.id })}
          >
            <View style={styles.eventListImage}>
              <LinearGradient
                colors={[Colors.dark.brand, "#FF6B6B"]}
                style={StyleSheet.absoluteFill}
              />
              <Feather name="music" size={18} color="rgba(255,255,255,0.8)" />
            </View>
            <View style={styles.eventListInfo}>
              <ThemedText style={styles.eventListTitle}>
                {event.title}
              </ThemedText>
              <ThemedText style={styles.eventListMeta}>
                {event.venueName} - {event.date}
              </ThemedText>
            </View>
            <Feather name="chevron-right" size={20} color={theme.textSecondary} />
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  heroSection: {
    alignItems: "center",
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.lg,
    paddingHorizontal: Spacing.lg,
  },
  logo: {
    width: 100,
    height: 70,
    marginBottom: Spacing.xs,
  },
  brandName: {
    fontSize: 26,
    fontFamily: Fonts?.serif,
    letterSpacing: 1,
    marginBottom: Spacing.xs,
  },
  brandBora: {
    color: Colors.dark.text,
    fontWeight: "400",
  },
  brandBailar: {
    color: Colors.dark.brand,
    fontWeight: "700",
  },
  tagline: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.dark.brand,
    textAlign: "center",
    letterSpacing: 0.5,
  },
  wizardSection: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing["2xl"],
  },
  wizardContainer: {
    backgroundColor: Colors.dark.wizardBackground,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  wizardField: {
    backgroundColor: "#FFFFFF",
    borderRadius: BorderRadius.xl,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  wizardFieldPressed: {
    backgroundColor: "#F9FAFB",
  },
  wizardFieldLabel: {
    fontSize: 15,
    color: Colors.dark.textSecondary,
    fontWeight: "400",
  },
  chevronIconContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  micIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.dark.brand,
    alignItems: "center",
    justifyContent: "center",
  },
  helperTextContainer: {
    alignItems: "center",
    marginTop: Spacing.sm,
    paddingBottom: Spacing.xs,
  },
  helperText: {
    fontSize: 14,
    color: Colors.dark.text,
    textAlign: "center",
  },
  helperHighlight: {
    color: Colors.dark.brand,
    fontWeight: "700",
  },
  contentSection: {
    marginBottom: Spacing.xl,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: 15,
    color: Colors.dark.text,
    fontWeight: "400",
  },
  normalWord: {
    color: Colors.dark.text,
    fontWeight: "400",
  },
  highlightWord: {
    color: Colors.dark.brand,
    fontWeight: "700",
  },
  seeAll: {
    color: Colors.dark.brand,
    fontSize: 14,
    fontWeight: "500",
  },
  thumbnailList: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
  },
  eventThumbnail: {
    width: 75,
    height: 75,
    borderRadius: BorderRadius.md,
    overflow: "hidden",
    marginRight: Spacing.sm,
  },
  thumbnailContent: {
    flex: 1,
  },
  thumbnailOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.1)",
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  eventsSection: {
    marginBottom: Spacing.xl,
  },
  eventsSectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  eventsSectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.dark.text,
  },
  eventListItem: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    padding: Spacing.md,
    backgroundColor: Colors.dark.backgroundSecondary,
    borderRadius: BorderRadius.md,
    gap: Spacing.md,
  },
  eventListImage: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.sm,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },
  eventListInfo: {
    flex: 1,
  },
  eventListTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.dark.text,
  },
  eventListMeta: {
    fontSize: 13,
    color: Colors.dark.textSecondary,
    marginTop: 2,
  },
});
