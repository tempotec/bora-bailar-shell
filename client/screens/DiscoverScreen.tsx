import React, { useState, useCallback, useRef, useMemo } from "react";
import {
  View,
  StyleSheet,
  Pressable,
  Image,
  Text,
  Dimensions,
  LayoutChangeEvent,
  Platform,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { Feather } from "@expo/vector-icons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedScrollHandler,
  interpolate,
  Extrapolation,
  runOnJS,
} from "react-native-reanimated";

import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Colors, Fonts } from "@/constants/theme";
import { useTabBar } from "@/contexts/TabBarContext";
import { 
  OndeModal, 
  QuandoModal, 
  ComQuemModal,
  CITIES,
  DATE_OPTIONS,
  COMPANION_OPTIONS,
} from "@/components/SearchModals";

const logoImage = require("../../attached_assets/WhatsApp_Image_2025-12-09_at_11.41.04-removebg-preview_1765394422474.png");

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_WIDTH = (SCREEN_WIDTH - Spacing.lg * 3) / 2;
const SCROLL_THRESHOLD = 100;

const VIDEO_STORIES_DATA = [
  {
    id: "1",
    title: "Dançando com Julia",
    username: "@Alanzinho",
    thumbnail: require("../../attached_assets/stock_images/person_dancing_happi_798bff4b.jpg"),
  },
  {
    id: "2",
    title: "Leve como uma folha",
    username: "@Ivete22",
    thumbnail: require("../../attached_assets/stock_images/person_dancing_happi_214e72d0.jpg"),
  },
  {
    id: "3",
    title: "Na rua é mais legal",
    username: "@LuizaLulu",
    thumbnail: require("../../attached_assets/stock_images/person_dancing_happi_8c1c5cba.jpg"),
  },
  {
    id: "4",
    title: "Ritmo do coração",
    username: "@MarceloDance",
    thumbnail: require("../../attached_assets/stock_images/person_dancing_happi_0e460040.jpg"),
  },
  {
    id: "5",
    title: "Noite de salsa",
    username: "@AnaForró",
    thumbnail: require("../../attached_assets/stock_images/person_dancing_happi_24afcbbe.jpg"),
  },
  {
    id: "6",
    title: "Alegria pura",
    username: "@PedroSamba",
    thumbnail: require("../../attached_assets/stock_images/person_dancing_happi_dbae0db5.jpg"),
  },
];

const DESTAQUE_MES_DATA = {
  title: "Destaque do mês",
  thumbnail: require("../../attached_assets/stock_images/person_dancing_happi_798bff4b.jpg"),
};

const TOP_DANCE_AWARDS_DATA = [
  {
    id: "1",
    category: "Categoria 1",
    title: "O que vale é animação",
    thumbnail: require("../../attached_assets/stock_images/person_dancing_happi_798bff4b.jpg"),
  },
  {
    id: "2",
    category: "Categoria 2",
    title: "Baladas badaladas",
    thumbnail: require("../../attached_assets/stock_images/ballroom_dancing_cou_a3f721af.jpg"),
  },
  {
    id: "3",
    category: "Categoria 3",
    title: "Aiquibão a dança de salão",
    thumbnail: require("../../attached_assets/stock_images/ballroom_dancing_cou_83e25a1a.jpg"),
  },
  {
    id: "4",
    category: "Categoria 4",
    title: "É samba no pé",
    thumbnail: require("../../attached_assets/stock_images/person_dancing_happi_214e72d0.jpg"),
  },
  {
    id: "5",
    category: "Categoria 5",
    title: "Famosos no BoraBailar",
    highlightWord: "BoraBailar",
    thumbnail: require("../../attached_assets/stock_images/ballroom_dancing_cou_4ebc2182.jpg"),
  },
  {
    id: "6",
    category: "Categoria 6",
    title: "Forró pé de serra",
    thumbnail: require("../../attached_assets/stock_images/person_dancing_happi_8c1c5cba.jpg"),
  },
  {
    id: "7",
    category: "Categoria 7",
    title: "Zouk love",
    thumbnail: require("../../attached_assets/stock_images/ballroom_dancing_cou_476ab99c.jpg"),
  },
  {
    id: "8",
    category: "Categoria 8",
    title: "Bachata sensual",
    thumbnail: require("../../attached_assets/stock_images/person_dancing_happi_0e460040.jpg"),
  },
  {
    id: "9",
    category: "Categoria 9",
    title: "Tango argentino",
    thumbnail: require("../../attached_assets/stock_images/ballroom_dancing_cou_7a8e006d.jpg"),
  },
  {
    id: "10",
    category: "Categoria 10",
    title: "Danças urbanas",
    thumbnail: require("../../attached_assets/stock_images/person_dancing_happi_24afcbbe.jpg"),
  },
];

const QUERER_DATA = [
  {
    id: "1",
    title: "SAIR PARA\nDANÇAR",
    description: "sair pra dançar e me divertir com alguém que tenha a ver comigo, mas sem compromissos.",
    image: "https://images.unsplash.com/photo-1504609813442-a8924e83f76e?w=400&h=300&fit=crop",
  },
  {
    id: "2",
    title: "SAIR EM\nGRUPO",
    description: "sair em grupo para dançar e conhecer gente educada e simpática que gosta do que eu gosto.",
    image: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=400&h=300&fit=crop",
  },
  {
    id: "3",
    title: "MELHORES\nBALADAS",
    description: "sair em grupo para dançar e conhecer gente educada e simpática que gosta do que eu gosto.",
    image: "https://images.unsplash.com/photo-1566737236500-c8ac43014a67?w=400&h=300&fit=crop",
  },
  {
    id: "4",
    title: "GENTE\nPROFISSA",
    description: "conhecer profissionais que sejam boa companhia e me levem para dançar.",
    image: "https://images.unsplash.com/photo-1545959570-a94084071b5d?w=400&h=300&fit=crop",
  },
  {
    id: "5",
    title: "ESCOLAS\nDE DANÇA",
    description: "conhecer profissionais que sejam boa companhia e me levem para dançar.",
    image: "https://images.unsplash.com/photo-1508700929628-666bc8bd84ea?w=400&h=300&fit=crop",
  },
  {
    id: "6",
    title: "ESCOLHA\nSUA TRIBO",
    description: "participar de comunidades de gente que ama dançar e se divertir de forma sadia e feliz.",
    image: "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=400&h=300&fit=crop",
  },
  {
    id: "7",
    title: "BORABAILAR\nTOP 10",
    description: "poder receber e mandar conteúdo para votar e ser votado no BB TOP 10 AWARD",
    image: "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400&h=300&fit=crop",
  },
  {
    id: "8",
    title: "FULL\nEXPERIENCE",
    description: "participar de eventos integrados de DANÇA, GASTRONOMIA e CONFRATERNIZAÇÃO.",
    image: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=400&h=300&fit=crop",
  },
];

const getDicasDaSemanaData = () => {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(today);
  monday.setDate(today.getDate() + mondayOffset);

  const daysOfWeek = [
    "Segunda-feira",
    "Terça-feira", 
    "Quarta-feira",
    "Quinta-feira",
    "Sexta-feira",
    "Sábado",
    "Domingo",
  ];

  const dicasPorDia = [
    [
      { title: "Café da manhã com música", price: "R$20" },
      { title: "Almoço gostoso na Lapa", price: "R$0" },
      { title: "Sarau no Centro da Cidade", price: "R$0" },
    ],
    [
      { title: "Aula de forró", price: "R$30" },
      { title: "Happy hour dançante", price: "R$25" },
      { title: "Noite de samba", price: "R$15" },
    ],
    [
      { title: "Workshop de salsa", price: "R$40" },
      { title: "Tarde de bolero", price: "R$10" },
      { title: "Baile de quarta", price: "R$20" },
    ],
    [
      { title: "Zouk na praça", price: "R$0" },
      { title: "Jantar com show", price: "R$80" },
      { title: "Roda de samba", price: "R$15" },
    ],
    [
      { title: "Sexta social", price: "R$35" },
      { title: "Balada latina", price: "R$50" },
      { title: "Forró pé de serra", price: "R$25" },
    ],
    [
      { title: "Matinê dançante", price: "R$20" },
      { title: "Festival de dança", price: "R$60" },
      { title: "Noitada especial", price: "R$45" },
    ],
    [
      { title: "Brunch com música", price: "R$55" },
      { title: "Tarde de tango", price: "R$30" },
      { title: "Sunset dance", price: "R$25" },
    ],
  ];

  return daysOfWeek.slice(0, 7).map((day, index) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + index);
    const formattedDate = `${String(date.getDate()).padStart(2, "0")}/${String(date.getMonth() + 1).padStart(2, "0")}`;
    
    return {
      id: String(index + 1),
      day,
      date: formattedDate,
      dicas: dicasPorDia[index],
    };
  });
};

const DICAS_DA_SEMANA_DATA = getDicasDaSemanaData();

const RECOMENDACOES_ESPECIAIS_DATA = [
  {
    id: "1",
    title: "Festa de Halloween",
    price: "R$50",
    discount: "40% OFF",
    image: "https://images.unsplash.com/photo-1504196606672-aef5c9cefc92?w=300&h=200&fit=crop",
  },
  {
    id: "2",
    title: "Festival de dança RJ",
    price: "R$100",
    discount: "20% OFF",
    image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&h=200&fit=crop",
  },
  {
    id: "3",
    title: "Noite de Salsa",
    price: "R$35",
    discount: "30% OFF",
    image: "https://images.unsplash.com/photo-1545959570-a94084071b5d?w=300&h=200&fit=crop",
  },
  {
    id: "4",
    title: "Baile Tropical",
    price: "R$60",
    discount: "25% OFF",
    image: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=300&h=200&fit=crop",
  },
  {
    id: "5",
    title: "Workshop Forró",
    price: "R$80",
    discount: "15% OFF",
    image: "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=300&h=200&fit=crop",
  },
  {
    id: "6",
    title: "Pagode da Cidade",
    price: "R$45",
    discount: "50% OFF",
    image: "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=300&h=200&fit=crop",
  },
];

const OFERTA_CARD_WIDTH = 150;
const OFERTA_CARD_HEIGHT = 120;

function OfertaEspecialCard({
  title,
  price,
  discount,
  image,
  onPress,
  onFavorite,
}: {
  title: string;
  price: string;
  discount: string;
  image: string;
  onPress?: () => void;
  onFavorite?: () => void;
}) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.ofertaCard,
        pressed && { opacity: 0.9 },
      ]}
      onPress={onPress}
    >
      <View style={styles.ofertaImageContainer}>
        <Image source={{ uri: image }} style={styles.ofertaImage} resizeMode="cover" />
        <View style={styles.ofertaDiscountBadge}>
          <Text style={styles.ofertaDiscountText}>{discount}</Text>
        </View>
        <Pressable 
          style={styles.ofertaHeartButton} 
          onPress={onFavorite}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Feather name="heart" size={14} color="#FFFFFF" />
        </Pressable>
      </View>
      <Text style={styles.ofertaTitle} numberOfLines={1}>{title}</Text>
      <Text style={styles.ofertaPrice}>A partir de {price}</Text>
    </Pressable>
  );
}

const VIDEO_STORY_WIDTH = 100;
const VIDEO_STORY_HEIGHT = 140;

function VideoStoryCard({
  title,
  username,
  thumbnail,
  onPress,
}: {
  title: string;
  username: string;
  thumbnail: any;
  onPress?: () => void;
}) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.videoStoryCard,
        pressed && { opacity: 0.8 },
      ]}
      onPress={onPress}
    >
      <View style={styles.videoStoryImageContainer}>
        <Image source={thumbnail} style={styles.videoStoryImage} resizeMode="cover" />
        <View style={styles.videoStoryPlayIcon}>
          <Feather name="play" size={16} color="#FFFFFF" />
        </View>
      </View>
      <Text style={styles.videoStoryTitle} numberOfLines={2}>{title}</Text>
      <Text style={styles.videoStoryUsername}>{username}</Text>
    </Pressable>
  );
}

function UploadButton({ onPress }: { onPress?: () => void }) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.uploadButton,
        pressed && { opacity: 0.9 },
      ]}
      onPress={onPress}
    >
      <Text style={styles.uploadButtonText}>Faça upload do seu vídeo</Text>
    </Pressable>
  );
}

function DestaqueDoMes({ thumbnail, onPress }: { thumbnail: any; onPress?: () => void }) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.destaqueMesCard,
        pressed && { opacity: 0.9 },
      ]}
      onPress={onPress}
    >
      <Image source={thumbnail} style={styles.destaqueMesImage} resizeMode="cover" />
      <View style={styles.destaqueMesPlayOverlay}>
        <View style={styles.destaqueMesPlayButton}>
          <Feather name="play" size={32} color="#FFFFFF" />
        </View>
      </View>
    </Pressable>
  );
}

function AwardCategoryCard({
  category,
  title,
  thumbnail,
  highlightWord,
  onPress,
}: {
  category: string;
  title: string;
  thumbnail: any;
  highlightWord?: string;
  onPress?: () => void;
}) {
  const renderTitle = () => {
    if (highlightWord && title.includes(highlightWord)) {
      const parts = title.split(highlightWord);
      return (
        <Text style={styles.awardCategoryTitle}>
          {parts[0]}
          <Text style={styles.awardCategoryHighlight}>{highlightWord}</Text>
          {parts[1]}
        </Text>
      );
    }
    return <Text style={styles.awardCategoryTitle}>{title}</Text>;
  };

  return (
    <Pressable
      style={({ pressed }) => [
        styles.awardCategoryCard,
        pressed && { opacity: 0.8 },
      ]}
      onPress={onPress}
    >
      <View style={styles.awardCategoryContent}>
        <Text style={styles.awardCategoryNumber}>{category}</Text>
        {renderTitle()}
      </View>
      <Image source={thumbnail} style={styles.awardCategoryThumbnail} resizeMode="cover" />
    </Pressable>
  );
}

function QueroParticiparButton({ onPress }: { onPress?: () => void }) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.queroParticiparButton,
        pressed && { opacity: 0.9 },
      ]}
      onPress={onPress}
    >
      <Text style={styles.queroParticiparButtonText}>Quero Participar</Text>
    </Pressable>
  );
}

const DICA_IMAGES = [
  require("../../attached_assets/stock_images/person_dancing_happi_798bff4b.jpg"),
  require("../../attached_assets/stock_images/ballroom_dancing_cou_a3f721af.jpg"),
  require("../../attached_assets/stock_images/ballroom_dancing_cou_83e25a1a.jpg"),
];

const DICA_EVENT_CARD_WIDTH = 100;

function DicaDaSemanaRow({
  day,
  date,
  dicas,
}: {
  day: string;
  date: string;
  dicas: { title: string; price: string }[];
}) {
  return (
    <View style={styles.dicaDaSemanaRow}>
      <View style={styles.dicaDayHeader}>
        <Text style={styles.dicaDayName}>{day}</Text>
        <Text style={styles.dicaDate}>({date})</Text>
      </View>
      <Animated.ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.dicasEventScrollContainer}
      >
        {dicas.map((dica, index) => (
          <Pressable 
            key={index} 
            style={({ pressed }) => [
              styles.dicaEventCard,
              pressed && { opacity: 0.8 },
            ]}
          >
            <Image 
              source={DICA_IMAGES[index % DICA_IMAGES.length]} 
              style={styles.dicaEventImage} 
              resizeMode="cover"
            />
            <Text style={styles.dicaEventTitle} numberOfLines={2}>{dica.title}</Text>
            <Text style={styles.dicaEventPrice}>
              A partir de {dica.price === "R$0" ? "R$0" : dica.price}
            </Text>
          </Pressable>
        ))}
      </Animated.ScrollView>
    </View>
  );
}

function ChevronUpDownIcon() {
  return (
    <View style={styles.chevronIconContainer}>
      <Feather name="chevron-up" size={14} color={Colors.dark.textSecondary} style={{ marginBottom: -5 }} />
      <Feather name="chevron-down" size={14} color={Colors.dark.textSecondary} style={{ marginTop: -5 }} />
    </View>
  );
}

function MicrophoneIcon() {
  return (
    <View style={styles.micIconContainer}>
      <Feather name="mic" size={18} color="#FFFFFF" />
    </View>
  );
}

function WizardSearchField({
  label,
  type,
  onPress,
  hasValue = false,
}: {
  label: string;
  type: "chevron" | "mic";
  onPress?: () => void;
  hasValue?: boolean;
}) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.wizardField,
        hasValue && styles.wizardFieldSelected,
        pressed && styles.wizardFieldPressed,
      ]}
      onPress={onPress}
    >
      <Text style={[styles.wizardFieldLabel, hasValue && styles.wizardFieldLabelSelected]}>
        {label}
      </Text>
      {type === "chevron" ? <ChevronUpDownIcon /> : <MicrophoneIcon />}
    </Pressable>
  );
}

function CollapsedSearchBar({ onPress }: { onPress?: () => void }) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.collapsedSearchBar,
        pressed && styles.wizardFieldPressed,
      ]}
      onPress={onPress}
    >
      <Feather name="search" size={18} color={Colors.dark.textSecondary} />
      <Text style={styles.collapsedSearchText}>Onde, quando e com quem?</Text>
    </Pressable>
  );
}

function StickyTitle({ title, highlightWords }: { title: string; highlightWords: readonly string[] }) {
  const words = title.split(" ");
  
  return (
    <View style={styles.stickySectionTitleContainer}>
      <Text style={styles.stickySectionTitle}>
        {words.map((word, index) => {
          const isHighlight = highlightWords.some(hw => 
            word.toLowerCase().includes(hw.toLowerCase())
          );
          return (
            <Text key={index}>
              {isHighlight ? (
                <Text style={styles.sectionTitleHighlight}>{word}</Text>
              ) : (
                word
              )}
              {index < words.length - 1 ? " " : ""}
            </Text>
          );
        })}
      </Text>
    </View>
  );
}

function QuererCard({
  title,
  description,
  image,
  onPress,
  onFavorite,
}: {
  title: string;
  description: string;
  image: string;
  onPress?: () => void;
  onFavorite?: () => void;
}) {
  return (
    <Pressable style={styles.quererCard} onPress={onPress}>
      <View style={styles.quererImageContainer}>
        <Image source={{ uri: image }} style={styles.quererImage} />
        <View style={styles.quererOverlay} />
        <Text style={styles.quererTitle}>{title}</Text>
        <Pressable style={styles.quererHeart} onPress={onFavorite}>
          <View style={styles.heartCircle}>
            <Feather name="heart" size={16} color="#FFFFFF" />
          </View>
        </Pressable>
      </View>
      <View style={styles.quererContent}>
        <Text style={styles.quererDescription}>
          <Text style={styles.queroPrefix}>QUERO </Text>
          {description}
        </Text>
      </View>
    </Pressable>
  );
}

const SECTIONS = {
  querer: { title: "O seu querer é que faz acontecer", highlightWords: ["querer", "acontecer"] },
  momento: { title: "Momento dança é momento feliz", highlightWords: ["dança", "feliz"] },
  awards: { title: "BORABAILAR TOP DANCE AWARDS", highlightWords: ["BORABAILAR"] },
  dicas: { title: "Dicas da semana", highlightWords: ["semana"] },
  recomendacoes: { title: "Recomendações especiais", highlightWords: [] },
} as const;

type SectionKey = keyof typeof SECTIONS;

export default function DiscoverScreen() {
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();
  const { isTabBarVisible } = useTabBar();
  
  const scrollY = useSharedValue(0);
  const previousScrollY = useSharedValue(0);
  const scrollDirection = useSharedValue<"up" | "down" | "idle">("idle");
  const [currentSectionKey, setCurrentSectionKey] = useState<SectionKey | null>(null);
  const currentSectionRef = useRef<SectionKey | null>(null);
  const stickyHeaderHeightRef = useRef(0);
  const sectionOffsetsRef = useRef<Record<SectionKey, number>>({
    querer: 0,
    momento: 0,
    awards: 0,
    dicas: 0,
    recomendacoes: 0,
  });

  const [ondeModalVisible, setOndeModalVisible] = useState(false);
  const [quandoModalVisible, setQuandoModalVisible] = useState(false);
  const [comQuemModalVisible, setComQuemModalVisible] = useState(false);
  
  const [selectedCity, setSelectedCity] = useState<typeof CITIES[0] | null>(null);
  const [selectedDate, setSelectedDate] = useState<typeof DATE_OPTIONS[0] | null>(null);
  const [selectedCompanion, setSelectedCompanion] = useState<typeof COMPANION_OPTIONS[0] | null>(null);
  
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");

  const handleMicPress = useCallback(() => {
    if (Platform.OS === "web") {
      Alert.alert(
        "Funcionalidade indisponível",
        "O reconhecimento de voz funciona apenas no aplicativo Expo Go. Escaneie o QR code para testar no seu celular.",
        [{ text: "OK" }]
      );
      return;
    }
    
    if (isRecording) {
      setIsRecording(false);
    } else {
      setIsRecording(true);
      setTimeout(() => {
        setIsRecording(false);
        setTranscript("quero sair para dançar forró");
      }, 3000);
    }
  }, [isRecording]);

  const updateCurrentSection = useCallback((scrollPosition: number) => {
    const headerOffset = stickyHeaderHeightRef.current || 150;
    let newSection: SectionKey | null = null;
    
    if (scrollPosition < SCROLL_THRESHOLD) {
      newSection = null;
    } else {
      const offsets = sectionOffsetsRef.current;
      const orderedSections: SectionKey[] = ["querer", "momento", "awards", "dicas", "recomendacoes"];
      
      for (let i = orderedSections.length - 1; i >= 0; i--) {
        const sectionKey = orderedSections[i];
        const sectionY = offsets[sectionKey];
        if (sectionY > 0 && scrollPosition >= sectionY - headerOffset) {
          newSection = sectionKey;
          break;
        }
      }
      
      if (!newSection && scrollPosition >= SCROLL_THRESHOLD) {
        newSection = "querer";
      }
    }
    
    if (newSection !== currentSectionRef.current) {
      currentSectionRef.current = newSection;
      setCurrentSectionKey(newSection);
    }
  }, []);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      const currentY = event.contentOffset.y;
      scrollY.value = currentY;
      runOnJS(updateCurrentSection)(currentY);
      
      const diff = currentY - previousScrollY.value;
      const threshold = 10;
      
      if (currentY <= 0) {
        isTabBarVisible.value = true;
      } else if (diff > threshold) {
        isTabBarVisible.value = false;
        scrollDirection.value = "down";
      } else if (diff < -threshold) {
        isTabBarVisible.value = true;
        scrollDirection.value = "up";
      }
      
      previousScrollY.value = currentY;
    },
  });

  const handleStickyHeaderLayout = useCallback((event: LayoutChangeEvent) => {
    const { height } = event.nativeEvent.layout;
    stickyHeaderHeightRef.current = height;
  }, []);

  const createSectionLayoutHandler = useCallback((sectionKey: SectionKey) => {
    return (event: LayoutChangeEvent) => {
      const { y } = event.nativeEvent.layout;
      sectionOffsetsRef.current[sectionKey] = y;
    };
  }, []);

  const handleQuererLayout = useMemo(() => createSectionLayoutHandler("querer"), [createSectionLayoutHandler]);
  const handleMomentoLayout = useMemo(() => createSectionLayoutHandler("momento"), [createSectionLayoutHandler]);
  const handleAwardsLayout = useMemo(() => createSectionLayoutHandler("awards"), [createSectionLayoutHandler]);
  const handleDicasLayout = useMemo(() => createSectionLayoutHandler("dicas"), [createSectionLayoutHandler]);
  const handleRecomendacoesLayout = useMemo(() => createSectionLayoutHandler("recomendacoes"), [createSectionLayoutHandler]);

  const currentSection = currentSectionKey ? SECTIONS[currentSectionKey] : null;

  const heroAnimatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [0, SCROLL_THRESHOLD],
      [1, 0],
      Extrapolation.CLAMP
    );
    const scale = interpolate(
      scrollY.value,
      [0, SCROLL_THRESHOLD],
      [1, 0.8],
      Extrapolation.CLAMP
    );
    const translateY = interpolate(
      scrollY.value,
      [0, SCROLL_THRESHOLD],
      [0, -50],
      Extrapolation.CLAMP
    );
    return {
      opacity,
      transform: [{ scale }, { translateY }],
    };
  });

  const expandedWizardStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [0, SCROLL_THRESHOLD * 0.5],
      [1, 0],
      Extrapolation.CLAMP
    );
    return {
      opacity,
    };
  });

  const collapsedWizardStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [SCROLL_THRESHOLD * 0.3, SCROLL_THRESHOLD * 0.7],
      [0, 1],
      Extrapolation.CLAMP
    );
    return {
      opacity,
    };
  });

  const stickyHeaderStyle = useAnimatedStyle(() => {
    const translateY = interpolate(
      scrollY.value,
      [0, SCROLL_THRESHOLD],
      [-100, 0],
      Extrapolation.CLAMP
    );
    return {
      transform: [{ translateY }],
    };
  });

  const stickyTitleStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [SCROLL_THRESHOLD * 0.8, SCROLL_THRESHOLD],
      [0, 1],
      Extrapolation.CLAMP
    );
    return {
      opacity,
    };
  });

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <Animated.View 
        style={[styles.stickyHeader, stickyHeaderStyle, { paddingTop: insets.top }]}
        onLayout={handleStickyHeaderLayout}
      >
        <View style={styles.stickyHeaderContent}>
          <Image source={logoImage} style={styles.stickyLogo} resizeMode="contain" />
          <Text style={styles.stickyBrandName}>
            <Text style={styles.brandRed}>B</Text>
            <Text style={styles.brandGray}>ora</Text>
            <Text style={styles.brandRed}>B</Text>
            <Text style={styles.brandGray}>ailar</Text>
          </Text>
        </View>
        <Animated.View style={[styles.collapsedWizardContainer, collapsedWizardStyle]}>
          <CollapsedSearchBar />
        </Animated.View>
        {currentSection ? (
          <Animated.View style={[styles.stickyTitleWrapper, stickyTitleStyle]}>
            <StickyTitle 
              title={currentSection.title} 
              highlightWords={currentSection.highlightWords} 
            />
          </Animated.View>
        ) : null}
      </Animated.View>

      <Animated.ScrollView
        style={styles.scrollView}
        contentContainerStyle={{
          paddingTop: insets.top + Spacing.md,
          paddingBottom: tabBarHeight + Spacing.xl,
        }}
        scrollIndicatorInsets={{ bottom: insets.bottom }}
        showsVerticalScrollIndicator={false}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
      >
        <Animated.View style={[styles.heroSection, heroAnimatedStyle]}>
          <Image
            source={logoImage}
            style={styles.logo}
            resizeMode="contain"
          />

          <Text style={styles.brandName}>
            <Text style={styles.brandRed}>B</Text>
            <Text style={styles.brandGray}>ORA</Text>
            <Text style={styles.brandRed}>B</Text>
            <Text style={styles.brandGray}>AILAR</Text>
          </Text>

          <Text style={styles.tagline}>PRA SAIR, DANÇAR E SE DIVERTIR!</Text>
        </Animated.View>

        <Animated.View style={[styles.wizardSection, expandedWizardStyle]}>
          <View style={styles.wizardContainer}>
            <WizardSearchField 
              label={selectedCity ? selectedCity.name : "Onde"} 
              type="chevron" 
              onPress={() => setOndeModalVisible(true)}
              hasValue={!!selectedCity}
            />
            <WizardSearchField 
              label={selectedDate ? selectedDate.label : "Quando"} 
              type="chevron" 
              onPress={() => setQuandoModalVisible(true)}
              hasValue={!!selectedDate}
            />
            <WizardSearchField 
              label={selectedCompanion ? selectedCompanion.label : "Com quem"} 
              type="mic" 
              onPress={() => setComQuemModalVisible(true)}
              hasValue={!!selectedCompanion}
            />
            
            <View style={styles.helperTextContainer}>
              <Text style={styles.helperText}>
                É só{" "}
                <Text style={styles.helperHighlight}>falar</Text>
                {" "}que a gente te{" "}
                <Text style={styles.helperHighlight}>entende</Text>!
              </Text>
            </View>
          </View>
        </Animated.View>

        <View style={styles.quererSection} onLayout={handleQuererLayout}>
          <Text style={styles.sectionTitle}>
            O seu{" "}
            <Text style={styles.sectionTitleHighlight}>querer</Text>
            {" "}é que faz{" "}
            <Text style={styles.sectionTitleHighlight}>acontecer</Text>
          </Text>
          
          <View style={styles.quererGrid}>
            {QUERER_DATA.map((item) => (
              <QuererCard
                key={item.id}
                title={item.title}
                description={item.description}
                image={item.image}
              />
            ))}
          </View>
        </View>

        <View style={styles.momentoSection} onLayout={handleMomentoLayout}>
          <Text style={styles.momentoTitle}>
            Momento{" "}
            <Text style={styles.sectionTitleHighlight}>dança</Text>
            {" "}é momento{" "}
            <Text style={styles.sectionTitleHighlight}>feliz</Text>
          </Text>
          
          <Animated.ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.videoStoriesContainer}
          >
            {VIDEO_STORIES_DATA.map((story) => (
              <VideoStoryCard
                key={story.id}
                title={story.title}
                username={story.username}
                thumbnail={story.thumbnail}
              />
            ))}
          </Animated.ScrollView>
          
          <UploadButton />
          
          <Text style={styles.destaqueMesTitle}>Destaque do mês</Text>
          <DestaqueDoMes thumbnail={DESTAQUE_MES_DATA.thumbnail} />
        </View>
        
        <View style={styles.topDanceAwardsSection} onLayout={handleAwardsLayout}>
          <Text style={styles.topDanceAwardsTitle}>
            <Text style={styles.topDanceAwardsBrand}>BORABAILAR</Text>
            {"\n"}TOP DANCE AWARDS
          </Text>
          
          <QueroParticiparButton />
          
          <View style={styles.awardCategoriesList}>
            {TOP_DANCE_AWARDS_DATA.map((item) => (
              <AwardCategoryCard
                key={item.id}
                category={item.category}
                title={item.title}
                thumbnail={item.thumbnail}
                highlightWord={(item as any).highlightWord}
              />
            ))}
          </View>
        </View>

        <View style={styles.dicasDaSemanaSection} onLayout={handleDicasLayout}>
          <Text style={styles.dicasDaSemanaTitle}>
            Dicas da{" "}
            <Text style={styles.sectionTitleHighlight}>semana</Text>
          </Text>
          <View style={styles.dicasDaSemanaList}>
            {DICAS_DA_SEMANA_DATA.map((item) => (
              <DicaDaSemanaRow
                key={item.id}
                day={item.day}
                date={item.date}
                dicas={item.dicas}
              />
            ))}
          </View>
        </View>

        <View style={styles.recomendacoesSection} onLayout={handleRecomendacoesLayout}>
          <Text style={styles.recomendacoesTitle}>Recomendações especiais</Text>
          <Animated.ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.recomendacoesContainer}
          >
            {RECOMENDACOES_ESPECIAIS_DATA.map((item) => (
              <OfertaEspecialCard
                key={item.id}
                title={item.title}
                price={item.price}
                discount={item.discount}
                image={item.image}
              />
            ))}
          </Animated.ScrollView>
        </View>
        
        <View style={{ height: tabBarHeight + Spacing.xl }} />
      </Animated.ScrollView>

      <OndeModal
        visible={ondeModalVisible}
        onClose={() => setOndeModalVisible(false)}
        onSelect={setSelectedCity}
        selectedCity={selectedCity}
      />
      
      <QuandoModal
        visible={quandoModalVisible}
        onClose={() => setQuandoModalVisible(false)}
        onSelect={setSelectedDate}
        selectedOption={selectedDate}
      />
      
      <ComQuemModal
        visible={comQuemModalVisible}
        onClose={() => setComQuemModalVisible(false)}
        onSelect={setSelectedCompanion}
        selectedOption={selectedCompanion}
        onMicPress={handleMicPress}
        isRecording={isRecording}
        transcript={transcript}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  stickyHeader: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  stickyHeaderContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  stickyLogo: {
    width: 36,
    height: 26,
  },
  stickyBrandName: {
    fontSize: 20,
    fontFamily: Fonts?.serif,
    letterSpacing: 1,
  },
  collapsedWizardContainer: {
    marginTop: Spacing.xs,
  },
  collapsedSearchBar: {
    backgroundColor: "#F5F5F5",
    borderRadius: 25,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  collapsedSearchText: {
    fontSize: 15,
    color: Colors.dark.textSecondary,
    fontWeight: "400",
  },
  stickyTitleWrapper: {
    marginTop: Spacing.sm,
  },
  stickySectionTitleContainer: {
    paddingVertical: Spacing.xs,
  },
  stickySectionTitle: {
    fontSize: 16,
    color: Colors.dark.text,
  },
  heroSection: {
    alignItems: "center",
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xl,
    paddingHorizontal: Spacing.lg,
  },
  logo: {
    width: 140,
    height: 100,
    marginBottom: Spacing.sm,
  },
  brandName: {
    fontSize: 32,
    fontFamily: Fonts?.serif,
    letterSpacing: 2,
    marginBottom: Spacing.sm,
  },
  brandRed: {
    color: Colors.dark.brand,
    fontWeight: "700",
  },
  brandGray: {
    color: Colors.dark.textSecondary,
    fontWeight: "400",
  },
  tagline: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.dark.brand,
    textAlign: "center",
    letterSpacing: 0.5,
  },
  wizardSection: {
    paddingHorizontal: Spacing.lg,
  },
  wizardContainer: {
    backgroundColor: Colors.dark.wizardBackground,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    paddingVertical: Spacing.xl + Spacing.lg,
    gap: Spacing.lg,
  },
  wizardField: {
    backgroundColor: "#FFFFFF",
    borderRadius: 30,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  wizardFieldPressed: {
    backgroundColor: "#F9FAFB",
  },
  wizardFieldLabel: {
    fontSize: 16,
    color: Colors.dark.textSecondary,
    fontWeight: "400",
  },
  wizardFieldSelected: {
    borderWidth: 1,
    borderColor: Colors.dark.primary,
    backgroundColor: Colors.dark.primary + "10",
  },
  wizardFieldLabelSelected: {
    color: Colors.dark.primary,
    fontWeight: "500",
  },
  chevronIconContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  micIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.dark.brand,
    alignItems: "center",
    justifyContent: "center",
  },
  helperTextContainer: {
    alignItems: "center",
    marginTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  helperText: {
    fontSize: 15,
    color: Colors.dark.text,
    textAlign: "center",
  },
  helperHighlight: {
    color: Colors.dark.brand,
    fontWeight: "700",
  },
  quererSection: {
    paddingHorizontal: Spacing.lg,
    marginTop: Spacing.xl + Spacing.xl,
  },
  sectionTitle: {
    fontSize: 18,
    color: Colors.dark.text,
    marginBottom: Spacing.lg,
  },
  sectionTitleHighlight: {
    color: Colors.dark.brand,
    fontWeight: "700",
  },
  quererGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
    justifyContent: "space-between",
  },
  quererCard: {
    width: CARD_WIDTH,
    marginBottom: Spacing.md,
  },
  quererImageContainer: {
    width: "100%",
    height: CARD_WIDTH * 0.9,
    borderRadius: BorderRadius.lg,
    overflow: "hidden",
    position: "relative",
  },
  quererImage: {
    width: "100%",
    height: "100%",
  },
  quererOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  quererTitle: {
    position: "absolute",
    bottom: Spacing.md,
    left: Spacing.md,
    right: Spacing.md,
    fontSize: 16,
    fontWeight: "800",
    color: "#FFFFFF",
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  quererHeart: {
    position: "absolute",
    top: Spacing.sm,
    right: Spacing.sm,
  },
  heartCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.dark.brand,
    alignItems: "center",
    justifyContent: "center",
  },
  quererContent: {
    paddingTop: Spacing.sm,
  },
  quererDescription: {
    fontSize: 13,
    color: Colors.dark.text,
    lineHeight: 18,
  },
  queroPrefix: {
    color: Colors.dark.brand,
    fontWeight: "700",
  },
  momentoSection: {
    paddingHorizontal: Spacing.lg,
    marginTop: Spacing.xl + Spacing.lg,
  },
  momentoTitle: {
    fontSize: 18,
    color: Colors.dark.text,
    marginBottom: Spacing.lg,
  },
  videoStoriesContainer: {
    paddingRight: Spacing.lg,
    gap: Spacing.md,
  },
  videoStoryCard: {
    width: VIDEO_STORY_WIDTH,
    marginRight: Spacing.xs,
  },
  videoStoryImageContainer: {
    width: VIDEO_STORY_WIDTH,
    height: VIDEO_STORY_HEIGHT,
    borderRadius: BorderRadius.lg,
    overflow: "hidden",
    position: "relative",
  },
  videoStoryImage: {
    width: "100%",
    height: "100%",
  },
  videoStoryPlayIcon: {
    position: "absolute",
    bottom: Spacing.sm,
    left: Spacing.sm,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  videoStoryTitle: {
    fontSize: 12,
    color: Colors.dark.text,
    fontWeight: "500",
    marginTop: Spacing.xs,
    lineHeight: 16,
  },
  videoStoryUsername: {
    fontSize: 11,
    color: Colors.dark.textSecondary,
    marginTop: 2,
  },
  uploadButton: {
    backgroundColor: Colors.dark.wizardBackground,
    borderRadius: BorderRadius.xl,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    marginTop: Spacing.xl,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.dark.brand,
  },
  uploadButtonText: {
    fontSize: 14,
    color: Colors.dark.brand,
    fontWeight: "600",
  },
  destaqueMesTitle: {
    fontSize: 18,
    color: Colors.dark.text,
    marginTop: Spacing.xl + Spacing.lg,
    marginBottom: Spacing.lg,
  },
  destaqueMesCard: {
    width: "100%",
    height: 200,
    borderRadius: BorderRadius.lg,
    overflow: "hidden",
    position: "relative",
  },
  destaqueMesImage: {
    width: "100%",
    height: "100%",
  },
  destaqueMesPlayOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  destaqueMesPlayButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(0,0,0,0.6)",
    alignItems: "center",
    justifyContent: "center",
  },
  topDanceAwardsSection: {
    paddingHorizontal: Spacing.lg,
    marginTop: Spacing.xl + Spacing.lg,
  },
  topDanceAwardsTitle: {
    fontSize: 18,
    color: Colors.dark.text,
    textAlign: "center",
    fontWeight: "600",
    lineHeight: 26,
  },
  topDanceAwardsBrand: {
    color: Colors.dark.brand,
    fontWeight: "700",
    fontSize: 22,
    letterSpacing: 1,
  },
  queroParticiparButton: {
    backgroundColor: "#4CAF50",
    borderRadius: BorderRadius.xl,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    alignItems: "center",
    marginTop: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  queroParticiparButtonText: {
    fontSize: 15,
    color: "#FFFFFF",
    fontWeight: "600",
  },
  awardCategoriesList: {
    gap: Spacing.md,
  },
  awardCategoryCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  awardCategoryContent: {
    flex: 1,
    marginRight: Spacing.md,
  },
  awardCategoryNumber: {
    fontSize: 12,
    color: Colors.dark.textSecondary,
    marginBottom: Spacing.xs,
  },
  awardCategoryTitle: {
    fontSize: 15,
    color: Colors.dark.text,
    fontWeight: "600",
  },
  awardCategoryHighlight: {
    color: Colors.dark.brand,
    fontWeight: "700",
  },
  awardCategoryThumbnail: {
    width: 70,
    height: 50,
    borderRadius: BorderRadius.md,
  },
  dicasDaSemanaSection: {
    paddingHorizontal: Spacing.lg,
    marginTop: Spacing.xl + Spacing.lg,
  },
  dicasDaSemanaTitle: {
    fontSize: 18,
    color: Colors.dark.text,
    fontWeight: "600",
    marginBottom: Spacing.lg,
  },
  dicasDaSemanaList: {
    gap: Spacing.xl,
  },
  dicaDaSemanaRow: {
    marginBottom: Spacing.md,
  },
  dicaDayHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  dicaDayName: {
    fontSize: 16,
    color: Colors.dark.brand,
    fontWeight: "600",
  },
  dicaDate: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
    marginLeft: Spacing.xs,
  },
  dicasEventScrollContainer: {
    gap: Spacing.md,
    paddingRight: Spacing.lg,
    marginLeft: -Spacing.lg,
    paddingLeft: Spacing.lg,
  },
  dicaEventCard: {
    width: DICA_EVENT_CARD_WIDTH,
  },
  dicaEventImage: {
    width: DICA_EVENT_CARD_WIDTH,
    height: 80,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.xs,
  },
  dicaEventTitle: {
    fontSize: 11,
    color: Colors.dark.text,
    fontWeight: "500",
    lineHeight: 14,
  },
  dicaEventPrice: {
    fontSize: 10,
    color: Colors.dark.textSecondary,
    marginTop: 2,
  },
  recomendacoesSection: {
    paddingHorizontal: Spacing.lg,
    marginTop: Spacing.xl + Spacing.lg,
  },
  recomendacoesTitle: {
    fontSize: 18,
    color: Colors.dark.text,
    fontWeight: "600",
    marginBottom: Spacing.lg,
  },
  recomendacoesContainer: {
    paddingRight: Spacing.lg,
    gap: Spacing.md,
    marginLeft: -Spacing.lg,
    paddingLeft: Spacing.lg,
  },
  ofertaCard: {
    width: OFERTA_CARD_WIDTH,
  },
  ofertaImageContainer: {
    width: OFERTA_CARD_WIDTH,
    height: OFERTA_CARD_HEIGHT,
    borderRadius: BorderRadius.lg,
    overflow: "hidden",
    position: "relative",
  },
  ofertaImage: {
    width: "100%",
    height: "100%",
  },
  ofertaDiscountBadge: {
    position: "absolute",
    top: Spacing.sm,
    left: Spacing.sm,
    backgroundColor: Colors.dark.brand,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  ofertaDiscountText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "700",
  },
  ofertaHeartButton: {
    position: "absolute",
    top: Spacing.sm,
    right: Spacing.sm,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(0,0,0,0.4)",
    alignItems: "center",
    justifyContent: "center",
  },
  ofertaTitle: {
    fontSize: 13,
    color: Colors.dark.text,
    fontWeight: "500",
    marginTop: Spacing.sm,
  },
  ofertaPrice: {
    fontSize: 11,
    color: Colors.dark.textSecondary,
    marginTop: 2,
  },
});
