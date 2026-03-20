import React, { useState, useCallback, useRef, useMemo, useEffect, useContext } from "react";
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
  ScrollView,
  FlatList,
  ImageSourcePropType,
  Modal,
  ViewToken,
} from "react-native";
import { useVideoPlayer, VideoView } from "expo-video";
import { useAudioRecorder, AudioModule, RecordingPresets } from "expo-audio";
import * as FileSystem from "expo-file-system/legacy";
import * as Linking from "expo-linking";
import { getApiUrl } from "@/lib/query-client";
import { videoService } from "@/services/videoService";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { Feather, Ionicons } from "@expo/vector-icons";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import { API_CONFIG } from "@/config";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedScrollHandler,
  interpolate,
  Extrapolation,
  runOnJS,
} from "react-native-reanimated";

import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Colors, Fonts } from "@/constants/theme";
import { useTabBar } from "@/contexts/TabBarContext";
import {
  OndeModal,
  QuandoModal,
  ComQuemModal,
  ALL_NEIGHBORHOODS,
  DATE_OPTIONS,
  COMPANION_OPTIONS,
} from "@/components/SearchModals";
import { PartnersCarousel } from "@/components/PartnersCarousel";
import { WizardSearchModal } from "@/components/WizardSearchModal";
import { PartnerBrands } from "@/components/PartnerBrands";
import type { DiscoverStackParamList } from "@/navigation/DiscoverStackNavigator";
import type { RootStackParamList } from "@/navigation/RootStackNavigator";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/api";
import { realApi, type PartnerCard, type PartnerBrand } from "@/services/realApi";
import { AuthContext } from "@/contexts/AuthContext";

const logoImage = require("../../assets/images/novo_logo.png");
const topDanceAwardsLogo = require("../../assets/images/top_dance_awards_logo.png");

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_WIDTH = (SCREEN_WIDTH - Spacing.lg * 3) / 2;
const SCROLL_THRESHOLD = 100;


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
  videoUrl,
  isVisible,
  onPress,
}: {
  title: string;
  username: string;
  thumbnail: any;
  videoUrl?: any;
  isVisible?: boolean;
  onPress?: () => void;
}) {
  // Create video player only when we have a videoUrl
  const player = useVideoPlayer(videoUrl || null, (p) => {
    p.loop = true;
    p.muted = true;
  });

  // Auto-play/pause based on visibility
  useEffect(() => {
    if (!player) return;
    if (isVisible && videoUrl) {
      player.play();
    } else {
      player.pause();
    }
  }, [isVisible, player, videoUrl]);

  const showVideo = isVisible && videoUrl && player;

  return (
    <Pressable
      style={({ pressed }) => [
        styles.videoStoryCard,
        pressed && { opacity: 0.8 },
      ]}
      onPress={onPress}
    >
      <View style={styles.videoStoryImageContainer}>
        {showVideo ? (
          <VideoView
            player={player}
            style={styles.videoStoryImage}
            contentFit="cover"
            nativeControls={false}
          />
        ) : (
          <Image source={thumbnail} style={styles.videoStoryImage} resizeMode="cover" />
        )}
        {!showVideo && (
          <View style={styles.videoStoryPlayIcon}>
            <Feather name="play" size={16} color="#FFFFFF" />
          </View>
        )}
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
      <Text style={styles.uploadButtonText}>Faça aqui o upload do seu momento dança</Text>
      <Feather name="upload" size={22} color={Colors.dark.text} style={{ marginLeft: 8 }} />
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

// Fallback images for Sunday (no specific images available)
const DICA_IMAGES_FALLBACK: ImageSourcePropType[] = [
  require("../../attached_assets/stock_images/person_dancing_happi_798bff4b.jpg"),
  require("../../attached_assets/stock_images/ballroom_dancing_cou_a3f721af.jpg"),
  require("../../attached_assets/stock_images/ballroom_dancing_cou_83e25a1a.jpg"),
];

// Real images organized by day of the week with day-mixing pattern
// Monday = 0, Saturday = 5, Sunday = 6
const DICA_IMAGES_BY_DAY: ImageSourcePropType[][] = [
  // Segunda-feira: 3 seg + 3 qua
  [
    require("../attached_assets/dicas/seg_01.jpg"),
    require("../attached_assets/dicas/seg_02.jpg"),
    require("../attached_assets/dicas/seg_03.jpg"),
    require("../attached_assets/dicas/qua_01.jpg"),
    require("../attached_assets/dicas/qua_02.jpg"),
    require("../attached_assets/dicas/qua_03.jpg"),
  ],
  // Terça-feira: 3 ter + 3 qui
  [
    require("../attached_assets/dicas/ter_01.jpg"),
    require("../attached_assets/dicas/ter_02.jpg"),
    require("../attached_assets/dicas/ter_03.jpg"),
    require("../attached_assets/dicas/qui_01.jpg"),
    require("../attached_assets/dicas/qui_02.jpg"),
    require("../attached_assets/dicas/qui_03.jpg"),
  ],
  // Quarta-feira: 3 qua + 3 sex
  [
    require("../attached_assets/dicas/qua_01.jpg"),
    require("../attached_assets/dicas/qua_02.jpg"),
    require("../attached_assets/dicas/qua_03.jpg"),
    require("../attached_assets/dicas/sex_01.jpg"),
    require("../attached_assets/dicas/sex_02.jpg"),
    require("../attached_assets/dicas/sex_03.jpg"),
  ],
  // Quinta-feira: 3 qui + 3 sab
  [
    require("../attached_assets/dicas/qui_01.jpg"),
    require("../attached_assets/dicas/qui_02.jpg"),
    require("../attached_assets/dicas/qui_03.jpg"),
    require("../attached_assets/dicas/sab_01.jpg"),
    require("../attached_assets/dicas/sab_02.jpg"),
    require("../attached_assets/dicas/sab_03.jpg"),
  ],
  // Sexta-feira: 3 sex + 3 seg
  [
    require("../attached_assets/dicas/sex_01.jpg"),
    require("../attached_assets/dicas/sex_02.jpg"),
    require("../attached_assets/dicas/sex_03.jpg"),
    require("../attached_assets/dicas/seg_01.jpg"),
    require("../attached_assets/dicas/seg_02.jpg"),
    require("../attached_assets/dicas/seg_03.jpg"),
  ],
  // Sábado: 3 sab + 3 ter
  [
    require("../attached_assets/dicas/sab_01.jpg"),
    require("../attached_assets/dicas/sab_02.jpg"),
    require("../attached_assets/dicas/sab_03.jpg"),
    require("../attached_assets/dicas/ter_01.jpg"),
    require("../attached_assets/dicas/ter_02.jpg"),
    require("../attached_assets/dicas/ter_03.jpg"),
  ],
  // Domingo: 3 qua + 3 sex (sem imagens mockadas)
  [
    require("../attached_assets/dicas/qua_01.jpg"),
    require("../attached_assets/dicas/qua_02.jpg"),
    require("../attached_assets/dicas/qua_03.jpg"),
    require("../attached_assets/dicas/sex_01.jpg"),
    require("../attached_assets/dicas/sex_02.jpg"),
    require("../attached_assets/dicas/sex_03.jpg"),
  ],
];

const DICA_EVENT_CARD_WIDTH = 104; // Increased by 4px

interface DicaEvent {
  title: string;
  price: string;
  imageUrl?: string; // Full size image URL from API
  thumbnailUrl?: string; // Smaller thumbnail for faster loading
}

function DicaDaSemanaRow({
  day,
  date,
  dayIndex,
  dicas,
  onDicaPress,
}: {
  day: string;
  date: string;
  dayIndex: number;
  dicas: DicaEvent[];
  onDicaPress?: (title: string, price: string, day: string, date: string) => void;
}) {
  // Get fallback images for this specific day
  const imagesForDay = DICA_IMAGES_BY_DAY[dayIndex] ?? DICA_IMAGES_FALLBACK;
  return (
    <View style={styles.dicaDaSemanaRow}>
      <View style={styles.dicaDayHeader}>
        <Text style={styles.dicaDayName}>{day}</Text>
        {date ? <Text style={styles.dicaDate}>({date})</Text> : null}
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.dicasEventScrollContainer}
        nestedScrollEnabled={true}
      >
        {dicas.map((dica, index) => {
          // Priority: thumbnail > imageUrl > local fallback
          // Treat empty strings as invalid
          const apiImageUrl = (dica.thumbnailUrl && dica.thumbnailUrl.trim()) || (dica.imageUrl && dica.imageUrl.trim());
          const imageSource = apiImageUrl
            ? { uri: apiImageUrl }
            : (imagesForDay[index] ?? imagesForDay[index % imagesForDay.length]);

          return (
            <Pressable
              key={index}
              style={({ pressed }) => [
                styles.dicaEventCard,
                pressed && { opacity: 0.8 },
              ]}
              onPress={() => onDicaPress?.(dica.title, dica.price, day, date)}
            >
              <View style={[styles.dicaEventImage, { backgroundColor: '#f0f0f0' }]}>
                <Image
                  source={imageSource}
                  style={styles.dicaEventImage}
                  resizeMode="cover"
                  // @ts-ignore - RN Image performance props
                  fadeDuration={200}
                />
              </View>
              <Text style={styles.dicaEventTitle} numberOfLines={2}>{dica.title}</Text>
              <Text style={styles.dicaEventPrice}>
                A partir de {dica.price === "R$0" ? "R$0" : dica.price}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
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
      <Feather name="mic" size={22} color="#FFFFFF" />
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
  const [liked, setLiked] = useState(false);

  const handleFavorite = () => {
    setLiked((prev) => !prev);
    onFavorite?.();
  };

  return (
    <Pressable style={styles.quererCard} onPress={onPress}>
      <View style={styles.quererImageContainer}>
        <Image source={typeof image === 'string' ? { uri: image } : image} style={styles.quererImage} />
        <View style={styles.quererOverlay} />
        <Text style={styles.quererTitle}>{title}</Text>
        <Pressable
          style={styles.quererHeart}
          onPress={handleFavorite}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons
            name={liked ? "heart" : "heart-outline"}
            size={24}
            color={liked ? Colors.dark.brand : "#FFFFFF"}
            style={{ textShadowColor: 'rgba(0,0,0,0.5)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 3 }}
          />
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

const SECTIONS_KEYS = ["querer", "momento", "partners", "awards", "dicas", "recomendacoes"] as const;
type SectionKey = typeof SECTIONS_KEYS[number];

export default function DiscoverScreen() {
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();
  // const { isTabBarVisible } = useTabBar(); // Removing usage for now to simplify
  const { isLoggedIn } = useContext(AuthContext);
  const navigation = useNavigation<NativeStackNavigationProp<DiscoverStackParamList>>();
  const rootNavigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const { data: discoverData, isLoading, error } = useQuery<any>({
    queryKey: ["discover"],
    queryFn: api.events.getDiscoverData,
  });

  // Debug logging
  useEffect(() => {
    console.log("Discover Data:", discoverData);
    console.log("Is Loading:", isLoading);
    console.log("Error:", error);
  }, [discoverData, isLoading, error]);

  const scrollY = useSharedValue(0);
  const previousScrollY = useSharedValue(0);

  const videoStories = discoverData?.stories || [];
  const destaqueMes = discoverData?.destaqueMes;
  const weeklyTip = (discoverData as any)?.weeklyTip || (discoverData as any)?.todayTip;
  const weeklyTips = (discoverData as any)?.weeklyTips || [];
  const awards = discoverData?.awards || [];
  const recommendations = discoverData?.recommendations || [];
  const querer = discoverData?.querer || [];

  // Fetch partner cards from API
  const { data: partnerCards = [] } = useQuery<PartnerCard[]>({
    queryKey: ["partnerCards"],
    queryFn: realApi.partnerCards.list,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  // Fetch partner brands from API
  const { data: partnerBrands = [] } = useQuery<PartnerBrand[]>({
    queryKey: ["partnerBrands"],
    queryFn: realApi.partnerBrands.list,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  // Fetch home texts (editable by admin)
  const { data: homeTexts } = useQuery<Record<string, string>>({
    queryKey: ["homeContent"],
    queryFn: realApi.homeContent.get,
    staleTime: 1000 * 60 * 10, // Cache for 10 minutes
  });

  // Group weekly tips by day of week for proper display
  const groupedTipsByDay = useMemo(() => {
    const dayNames = ["Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado", "Domingo"];
    const grouped: Record<number, { dayName: string; events: DicaEvent[] }> = {};

    (weeklyTips as any[]).forEach((tip: any) => {
      const dayIndex = tip.dayOfWeek ?? tip.day_of_week ?? 0;
      const dayName = tip.dayOfWeekName || tip.day_of_week_name || dayNames[dayIndex] || "Dia";

      if (!grouped[dayIndex]) {
        grouped[dayIndex] = { dayName, events: [] };
      }

      grouped[dayIndex].events.push({
        title: tip.title || tip.event?.title || tip.event?.name || "Evento",
        price: tip.event?.price ? `R$${tip.event.price}` : "Grátis",
        thumbnailUrl: tip.thumbnailUrl || tip.event?.thumbnailUrl || tip.event?.thumbnail_url,
        imageUrl: tip.imageUrl || tip.event?.coverImage || tip.event?.cover_image,
      });
    });

    // Sort by day index and return as array
    return Object.entries(grouped)
      .sort(([a], [b]) => Number(a) - Number(b))
      .map(([dayIndex, data]) => ({
        dayIndex: Number(dayIndex),
        dayName: data.dayName,
        events: data.events,
      }));
  }, [weeklyTips]);
  // const scrollDirection = useSharedValue<"up" | "down" | "idle">("idle");
  const [currentSectionKey, setCurrentSectionKey] = useState<SectionKey | null>(null);
  const currentSectionRef = useRef<SectionKey | null>(null);
  const stickyHeaderHeightRef = useRef(0);
  const sectionOffsetsRef = useRef<Record<SectionKey, number>>({
    querer: 0,
    momento: 0,
    partners: 0,
    awards: 0,
    dicas: 0,
    recomendacoes: 0,
  });

  const [ondeModalVisible, setOndeModalVisible] = useState(false);
  const [quandoModalVisible, setQuandoModalVisible] = useState(false);
  const [comQuemModalVisible, setComQuemModalVisible] = useState(false);
  const [wizardModalVisible, setWizardModalVisible] = useState(false);
  const [visibleVideoIndex, setVisibleVideoIndex] = useState<number | null>(0); // Autoplay first video by default

  const [selectedCity, setSelectedCity] = useState<typeof ALL_NEIGHBORHOODS[0] | null>(null);
  const [selectedDate, setSelectedDate] = useState<typeof DATE_OPTIONS[0] | null>(null);
  const [selectedCompanion, setSelectedCompanion] = useState<typeof COMPANION_OPTIONS[0] | null>(null);
  const [selectedAwardCategory, setSelectedAwardCategory] = useState<{
    id: string;
    category: string;
    title: string;
    thumbnail: any;
  } | null>(null);

  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [pendingTranscription, setPendingTranscription] = useState(false);

  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);

  useEffect(() => {
    (async () => {
      if (Platform.OS !== "web") {
        const status = await AudioModule.requestRecordingPermissionsAsync();
        if (!status.granted) {
          console.log("Audio recording permission not granted");
        }
      }
    })();
  }, []);

  // Navegação automática quando todos os 3 filtros são preenchidos
  useEffect(() => {
    // Verifica se os 3 filtros estão selecionados
    if (selectedCity && selectedDate && selectedCompanion) {
      // Mapear "Com Quem" para o "Quero" correspondente
      const companionToQueroMap: Record<string, { title: string; description: string; categoria: string }> = {
        "solo": {
          title: "SAIR PARA DANÇAR",
          description: "Encontre eventos para dançar sozinho",
          categoria: "dançar"
        },
        "couple": {
          title: "SAIR PARA DANÇAR",
          description: "Encontre eventos para dançar em casal",
          categoria: "dançar"
        },
        "friends": {
          title: "SAIR COM AMIGOS",
          description: "Encontre eventos para sair com amigos",
          categoria: "amigos"
        },
        "group": {
          title: "SAIR EM GRUPO",
          description: "Encontre eventos para sair em grupo",
          categoria: "grupo"
        }
      };

      const queroInfo = companionToQueroMap[selectedCompanion.id];

      if (queroInfo && isLoggedIn) {
        // Preparar filtros para passar na navegação
        const filters = {
          categoria: queroInfo.categoria,
          zona: selectedCity.zone,
          bairro: selectedCity.name,
          quando: selectedDate?.label,
          tipoAcompanhamento: selectedCompanion.id === "solo" ? "sozinho" :
            selectedCompanion.id === "couple" ? "casal" :
              selectedCompanion.id === "friends" ? "amigos" : "grupo"
        };

        // Navegar para QueroDetailScreen com filtros
        rootNavigation.navigate("QueroDetail", {
          queroTitle: queroInfo.title,
          queroDescription: queroInfo.description,
          preSelectedFilters: filters
        });

        // Limpar os filtros após navegar (opcional)
        setSelectedCity(null);
        setSelectedDate(null);
        setSelectedCompanion(null);
      }
    }
  }, [selectedCity, selectedDate, selectedCompanion, isLoggedIn, rootNavigation]);


  const transcribeAudio = useCallback(async (audioUri: string) => {
    try {
      setIsTranscribing(true);

      const base64Audio = await FileSystem.readAsStringAsync(audioUri, {
        encoding: "base64" as const,
      });

      const apiUrl = getApiUrl();
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      const response = await fetch(new URL("/api/transcribe", apiUrl).toString(), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          audio: base64Audio,
          filename: "recording.m4a",
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error("Transcription failed");
      }

      const data = await response.json();
      const transcribedText = data.text || "";
      setTranscript(transcribedText);

      // Navigate to AI Chat with the transcribed text
      if (transcribedText.trim()) {
        rootNavigation.navigate("AIChat", {
          cardTitle: "ASSISTENTE DE VOZ",
          cardDescription: "Busca por voz",
          initialMessage: transcribedText,
        });
      }
    } catch (error: any) {
      console.error("Transcription error:", error);
      const message = error.name === "AbortError"
        ? "A transcrição demorou muito. Tente novamente."
        : "Não foi possível transcrever o áudio. Tente novamente.";
      Alert.alert("Erro na transcrição", message, [{ text: "OK" }]);
    } finally {
      setIsTranscribing(false);
      setIsRecording(false);
    }
  }, [rootNavigation]);

  useEffect(() => {
    if (pendingTranscription && !audioRecorder.isRecording && audioRecorder.uri) {
      setPendingTranscription(false);
      transcribeAudio(audioRecorder.uri);
    }
  }, [pendingTranscription, audioRecorder.isRecording, audioRecorder.uri, transcribeAudio]);



  const handleMicPress = useCallback(() => {
    rootNavigation.navigate("AIChat", {
      cardTitle: "ASSISTENTE DE VOZ",
      cardDescription: "Busca por voz",
    });
  }, [rootNavigation]);

  const SECTIONS_DYNAMIC = useMemo(() => ({
    querer: { title: homeTexts?.quero_section_title ?? "O seu querer faz acontecer", highlightWords: ["querer", "acontecer", "dança", "feliz"] },
    momento: { title: homeTexts?.momento_title ?? "Momento dança é momento feliz", highlightWords: ["dança", "feliz", "Momento"] },
    partners: { title: homeTexts?.brands_section_title ?? "Quer ser parceiro do BORABAILAR?", highlightWords: ["parceiro", "BORABAILAR"] },
    awards: { title: "BoraBailar TOP 10", highlightWords: ["BoraBailar"] },
    dicas: { title: homeTexts?.dicas_title ?? "Dicas da semana", highlightWords: ["semana"] },
    recomendacoes: { title: "Recomendações especiais", highlightWords: [] },
  }), [homeTexts]);

  const currentSection = currentSectionKey ? SECTIONS_DYNAMIC[currentSectionKey] : null;

  // Simplified Scroll Handler
  const updateCurrentSection = useCallback((scrollPosition: number) => {
    const headerOffset = stickyHeaderHeightRef.current || 150;
    let newSection: SectionKey | null = null;

    if (scrollPosition < SCROLL_THRESHOLD) {
      newSection = null;
    } else {
      const offsets = sectionOffsetsRef.current;
      const orderedSections: SectionKey[] = ["querer", "momento", "dicas", "awards", "recomendacoes", "partners"];

      for (let i = orderedSections.length - 1; i >= 0; i--) {
        const sectionKey = orderedSections[i];
        const sectionY = offsets[sectionKey];
        // Adding +250 to offset accounts for the content Slide Up transform
        if (sectionY > 0 && scrollPosition >= sectionY - headerOffset + 250) {
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
  const handlePartnersLayout = useMemo(() => createSectionLayoutHandler("partners"), [createSectionLayoutHandler]);
  const handleAwardsLayout = useMemo(() => createSectionLayoutHandler("awards"), [createSectionLayoutHandler]);
  const handleDicasLayout = useMemo(() => createSectionLayoutHandler("dicas"), [createSectionLayoutHandler]);
  const handleRecomendacoesLayout = useMemo(() => createSectionLayoutHandler("recomendacoes"), [createSectionLayoutHandler]);

  // currentSection computation moved above updateCurrentSection

  // Animations
  const heroAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(scrollY.value, [0, SCROLL_THRESHOLD * 0.6], [1, 0], Extrapolation.CLAMP),
      transform: [
        { scale: interpolate(scrollY.value, [0, SCROLL_THRESHOLD], [1, 0.85], Extrapolation.CLAMP) },
        { translateY: interpolate(scrollY.value, [0, SCROLL_THRESHOLD], [0, -80], Extrapolation.CLAMP) },
      ],
    };
  });

  const expandedWizardStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(scrollY.value, [0, SCROLL_THRESHOLD * 0.5], [1, 0], Extrapolation.CLAMP),
      transform: [
        { translateY: interpolate(scrollY.value, [0, SCROLL_THRESHOLD], [0, -120], Extrapolation.CLAMP) },
      ],
    };
  });

  // Pulls the content below hero+wizard UP to fill the gap smoothly
  const contentSlideUpStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateY: interpolate(scrollY.value, [0, SCROLL_THRESHOLD * 1.5], [0, -350], Extrapolation.CLAMP) },
      ],
    };
  });

  const collapsedWizardStyle = useAnimatedStyle(() => {
    return { opacity: interpolate(scrollY.value, [SCROLL_THRESHOLD * 0.3, SCROLL_THRESHOLD * 0.7], [0, 1], Extrapolation.CLAMP) };
  });

  const stickyHeaderStyle = useAnimatedStyle(() => {
    return { transform: [{ translateY: interpolate(scrollY.value, [0, SCROLL_THRESHOLD], [-100, 0], Extrapolation.CLAMP) }] };
  });

  const stickyTitleStyle = useAnimatedStyle(() => {
    return { opacity: interpolate(scrollY.value, [SCROLL_THRESHOLD * 0.8, SCROLL_THRESHOLD], [0, 1], Extrapolation.CLAMP) };
  });

  const authButtonsStyle = useAnimatedStyle(() => {
    return { opacity: interpolate(scrollY.value, [0, SCROLL_THRESHOLD * 0.5], [1, 0], Extrapolation.CLAMP) };
  }) as any;

  const handleSignUp = useCallback(() => {
    rootNavigation.navigate("CadastreSe");
  }, [rootNavigation]);

  const handleBellPress = useCallback(async () => {
    try {
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
        });
      }

      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        Alert.alert("Aviso", "Precisamos de permissão para te avisar das novidades!");
        return;
      }

      const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
      const pushTokenString = (
        await Notifications.getExpoPushTokenAsync({
          projectId,
        })
      ).data;

      Alert.alert(
        "Notificações Ativadas!",
        "Agora vamos te avisar sempre que tiver algo bombando no BoraBailar."
      );
      
      fetch(`${API_CONFIG.BASE_URL}/push-tokens/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: pushTokenString, platform: Platform.OS }),
      }).catch(err => console.error("Error registering token", err));

    } catch (e: any) {
      console.log('Error push token:', e);
      Alert.alert(
        "Notificações Ativadas!",
        "Agora vamos te avisar sempre que tiver algo bombando no BoraBailar."
      );
    }
  }, []);


  // Mapeamento de filtros padrão por tipo de "Quero"
  const QUERO_FILTERS_MAP: Record<string, {
    categoria: string;
    zona: string;
    tipoAcompanhamento: string;
  }> = {
    "SAIR PARA DANÇAR": {
      categoria: "dançar",
      zona: "Zona Sul",
      tipoAcompanhamento: "sozinho"
    },
    "SAIR EM GRUPO": {
      categoria: "grupo",
      zona: "Centro",
      tipoAcompanhamento: "grupo"
    },
    "SAIR COM AMIGOS": {
      categoria: "amigos",
      zona: "Sudoeste",
      tipoAcompanhamento: "amigos"
    }
  };

  const handleQuererCardPress = useCallback((title: string, description: string) => {
    if (isLoggedIn) {
      // Buscar filtros padrão para este card
      const normalizedTitle = title.replace(/\n/g, " ").trim();
      const filters = QUERO_FILTERS_MAP[normalizedTitle];

      rootNavigation.navigate("QueroDetail", {
        queroTitle: title,
        queroDescription: description,
        // Passar filtros pré-definidos se existirem
        preSelectedFilters: filters ? {
          categoria: filters.categoria,
          zona: filters.zona,
          tipoAcompanhamento: filters.tipoAcompanhamento
        } : undefined
      });
    } else {
      rootNavigation.navigate("FaltaPouco", {
        eventName: title.replace(/\n/g, " "),
        eventDetails: description,
      });
    }
  }, [rootNavigation, isLoggedIn]);

  const handleDanceAwardsPress = useCallback(() => {
    rootNavigation.navigate("AIChat", {
      cardTitle: "BORABAILAR TOP DANCE AWARDS",
      cardDescription: "Participe do maior prêmio de dança do Brasil"
    });
  }, [rootNavigation]);

  const handleAwardCategoryPress = useCallback((category: { id: string; category: string; title: string; thumbnail: any }) => {
    setSelectedAwardCategory(category);
  }, []);

  const handleAwardCategoryParticipate = useCallback(() => {
    if (selectedAwardCategory) {
      rootNavigation.navigate("AIChat", {
        cardTitle: `BORABAILAR TOP DANCE AWARDS - ${selectedAwardCategory.title}`,
        cardDescription: "Participe desta categoria do prêmio"
      });
      setSelectedAwardCategory(null);
    }
  }, [rootNavigation, selectedAwardCategory]);

  const handleDicaPress = useCallback((title: string, price: string, day: string, date: string) => {
    rootNavigation.navigate("AIChat", {
      cardTitle: `DICA_SEMANA:${title}`,
      cardDescription: `${day} (${date})|${price}`,
    });
  }, [rootNavigation]);

  const handleVideoStoryPress = useCallback((index: number) => {
    rootNavigation.navigate("Reels", {
      initialIndex: index,
      stories: videoStories
    });
  }, [rootNavigation, videoStories]);

  // Viewability config for autoplay - detects which video card is most visible
  const videoViewabilityConfig = useRef({
    itemVisiblePercentThreshold: 60,
    minimumViewTime: 300,
  }).current;

  const onVideoViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    const firstVisible = viewableItems.find(v => v.isViewable);
    setVisibleVideoIndex(firstVisible?.index ?? null);
  }).current;

  const handleDestaquePress = useCallback(() => {
    if (destaqueMes) {
      rootNavigation.navigate("Reels", {
        initialIndex: 0,
        stories: [{
          id: 'destaque',
          title: destaqueMes.title,
          username: '@BoraBailar',
          thumbnail: destaqueMes.thumbnail,
          videoUrl: destaqueMes.videoUrl,
        }]
      });
    }
  }, [rootNavigation, destaqueMes]);

  const handleRecomendacaoPress = useCallback((title: string, price: string, discount: string, image: string) => {
    rootNavigation.navigate("FaltaPouco", {
      eventName: title,
      eventDetails: `${price} | ${discount}`,
      eventImage: image,
    });
  }, [rootNavigation]);

  const handleUploadPress = useCallback(async () => {
    try {
      // 1. Selecionar vídeo
      const video = await videoService.pickVideo();
      if (!video) return;

      // 2. Validar tamanho
      await videoService.validateVideoSize(video.uri);

      // 3. Selecionar thumbnail
      Alert.alert(
        "Thumbnail",
        "Agora selecione uma imagem de capa para o vídeo",
        [
          {
            text: "Selecionar",
            onPress: async () => {
              try {
                const thumbnail = await videoService.pickThumbnail();
                if (!thumbnail) return;

                // Navigate to the post creation screen
                rootNavigation.navigate("UploadPost", {
                  videoUri: video.uri,
                  thumbnailUri: thumbnail.uri
                });
              } catch (err: any) {
                Alert.alert("Erro", err.message);
              }
            },
          },
          { text: "Cancelar", style: "cancel" },
        ]
      );
    } catch (err: any) {
      Alert.alert("Erro", err.message);
    }
  }, []);

  const handleWizardSearch = useCallback((filters: {
    city: typeof ALL_NEIGHBORHOODS[0] | null;
    date: typeof DATE_OPTIONS[0] | null;
    companion: typeof COMPANION_OPTIONS[0] | null;
  }) => {
    // Update individual selected values
    setSelectedCity(filters.city);
    setSelectedDate(filters.date);
    setSelectedCompanion(filters.companion);
    (navigation as any).navigate("Explorar", {
      city: filters.city?.id,
      date: filters.date?.id,
      companion: filters.companion?.id
    });
  }, [navigation]);

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      {!isLoggedIn ? (
        <Animated.View style={[styles.topHeader, { paddingTop: insets.top }, authButtonsStyle]}>
          <Pressable style={styles.authButton} onPress={handleSignUp}>
            <Text style={styles.authButtonText}>SIGN UP</Text>
          </Pressable>
          <View style={styles.topHeaderSpacer} />
          <Pressable style={styles.authButton}>
            <Text style={styles.authButtonText}>LOG IN</Text>
          </Pressable>
        </Animated.View>
      ) : null}

      <Animated.View
        style={[styles.stickyHeader, stickyHeaderStyle, { paddingTop: insets.top }]}
        onLayout={handleStickyHeaderLayout}
      >
        <View style={styles.stickyHeaderRow}>
          <View style={styles.stickyHeaderContent}>
            <Image source={logoImage} style={styles.stickyLogo} resizeMode="contain" />
            <Text style={styles.stickyBrandName}>
              <Text style={{color: Colors.dark.brand}}>B</Text><Text style={styles.brandGray}>ORABAILAR</Text>
            </Text>
          </View>
          <Pressable
            style={({ pressed }) => [
              styles.stickyBellButton,
              pressed && { opacity: 0.7 }
            ]}
            onPress={handleBellPress}
          >
            <Feather name="bell" size={22} color={Colors.dark.textSecondary} />
          </Pressable>
        </View>
        <Animated.View style={[styles.collapsedWizardContainer, collapsedWizardStyle]}>
          <CollapsedSearchBar onPress={() => setWizardModalVisible(true)} />
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
          paddingTop: insets.top + 40,
          paddingBottom: tabBarHeight + Spacing.xl,
        }}
        scrollIndicatorInsets={{ bottom: insets.bottom }}
        showsVerticalScrollIndicator={false}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
      >
        <Animated.View style={[styles.heroSection, heroAnimatedStyle]}>
          <Image source={logoImage} style={styles.logo} resizeMode="contain" />
          <Text style={styles.brandName}>
            <Text style={{color: Colors.dark.brand}}>B</Text><Text style={styles.brandGray}>ORABAILAR</Text>
          </Text>
          <Text style={styles.tagline}>{homeTexts?.hero_tagline ?? 'SAIR, DANÇAR E SE DIVERTIR!'}</Text>
        </Animated.View>

        {/* Wizard */}
        <Animated.View style={[styles.wizardSection, expandedWizardStyle]}>
          <View style={styles.wizardContainer}>
            {/* 3 boxes idênticos com chevron */}
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
              type="chevron"
              onPress={() => setComQuemModalVisible(true)}
              hasValue={!!selectedCompanion}
            />

            {/* Botão Buscar (lupa) — compacto */}
            <Pressable
              style={({ pressed }) => [
                styles.wizardSearchButton,
                (selectedCity && selectedDate && selectedCompanion)
                  ? styles.wizardSearchButtonActive
                  : styles.wizardSearchButtonInactive,
                pressed && { opacity: 0.85, transform: [{ scale: 0.96 }] },
              ]}
              onPress={() => {
                if (selectedCity && selectedDate && selectedCompanion) {
                  (navigation as any).navigate("Explorar", {
                    city: selectedCity.id,
                    date: selectedDate.id,
                    companion: selectedCompanion.id
                  });
                } else {
                  if (!selectedCity) setOndeModalVisible(true);
                  else if (!selectedDate) setQuandoModalVisible(true);
                  else if (!selectedCompanion) setComQuemModalVisible(true);
                }
              }}
            >
              <Feather name="search" size={18} color="#FFFFFF" />
              <Text style={styles.wizardSearchButtonText}>Buscar</Text>
            </Pressable>

            {/* Botão Limpar Filtros (#8) — aparece quando algum filtro está selecionado */}
            {(selectedCity || selectedDate || selectedCompanion) && (
              <Pressable
                style={({ pressed }) => [
                  { alignSelf: 'center', paddingVertical: Spacing.sm, paddingHorizontal: Spacing.md },
                  pressed && { opacity: 0.6 },
                ]}
                onPress={() => {
                  setSelectedCity(null);
                  setSelectedDate(null);
                  setSelectedCompanion(null);
                }}
              >
                <Text style={{ fontSize: 13, color: Colors.dark.textSecondary, textDecorationLine: 'underline' }}>Limpar filtros</Text>
              </Pressable>
            )}
          </View>
        </Animated.View>

        {/* Conteúdo abaixo do wizard — sobe suavemente com scroll */}
        <Animated.View style={contentSlideUpStyle}>

          {/* Seção Mic — fora do wizard, em div própria cinza */}
          <Pressable
            style={({ pressed }) => [
              styles.micStandaloneContainer,
              isRecording && { borderWidth: 2, borderColor: Colors.dark.brand },
              pressed && { opacity: 0.85 },
            ]}
            onPress={handleMicPress}
            disabled={isTranscribing}
          >
            <Text style={styles.micStandaloneText}>
              {isRecording
                ? "Gravando... Toque para parar e enviar"
                : isTranscribing
                  ? "Transcrevendo seu áudio..."
                  : (
                    <>
                      <Text>Se quiser, conta mais </Text>
                      <Text style={{ fontSize: 16, fontWeight: '800', color: Colors.dark.brand }}>AQUI</Text>
                      <Text> sobre você e sobre o que você procura</Text>
                    </>
                  )
              }
            </Text>
            <Feather name="chevron-right" size={18} color={Colors.dark.brand} style={{ marginRight: -4 }} />
            <View style={[
              styles.aiMicButton,
              isRecording && { backgroundColor: '#FF3B30' },
              isTranscribing && { backgroundColor: Colors.dark.textSecondary },
            ]}>
              <Feather
                name={isTranscribing ? "loader" : "mic"}
                size={26}
                color="#FFFFFF"
              />
            </View>
          </Pressable>

          {/* Sections */}
          <View style={styles.quererSection} onLayout={handleQuererLayout}>
            <Text style={styles.sectionTitle}>
              {homeTexts?.quero_section_title ?? 'O seu querer faz acontecer'}
            </Text>
            <Text style={{ fontSize: 14, color: Colors.dark.textSecondary, marginBottom: Spacing.lg }}>
              Marque aqui o que você deseja
            </Text>
            <View style={styles.quererGrid}>
              {querer.map((item: any) => (
                <QuererCard
                  key={item.id}
                  title={item.title}
                  description={item.description}
                  image={item.image}
                  onPress={() => handleQuererCardPress(item.title, item.description)}
                />
              ))}
            </View>
          </View>

          <View style={[styles.momentoSection, { backgroundColor: '#F8F8F8', borderRadius: BorderRadius.xl, padding: Spacing.xl, marginHorizontal: -Spacing.lg }]} onLayout={handleMomentoLayout}>
            <Text style={styles.momentoTitle}>
              {homeTexts?.momento_title ?? 'Momento dança é Momento feliz'}
            </Text>
            <Text style={styles.momentoSubtitle}>
              Para quem curte ver gente feliz em momentos felizes. Compartilhe aqui os seus passos.
            </Text>
            <FlatList
              horizontal
              data={videoStories}
              keyExtractor={(item) => item.id}
              showsHorizontalScrollIndicator={false}
              nestedScrollEnabled={true}
              contentContainerStyle={styles.videoStoriesContainer}
              viewabilityConfig={videoViewabilityConfig}
              onViewableItemsChanged={onVideoViewableItemsChanged}
              renderItem={({ item, index }) => (
                <VideoStoryCard
                  title={item.title}
                  username={item.username}
                  thumbnail={item.thumbnail}
                  videoUrl={item.videoUrl}
                  isVisible={index === visibleVideoIndex}
                  onPress={() => handleVideoStoryPress(index)}
                />
              )}
            />
            <UploadButton onPress={handleUploadPress} />

          </View>

          {groupedTipsByDay.length > 0 && (
            <View style={styles.dicasDaSemanaSection} onLayout={handleDicasLayout}>
              <Text style={styles.dicasDaSemanaTitle}>{homeTexts?.dicas_title ?? 'Dicas da semana'}</Text>
              {homeTexts?.dicas_subtitle ? (
                <Text style={styles.dicasDaSemanaSubtitle}>{homeTexts.dicas_subtitle}</Text>
              ) : null}
              <View style={styles.dicasDaSemanaList}>
                {groupedTipsByDay.map((dayGroup) => (
                  <DicaDaSemanaRow
                    key={dayGroup.dayIndex}
                    day={dayGroup.dayName}
                    date=""
                    dayIndex={dayGroup.dayIndex}
                    dicas={dayGroup.events}
                    onDicaPress={handleDicaPress}
                  />
                ))}
              </View>
            </View>
          )}

          <View style={[styles.topDanceAwardsSection, { backgroundColor: '#F8F8F8', borderRadius: BorderRadius.xl, padding: Spacing.xl }]} onLayout={handleAwardsLayout}>
            <View style={styles.topDanceAwardsHeader}>
              <View style={styles.topDanceAwardsTextContent}>
                <Text style={[styles.topDanceAwardsBrandText, { fontSize: 20, fontWeight: '800', color: Colors.dark.text, textTransform: 'uppercase' }]}>
                  <Text style={{ color: Colors.dark.brand }}>B</Text>oraBailar TOP 10 DANCE AWARDS
                </Text>
                <Text style={styles.topDanceAwardsSubtitle}>
                  Os melhores da dança, eleitos por você
                </Text>
              </View>
            </View>
            <View style={styles.awardCategoriesList}>
              {awards.map((item: any) => (
                <AwardCategoryCard
                  key={item.id}
                  category={item.category_label || item.category || `Categoria ${item.id}`}
                  title={item.name || item.title}
                  thumbnail={item.image_url ? { uri: item.image_url } : item.thumbnail}
                  highlightWord={item.highlight_word || item.highlightWord}
                  onPress={() => handleAwardCategoryPress(item)}
                />
              ))}
            </View>
            {/* Botão Quero Participar APÓS as categorias */}
            <QueroParticiparButton onPress={handleDanceAwardsPress} />
          </View>

          {/* Destaques do Mês — só 3, sem lateral */}
          <View style={styles.destaquesMesSection}>
            <Text style={styles.destaquesMesTitle}>Destaques do Mês</Text>
            <Text style={styles.destaquesMesSubtitle}>para quem curte ver gente feliz em momentos felizes</Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              {videoStories.slice(0, 3).map((item: any, index: number) => (
                <VideoStoryCard
                  key={`destaque-${item.id}`}
                  title={item.title}
                  username={item.username}
                  thumbnail={item.thumbnail}
                  videoUrl={item.videoUrl}
                  isVisible={false}
                  onPress={() => handleVideoStoryPress(index)}
                />
              ))}
            </View>
          </View>

          {/* Parceiros / Marcas */}
          <View onLayout={handlePartnersLayout}>
            <PartnersCarousel partnerCards={partnerCards} homeTexts={homeTexts} />
          </View>
          <PartnerBrands partnerBrands={partnerBrands} homeTexts={homeTexts} />

          {/* Dançando por Uma Causa — última seção (#38, #39) */}
          <View style={styles.beneficenciaSection}>
            <Text style={{ fontSize: 16, color: Colors.dark.primary, marginBottom: 4 }}>♥</Text>
            <Text style={styles.beneficenciaTitle}>Dançando por Uma Causa</Text>
            <View style={{ gap: 8, marginBottom: 12 }}>
              <Text style={styles.beneficenciaSubtitle}>• Projeto Emanuel</Text>
              <Pressable onPress={() => Linking.openURL('https://casaapoiocancer.org.br/')}>
                <Text style={[styles.beneficenciaSubtitle, { color: Colors.dark.brand, textDecorationLine: 'underline' }]}>• Casa da Criança com Câncer</Text>
              </Pressable>
            </View>
            <Text style={styles.beneficenciaSubtitle}>
              Parte da nossa receita é destinada a causas sociais.{"\n"}Ao usar o BoraBailar, você também faz a diferença.
            </Text>
          </View>

        </Animated.View>{/* Close contentSlideUpStyle wrapper */}

        <View style={{ height: tabBarHeight + Spacing.xl }} />
      </Animated.ScrollView>

      {/* Modals */}
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
        isTranscribing={isTranscribing}
        transcript={transcript}
      />

      {/* Modal de Preview da Categoria do Top Dance Awards */}
      <Modal
        visible={!!selectedAwardCategory}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedAwardCategory(null)}
      >
        <Pressable
          style={styles.awardPreviewOverlay}
          onPress={() => setSelectedAwardCategory(null)}
        >
          <Pressable style={styles.awardPreviewContainer} onPress={(e) => e.stopPropagation()}>
            {selectedAwardCategory && (
              <>
                <Image
                  source={selectedAwardCategory.thumbnail}
                  style={styles.awardPreviewImage}
                  resizeMode="cover"
                />
                <Text style={styles.awardPreviewCategory}>{selectedAwardCategory.category}</Text>
                <Text style={styles.awardPreviewTitle}>{selectedAwardCategory.title}</Text>
                <Pressable
                  style={({ pressed }) => [
                    styles.awardPreviewButton,
                    pressed && { opacity: 0.9 },
                  ]}
                  onPress={handleAwardCategoryParticipate}
                >
                  <Text style={styles.awardPreviewButtonText}>Participar desta Categoria</Text>
                </Pressable>
                <Pressable
                  style={styles.awardPreviewCloseButton}
                  onPress={() => setSelectedAwardCategory(null)}
                >
                  <Feather name="x" size={24} color="#666" />
                </Pressable>
              </>
            )}
          </Pressable>
        </Pressable>
      </Modal>

      {/* Wizard Search Modal - Airbnb Style */}
      <WizardSearchModal
        visible={wizardModalVisible}
        onClose={() => setWizardModalVisible(false)}
        onSearch={handleWizardSearch}
        initialCity={selectedCity}
        initialDate={selectedDate}
        initialCompanion={selectedCompanion}
        onMicPress={handleMicPress}
        isRecording={isRecording}
        isTranscribing={isTranscribing}
        transcript={transcript}
      />
    </View >
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollView: { flex: 1 },
  topHeader: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 200,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.sm,
    paddingTop: Spacing.md,
    backgroundColor: "transparent",
  },
  authButtonsContainer: { minWidth: 60 },
  authButton: { paddingVertical: Spacing.sm, paddingHorizontal: Spacing.md },
  authButtonText: { fontSize: 14, fontWeight: "600", color: "#666666", letterSpacing: 0.5 },
  topHeaderSpacer: { flex: 1 },
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
  stickyHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing.sm,
  },
  stickyHeaderContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    gap: Spacing.sm,
  },
  stickyBellButton: { padding: Spacing.xs, position: "absolute", right: 0 },
  stickyLogo: { width: 48, height: 36 },
  stickyBrandName: { fontSize: 24, fontFamily: "Montserrat_700Bold", letterSpacing: 1.5 },
  collapsedWizardContainer: { marginTop: Spacing.xs },
  collapsedSearchBar: {
    backgroundColor: "#F5F5F5",
    borderRadius: 25,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  collapsedSearchText: { fontSize: 15, color: Colors.dark.textSecondary, fontWeight: "400" },
  stickyTitleWrapper: { marginTop: Spacing.sm },
  stickySectionTitleContainer: { paddingVertical: Spacing.xs },
  stickySectionTitle: { fontSize: 16, color: Colors.dark.text },
  heroSection: {
    alignItems: "center",
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xl,
    paddingHorizontal: Spacing.lg,
  },
  logo: { width: 140, height: 100, marginBottom: Spacing.sm },
  brandName: { fontSize: 32, fontFamily: "Montserrat_700Bold", letterSpacing: 2, marginBottom: Spacing.sm },
  brandRed: { color: Colors.dark.brand, fontWeight: "700" },
  brandGray: { color: Colors.dark.textSecondary, fontWeight: "400" },
  tagline: { fontSize: 15, fontWeight: "700", color: Colors.dark.brand, textAlign: "center", letterSpacing: 0.5 },
  wizardSection: { paddingHorizontal: Spacing.lg },
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
  wizardFieldPressed: { backgroundColor: "#F9FAFB" },
  wizardFieldLabel: { fontSize: 16, color: Colors.dark.textSecondary, fontWeight: "400" },
  wizardFieldSelected: { borderWidth: 2, borderColor: "#1F2937", backgroundColor: "#FFFFFF" },
  wizardFieldLabelSelected: { color: "#1F2937", fontWeight: "600" },
  chevronIconContainer: { alignItems: "center", justifyContent: "center" },
  micIconContainer: { width: 42, height: 42, borderRadius: 21, backgroundColor: Colors.dark.brand, alignItems: "center", justifyContent: "center" },
  micCta: { fontSize: 14, color: Colors.dark.brand, textAlign: "center", fontWeight: "500", marginTop: Spacing.sm },
  wizardSearchButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: 25,
    gap: Spacing.xs,
    alignSelf: "center",
  },
  wizardSearchButtonActive: {
    backgroundColor: Colors.dark.brand,
  },
  wizardSearchButtonInactive: {
    backgroundColor: Colors.dark.textSecondary,
  },
  wizardSearchButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
    letterSpacing: 0.3,
  },
  aiMicButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.dark.brand,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.sm,
  },
  micStandaloneContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.dark.wizardBackground,
    borderRadius: BorderRadius.xl,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.lg,
    gap: Spacing.md,
  },
  micStandaloneText: {
    flex: 1,
    fontSize: 13,
    color: Colors.dark.textSecondary,
    fontStyle: "italic",
  },
  helperTextContainer: { alignItems: "center", marginTop: Spacing.md, paddingBottom: Spacing.sm },
  helperText: { fontSize: 15, color: Colors.dark.text, textAlign: "center" },
  helperHighlight: { color: Colors.dark.brand, fontWeight: "700" },
  quererSection: { paddingHorizontal: Spacing.lg, marginTop: Spacing.xl + Spacing.xl },
  sectionTitle: { fontSize: 18, color: Colors.dark.text, marginBottom: Spacing.lg },
  sectionTitleHighlight: { color: Colors.dark.brand, fontWeight: "700" },
  quererGrid: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.md, justifyContent: "space-between" },
  quererCard: { width: CARD_WIDTH, marginBottom: Spacing.md },
  quererImageContainer: { width: "100%", height: CARD_WIDTH * 0.9, borderRadius: BorderRadius.lg, overflow: "hidden", position: "relative" },
  quererImage: { width: "100%", height: "100%" },
  quererOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.3)" },
  quererTitle: { position: "absolute", bottom: Spacing.md, left: Spacing.md, right: Spacing.md, fontSize: 16, fontWeight: "800", color: "#FFFFFF", textShadowColor: "rgba(0,0,0,0.5)", textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 2 },
  quererHeart: { position: "absolute", top: Spacing.sm, right: Spacing.sm },
  heartCircle: { width: 32, height: 32, borderRadius: 16, backgroundColor: "transparent", alignItems: "center", justifyContent: "center" },
  quererContent: { paddingTop: Spacing.sm },
  quererDescription: { fontSize: 13, color: Colors.dark.text, lineHeight: 18 },
  queroPrefix: { color: Colors.dark.brand, fontWeight: "700" },
  momentoSection: { paddingHorizontal: Spacing.lg, marginTop: Spacing.xl + Spacing.lg },
  momentoTitle: { fontSize: 18, color: Colors.dark.text, marginBottom: Spacing.sm },
  momentoSubtitle: { fontSize: 14, color: Colors.dark.textSecondary, marginBottom: Spacing.lg },
  videoStoriesContainer: { paddingRight: Spacing.lg, gap: Spacing.md },
  videoStoryCard: { width: VIDEO_STORY_WIDTH, marginRight: Spacing.xs },
  videoStoryImageContainer: { width: VIDEO_STORY_WIDTH, height: VIDEO_STORY_HEIGHT, borderRadius: BorderRadius.lg, overflow: "hidden", position: "relative" },
  videoStoryImage: { width: "100%", height: "100%" },
  videoStoryPlayIcon: { position: "absolute", bottom: Spacing.sm, left: Spacing.sm, width: 28, height: 28, borderRadius: 14, backgroundColor: "rgba(0,0,0,0.5)", alignItems: "center", justifyContent: "center" },
  videoStoryTitle: { fontSize: 12, color: Colors.dark.text, fontWeight: "500", marginTop: Spacing.xs, lineHeight: 16 },
  videoStoryUsername: { fontSize: 11, color: Colors.dark.textSecondary, marginTop: 2 },
  uploadButton: { flexDirection: "row", backgroundColor: "#FFFFFF", borderRadius: BorderRadius.xl, paddingVertical: Spacing.md, paddingHorizontal: Spacing.lg, marginTop: Spacing.xl, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "#1F2937" },
  uploadButtonText: { fontSize: 14, color: Colors.dark.text, fontWeight: "500" },
  destaqueMesTitle: { fontSize: 18, color: Colors.dark.text, marginTop: Spacing.xl + Spacing.lg, marginBottom: Spacing.lg },
  destaqueMesDescription: { fontSize: 14, color: Colors.dark.textSecondary, marginTop: Spacing.sm, marginBottom: Spacing.md, lineHeight: 20, paddingHorizontal: Spacing.xs },
  destaqueMesUsername: { color: Colors.dark.brand, fontWeight: '600' },
  uploadCallToAction: { fontSize: 14, color: Colors.dark.text, textAlign: 'center', marginTop: Spacing.lg, marginBottom: Spacing.sm, lineHeight: 20 },
  uploadCallToActionHighlight: { color: Colors.dark.brand, fontWeight: '700', fontSize: 16 },
  destaqueMesCard: { width: "100%", height: 200, borderRadius: BorderRadius.lg, overflow: "hidden", position: "relative" },
  destaqueMesImage: { width: "100%", height: "100%" },
  destaqueMesPlayOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.2)", alignItems: "center", justifyContent: "center" },
  destaqueMesPlayButton: { width: 64, height: 64, borderRadius: 32, backgroundColor: "rgba(0,0,0,0.6)", alignItems: "center", justifyContent: "center" },
  topDanceAwardsSection: { paddingHorizontal: Spacing.lg, marginTop: Spacing.xl + Spacing.lg },
  topDanceAwardsHeader: { marginBottom: Spacing.lg },
  topDanceAwardsTextContent: { marginTop: Spacing.xs },
  topDanceAwardsBrandText: { fontSize: 13, color: Colors.dark.brand, fontWeight: "700", textTransform: "uppercase" },
  topDanceAwardsTitle: { fontSize: 18, color: Colors.dark.text, textAlign: "left", fontWeight: "600", lineHeight: 26 },
  topDanceAwardsSubtitle: { fontSize: 13, color: Colors.dark.textSecondary, textAlign: "left", marginTop: 4 },
  queroParticiparButton: { flexDirection: "row", backgroundColor: Colors.dark.wizardBackground, borderRadius: BorderRadius.xl, paddingVertical: Spacing.md, paddingHorizontal: Spacing.xl, alignItems: "center", justifyContent: "center", marginTop: Spacing.xl, borderWidth: 1, borderColor: "rgba(255,255,255,0.25)" },
  queroParticiparButtonText: { fontSize: 15, color: Colors.dark.textSecondary, fontWeight: "600" },
  awardCategoriesList: { gap: Spacing.md },
  awardCategoryCard: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: Spacing.md, borderBottomWidth: 1, borderBottomColor: "#F0F0F0" },
  awardCategoryContent: { flex: 1, marginRight: Spacing.md },
  awardCategoryNumber: { fontSize: 12, color: Colors.dark.textSecondary, marginBottom: Spacing.xs },
  awardCategoryTitle: { fontSize: 15, color: Colors.dark.text, fontWeight: "600" },
  awardCategoryHighlight: { color: Colors.dark.brand, fontWeight: "700" },
  awardCategoryThumbnail: { width: 76, height: 56, borderRadius: BorderRadius.md },
  dicasDaSemanaSection: { paddingHorizontal: Spacing.lg, marginTop: Spacing.xl + Spacing.lg },
  dicasDaSemanaTitle: { fontSize: 18, color: Colors.dark.text, fontWeight: "600", marginBottom: Spacing.xs },
  dicasDaSemanaSubtitle: { fontSize: 14, color: Colors.dark.textSecondary, marginBottom: Spacing.lg },
  dicasDaSemanaList: { gap: Spacing.xl },
  dicaDaSemanaRow: { marginBottom: Spacing.md },
  dicaDayHeader: { flexDirection: "row", alignItems: "center", marginBottom: Spacing.md },
  dicaDayName: { fontSize: 16, color: Colors.dark.brand, fontWeight: "600" },
  dicaDate: { fontSize: 14, color: Colors.dark.textSecondary, marginLeft: Spacing.xs },
  dicasEventScrollContainer: { gap: Spacing.md, paddingRight: Spacing.lg },
  dicaEventCard: { width: DICA_EVENT_CARD_WIDTH },
  dicaEventImage: { width: DICA_EVENT_CARD_WIDTH, height: 84, borderRadius: BorderRadius.md, marginBottom: Spacing.xs }, // Height increased by 4px
  dicaEventTitle: { fontSize: 11, color: Colors.dark.text, fontWeight: "500", lineHeight: 14 },
  dicaEventPrice: { fontSize: 10, color: Colors.dark.textSecondary, marginTop: 2 },
  recomendacoesSection: { paddingHorizontal: Spacing.lg, marginTop: Spacing.xl + Spacing.lg },
  recomendacoesTitle: { fontSize: 18, color: Colors.dark.text, fontWeight: "600", marginBottom: Spacing.lg },
  recomendacoesContainer: { paddingRight: Spacing.lg, gap: Spacing.md },
  ofertaCard: { width: OFERTA_CARD_WIDTH },
  ofertaImageContainer: { width: OFERTA_CARD_WIDTH, height: OFERTA_CARD_HEIGHT, borderRadius: BorderRadius.lg, overflow: "hidden", position: "relative" },
  ofertaImage: { width: "100%", height: "100%" },
  ofertaDiscountBadge: { position: "absolute", top: Spacing.sm, left: Spacing.sm, backgroundColor: Colors.dark.brand, paddingHorizontal: Spacing.sm, paddingVertical: Spacing.xs, borderRadius: BorderRadius.sm },
  ofertaDiscountText: { color: "#FFFFFF", fontSize: 10, fontWeight: "700" },
  ofertaHeartButton: { position: "absolute", top: Spacing.sm, right: Spacing.sm, width: 32, height: 32, borderRadius: 16, backgroundColor: "rgba(0,0,0,0.4)", alignItems: "center", justifyContent: "center" },
  ofertaTitle: { fontSize: 13, color: Colors.dark.text, fontWeight: "500", marginTop: Spacing.sm },
  ofertaPrice: { fontSize: 11, color: Colors.dark.textSecondary, marginTop: 2 },
  // Award Category Preview Modal Styles
  awardPreviewOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.7)", justifyContent: "center", alignItems: "center", padding: Spacing.xl },
  awardPreviewContainer: { backgroundColor: "#FFFFFF", borderRadius: BorderRadius.xl, padding: Spacing.xl, width: "100%", maxWidth: 340, alignItems: "center", position: "relative" },
  awardPreviewImage: { width: "100%" as any, height: 250, borderRadius: BorderRadius.lg, marginBottom: Spacing.lg, backgroundColor: "#F5F5F5" },
  awardPreviewCategory: { fontSize: 12, color: Colors.dark.textSecondary, textTransform: "uppercase", letterSpacing: 1, marginBottom: Spacing.xs },
  awardPreviewTitle: { fontSize: 20, color: Colors.dark.brand, fontWeight: "700", textAlign: "center", marginBottom: Spacing.xl },
  awardPreviewButton: { backgroundColor: Colors.dark.brand, borderRadius: BorderRadius.xl, paddingVertical: Spacing.md, paddingHorizontal: Spacing.xl + Spacing.lg, alignItems: "center" },
  awardPreviewButtonText: { fontSize: 15, color: "#FFFFFF", fontWeight: "600" },
  awardPreviewCloseButton: { position: "absolute", top: Spacing.md, right: Spacing.md, width: 36, height: 36, borderRadius: 18, backgroundColor: "#F0F0F0", alignItems: "center", justifyContent: "center" },

  // Campo AI Prompt
  aiPromptContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    marginTop: Spacing.sm,
  },
  aiPromptText: {
    flex: 1,
    fontSize: 13,
    color: Colors.dark.textSecondary,
    fontStyle: "italic",
  },

  // Awards section extras
  awardsLogoHeader: {
    width: 120,
    height: 40,
    alignSelf: "center",
    marginBottom: Spacing.sm,
    tintColor: Colors.dark.brand,
  },
  topDanceAwardsLogoImage: {
    width: 300,
    height: 72,
    alignSelf: "flex-start",
    marginBottom: Spacing.xs,
  },
  awardsTagline: {
    fontSize: 13,
    color: Colors.dark.textSecondary,
    textAlign: "center",
    fontStyle: "italic",
    marginBottom: Spacing.lg,
    paddingHorizontal: Spacing.lg,
  },

  // Destaques do Mês section
  destaquesMesSection: {
    paddingHorizontal: Spacing.lg,
    marginTop: Spacing.xl + Spacing.lg,
  },
  destaquesMesTitle: {
    fontSize: 20,
    color: Colors.dark.text,
    fontWeight: "700",
    marginBottom: Spacing.xs,
  },
  destaquesMesSubtitle: {
    fontSize: 13,
    color: Colors.dark.textSecondary,
    fontStyle: "italic",
    marginBottom: Spacing.lg,
  },
  destaqueStripCard: {
    width: 130,
  },
  destaqueStripImage: {
    width: 130,
    height: 170,
    borderRadius: BorderRadius.lg,
  },
  destaqueStripOverlay: {
    ...StyleSheet.absoluteFillObject,
    top: 0,
    width: 130,
    height: 170,
    borderRadius: BorderRadius.lg,
    backgroundColor: "rgba(0,0,0,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  destaqueStripPlay: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  destaqueStripTitle: {
    fontSize: 12,
    color: Colors.dark.text,
    fontWeight: "600",
    marginTop: Spacing.xs,
  },
  destaquesMesEmpty: {
    height: 160,
    borderRadius: BorderRadius.lg,
    backgroundColor: "rgba(255,255,255,0.05)",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
  },
  destaquesMesEmptyText: {
    fontSize: 13,
    color: Colors.dark.textSecondary,
  },

  // Beneficência section
  beneficenciaSection: {
    marginTop: Spacing.xl + Spacing.lg,
    marginHorizontal: Spacing.lg,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: Colors.dark.brand + "30",
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  beneficenciaTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.dark.text,
    textAlign: "center",
    marginBottom: Spacing.sm,
  },
  beneficenciaSubtitle: {
    fontSize: 12,
    color: Colors.dark.textSecondary,
    textAlign: "center",
    lineHeight: 18,
  },
});

