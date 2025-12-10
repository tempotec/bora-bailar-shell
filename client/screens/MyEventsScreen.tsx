import React, { useState } from "react";
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
import { LinearGradient } from "expo-linear-gradient";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";
import { Button } from "@/components/Button";

type TabType = "upcoming" | "past";

const UPCOMING_EVENTS = [
  {
    id: "1",
    title: "Noite Latina",
    venue: "Club Havana",
    date: "Sab, 14 Dez",
    time: "22:00",
    status: "confirmed",
  },
  {
    id: "2",
    title: "Forrozada",
    venue: "Espaco Nordeste",
    date: "Dom, 15 Dez",
    time: "18:00",
    status: "pending",
  },
];

const PAST_EVENTS = [
  {
    id: "3",
    title: "Samba de Raiz",
    venue: "Bar do Ze",
    date: "Sab, 7 Dez",
    time: "20:00",
    status: "attended",
  },
];

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
          value === "upcoming" && {
            backgroundColor: Colors.dark.primary,
          },
        ]}
        onPress={() => onChange("upcoming")}
      >
        <ThemedText
          style={[
            styles.segmentText,
            value === "upcoming" && styles.segmentTextActive,
          ]}
        >
          Proximos
        </ThemedText>
      </Pressable>
      <Pressable
        style={[
          styles.segment,
          value === "past" && {
            backgroundColor: Colors.dark.primary,
          },
        ]}
        onPress={() => onChange("past")}
      >
        <ThemedText
          style={[
            styles.segmentText,
            value === "past" && styles.segmentTextActive,
          ]}
        >
          Anteriores
        </ThemedText>
      </Pressable>
    </View>
  );
}

function EventListItem({ event }: { event: (typeof UPCOMING_EVENTS)[0] }) {
  const { theme } = useTheme();

  const getStatusColor = () => {
    switch (event.status) {
      case "confirmed":
        return Colors.dark.success;
      case "pending":
        return Colors.dark.tertiary;
      case "attended":
        return Colors.dark.textSecondary;
      default:
        return Colors.dark.textSecondary;
    }
  };

  const getStatusText = () => {
    switch (event.status) {
      case "confirmed":
        return "Confirmado";
      case "pending":
        return "Pendente";
      case "attended":
        return "Participou";
      default:
        return "";
    }
  };

  return (
    <Pressable
      style={({ pressed }) => [
        styles.eventItem,
        { backgroundColor: theme.backgroundDefault },
        pressed && styles.pressed,
      ]}
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
          <ThemedText style={styles.metaText}>{event.venue}</ThemedText>
        </View>
        <View style={styles.eventMeta}>
          <Feather name="calendar" size={12} color={theme.textSecondary} />
          <ThemedText style={styles.metaText}>
            {event.date} - {event.time}
          </ThemedText>
        </View>
      </View>
      <View style={[styles.statusBadge, { backgroundColor: getStatusColor() + "20" }]}>
        <ThemedText style={[styles.statusText, { color: getStatusColor() }]}>
          {getStatusText()}
        </ThemedText>
      </View>
    </Pressable>
  );
}

function EmptyState() {
  return (
    <View style={styles.emptyState}>
      <View style={styles.emptyIcon}>
        <Feather name="calendar" size={48} color={Colors.dark.textSecondary} />
      </View>
      <ThemedText type="h4" style={styles.emptyTitle}>
        Nenhum evento ainda
      </ThemedText>
      <ThemedText style={styles.emptyText}>
        Explore e descubra eventos incriveis para participar!
      </ThemedText>
      <Button style={styles.emptyButton} onPress={() => {}}>
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
  const [activeTab, setActiveTab] = useState<TabType>("upcoming");

  const events = activeTab === "upcoming" ? UPCOMING_EVENTS : PAST_EVENTS;
  const hasEvents = events.length > 0;

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

      {hasEvents ? (
        <View style={styles.eventList}>
          {events.map((event) => (
            <EventListItem key={event.id} event={event} />
          ))}
        </View>
      ) : (
        <EmptyState />
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
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
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
  statusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.xs,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "600",
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
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
