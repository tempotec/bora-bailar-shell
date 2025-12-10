import React, { useState } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";
import { Button } from "@/components/Button";
import { apiRequest } from "@/lib/query-client";
import { MyEventsStackParamList } from "@/navigation/MyEventsStackNavigator";
import type { Event } from "@shared/schema";

type NavigationProp = NativeStackNavigationProp<MyEventsStackParamList>;

type TabType = "favorites" | "attending";

const DEMO_USER_ID = "demo-user";

function SegmentedControl({
  value,
  onChange,
}: {
  value: TabType;
  onChange: (tab: TabType) => void;
}) {
  const { theme } = useTheme();

  return (
    <View style={[styles.segmentedControl, { backgroundColor: theme.backgroundDefault }]}>
      <Pressable
        style={[
          styles.segment,
          value === "favorites" && {
            backgroundColor: Colors.dark.primary,
          },
        ]}
        onPress={() => onChange("favorites")}
      >
        <Feather
          name="heart"
          size={16}
          color={value === "favorites" ? "#FFF" : Colors.dark.textSecondary}
          style={{ marginRight: 6 }}
        />
        <ThemedText
          style={[
            styles.segmentText,
            value === "favorites" && styles.segmentTextActive,
          ]}
        >
          Favoritos
        </ThemedText>
      </Pressable>
      <Pressable
        style={[
          styles.segment,
          value === "attending" && {
            backgroundColor: Colors.dark.primary,
          },
        ]}
        onPress={() => onChange("attending")}
      >
        <Feather
          name="calendar"
          size={16}
          color={value === "attending" ? "#FFF" : Colors.dark.textSecondary}
          style={{ marginRight: 6 }}
        />
        <ThemedText
          style={[
            styles.segmentText,
            value === "attending" && styles.segmentTextActive,
          ]}
        >
          Confirmados
        </ThemedText>
      </Pressable>
    </View>
  );
}

function EventListItem({ event, onRemoveFavorite }: { event: Event; onRemoveFavorite?: () => void }) {
  const { theme } = useTheme();
  const navigation = useNavigation<NavigationProp>();

  return (
    <Pressable
      style={({ pressed }) => [
        styles.eventItem,
        { backgroundColor: theme.backgroundDefault },
        pressed && styles.pressed,
      ]}
      onPress={() => navigation.navigate("EventDetails", { eventId: event.id })}
    >
      <View style={styles.eventImage}>
        <LinearGradient
          colors={[Colors.dark.primary, Colors.dark.secondary]}
          style={StyleSheet.absoluteFill}
        />
        <Feather name="music" size={24} color="#FFF" />
      </View>
      <View style={styles.eventInfo}>
        <ThemedText type="body" style={{ fontWeight: "600" }}>
          {event.title}
        </ThemedText>
        <View style={styles.eventMeta}>
          <Feather name="map-pin" size={12} color={theme.textSecondary} />
          <ThemedText style={styles.metaText}>{event.venueName}</ThemedText>
        </View>
        <View style={styles.eventMeta}>
          <Feather name="calendar" size={12} color={theme.textSecondary} />
          <ThemedText style={styles.metaText}>
            {event.date} - {event.time}
          </ThemedText>
        </View>
      </View>
      {onRemoveFavorite ? (
        <Pressable
          onPress={onRemoveFavorite}
          style={({ pressed }) => [styles.removeButton, pressed && { opacity: 0.7 }]}
          hitSlop={8}
        >
          <Feather name="heart" size={20} color={Colors.dark.secondary} />
        </Pressable>
      ) : (
        <Feather name="chevron-right" size={20} color={theme.textSecondary} />
      )}
    </Pressable>
  );
}

function EmptyState({ type }: { type: TabType }) {
  const navigation = useNavigation<any>();

  return (
    <View style={styles.emptyState}>
      <View style={styles.emptyIcon}>
        <Feather
          name={type === "favorites" ? "heart" : "calendar"}
          size={48}
          color={Colors.dark.textSecondary}
        />
      </View>
      <ThemedText type="h4" style={styles.emptyTitle}>
        {type === "favorites" ? "Nenhum favorito" : "Nenhum evento confirmado"}
      </ThemedText>
      <ThemedText style={styles.emptyText}>
        {type === "favorites"
          ? "Salve eventos que voce gosta para encontra-los rapidamente aqui!"
          : "Confirme presenca em eventos para ve-los aqui!"}
      </ThemedText>
      <Button style={styles.emptyButton} onPress={() => navigation.navigate("Discover")}>
        Descobrir Eventos
      </Button>
    </View>
  );
}

export default function MyEventsScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<TabType>("favorites");

  const { data: favorites = [], isLoading: favoritesLoading } = useQuery<Event[]>({
    queryKey: ["/api/users", DEMO_USER_ID, "favorites"],
  });

  const removeFavoriteMutation = useMutation({
    mutationFn: async (eventId: string) => {
      await apiRequest("DELETE", `/api/users/${DEMO_USER_ID}/favorites/${eventId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users", DEMO_USER_ID, "favorites"] });
    },
  });

  const handleRemoveFavorite = (eventId: string) => {
    removeFavoriteMutation.mutate(eventId);
  };

  const events = activeTab === "favorites" ? favorites : [];
  const isLoading = favoritesLoading;

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
      <View style={styles.header}>
        <SegmentedControl value={activeTab} onChange={setActiveTab} />
      </View>

      {isLoading ? (
        <View style={styles.loadingState}>
          <ActivityIndicator size="large" color={Colors.dark.primary} />
        </View>
      ) : events.length > 0 ? (
        <View style={styles.eventList}>
          {events.map((event) => (
            <EventListItem
              key={event.id}
              event={event}
              onRemoveFavorite={activeTab === "favorites" ? () => handleRemoveFavorite(event.id) : undefined}
            />
          ))}
        </View>
      ) : (
        <EmptyState type={activeTab} />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  segmentedControl: {
    flexDirection: "row",
    borderRadius: BorderRadius.md,
    padding: Spacing.xs,
  },
  segment: {
    flex: 1,
    flexDirection: "row",
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  segmentText: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.dark.textSecondary,
  },
  segmentTextActive: {
    color: "#FFF",
  },
  eventList: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
  },
  eventItem: {
    flexDirection: "row",
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    gap: Spacing.md,
  },
  eventImage: {
    width: 60,
    height: 60,
    borderRadius: BorderRadius.sm,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },
  eventInfo: {
    flex: 1,
    gap: Spacing.xs,
  },
  eventMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  metaText: {
    fontSize: 12,
    color: Colors.dark.textSecondary,
  },
  removeButton: {
    padding: Spacing.sm,
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  loadingState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: Spacing.xl,
  },
  emptyIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.dark.backgroundDefault,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  emptyTitle: {
    marginBottom: Spacing.sm,
    textAlign: "center",
  },
  emptyText: {
    color: Colors.dark.textSecondary,
    textAlign: "center",
    marginBottom: Spacing.xl,
  },
  emptyButton: {
    width: "100%",
  },
});
