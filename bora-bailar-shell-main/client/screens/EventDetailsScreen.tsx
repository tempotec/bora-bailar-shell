import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  Pressable,
  Modal,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRoute, useNavigation, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";
import { MyEventsStackParamList } from "@/navigation/MyEventsStackNavigator";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useContext, useEffect } from "react";
import { AuthContext } from "@/contexts/AuthContext";
import { api } from "@/services/api";

type EventDetailsRouteProp = RouteProp<MyEventsStackParamList, "EventDetails">;
type EventDetailsNavigationProp = NativeStackNavigationProp<MyEventsStackParamList, "EventDetails">;

// Mock event details matching the Explore events
const EVENT_DETAILS: Record<string, any> = {
  "1": {
    id: "1",
    title: "QUINTANEJA NO PADANO",
    category: "Muito sertanejo",
    location: "Barra da Tijuca",
    date: "Quinta-feira, 14 de setembro",
    time: "17h00",
    image: require("../../attached_assets/stock_images/ballroom_dancing_cou_a3f721af.jpg"),
    description: "A quinta-feira mais animada do circuito tem hora e local certos! Padano reúne os melhores hits do sertanejo atuais e traz a experiência única que só a Padano oferece!",
    highlights: [
      "DJs e bandas de primeira",
      "Drinks especiais e comidinhas",
      "Pista de dança ampla",
      "Ambiente climatizado e aconchegante",
      "Estrutura completa para sua diversão",
      "Estacionamento no local",
    ],
    tickets: [
      { id: "meia", name: "Meia", price: 50.00 },
      { id: "inteira", name: "Inteira", price: 100.00 },
    ],
  },
  "2": {
    id: "2",
    title: "HAPPY HOUR NO CARIOCA DA GEMA",
    category: "Muito samba",
    location: "Lapa - Centro",
    date: "Sexta-feira, 14 de setembro",
    time: "18h00",
    image: require("../../attached_assets/stock_images/ballroom_dancing_cou_83e25a1a.jpg"),
    description: "O happy hour mais tradicional da Lapa! Venha curtir o melhor do samba de raiz em um dos pontos mais icônicos do Rio de Janeiro.",
    highlights: [
      "Roda de samba ao vivo",
      "Comidas típicas brasileiras",
      "Drinks e caipirinhas artesanais",
      "Ambiente descontraído e acolhedor",
      "Próximo ao metrô",
    ],
    tickets: [
      { id: "meia", name: "Meia", price: 35.00 },
      { id: "inteira", name: "Inteira", price: 70.00 },
    ],
  },
  "3": {
    id: "3",
    title: "MALHAÇÃO COM DANÇA",
    category: "Muito funk",
    location: "Leblon",
    date: "Sábado, 14 de setembro",
    time: "15h00",
    image: require("../../attached_assets/stock_images/ballroom_dancing_cou_4ebc2182.jpg"),
    description: "Combine exercício e diversão! Aula de dança fitness com os melhores DJs de funk carioca.",
    highlights: [
      "Aula com instrutores profissionais",
      "Playlist exclusiva",
      "Sorteio de brindes",
      "Água e frutas incluídas",
    ],
    tickets: [
      { id: "meia", name: "Meia", price: 40.00 },
      { id: "inteira", name: "Inteira", price: 80.00 },
    ],
  },
  "4": {
    id: "4",
    title: "JANTAR DANÇANTE",
    category: "Muito zouk",
    location: "Jacarepaguá",
    date: "Domingo, 14 de setembro",
    time: "19h00",
    image: require("../../attached_assets/stock_images/person_dancing_happi_214e72d0.jpg"),
    description: "Noite especial com jantar completo e pista de dança para curtir o melhor do zouk brasileiro.",
    highlights: [
      "Jantar completo incluído",
      "Show ao vivo",
      "Aula de zouk para iniciantes",
      "Ambiente romântico",
    ],
    tickets: [
      { id: "meia", name: "Meia", price: 75.00 },
      { id: "inteira", name: "Inteira", price: 150.00 },
    ],
  },
  "5": {
    id: "5",
    title: "CAFÉ DA MANHÃ COM MÚSICA",
    category: "Muito samba",
    location: "Tijuca",
    date: "Segunda-feira, 14 de setembro",
    time: "10h00",
    image: require("../../attached_assets/stock_images/ballroom_dancing_cou_7a8e006d.jpg"),
    description: "Comece a semana com energia! Café da manhã completo ao som de música ao vivo.",
    highlights: [
      "Café da manhã completo",
      "Música ao vivo",
      "Ambiente familiar",
    ],
    tickets: [
      { id: "meia", name: "Meia", price: 30.00 },
      { id: "inteira", name: "Inteira", price: 60.00 },
    ],
  },
};

function TicketSelectionModal({
  visible,
  onClose,
  onConfirm,
  tickets
}: {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  tickets: Array<{ id: string; name: string; price: number }>;
}) {
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  const updateQuantity = (ticketId: string, delta: number) => {
    setQuantities(prev => {
      const current = prev[ticketId] || 0;
      const newValue = Math.max(0, current + delta);
      return { ...prev, [ticketId]: newValue };
    });
  };

  const getTotalQuantity = () => {
    return Object.values(quantities).reduce((sum, qty) => sum + qty, 0);
  };

  const handleConfirm = () => {
    const total = getTotalQuantity();
    if (total > 0) {
      onConfirm(); // Call prop
    }
  };


  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Selecione seu ingresso</Text>

          {tickets.map((ticket) => (
            <View key={ticket.id} style={styles.ticketRow}>
              <View style={styles.ticketInfo}>
                <Text style={styles.ticketName}>{ticket.name}</Text>
                <Text style={styles.ticketPrice}>R${ticket.price.toFixed(2)}</Text>
              </View>
              <View style={styles.quantityControls}>
                <Pressable
                  style={styles.quantityButton}
                  onPress={() => updateQuantity(ticket.id, -1)}
                >
                  <Feather name="minus-circle" size={24} color={Colors.dark.text} />
                </Pressable>
                <Text style={styles.quantityText}>{quantities[ticket.id] || 0}</Text>
                <Pressable
                  style={styles.quantityButton}
                  onPress={() => updateQuantity(ticket.id, 1)}
                >
                  <Feather name="plus-circle" size={24} color={Colors.dark.text} />
                </Pressable>
              </View>
            </View>
          ))}

          <Pressable
            style={[styles.confirmButton, getTotalQuantity() === 0 && styles.confirmButtonDisabled]}
            onPress={handleConfirm}
            disabled={getTotalQuantity() === 0}
          >
            <Text style={styles.confirmButtonText}>Selecione o seu ingresso</Text>
          </Pressable>

          <Pressable style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Cancelar</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

export default function EventDetailsScreen() {
  const insets = useSafeAreaInsets();
  const route = useRoute<EventDetailsRouteProp>();
  const navigation = useNavigation<EventDetailsNavigationProp>();
  const [ticketModalVisible, setTicketModalVisible] = useState(false);

  const eventId = route.params?.eventId || "1";
  const event = EVENT_DETAILS[eventId] || EVENT_DETAILS["1"];

  const { isLoggedIn, user } = useContext(AuthContext);
  const queryClient = useQueryClient();
  const userId = user?.id;

  const [isSaved, setIsSaved] = useState(false);

  // Check if saved
  const { data: favorites } = useQuery({
    queryKey: ["favorites", userId],
    queryFn: async () => {
      if (!userId) return [];
      return api.userActions.getFavorites(userId);
    },
    enabled: !!userId,
  });

  useEffect(() => {
    if (favorites) {
      const isFav = favorites.some((f: any) => f.id === eventId);
      setIsSaved(isFav);
    }
  }, [favorites, eventId]);

  // Toggle Favorite
  const toggleFavoriteMutation = useMutation({
    mutationFn: async () => {
      if (!userId) throw new Error("User needed");
      return api.userActions.toggleFavorite(userId, eventId);
    },
    onSuccess: (isFav) => {
      setIsSaved(isFav); // Update local state
      queryClient.invalidateQueries({ queryKey: ["favorites", userId] });
    },
  });

  const handleSave = () => {
    if (!isLoggedIn) {
      (navigation as any).navigate("FaltaPouco");
      return;
    }
    toggleFavoriteMutation.mutate();
  };

  // Attend Event
  const attendMutation = useMutation({
    mutationFn: async () => {
      if (!userId) throw new Error("User needed");
      return api.userActions.attendEvent(userId, eventId);
    },
    onSuccess: () => {
      alert("Presença confirmada com sucesso!");
      setTicketModalVisible(false);
      queryClient.invalidateQueries({ queryKey: ["attending", userId] });
    },
  });

  const handleBuyPress = () => {
    if (!isLoggedIn) {
      (navigation as any).navigate("FaltaPouco");
      return;
    }
    setTicketModalVisible(true);
  };

  const handleConfirmPurchase = () => {
    attendMutation.mutate();
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header with Image */}
        <View style={styles.imageContainer}>
          <Image source={event.image} style={styles.eventImage} resizeMode="cover" />
          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.7)"]}
            style={styles.imageGradient}
          />
          <Pressable
            style={[styles.backButton, { top: insets.top + Spacing.sm }]}
            onPress={() => navigation.goBack()}
          >
            <Feather name="chevron-left" size={28} color="#FFFFFF" />
          </Pressable>
          <Pressable
            style={[styles.favoriteButton, { top: insets.top + Spacing.sm }]}
            onPress={handleSave}
          >
            <Feather
              name="heart"
              size={24}
              color={isSaved ? "#C41E3A" : "#FFFFFF"}
              style={isSaved ? { opacity: 1 } : {}} // Removed invalid fill
            />
          </Pressable>
        </View>

        {/* Event Info */}
        <View style={styles.contentContainer}>
          <Text style={styles.eventTitle}>{event.title}</Text>

          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{event.category}</Text>
          </View>

          <View style={styles.infoRow}>
            <Feather name="calendar" size={16} color={Colors.dark.textSecondary} />
            <Text style={styles.infoText}>{event.date}</Text>
          </View>

          <View style={styles.infoRow}>
            <Feather name="map-pin" size={16} color={Colors.dark.textSecondary} />
            <Text style={styles.infoText}>{event.location}</Text>
          </View>

          <View style={styles.divider} />

          <Text style={styles.sectionTitle}>Descrição do evento</Text>
          <Text style={styles.description}>{event.description}</Text>

          <Text style={styles.sectionTitle}>O que te espera:</Text>
          {event.highlights.map((highlight: string, index: number) => (
            <View key={index} style={styles.highlightRow}>
              <Text style={styles.bulletPoint}>•</Text>
              <Text style={styles.highlightText}>{highlight}</Text>
            </View>
          ))}

          <Pressable
            style={styles.buyButton}
            onPress={handleBuyPress}
          >
            <Text style={styles.buyButtonText}>Comprar ingressos</Text>
          </Pressable>
        </View>
      </ScrollView>

      <TicketSelectionModal
        visible={ticketModalVisible}
        onClose={() => setTicketModalVisible(false)}
        onConfirm={handleConfirmPurchase}
        tickets={event.tickets}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  imageContainer: {
    width: "100%",
    height: 300,
    position: "relative",
  },
  eventImage: {
    width: "100%",
    height: "100%",
  },
  imageGradient: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: "50%",
  },
  backButton: {
    position: "absolute",
    left: Spacing.md,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  favoriteButton: {
    position: "absolute",
    right: Spacing.md,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  contentContainer: {
    padding: Spacing.lg,
  },
  eventTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: Colors.dark.text,
    marginBottom: Spacing.sm,
  },
  categoryBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#FFE5E5",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.md,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#CC0000",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  infoText: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: "#E0E0E0",
    marginVertical: Spacing.lg,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.dark.text,
    marginBottom: Spacing.md,
  },
  description: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
    lineHeight: 20,
    marginBottom: Spacing.xl,
  },
  highlightRow: {
    flexDirection: "row",
    marginBottom: Spacing.sm,
    paddingLeft: Spacing.sm,
  },
  bulletPoint: {
    fontSize: 16,
    color: Colors.dark.brand,
    marginRight: Spacing.sm,
    fontWeight: "700",
  },
  highlightText: {
    flex: 1,
    fontSize: 14,
    color: Colors.dark.text,
    lineHeight: 20,
  },
  buyButton: {
    backgroundColor: "#4CAF50",
    borderRadius: BorderRadius.xl,
    paddingVertical: Spacing.lg,
    alignItems: "center",
    marginTop: Spacing.xl,
    marginBottom: Spacing.xl,
  },
  buyButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    padding: Spacing.xl,
    paddingBottom: Spacing.xl + 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.dark.text,
    textAlign: "center",
    marginBottom: Spacing.xl,
  },
  ticketRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  ticketInfo: {
    flex: 1,
  },
  ticketName: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.dark.text,
    marginBottom: 4,
  },
  ticketPrice: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
  },
  quantityControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  quantityButton: {
    padding: 4,
  },
  quantityText: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.dark.text,
    minWidth: 30,
    textAlign: "center",
  },
  confirmButton: {
    backgroundColor: "#4CAF50",
    borderRadius: BorderRadius.xl,
    paddingVertical: Spacing.lg,
    alignItems: "center",
    marginTop: Spacing.xl,
  },
  confirmButtonDisabled: {
    backgroundColor: "#CCCCCC",
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  closeButton: {
    paddingVertical: Spacing.md,
    alignItems: "center",
    marginTop: Spacing.sm,
  },
  closeButtonText: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
  },
});
