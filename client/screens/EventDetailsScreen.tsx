import React, { useState } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRoute, RouteProp } from "@react-navigation/native";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";
import { Button } from "@/components/Button";
import { DiscoverStackParamList } from "@/navigation/DiscoverStackNavigator";
import { apiRequest } from "@/lib/query-client";
import type { Event } from "@shared/schema";

type EventDetailsRouteProp = RouteProp<DiscoverStackParamList, "EventDetails">;

const DEMO_USER_ID = "demo-user";

function InfoRow({
  icon,
  title,
  subtitle,
}: {
  icon: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoIcon}>
        <Feather name={icon as any} size={20} color={Colors.dark.primary} />
      </View>
      <View style={styles.infoContent}>
        <ThemedText style={styles.infoTitle}>{title}</ThemedText>
        {subtitle ? (
          <ThemedText style={styles.infoSubtitle}>{subtitle}</ThemedText>
        ) : null}
      </View>
    </View>
  );
}

function AttendeeAvatar({ name, index }: { name: string; index: number }) {
  return (
    <View style={[styles.attendeeAvatar, { marginLeft: index > 0 ? -10 : 0 }]}>
      <LinearGradient
        colors={[Colors.dark.secondary, Colors.dark.tertiary]}
        style={StyleSheet.absoluteFill}
      />
      <ThemedText style={styles.attendeeInitial}>
        {name.charAt(0)}
      </ThemedText>
    </View>
  );
}

export default function EventDetailsScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const route = useRoute<EventDetailsRouteProp>();
  const queryClient = useQueryClient();
  const { eventId } = route.params;

  const { data: event, isLoading } = useQuery<Event>({
    queryKey: ["/api/events", eventId],
  });

  const { data: favoriteStatus } = useQuery<{ isFavorite: boolean }>({
    queryKey: ["/api/users", DEMO_USER_ID, "favorites", eventId, "check"],
    enabled: false,
  });

  const [isSaved, setIsSaved] = useState(false);

  const toggleFavoriteMutation = useMutation({
    mutationFn: async () => {
      if (isSaved) {
        await apiRequest("DELETE", `/api/users/${DEMO_USER_ID}/favorites/${eventId}`);
      } else {
        await apiRequest("POST", `/api/users/${DEMO_USER_ID}/favorites`, { eventId });
      }
    },
    onSuccess: () => {
      setIsSaved(!isSaved);
      queryClient.invalidateQueries({ queryKey: ["/api/users", DEMO_USER_ID, "favorites"] });
    },
  });

  const handleSave = () => {
    toggleFavoriteMutation.mutate();
  };

  if (isLoading || !event) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.backgroundRoot }]}>
        <ActivityIndicator size="large" color={Colors.dark.primary} />
      </View>
    );
  }

  const attendeeNames = ["Maria", "Pedro", "Ana", "Carlos", "Julia"];
  const totalAttendees = event.attendeesCount || 0;

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{
          paddingBottom: 100 + insets.bottom,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroImage}>
          <LinearGradient
            colors={[Colors.dark.primary, Colors.dark.secondary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.8)"]}
            style={[StyleSheet.absoluteFill, { top: "40%" }]}
          />
          <View style={styles.heroContent}>
            <View style={styles.heroOverlay}>
              <Pressable
                style={({ pressed }) => [
                  styles.actionButton,
                  pressed && styles.pressed,
                ]}
                onPress={handleSave}
              >
                <Feather
                  name="bookmark"
                  size={24}
                  color={isSaved ? Colors.dark.primary : "#FFF"}
                />
              </Pressable>
              <Pressable
                style={({ pressed }) => [
                  styles.actionButton,
                  pressed && styles.pressed,
                ]}
              >
                <Feather name="share" size={24} color="#FFF" />
              </Pressable>
            </View>
            <ThemedText type="h2" style={styles.heroTitle}>
              {event.title}
            </ThemedText>
          </View>
        </View>

        <View style={styles.content}>
          <View
            style={[
              styles.ticketCard,
              { backgroundColor: theme.backgroundDefault },
            ]}
          >
            <View style={styles.ticketInfo}>
              <ThemedText style={styles.ticketLabel}>Ingresso</ThemedText>
              <ThemedText type="h3" style={styles.ticketPrice}>
                {event.price || "Gratis"}
              </ThemedText>
            </View>
            <Button style={styles.ticketButton} onPress={() => {}}>
              Comprar
            </Button>
          </View>

          <View style={styles.section}>
            <InfoRow
              icon="calendar"
              title={event.date}
              subtitle={`${event.time}${event.endTime ? ` - ${event.endTime}` : ""}`}
            />
            <InfoRow
              icon="map-pin"
              title={event.venueName || "Local a definir"}
              subtitle={event.address || undefined}
            />
          </View>

          {event.description ? (
            <View style={styles.section}>
              <ThemedText type="h4" style={styles.sectionTitle}>
                Sobre o Evento
              </ThemedText>
              <ThemedText style={styles.description}>
                {event.description}
              </ThemedText>
            </View>
          ) : null}

          <View style={styles.section}>
            <ThemedText type="h4" style={styles.sectionTitle}>
              Quem vai
            </ThemedText>
            <View style={styles.attendeesRow}>
              <View style={styles.attendeesList}>
                {attendeeNames.slice(0, 5).map((name, index) => (
                  <AttendeeAvatar
                    key={name}
                    name={name}
                    index={index}
                  />
                ))}
              </View>
              <ThemedText style={styles.attendeesCount}>
                {totalAttendees > 5 ? `+${totalAttendees - 5} confirmados` : `${totalAttendees} confirmados`}
              </ThemedText>
            </View>
          </View>

          <View style={styles.section}>
            <ThemedText type="h4" style={styles.sectionTitle}>
              Localizacao
            </ThemedText>
            <View
              style={[
                styles.mapPlaceholder,
                { backgroundColor: theme.backgroundDefault },
              ]}
            >
              <Feather name="map" size={32} color={Colors.dark.textSecondary} />
              <ThemedText style={styles.mapText}>
                {event.venueName || "Local a definir"}
              </ThemedText>
              <ThemedText style={styles.mapAddress}>{event.address}</ThemedText>
            </View>
          </View>
        </View>
      </ScrollView>

      <View
        style={[
          styles.floatingCta,
          {
            paddingBottom: insets.bottom + Spacing.lg,
            backgroundColor: theme.backgroundRoot,
          },
        ]}
      >
        <LinearGradient
          colors={["transparent", theme.backgroundRoot]}
          style={styles.floatingGradient}
        />
        <Button style={styles.ctaButton} onPress={() => {}}>
          Garantir Meu Ingresso
        </Button>
      </View>
    </View>
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
  scrollView: {
    flex: 1,
  },
  heroImage: {
    height: 280,
    justifyContent: "flex-end",
  },
  heroContent: {
    padding: Spacing.lg,
  },
  heroOverlay: {
    position: "absolute",
    top: Spacing.lg,
    right: Spacing.lg,
    flexDirection: "row",
    gap: Spacing.md,
  },
  actionButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  heroTitle: {
    color: "#FFF",
    marginTop: Spacing.xl,
  },
  pressed: {
    opacity: 0.8,
  },
  content: {
    padding: Spacing.lg,
  },
  ticketCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.xl,
  },
  ticketInfo: {
    gap: Spacing.xs,
  },
  ticketLabel: {
    fontSize: 12,
    color: Colors.dark.textSecondary,
  },
  ticketPrice: {
    color: Colors.dark.primary,
  },
  ticketButton: {
    paddingHorizontal: Spacing.xl,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    marginBottom: Spacing.md,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  infoIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.dark.primary + "20",
    justifyContent: "center",
    alignItems: "center",
    marginRight: Spacing.md,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "500",
  },
  infoSubtitle: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
    marginTop: 2,
  },
  description: {
    color: Colors.dark.textSecondary,
    lineHeight: 24,
  },
  attendeesRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  attendeesList: {
    flexDirection: "row",
  },
  attendeeAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: Colors.dark.backgroundRoot,
  },
  attendeeInitial: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFF",
  },
  attendeesCount: {
    marginLeft: Spacing.md,
    color: Colors.dark.textSecondary,
    fontSize: 14,
  },
  mapPlaceholder: {
    height: 150,
    borderRadius: BorderRadius.md,
    justifyContent: "center",
    alignItems: "center",
  },
  mapText: {
    fontSize: 16,
    fontWeight: "500",
    marginTop: Spacing.md,
  },
  mapAddress: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
    marginTop: Spacing.xs,
  },
  floatingCta: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
  },
  floatingGradient: {
    position: "absolute",
    top: -40,
    left: 0,
    right: 0,
    height: 40,
  },
  ctaButton: {
    width: "100%",
  },
});
