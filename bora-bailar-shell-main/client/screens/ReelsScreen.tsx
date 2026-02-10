import React, { useState, useRef, useCallback, useEffect, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  StatusBar,
  AppState,
  useWindowDimensions,
} from "react-native";
import { FlashList, ViewToken } from "@shopify/flash-list";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useNavigation, useRoute, RouteProp, useFocusEffect } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useVideoPlayer, VideoView } from "expo-video";
import { Image } from "expo-image";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { LinearGradient } from "expo-linear-gradient";
import { useTabBar } from "@/contexts/TabBarContext";


type ReelItem = {
  id: string;
  username: string;
  displayName: string;
  verified: boolean;
  description: string;
  thumbnail: any;
  videoUrl: string;
  likes: number;
  comments: number;
  shares: number;
};

const REELS_DATA: ReelItem[] = [
  {
    id: "1",
    username: "@Josias.BoraBailar",
    displayName: "Josias",
    verified: true,
    description: "Dançando com a gata em Ipanema",
    thumbnail: require("../../attached_assets/stock_images/person_dancing_happi_798bff4b.jpg"),
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    likes: 1234,
    comments: 89,
    shares: 45,
  },
  {
    id: "2",
    username: "@Julia.Danca",
    displayName: "Julia",
    verified: true,
    description: "Samba no pé na Lapa!",
    thumbnail: require("../../attached_assets/stock_images/person_dancing_happi_214e72d0.jpg"),
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    likes: 2567,
    comments: 156,
    shares: 78,
  },
  {
    id: "3",
    username: "@Carlos.Forró",
    displayName: "Carlos",
    verified: false,
    description: "Forró universitário é vida!",
    thumbnail: require("../../attached_assets/stock_images/person_dancing_happi_8c1c5cba.jpg"),
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
    likes: 890,
    comments: 34,
    shares: 12,
  },
  {
    id: "4",
    username: "@Ana.Salsa",
    displayName: "Ana",
    verified: true,
    description: "Noite de salsa no Rio",
    thumbnail: require("../../attached_assets/stock_images/person_dancing_happi_0e460040.jpg"),
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
    likes: 3456,
    comments: 234,
    shares: 123,
  },
  {
    id: "5",
    username: "@Pedro.Zouk",
    displayName: "Pedro",
    verified: false,
    description: "Zouk brasileiro com muito amor",
    thumbnail: require("../../attached_assets/stock_images/person_dancing_happi_24afcbbe.jpg"),
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4",
    likes: 1567,
    comments: 67,
    shares: 34,
  },
  {
    id: "6",
    username: "@Maria.Tango",
    displayName: "Maria",
    verified: true,
    description: "Tango argentino no coração",
    thumbnail: require("../../attached_assets/stock_images/person_dancing_happi_dbae0db5.jpg"),
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
    likes: 4567,
    comments: 345,
    shares: 189,
  },
];

type ReelCardProps = {
  item: ReelItem;
  isVisible: boolean;
  onLike: () => void;
  onComment: () => void;
  onShare: () => void;
};

function ReelCard({ item, isVisible, onLike, onComment, onShare }: ReelCardProps) {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(item.likes);
  const [commentCount] = useState(item.comments);
  const [shareCount, setShareCount] = useState(item.shares);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const insets = useSafeAreaInsets();

  const player = useVideoPlayer(item.videoUrl, (p) => {
    p.loop = true;
  });

  useEffect(() => {
    if (isVisible && player) {
      player.play();
    } else if (player) {
      player.pause();
    }
  }, [isVisible, player]);

  useEffect(() => {
    if (player) {
      const subscription = player.addListener("playingChange", (isPlaying) => {
        if (isPlaying) {
          setIsVideoLoaded(true);
        }
      });
      return () => subscription.remove();
    }
  }, [player]);

  const handleLike = () => {
    if (!liked) {
      setLikeCount(prev => prev + 1);
    } else {
      setLikeCount(prev => prev - 1);
    }
    setLiked(!liked);
    onLike();
  };

  const handleShare = () => {
    setShareCount(prev => prev + 1);
    onShare();
  };

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K";
    }
    return num.toString();
  };

  return (
    <View style={styles.reelContainer}>
      {!isVideoLoaded ? (
        <Image
          source={item.thumbnail}
          style={styles.posterImage}
          contentFit="cover"
        />
      ) : null}

      <VideoView
        player={player}
        style={[styles.video, { opacity: isVideoLoaded ? 1 : 0 }]}
        contentFit="cover"
        nativeControls={false}
      />

      <LinearGradient
        colors={["rgba(0,0,0,0.4)", "transparent", "transparent", "rgba(0,0,0,0.7)"]}
        locations={[0, 0.2, 0.5, 1]}
        style={styles.gradient}
      />

      <View style={[styles.tooltipContainer, { top: insets.top + 60 }]}>
        <View style={styles.tooltip}>
          <Feather name="filter" size={16} color={Colors.dark.text} />
          <Text style={styles.tooltipText}>
            Você pode escolher aqui o seu estilo de dança favorito, e assistirá um conteúdo específico
          </Text>
        </View>
      </View>

      <View style={[styles.sideActions, { bottom: insets.bottom + 160 }]}>
        <Pressable style={styles.actionButton} onPress={handleLike}>
          <Feather
            name="heart"
            size={28}
            color={liked ? Colors.dark.brand : "#FFFFFF"}
          />
          <Text style={styles.actionText}>{formatNumber(likeCount)}</Text>
        </Pressable>

        <Pressable style={styles.actionButton} onPress={onComment}>
          <Feather name="message-circle" size={28} color="#FFFFFF" />
          <Text style={styles.actionText}>{formatNumber(commentCount)}</Text>
        </Pressable>

        <Pressable style={styles.actionButton} onPress={handleShare}>
          <Feather name="send" size={28} color="#FFFFFF" />
          <Text style={styles.actionText}>{formatNumber(shareCount)}</Text>
        </Pressable>
      </View>

      <View style={[styles.bottomContent, { bottom: insets.bottom + 20 }]}>
        <View style={styles.userInfo}>
          <Text style={styles.username}>
            {item.username}
            {item.verified ? (
              <Text> <Feather name="check-circle" size={14} color="#4FC3F7" /></Text>
            ) : null}
          </Text>
          <Text style={styles.description}>{item.description}</Text>
        </View>

        <View style={styles.sharePrompt}>
          <Text style={styles.sharePromptText}>
            Quer compartilhar o seu momento dança, mensagem ou depoimento?
          </Text>
          <Pressable style={styles.shareButton}>
            <Text style={styles.shareButtonText}>É AQUI!</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

export type ReelsScreenParams = {
  initialIndex?: number;
  stories?: Array<{
    id: string;
    title: string;
    username: string;
    thumbnail: any;
    videoUrl?: string;
  }>;
};

export default function ReelsScreen() {
  const insets = useSafeAreaInsets();
  const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = useWindowDimensions();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<{ Reels: ReelsScreenParams }, "Reels">>();
  const listRef = useRef<any>(null);
  const [visibleIndex, setVisibleIndex] = useState<number | null>(null);
  const { isTabBarVisible } = useTabBar();
  const appState = useRef(AppState.currentState);

  // Convert stories from params to ReelItems, fallback to hardcoded data
  const reelsData = useMemo(() => {
    if (route.params?.stories && route.params.stories.length > 0) {
      return route.params.stories.map((story): ReelItem => ({
        id: story.id,
        username: story.username,
        displayName: story.username.replace('@', ''),
        verified: false,
        description: story.title,
        thumbnail: story.thumbnail,
        videoUrl: story.videoUrl!,
        likes: Math.floor(Math.random() * 5000),
        comments: Math.floor(Math.random() * 200),
        shares: Math.floor(Math.random() * 100),
      }));
    }
    return REELS_DATA;
  }, [route.params?.stories]);

  // Clamp initialIndex to valid range to prevent out-of-bounds errors
  const rawInitialIndex = route.params?.initialIndex ?? 0;
  const initialIndex = Math.min(Math.max(rawInitialIndex, 0), reelsData.length - 1);

  // ✅ Autoplay inicial (evita tela "morta")
  useEffect(() => {
    if (reelsData?.length && visibleIndex === null) {
      setVisibleIndex(initialIndex);
    }
  }, [reelsData?.length, initialIndex]);

  // ✅ Pausar no background (AppState)
  useEffect(() => {
    const sub = AppState.addEventListener("change", (nextState) => {
      if (appState.current === "active" && nextState.match(/inactive|background/)) {
        setVisibleIndex(null); // pausa tudo
      } else if (nextState === "active" && appState.current.match(/inactive|background/)) {
        // Retomar quando volta pro app
        setVisibleIndex(initialIndex);
      }
      appState.current = nextState;
    });
    return () => sub.remove();
  }, [initialIndex]);

  useFocusEffect(
    useCallback(() => {
      StatusBar.setHidden(true, "fade");
      isTabBarVisible.value = false;
      return () => {
        StatusBar.setHidden(false, "fade");
        isTabBarVisible.value = true;
        setVisibleIndex(null); // ✅ Pausar ao sair da tela
      };
    }, [isTabBarVisible])
  );

  // ✅ Viewability robusto com debounce
  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 80,
    minimumViewTime: 150, // evita troca rápida
  }).current;

  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken<ReelItem>[] }) => {
    if (!viewableItems?.length) return;
    const visible = viewableItems.find((v) => v.isViewable);
    if (visible?.index != null) {
      setVisibleIndex(visible.index);
    }
  }).current;

  const handleBack = () => {
    navigation.goBack();
  };

  const handleLike = useCallback(() => { }, []);
  const handleComment = useCallback(() => { }, []);
  const handleShare = useCallback(() => { }, []);

  const renderItem = useCallback(({ item, index }: { item: ReelItem; index: number }) => {
    return (
      <View style={{ width: SCREEN_WIDTH, height: SCREEN_HEIGHT }}>
        <ReelCard
          item={item}
          isVisible={index === visibleIndex}
          onLike={handleLike}
          onComment={handleComment}
          onShare={handleShare}
        />
      </View>
    );
  }, [visibleIndex, handleLike, handleComment, handleShare, SCREEN_WIDTH, SCREEN_HEIGHT]);

  return (
    <View style={styles.container}>
      <View style={[styles.topActions, { top: insets.top + Spacing.sm }]}>
        <Pressable style={styles.backButton} onPress={handleBack}>
          <Feather name="chevron-left" size={28} color="#FFFFFF" />
        </Pressable>
      </View>

      <FlashList
        ref={listRef}
        data={reelsData}
        extraData={visibleIndex}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        decelerationRate="fast"
        initialScrollIndex={initialIndex}
        viewabilityConfig={viewabilityConfig}
        onViewableItemsChanged={onViewableItemsChanged}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  flatList: {
    flex: 1,
  },
  topActions: {
    position: "absolute",
    left: Spacing.sm,
    zIndex: 100,
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.3)",
    borderRadius: 22,
  },
  reelContainer: {
    width: "100%",
    height: "100%",
    position: "relative",
    backgroundColor: "#000000",
  },
  video: {
    width: "100%",
    height: "100%",
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  posterImage: {
    width: "100%",
    height: "100%",
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  gradient: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
  tooltipContainer: {
    position: "absolute",
    left: Spacing.md,
    right: 60,
  },
  tooltip: {
    backgroundColor: "rgba(255,255,255,0.95)",
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.sm,
  },
  tooltipText: {
    flex: 1,
    fontSize: 13,
    color: Colors.dark.text,
    lineHeight: 18,
  },
  sideActions: {
    position: "absolute",
    right: Spacing.md,
    alignItems: "center",
    gap: Spacing.lg,
  },
  actionButton: {
    alignItems: "center",
    gap: 4,
  },
  actionText: {
    fontSize: 12,
    color: "#FFFFFF",
    fontWeight: "600",
  },
  bottomContent: {
    position: "absolute",
    left: 0,
    right: 0,
    paddingHorizontal: Spacing.md,
  },
  userInfo: {
    marginBottom: Spacing.md,
  },
  username: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: "#FFFFFF",
    opacity: 0.9,
  },
  sharePrompt: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    gap: Spacing.sm,
  },
  sharePromptText: {
    flex: 1,
    fontSize: 12,
    color: "#FFFFFF",
    opacity: 0.9,
  },
  shareButton: {
    backgroundColor: Colors.dark.brand,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  shareButtonText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});
