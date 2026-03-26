import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Alert,
  Dimensions,
  Image,
  Linking,
} from "react-native";
import { Feather, MaterialIcons, MaterialCommunityIcons, FontAwesome5 } from "@expo/vector-icons";
import { Colors, Spacing, BorderRadius, Fonts } from "@/constants/theme";
import type { PartnerCard } from "@/services/realApi";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_WIDTH = SCREEN_WIDTH * 0.7;

// Hardcoded fallback data (used when API fails)
const FALLBACK_PARTNER_TYPES: PartnerCard[] = [
  {
    id: 1,
    categoryKey: "dance_venues",
    categoryLabel: "Locais de Dança",
    order: 1,
    icon: { type: "emoji", value: "🎵" },
    title: "LOCAIS DE DANÇA",
    shortDescription: "Sua casa cheia e a galera no ritmo!",
    mainText: "Transforme seu estabelecimento no point mais badalado da cidade.",
    finalCall: "Parceria com benefícios exclusivos e visibilidade máxima.",
    buttonText: "Quero ser parceiro",
    buttonLink: "",
    isActive: true,
  },
  {
    id: 2,
    categoryKey: "restaurants",
    categoryLabel: "Restaurantes",
    order: 2,
    icon: { type: "emoji", value: "🍽️" },
    title: "RESTAURANTES, CLUBES E AFINS",
    shortDescription: "Do sabor ao ritmo, tudo num lugar!",
    mainText: "Seja um destino completo: boa comida e pista de dança.",
    finalCall: "Alavanque seu negócio com nosso selo de qualidade.",
    buttonText: "Quero ser parceiro",
    buttonLink: "",
    isActive: true,
  },
  {
    id: 3,
    categoryKey: "teachers",
    categoryLabel: "Professores",
    order: 3,
    icon: { type: "emoji", value: "👨‍🏫" },
    title: "PROFESSOR DE DANÇA E ENTERTAINERS",
    shortDescription: "Ensine, performe e cresça com a gente.",
    mainText: "Sua paixão pela dança, agora é sua carreira!",
    finalCall: "",
    buttonText: "Quero ser parceiro",
    buttonLink: "",
    isActive: true,
  },
  {
    id: 4,
    categoryKey: "promoters",
    categoryLabel: "Promoters",
    order: 4,
    icon: { type: "emoji", value: "🎤" },
    title: "PROMOTERS",
    shortDescription: "Divulgue os melhores eventos e ganhe com isso.",
    mainText: "Seja a ponte entre a festa e a diversão.",
    finalCall: "",
    buttonText: "Quero ser parceiro",
    buttonLink: "",
    isActive: true,
  },
  {
    id: 5,
    categoryKey: "schools",
    categoryLabel: "Escolas",
    order: 5,
    icon: { type: "emoji", value: "🏫" },
    title: "ESCOLAS DE DANÇA",
    shortDescription: "Seu estúdio, nosso palco!",
    mainText: "Conecte-se a uma rede de apaixonados por dança.",
    finalCall: "Vamos juntos formar a próxima geração de estrelas!",
    buttonText: "Quero ser parceiro",
    buttonLink: "",
    isActive: true,
  },
  {
    id: 6,
    categoryKey: "events",
    categoryLabel: "Eventos",
    order: 6,
    icon: { type: "emoji", value: "📅" },
    title: "EVENTOS",
    shortDescription: "Organize, divulgue e lote seus eventos com a gente.",
    mainText: "",
    finalCall: "",
    buttonText: "Quero ser parceiro",
    buttonLink: "",
    isActive: true,
  },
  {
    id: 7,
    categoryKey: "franchising",
    categoryLabel: "Franchising",
    order: 7,
    icon: { type: "emoji", value: "💼" },
    title: "FRANCHISING",
    shortDescription: "Leve o BoraBailar para sua cidade.",
    mainText: "Seja dono do seu próprio negócio no mundo da dança.",
    finalCall: "",
    buttonText: "Quero ser parceiro",
    buttonLink: "",
    isActive: true,
  },
];

// Build description from multiple fields, avoiding extra newlines
function buildDescription(card: PartnerCard): string {
  const parts = [
    card.shortDescription?.trim(),
    card.mainText?.trim(),
    card.finalCall?.trim(),
  ].filter(Boolean);
  return parts.join("\n\n");
}

// Render icon based on type (emoji or URL)
function PartnerIcon({ icon }: { icon: PartnerCard["icon"] }) {
  const [imageError, setImageError] = useState(false);

  if (icon.type === "url" && icon.value && !imageError) {
    return (
      <Image
        source={{ uri: icon.value }}
        style={{ width: 32, height: 32, borderRadius: 4 }}
        resizeMode="contain"
        onError={() => setImageError(true)}
      />
    );
  }

  // Fallback to emoji or default
  return (
    <Text style={{ fontSize: 28 }}>
      {icon.value || "🎯"}
    </Text>
  );
}

function PartnerCardItem({
  item,
  onPress,
}: {
  item: PartnerCard;
  onPress: (buttonLink: string) => void;
}) {
  const description = buildDescription(item);

  return (
    <View style={styles.cardWrapper}>
      {/* Icon positioned above the card */}
      <View style={styles.iconContainer}>
        <View style={styles.iconCircle}>
          <PartnerIcon icon={item.icon} />
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>{item.title}</Text>

        <Text style={styles.cardDescription}>{description}</Text>

        <Pressable
          style={({ pressed }) => [
            styles.button,
            pressed && { opacity: 0.9 },
          ]}
          onPress={() => onPress(item.buttonLink)}
        >
          <Text style={styles.buttonText}>{item.buttonText || "Quero ser parceiro"}</Text>
        </Pressable>
      </View>
    </View>
  );
}

interface PartnersCarouselProps {
  partnerCards?: PartnerCard[];
  homeTexts?: Record<string, string>;
}

export function PartnersCarousel({ partnerCards, homeTexts }: PartnersCarouselProps) {
  const scrollViewRef = useRef<ScrollView>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const AUTO_SCROLL_INTERVAL = 4000; // 4 seconds

  // Use passed cards or fallback
  const cards = partnerCards && partnerCards.length > 0
    ? partnerCards
    : FALLBACK_PARTNER_TYPES;

  const cardsLengthRef = useRef(cards.length);

  // Update ref when cards change
  useEffect(() => {
    cardsLengthRef.current = cards.length;
    // Reset index if it exceeds new length
    if (currentIndex >= cards.length) {
      setCurrentIndex(0);
    }
  }, [cards.length, currentIndex]);

  // Auto-scroll with dynamic length awareness
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % cardsLengthRef.current;

        scrollViewRef.current?.scrollTo({
          x: nextIndex * (CARD_WIDTH + Spacing.md),
          animated: true,
        });

        return nextIndex;
      });
    }, AUTO_SCROLL_INTERVAL);

    return () => clearInterval(interval);
  }, []);

  // Handle button press with Linking + error handling
  const handlePress = useCallback(async (buttonLink: string) => {
    if (!buttonLink || !buttonLink.trim()) {
      Alert.alert(
        "Em desenvolvimento",
        "O formulário de parceria estará disponível em breve!",
        [{ text: "OK" }]
      );
      return;
    }

    try {
      const canOpen = await Linking.canOpenURL(buttonLink);
      if (canOpen) {
        await Linking.openURL(buttonLink);
      } else {
        Alert.alert(
          "Não foi possível abrir",
          "O link não é suportado neste dispositivo.",
          [{ text: "OK" }]
        );
      }
    } catch (error) {
      console.warn("[PartnersCarousel] Failed to open URL:", error);
      Alert.alert(
        "Erro",
        "Não foi possível abrir o link. Tente novamente.",
        [{ text: "OK" }]
      );
    }
  }, []);

  const scrollToCard = useCallback((index: number) => {
    scrollViewRef.current?.scrollTo({
      x: index * (CARD_WIDTH + Spacing.md),
      animated: true,
    });
    setCurrentIndex(index);
  }, []);

  // Split cards for two-column list display
  const firstColumnCards = cards.slice(0, Math.ceil(cards.length / 2));
  const secondColumnCards = cards.slice(Math.ceil(cards.length / 2));

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>
          {homeTexts?.partner_cta_title ?? 'Seja um Parceiro BoraBailar'}
        </Text>

        <View style={styles.subHeaderAndImage}>
          <View style={styles.textColumn}>
            <Text style={styles.subHeader}>
              {homeTexts?.partner_cta_subtitle ?? 'Faça agora o seu cadastro e comece o quanto antes.'}
            </Text>

            <Text style={styles.listTitle}>
              {homeTexts?.partner_categories_title ?? 'Escolha o Seu Tipo de Parceria:'}
            </Text>

            <View style={styles.listContainer}>
              <View style={styles.listColumn}>
                {firstColumnCards.map((item: PartnerCard, index: number) => (
                  <Pressable
                    key={item.id}
                    onPress={() => scrollToCard(index)}
                    style={({ pressed }) => pressed && { opacity: 0.7 }}
                  >
                    <Text style={[styles.listItem, styles.listItemHighlight]}>
                      • {item.title.replace(/\n/g, " ")}
                    </Text>
                  </Pressable>
                ))}
              </View>
              <View style={styles.listColumn}>
                {secondColumnCards.map((item: PartnerCard, index: number) => (
                  <Pressable
                    key={item.id}
                    onPress={() => scrollToCard(firstColumnCards.length + index)}
                    style={({ pressed }) => pressed && { opacity: 0.7 }}
                  >
                    <Text style={[styles.listItem, styles.listItemHighlight]}>
                      • {item.title.replace(/\n/g, " ")}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          </View>
        </View>
      </View>

      <ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        decelerationRate="fast"
        snapToInterval={CARD_WIDTH + Spacing.md}
        snapToAlignment="start"
      >
        {cards.map((item: PartnerCard) => (
          <PartnerCardItem key={item.id} item={item} onPress={handlePress} />
        ))}
      </ScrollView>

      <View style={styles.scrollIndicator}>
        <Text style={styles.scrollText}>Arraste para o lado para ver mais opções</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: Spacing.xl + Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  headerContainer: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.dark.text,
    marginBottom: Spacing.md,
    lineHeight: 28,
  },
  brandRed: {
    color: Colors.dark.brand,
  },
  subHeaderAndImage: {
    flexDirection: 'row',
  },
  textColumn: {
    flex: 1,
  },
  subHeader: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
    marginBottom: Spacing.lg,
    lineHeight: 20,
  },
  listTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: Colors.dark.text,
    marginBottom: Spacing.sm,
  },
  listContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  listColumn: {
    width: '50%',
  },
  listItem: {
    fontSize: 11,
    color: Colors.dark.textSecondary,
    marginBottom: 2,
    lineHeight: 16,
  },
  listItemHighlight: {
    color: Colors.dark.brand,
    fontWeight: "600",
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: 32, // Space for floating icon (half of icon height)
    gap: Spacing.md,
  },
  cardWrapper: {
    width: CARD_WIDTH,
    alignItems: "center",
    marginTop: 32, // Push card down to make room for icon
  },
  card: {
    width: "100%",
    backgroundColor: "#F2DEDE",
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    paddingTop: Spacing.xl + 20, // Extra top padding for icon overlap
    alignItems: "center",
  },
  iconContainer: {
    position: "absolute",
    top: -32, // Position icon above the card (half of icon height)
    zIndex: 10,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: Colors.dark.brand,
    alignItems: "center",
    justifyContent: "center",
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: Colors.dark.text,
    textAlign: "center",
    marginBottom: Spacing.md,
    textTransform: "uppercase",
  },
  cardDescription: {
    fontSize: 13,
    color: Colors.dark.text,
    textAlign: "center",
    marginBottom: Spacing.xl,
    lineHeight: 18,
  },
  button: {
    backgroundColor: "#C41E3A", // Darker red
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.xl,
    width: "100%",
    alignItems: "center",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  scrollIndicator: {
    alignItems: 'center',
    marginTop: Spacing.md,
  },
  scrollText: {
    fontSize: 10,
    color: Colors.dark.textSecondary,
  }
});
