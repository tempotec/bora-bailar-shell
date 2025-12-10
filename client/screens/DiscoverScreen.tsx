import React, { useState, useMemo } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  Pressable,
  FlatList,
  ActivityIndicator,
  TextInput,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { LinearGradient } from "expo-linear-gradient";
import { useQuery } from "@tanstack/react-query";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";
import { DiscoverStackParamList } from "@/navigation/DiscoverStackNavigator";
import type { Event, Venue } from "@shared/schema";

type NavigationProp = NativeStackNavigationProp<DiscoverStackParamList>;

interface EventCardProps {
  event: {
    id: string;
    title: string;
    venueName: string | null;
    date: string;
    time: string;
    attendeesCount: number | null;
  };
  size?: "large" | "medium";
}

function EventCard({ event, size = "large" }: EventCardProps) {
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
            <ThemedText style={styles.eventVenue}>{event.venueName}</ThemedText>
            <ThemedText style={styles.eventTime}>{event.time}</ThemedText>
          </View>
          <View style={styles.attendeesRow}>
            <Feather name="users" size={14} color={Colors.dark.textSecondary} />
            <ThemedText style={styles.attendeesText}>
              {event.attendeesCount || 0} confirmados
            </ThemedText>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

function VenueCard({ venue, onPress }: { venue: { id: string; name: string; eventsCount: number | null }; onPress?: () => void }) {
  return (
    <Pressable
      style={({ pressed }) => [styles.venueCard, pressed && styles.pressed]}
      onPress={onPress}
    >
      <LinearGradient
        colors={[Colors.dark.backgroundSecondary, Colors.dark.backgroundDefault]}
        style={StyleSheet.absoluteFill}
      />
      <Feather name="home" size={24} color={Colors.dark.primary} />
      <ThemedText style={styles.venueName}>{venue.name}</ThemedText>
      <ThemedText style={styles.venueEvents}>{venue.eventsCount || 0} eventos</ThemedText>
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

function FilterChip({ label, isActive, onPress }: { label: string; isActive?: boolean; onPress: () => void }) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.filterChip,
        isActive && styles.filterChipActive,
        pressed && styles.pressed,
      ]}
      onPress={onPress}
    >
      <ThemedText style={[styles.filterChipText, isActive && styles.filterChipTextActive]}>
        {label}
      </ThemedText>
    </Pressable>
  );
}

export default function DiscoverScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();
  const navigation = useNavigation<NavigationProp>();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedVenue, setSelectedVenue] = useState<string | null>(null);

  const { data: events = [], isLoading: eventsLoading } = useQuery<Event[]>({
    queryKey: ["/api/events"],
  });

  const { data: venues = [], isLoading: venuesLoading } = useQuery<Venue[]>({
    queryKey: ["/api/venues"],
  });

  const filteredEvents = useMemo(() => {
    let result = events;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (event) =>
          event.title.toLowerCase().includes(query) ||
          (event.venueName && event.venueName.toLowerCase().includes(query)) ||
          (event.description && event.description.toLowerCase().includes(query))
      );
    }

    if (selectedVenue) {
      result = result.filter((event) => event.venueName === selectedVenue);
    }

    return result;
  }, [events, searchQuery, selectedVenue]);

  const featuredEvent = filteredEvents.find(e => e.isFeatured) || filteredEvents[0];
  const weekendEvents = filteredEvents.filter(e => e.id !== featuredEvent?.id).slice(0, 3);

  const handleVenuePress = (venueName: string) => {
    if (selectedVenue === venueName) {
      setSelectedVenue(null);
    } else {
      setSelectedVenue(venueName);
    }
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedVenue(null);
  };

  if (eventsLoading || venuesLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.backgroundRoot }]}>
        <ActivityIndicator size="large" color={Colors.dark.primary} />
      </View>
    );
  }

  const isFiltering = searchQuery.trim() !== "" || selectedVenue !== null;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      contentContainerStyle={{
        paddingTop: headerHeight + Spacing.lg,
        paddingBottom: tabBarHeight + Spacing.xl,
      }}
      scrollIndicatorInsets={{ bottom: insets.bottom }}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.searchSection}>
        <View style={[styles.searchBar, { backgroundColor: theme.backgroundDefault }]}>
          <Feather name="search" size={20} color={theme.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: theme.text }]}
            placeholder="Buscar eventos, locais..."
            placeholderTextColor={theme.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
          />
          {searchQuery.length > 0 ? (
            <Pressable onPress={() => setSearchQuery("")} hitSlop={8}>
              <Feather name="x" size={20} color={theme.textSecondary} />
            </Pressable>
          ) : null}
        </View>

        {isFiltering ? (
          <View style={styles.activeFilters}>
            <ThemedText style={styles.filterLabel}>
              {filteredEvents.length} {filteredEvents.length === 1 ? "evento encontrado" : "eventos encontrados"}
            </ThemedText>
            <Pressable onPress={clearFilters} hitSlop={8}>
              <ThemedText style={styles.clearFilters}>Limpar</ThemedText>
            </Pressable>
          </View>
        ) : null}

        {selectedVenue ? (
          <View style={styles.filterTags}>
            <FilterChip
              label={selectedVenue}
              isActive
              onPress={() => setSelectedVenue(null)}
            />
          </View>
        ) : null}
      </View>

      {featuredEvent && !isFiltering ? (
        <View style={styles.heroSection}>
          <EventCard
            event={{
              id: featuredEvent.id,
              title: featuredEvent.title,
              venueName: featuredEvent.venueName,
              date: featuredEvent.date,
              time: featuredEvent.time,
              attendeesCount: featuredEvent.attendeesCount,
            }}
            size="large"
          />
        </View>
      ) : null}

      {weekendEvents.length > 0 && !isFiltering ? (
        <View style={styles.section}>
          <SectionHeader title="Este Final de Semana" onSeeAll={() => {}} />
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={weekendEvents}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.horizontalList}
            renderItem={({ item }) => (
              <EventCard
                event={{
                  id: item.id,
                  title: item.title,
                  venueName: item.venueName,
                  date: item.date,
                  time: item.time,
                  attendeesCount: item.attendeesCount,
                }}
                size="medium"
              />
            )}
          />
        </View>
      ) : null}

      {venues.length > 0 && !isFiltering ? (
        <View style={styles.section}>
          <SectionHeader title="Filtrar por Local" />
          <View style={styles.venuesGrid}>
            {venues.map((venue) => (
              <VenueCard
                key={venue.id}
                venue={venue}
                onPress={() => handleVenuePress(venue.name)}
              />
            ))}
          </View>
        </View>
      ) : null}

      <View style={styles.section}>
        <SectionHeader title={isFiltering ? "Resultados" : "Todos os Eventos"} />
        {filteredEvents.length === 0 ? (
          <View style={styles.emptyState}>
            <Feather name="search" size={48} color={theme.textSecondary} />
            <ThemedText style={styles.emptyText}>Nenhum evento encontrado</ThemedText>
            <ThemedText style={styles.emptySubtext}>
              Tente buscar por outro termo ou limpe os filtros
            </ThemedText>
          </View>
        ) : (
          filteredEvents.map((event) => (
            <Pressable
              key={event.id}
              style={({ pressed }) => [
                styles.eventListItem,
                { backgroundColor: theme.backgroundDefault },
                pressed && styles.pressed,
              ]}
              onPress={() => navigation.navigate("EventDetails", { eventId: event.id })}
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
                  {event.venueName} - {event.date}
                </ThemedText>
              </View>
              <Feather name="chevron-right" size={20} color={theme.textSecondary} />
            </Pressable>
          ))
        )}
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
  searchSection: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: Spacing.xs,
  },
  activeFilters: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: Spacing.sm,
  },
  filterLabel: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
  },
  clearFilters: {
    fontSize: 14,
    color: Colors.dark.primary,
    fontWeight: "500",
  },
  filterTags: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: Spacing.sm,
    gap: Spacing.xs,
  },
  filterChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.dark.backgroundSecondary,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  filterChipActive: {
    backgroundColor: Colors.dark.primary,
  },
  filterChipText: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
  },
  filterChipTextActive: {
    color: "#FFF",
    fontWeight: "500",
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
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.xl * 2,
    paddingHorizontal: Spacing.lg,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: Spacing.lg,
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
    textAlign: "center",
    marginTop: Spacing.sm,
  },
});
