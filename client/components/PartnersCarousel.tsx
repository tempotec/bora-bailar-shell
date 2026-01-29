import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Alert,
  Dimensions,
  Image,
} from "react-native";
import { Feather, MaterialIcons, MaterialCommunityIcons, FontAwesome5 } from "@expo/vector-icons"; // Using available icon sets
import { Colors, Spacing, BorderRadius, Fonts } from "@/constants/theme";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_WIDTH = SCREEN_WIDTH * 0.7; // Card takes up 70% of screen width

interface PartnerType {
  id: string;
  title: string;
  description: string;
  icon: any; // Function returning an icon component
  listHighlight?: boolean;
}

const PARTNER_TYPES: PartnerType[] = [
  {
    id: "1",
    title: "LOCAIS DE DANÇA",
    description: "Sua casa cheia e a galera no ritmo!\n\nTransforme seu estabelecimento no point mais badalado da cidade.\n\nParceria com benefícios exclusivos e visibilidade máxima.",
    icon: () => <MaterialCommunityIcons name="music-box" size={32} color={Colors.dark.text} />,
    listHighlight: true,
  },
  {
    id: "2",
    title: "RESTAURANTES,\nCLUBES E AFINS",
    description: "Do sabor ao ritmo, tudo num lugar!\nSeja um destino completo: boa comida e pista de dança.\n\nAlavanque seu negócio com nosso selo de qualidade.",
    icon: () => <MaterialIcons name="storefront" size={32} color={Colors.dark.text} />,
    listHighlight: true,
  },
  {
    id: "3",
    title: "PROFESSOR DE DANÇA\nE ENTERTAINERS",
    description: "Ensine, performe e cresça com a gente.\n\nSua paixão pela dança, agora é sua carreira!",
    icon: () => <FontAwesome5 name="chalkboard-teacher" size={28} color={Colors.dark.text} />,
    listHighlight: true,
  },
  {
    id: "4",
    title: "PROMOTERS",
    description: "Divulgue os melhores eventos e ganhe com isso.\n\nSeja a ponte entre a festa e a diversão.",
    icon: () => <Feather name="mic" size={32} color={Colors.dark.text} />,
    listHighlight: true,
  },
  {
    id: "5",
    title: "ESCOLAS DE DANÇA",
    description: "Seu estúdio, nosso palco!\n\nConecte-se a uma rede de apaixonados por dança.\n\nVamos juntos formar a próxima geração de estrelas!",
    icon: () => <FontAwesome5 name="users" size={28} color={Colors.dark.text} />,
    listHighlight: true,
  },
  {
    id: "6",
    title: "EVENTOS",
    description: "Organize, divulgue e lote seus eventos com a gente.",
    icon: () => <MaterialIcons name="event" size={32} color={Colors.dark.text} />,
    listHighlight: true,
  },
  {
    id: "7",
    title: "FRANCHISING",
    description: "Leve o BoraBailar para sua cidade.\n\nSeja dono do seu próprio negócio no mundo da dança.",
    icon: () => <MaterialCommunityIcons name="briefcase-outline" size={32} color={Colors.dark.text} />,
    listHighlight: true,
  },
];

function PartnerCard({ item, onPress }: { item: PartnerType; onPress: () => void }) {
  return (
    <View style={styles.cardWrapper}>
      {/* Icon positioned above the card */}
      <View style={styles.iconContainer}>
        <View style={styles.iconCircle}>
          {item.icon()}
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>{item.title}</Text>

        <Text style={styles.cardDescription}>
          {item.description}
        </Text>

        <Pressable
          style={({ pressed }) => [
            styles.button,
            pressed && { opacity: 0.9 },
          ]}
          onPress={onPress}
        >
          <Text style={styles.buttonText}>Quero ser parceiro</Text>
        </Pressable>
      </View>
    </View>
  );
}

export function PartnersCarousel() {
  const scrollViewRef = useRef<ScrollView>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const AUTO_SCROLL_INTERVAL = 4000; // 4 seconds

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % PARTNER_TYPES.length;

        // Scroll to next card
        scrollViewRef.current?.scrollTo({
          x: nextIndex * (CARD_WIDTH + Spacing.md),
          animated: true,
        });

        return nextIndex;
      });
    }, AUTO_SCROLL_INTERVAL);

    return () => clearInterval(interval);
  }, []);

  const handlePress = () => {
    Alert.alert(
      "Em desenvolvimento",
      "O formulário de parceria estará disponível em breve!",
      [{ text: "OK" }]
    );
  };

  const scrollToCard = (index: number) => {
    scrollViewRef.current?.scrollTo({
      x: index * (CARD_WIDTH + Spacing.md),
      animated: true,
    });
    setCurrentIndex(index);
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>
          Quer se tornar parceiro do{" "}
          <Text style={styles.brandRed}>BORABAILAR</Text>?
        </Text>

        <View style={styles.subHeaderAndImage}>
          <View style={styles.textColumn}>
            <Text style={styles.subHeader}>
              Faça agora o seu cadastro e comece o quanto antes.
            </Text>

            <Text style={styles.listTitle}>
              Escolha qual parceria combina com você:
            </Text>

            <View style={styles.listContainer}>
              <View style={styles.listColumn}>
                {PARTNER_TYPES.slice(0, 3).map((item, index) => (
                  <Pressable
                    key={item.id}
                    onPress={() => scrollToCard(index)}
                    style={({ pressed }) => pressed && { opacity: 0.7 }}
                  >
                    <Text style={[styles.listItem, item.listHighlight && styles.listItemHighlight]}>
                      • {item.title.replace("\n", " ")}
                    </Text>
                  </Pressable>
                ))}
              </View>
              <View style={styles.listColumn}>
                {PARTNER_TYPES.slice(3).map((item, index) => (
                  <Pressable
                    key={item.id}
                    onPress={() => scrollToCard(index + 3)}
                    style={({ pressed }) => pressed && { opacity: 0.7 }}
                  >
                    <Text style={[styles.listItem, item.listHighlight && styles.listItemHighlight]}>
                      • {item.title.replace("\n", " ")}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          </View>

          {/* Simple illustration of dancing couple - using a placeholder or icon if image not available */}
          {/* Ideally we would use the image from the screenshot if we had it as an asset */}

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
        {PARTNER_TYPES.map((item) => (
          <PartnerCard key={item.id} item={item} onPress={handlePress} />
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
