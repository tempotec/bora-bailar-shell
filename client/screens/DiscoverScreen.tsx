import React, { useState, useMemo } from "react";
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

function WizardSearchField({
  label,
  icon,
  onPress,
}: {
  label: string;
  icon: "chevrons-down" | "mic";
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
      <Feather
        name={icon}
        size={icon === "mic" ? 20 : 18}
        color={icon === "mic" ? Colors.dark.brand : Colors.dark.textSecondary}
      />
    </Pressable>
  );
}

function EventThumbnail({ event }: { event: Event }) {
  const navigation = useNavigation<NavigationProp>();

  return (
    <Pressable
      style={({ pressed }) => [
        styles.eventThumbnail,
        pressed && styles.pressed,
      ]}
      onPress={() => navigation.navigate("EventDetails", { eventId: event.id })}
    >
      <LinearGradient
        colors={[Colors.dark.brand, "#FF6B6B"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.thumbnailOverlay}>
        <Feather name="music" size={24} color="rgba(255,255,255,0.6)" />
      </View>
    </Pressable>
  );
}

function SectionHeader({
  title,
  highlightWords = [],
  onSeeAll,
}: {
  title: string;
  highlightWords?: string[];
  onSeeAll?: () => void;
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
      {onSeeAll ? (
        <Pressable onPress={onSeeAll} hitSlop={8}>
          <ThemedText style={styles.seeAll}>Ver todos</ThemedText>
        </Pressable>
      ) : null}
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
        paddingTop: Spacing.lg,
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
          <Text style={styles.brandBora}>BORA</Text>
          <Text style={styles.brandBailar}>BAILAR</Text>
        </Text>

        <Text style={styles.tagline}>PRA SAIR, DANCAR E SE DIVERTIR!</Text>
      </View>

      <View style={styles.wizardSection}>
        <View style={styles.wizardContainer}>
          <WizardSearchField label="Onde" icon="chevrons-down" />
          <WizardSearchField label="Quando" icon="chevrons-down" />
          <WizardSearchField label="Com quem" icon="mic" />
        </View>

        <View style={styles.helperTextContainer}>
          <Text style={styles.helperText}>
            E so{" "}
            <Text style={styles.helperHighlight}>falar</Text>
            {" "}que a gente te{" "}
            <Text style={styles.helperHighlight}>entende</Text>!
          </Text>
        </View>
      </View>

      <View style={styles.contentSection}>
        <SectionHeader
          title="O seu querer e que faz acontecer"
          highlightWords={["querer", "acontecer"]}
        />

        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={events.slice(0, 6)}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.thumbnailList}
          renderItem={({ item }) => <EventThumbnail event={item} />}
        />
      </View>

      <View style={styles.eventsSection}>
        <SectionHeader title="Eventos em Destaque" onSeeAll={() => {}} />

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
    paddingTop: Spacing.xl,
    paddingBottom: Spacing["2xl"],
    paddingHorizontal: Spacing.lg,
  },
  logo: {
    width: 120,
    height: 80,
    marginBottom: Spacing.md,
  },
  brandName: {
    fontSize: 28,
    fontFamily: Fonts?.serif,
    letterSpacing: 2,
    marginBottom: Spacing.sm,
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
    fontSize: 14,
    fontWeight: "700",
    color: Colors.dark.brand,
    textAlign: "center",
    letterSpacing: 1,
  },
  wizardSection: {
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing["3xl"],
  },
  wizardContainer: {
    backgroundColor: Colors.dark.wizardBackground,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  wizardField: {
    backgroundColor: "#FFFFFF",
    borderRadius: BorderRadius.xl,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  wizardFieldPressed: {
    backgroundColor: "#F9FAFB",
  },
  wizardFieldLabel: {
    fontSize: 16,
    color: Colors.dark.textSecondary,
    fontWeight: "400",
  },
  helperTextContainer: {
    alignItems: "center",
    marginTop: Spacing.lg,
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
    marginBottom: Spacing["2xl"],
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: 16,
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
    width: 80,
    height: 80,
    borderRadius: BorderRadius.md,
    overflow: "hidden",
    marginRight: Spacing.sm,
  },
  thumbnailOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  eventsSection: {
    marginBottom: Spacing.xl,
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
