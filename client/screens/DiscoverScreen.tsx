import React, { useState } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  Pressable,
  ImageBackground,
  FlatList,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { LinearGradient } from "expo-linear-gradient";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";
import { DiscoverStackParamList } from "@/navigation/DiscoverStackNavigator";

const MOCK_EVENTS = [
  {
    id: "1",
    title: "Noite Latina",
    venue: "Club Havana",
    date: "Sab, 14 Dez",
    time: "22:00",
    image: null,
    attendees: 234,
  },
  {
    id: "2",
    title: "Forrozada",
    venue: "Espaco Nordeste",
    date: "Dom, 15 Dez",
    time: "18:00",
    image: null,
    attendees: 156,
  },
  {
    id: "3",
    title: "Samba Rock",
    venue: "Bar do Samba",
    date: "Sex, 20 Dez",
    time: "21:00",
    image: null,
    attendees: 89,
  },
  {
    id: "4",
    title: "Zouk Night",
    venue: "Dance Studio",
    date: "Sab, 21 Dez",
    time: "20:00",
    image: null,
    attendees: 178,
  },
];

const VENUES = [
  { id: "1", name: "Club Havana", events: 12 },
  { id: "2", name: "Espaco Nordeste", events: 8 },
  { id: "3", name: "Bar do Samba", events: 15 },
  { id: "4", name: "Dance Studio", events: 6 },
];

type NavigationProp = NativeStackNavigationProp<DiscoverStackParamList>;

function EventCard({
  event,
  size = "large",
}: {
  event: (typeof MOCK_EVENTS)[0];
  size?: "large" | "medium";
}) {
  const navigation = useNavigation<NavigationProp>();

  const handlePress = () => {
    navigation.navigate("EventDetails", { eventId: event.id });
  };

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        size === "large" ? styles.heroCard : styles.eventCard,
        pressed && styles.pressed,
      ]}
    >
      <LinearGradient
        colors={[Colors.dark.primary, Colors.dark.secondary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <LinearGradient
        colors={["transparent", "rgba(0,0,0,0.8)"]}
        style={[StyleSheet.absoluteFill, { top: "50%" }]}
      />
      <View style={styles.eventCardContent}>
        <View style={styles.eventDate}>
          <ThemedText style={styles.eventDateText}>{event.date}</ThemedText>
        </View>
        <View style={styles.eventInfo}>
          <ThemedText type="h4" style={styles.eventTitle}>
            {event.title}
          </ThemedText>
          <View style={styles.eventMeta}>
            <Feather name="map-pin" size={14} color={Colors.dark.textSecondary} />
            <ThemedText style={styles.eventVenue}>{event.venue}</ThemedText>
            <ThemedText style={styles.eventTime}>{event.time}</ThemedText>
          </View>
          <View style={styles.attendeesRow}>
            <Feather name="users" size={14} color={Colors.dark.textSecondary} />
            <ThemedText style={styles.attendeesText}>
              {event.attendees} confirmados
            </ThemedText>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

function VenueCard({ venue }: { venue: (typeof VENUES)[0] }) {
  return (
    <Pressable
      style={({ pressed }) => [styles.venueCard, pressed && styles.pressed]}
    >
      <LinearGradient
        colors={[Colors.dark.backgroundSecondary, Colors.dark.backgroundDefault]}
        style={StyleSheet.absoluteFill}
      />
      <Feather name="home" size={24} color={Colors.dark.primary} />
      <ThemedText style={styles.venueName}>{venue.name}</ThemedText>
      <ThemedText style={styles.venueEvents}>{venue.events} eventos</ThemedText>
    </Pressable>
  );
}

function SectionHeader({
  title,
  onSeeAll,
}: {
  title: string;
  onSeeAll?: () => void;
}) {
  return (
    <View style={styles.sectionHeader}>
      <ThemedText type="h4">{title}</ThemedText>
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
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();

  const featuredEvent = MOCK_EVENTS[0];
  const weekendEvents = MOCK_EVENTS.slice(1, 4);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      contentContainerStyle={{
        paddingTop: headerHeight + Spacing.lg,
        paddingBottom: tabBarHeight + Spacing.xl,
      }}
      scrollIndicatorInsets={{ bottom: insets.bottom }}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.heroSection}>
        <EventCard event={featuredEvent} size="large" />
      </View>

      <View style={styles.section}>
        <SectionHeader title="Este Final de Semana" onSeeAll={() => {}} />
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={weekendEvents}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.horizontalList}
          renderItem={({ item }) => <EventCard event={item} size="medium" />}
        />
      </View>

      <View style={styles.section}>
        <SectionHeader title="Locais Populares" onSeeAll={() => {}} />
        <View style={styles.venuesGrid}>
          {VENUES.map((venue) => (
            <VenueCard key={venue.id} venue={venue} />
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <SectionHeader title="Todos os Eventos" />
        {MOCK_EVENTS.map((event) => (
          <Pressable
            key={event.id}
            style={({ pressed }) => [
              styles.eventListItem,
              { backgroundColor: theme.backgroundDefault },
              pressed && styles.pressed,
            ]}
            onPress={() => {}}
          >
            <View style={styles.eventListImage}>
              <LinearGradient
                colors={[Colors.dark.secondary, Colors.dark.tertiary]}
                style={StyleSheet.absoluteFill}
              />
              <Feather name="music" size={20} color="#FFF" />
            </View>
            <View style={styles.eventListInfo}>
              <ThemedText type="body" style={{ fontWeight: "600" }}>
                {event.title}
              </ThemedText>
              <ThemedText style={styles.eventListMeta}>
                {event.venue} - {event.date}
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
  heroSection: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  heroCard: {
    height: 220,
    borderRadius: BorderRadius.lg,
    overflow: "hidden",
  },
  eventCard: {
    width: 200,
    height: 160,
    borderRadius: BorderRadius.md,
    overflow: "hidden",
    marginRight: Spacing.md,
  },
  eventCardContent: {
    flex: 1,
    justifyContent: "space-between",
    padding: Spacing.lg,
  },
  eventDate: {
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.xs,
    alignSelf: "flex-start",
  },
  eventDateText: {
    fontSize: 12,
    fontWeight: "600",
  },
  eventInfo: {
    gap: Spacing.xs,
  },
  eventTitle: {
    color: "#FFF",
  },
  eventMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  eventVenue: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
  },
  eventTime: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
    marginLeft: Spacing.sm,
  },
  attendeesRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  attendeesText: {
    fontSize: 12,
    color: Colors.dark.textSecondary,
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  seeAll: {
    color: Colors.dark.primary,
    fontSize: 14,
    fontWeight: "500",
  },
  horizontalList: {
    paddingHorizontal: Spacing.lg,
  },
  venuesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
  },
  venueCard: {
    width: "47%",
    height: 100,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  venueName: {
    fontSize: 14,
    fontWeight: "600",
    marginTop: Spacing.sm,
    textAlign: "center",
  },
  venueEvents: {
    fontSize: 12,
    color: Colors.dark.textSecondary,
    marginTop: Spacing.xs,
  },
  eventListItem: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: Spacing.md,
  },
  eventListImage: {
    width: 50,
    height: 50,
    borderRadius: BorderRadius.sm,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },
  eventListInfo: {
    flex: 1,
  },
  eventListMeta: {
    fontSize: 13,
    color: Colors.dark.textSecondary,
    marginTop: 2,
  },
});
