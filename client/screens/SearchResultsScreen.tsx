import React from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";
import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";

import { useTheme } from "@/hooks/useTheme";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";
import { getApiUrl } from "@/lib/query-client";

type Event = {
  id: string;
  title: string;
  description?: string;
  venueName?: string;
  address?: string;
  city?: string;
  date: string;
  time: string;
  price?: string;
  attendeesCount?: number;
};

export default function SearchResultsScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  
  const { city, date, query } = (route.params as { city?: string; date?: string; query?: string }) || {};
  
  const searchUrl = new URL("/api/events/search", getApiUrl());
  if (city) searchUrl.searchParams.set("city", city);
  if (date) searchUrl.searchParams.set("date", date);
  if (query) searchUrl.searchParams.set("query", query);
  
  const { data: events, isLoading, error } = useQuery<Event[]>({
    queryKey: ["/api/events/search", { city, date, query }],
    queryFn: async () => {
      const response = await fetch(searchUrl.toString());
      if (!response.ok) throw new Error("Failed to search events");
      return response.json();
    },
  });
  
  const renderEventCard = ({ item }: { item: Event }) => (
    <Pressable
      style={({ pressed }) => [
        styles.eventCard,
        pressed && styles.eventCardPressed,
      ]}
      onPress={() => (navigation as any).navigate("EventDetails", { eventId: item.id })}
    >
      <View style={styles.eventInfo}>
        <Text style={styles.eventTitle}>{item.title}</Text>
        {item.venueName ? (
          <View style={styles.eventLocation}>
            <Feather name="map-pin" size={14} color={Colors.dark.textSecondary} />
            <Text style={styles.eventLocationText}>{item.venueName}</Text>
          </View>
        ) : null}
        <View style={styles.eventDateTime}>
          <View style={styles.eventDateTimeItem}>
            <Feather name="calendar" size={14} color={Colors.dark.textSecondary} />
            <Text style={styles.eventDateTimeText}>{item.date}</Text>
          </View>
          <View style={styles.eventDateTimeItem}>
            <Feather name="clock" size={14} color={Colors.dark.textSecondary} />
            <Text style={styles.eventDateTimeText}>{item.time}</Text>
          </View>
        </View>
        {item.price ? (
          <Text style={styles.eventPrice}>{item.price}</Text>
        ) : null}
      </View>
      <View style={styles.eventArrow}>
        <Feather name="chevron-right" size={24} color={Colors.dark.textSecondary} />
      </View>
    </Pressable>
  );
  
  const ListHeader = () => (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>Resultados da busca</Text>
      <View style={styles.filterTags}>
        {city ? (
          <View style={styles.filterTag}>
            <Feather name="map-pin" size={12} color={Colors.dark.brand} />
            <Text style={styles.filterTagText}>{city}</Text>
          </View>
        ) : null}
        {date ? (
          <View style={styles.filterTag}>
            <Feather name="calendar" size={12} color={Colors.dark.brand} />
            <Text style={styles.filterTagText}>{date}</Text>
          </View>
        ) : null}
        {query ? (
          <View style={styles.filterTag}>
            <Feather name="search" size={12} color={Colors.dark.brand} />
            <Text style={styles.filterTagText}>{query}</Text>
          </View>
        ) : null}
      </View>
    </View>
  );
  
  const ListEmpty = () => (
    <View style={styles.emptyContainer}>
      <Feather name="search" size={48} color={Colors.dark.textSecondary} />
      <Text style={styles.emptyTitle}>Nenhum evento encontrado</Text>
      <Text style={styles.emptySubtitle}>
        Tente ajustar os filtros de busca
      </Text>
    </View>
  );
  
  if (isLoading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.dark.brand} />
          <Text style={styles.loadingText}>Buscando eventos...</Text>
        </View>
      </View>
    );
  }
  
  if (error) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.errorContainer}>
          <Feather name="alert-circle" size={48} color={Colors.dark.brand} />
          <Text style={styles.errorTitle}>Erro na busca</Text>
          <Text style={styles.errorSubtitle}>
            Não foi possível buscar os eventos. Tente novamente.
          </Text>
          <Pressable
            style={styles.retryButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.retryButtonText}>Voltar</Text>
          </Pressable>
        </View>
      </View>
    );
  }
  
  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <FlatList
        data={events}
        renderItem={renderEventCard}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={ListEmpty}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: insets.bottom + Spacing.xl },
        ]}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.backgroundRoot,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.md,
  },
  loadingText: {
    fontSize: 16,
    color: Colors.dark.textSecondary,
  },
  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing.xl,
    gap: Spacing.md,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: Colors.dark.text,
    marginTop: Spacing.md,
  },
  errorSubtitle: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: Colors.dark.brand,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.lg,
    marginTop: Spacing.md,
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  listContent: {
    paddingHorizontal: Spacing.lg,
  },
  header: {
    paddingVertical: Spacing.lg,
    gap: Spacing.md,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: Colors.dark.text,
  },
  filterTags: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  filterTag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(196, 30, 58, 0.1)",
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.lg,
    gap: Spacing.xs,
  },
  filterTagText: {
    fontSize: 12,
    color: Colors.dark.brand,
    fontWeight: "500",
  },
  eventCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
  },
  eventCardPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }],
  },
  eventInfo: {
    flex: 1,
    gap: Spacing.xs,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.dark.text,
  },
  eventLocation: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  eventLocationText: {
    fontSize: 13,
    color: Colors.dark.textSecondary,
  },
  eventDateTime: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  eventDateTimeItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  eventDateTimeText: {
    fontSize: 12,
    color: Colors.dark.textSecondary,
  },
  eventPrice: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.dark.brand,
    marginTop: Spacing.xs,
  },
  eventArrow: {
    marginLeft: Spacing.md,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.xl * 3,
    gap: Spacing.md,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.dark.text,
    marginTop: Spacing.md,
  },
  emptySubtitle: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
    textAlign: "center",
  },
});
