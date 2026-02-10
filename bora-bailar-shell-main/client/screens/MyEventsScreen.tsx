import React, { useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  StatusBar,
  FlatList,
  Modal,
  Text,
  Pressable,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, Colors, BorderRadius } from "@/constants/theme";
import { useContext, useEffect } from "react";
import { AuthContext } from "@/contexts/AuthContext";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { api } from "@/services/api";

// Components
import { EventFeedItem } from "@/components/ExploreComponents";

// Navigation Types
import type { RootStackParamList } from "@/navigation/RootStackNavigator";
import { MyEventsStackParamList } from "@/navigation/MyEventsStackNavigator";

export default function MyEventsScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<MyEventsStackParamList>>();

  const { isLoggedIn, user } = useContext(AuthContext);
  const userId = user?.id;
  const [activeTab, setActiveTab] = useState<"favorites" | "attending">("favorites");

  // Fetch Favorites
  const { data: favorites = [], isLoading: favLoading } = useQuery({
    queryKey: ["favorites", userId],
    queryFn: async () => {
      if (!userId) return [];
      return api.userActions.getFavorites(userId);
    },
    enabled: !!userId,
  });

  // Fetch Attending
  const { data: attending = [], isLoading: attendingLoading } = useQuery({
    queryKey: ["attending", userId],
    queryFn: async () => {
      if (!userId) return [];
      return api.userActions.getAttending(userId);
    },
    enabled: !!userId,
  });

  const displayEvents = activeTab === "favorites" ? favorites : attending;
  const isLoading = activeTab === "favorites" ? favLoading : attendingLoading;

  const handleEventPress = (event: any) => {
    navigation.navigate("EventDetails", { eventId: event.id });
  };

  if (!isLoggedIn) {
    return (
      <View style={[styles.container, { backgroundColor: theme.backgroundRoot, paddingTop: insets.top }]}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.xl }}>
          <Feather name="lock" size={48} color={Colors.dark.textSecondary} />
          <Text style={{ fontSize: 18, fontWeight: '600', color: Colors.dark.text, marginTop: Spacing.lg, textAlign: 'center' }}>
            Entre para ver seus eventos
          </Text>
          <Text style={{ fontSize: 14, color: Colors.dark.textSecondary, marginTop: Spacing.sm, textAlign: 'center', marginBottom: Spacing.xl }}>
            Faça login para salvar favoritos e confirmar presença.
          </Text>
          <Pressable
            style={{ backgroundColor: Colors.dark.brand, paddingVertical: Spacing.md, paddingHorizontal: Spacing.xl * 2, borderRadius: BorderRadius.lg }}
            onPress={() => (navigation as any).navigate("FaltaPouco")}
          >
            <Text style={{ color: '#FFF', fontWeight: '600', fontSize: 16 }}>Entrar / Cadastrar</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <StatusBar barStyle="dark-content" />
      <View style={{ paddingTop: insets.top, backgroundColor: theme.backgroundRoot }} />

      {/* Tabs */}
      <View style={{ flexDirection: 'row', paddingHorizontal: Spacing.lg, marginBottom: Spacing.md }}>
        <Pressable
          onPress={() => setActiveTab("favorites")}
          style={{ marginRight: Spacing.lg, paddingVertical: Spacing.sm, borderBottomWidth: 2, borderBottomColor: activeTab === "favorites" ? Colors.dark.brand : 'transparent' }}
        >
          <Text style={{ fontSize: 16, fontWeight: '600', color: activeTab === "favorites" ? Colors.dark.text : Colors.dark.textSecondary }}>Favoritos</Text>
        </Pressable>
        <Pressable
          onPress={() => setActiveTab("attending")}
          style={{ paddingVertical: Spacing.sm, borderBottomWidth: 2, borderBottomColor: activeTab === "attending" ? Colors.dark.brand : 'transparent' }}
        >
          <Text style={{ fontSize: 16, fontWeight: '600', color: activeTab === "attending" ? Colors.dark.text : Colors.dark.textSecondary }}>Confirmados</Text>
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent]}
      >
        <View style={styles.feedContainer}>
          {isLoading ? (
            <Text style={{ textAlign: 'center', marginTop: Spacing.xl, color: Colors.dark.textSecondary }}>Carregando...</Text>
          ) : displayEvents.length === 0 ? (
            <Text style={{ textAlign: 'center', marginTop: Spacing.xl, color: Colors.dark.textSecondary }}>
              {activeTab === "favorites" ? "Nenhum favorito ainda." : "Nenhum evento confirmado."}
            </Text>
          ) : (
            displayEvents.map((event: any) => (
              <EventFeedItem
                key={event.id}
                event={event}
                onPress={() => handleEventPress(event)}
                onDetails={() => handleEventPress(event)}
              />
            ))
          )}
        </View>

        <View style={{ height: Spacing.xl * 3 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: Spacing.xl,
  },
  sectionContainer: {
    marginBottom: Spacing.xl,
  },
  storiesScroll: {
    paddingHorizontal: Spacing.lg,
  },
  feedContainer: {
    paddingHorizontal: Spacing.lg,
  },
});


