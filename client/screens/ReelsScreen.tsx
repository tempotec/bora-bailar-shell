import React, { useState, useRef, useCallback, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  FlatList,
  Pressable,
  ViewToken,
  StatusBar,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Image } from "expo-image";
import { Colors, Spacing, BorderRadius, Fonts } from "@/constants/theme";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { LinearGradient } from "expo-linear-gradient";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

type ReelItem = {
  id: string;
  username: string;
  displayName: string;
  verified: boolean;
  description: string;
  thumbnail: any;
  videoUrl?: string;
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
      <Image
        source={item.thumbnail}
        style={styles.reelImage}
        contentFit="cover"
      />
      
      <LinearGradient
        colors={["transparent", "rgba(0,0,0,0.3)", "rgba(0,0,0,0.7)"]}
        style={styles.gradient}
      />

      <View style={styles.tooltipContainer}>
        <View style={styles.tooltip}>
          <Feather name="filter" size={16} color={Colors.dark.text} />
          <Text style={styles.tooltipText}>
            Você pode escolher aqui o seu estilo de dança favorito, e assistirá um conteúdo específico
          </Text>
        </View>
      </View>

      <View style={styles.sideActions}>
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

      <View style={styles.bottomContent}>
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

      <View style={styles.swipeHint}>
        <Text style={styles.swipeHintText}>Arraste para baixo para ver mais</Text>
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
  }>;
};

export default function ReelsScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<{ Reels: ReelsScreenParams }, "Reels">>();
  const flatListRef = useRef<FlatList>(null);
  const [visibleIndex, setVisibleIndex] = useState(route.params?.initialIndex || 0);

  const initialIndex = route.params?.initialIndex || 0;

  useEffect(() => {
    if (initialIndex > 0 && flatListRef.current) {
      setTimeout(() => {
        flatListRef.current?.scrollToIndex({ index: initialIndex, animated: false });
      }, 100);
    }
  }, [initialIndex]);

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 80,
  }).current;

  const onViewableItemsChanged = useCallback(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems.length > 0) {
      const firstVisibleItem = viewableItems[0];
      if (firstVisibleItem.index !== null) {
        setVisibleIndex(firstVisibleItem.index);
      }
    }
  }, []);

  const handleBack = () => {
    navigation.goBack();
  };

  const handleLike = useCallback(() => {
  }, []);

  const handleComment = useCallback(() => {
  }, []);

  const handleShare = useCallback(() => {
  }, []);

  const renderItem = useCallback(({ item, index }: { item: ReelItem; index: number }) => {
    return (
      <ReelCard
        item={item}
        isVisible={index === visibleIndex}
        onLike={handleLike}
        onComment={handleComment}
        onShare={handleShare}
      />
    );
  }, [visibleIndex, handleLike, handleComment, handleShare]);

  const getItemLayout = useCallback((_: any, index: number) => ({
    length: SCREEN_HEIGHT,
    offset: SCREEN_HEIGHT * index,
    index,
  }), []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <Pressable style={styles.backButton} onPress={handleBack}>
          <Feather name="chevron-left" size={28} color="#FFFFFF" />
        </Pressable>
        
        <Text style={styles.headerTitle}>M</Text>
        
        <Pressable style={styles.notificationButton}>
          <Feather name="bell" size={24} color="#FFFFFF" />
        </Pressable>
      </View>

      <FlatList
        ref={flatListRef}
        data={REELS_DATA}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        snapToAlignment="start"
        decelerationRate="fast"
        getItemLayout={getItemLayout}
        initialScrollIndex={initialIndex}
        viewabilityConfig={viewabilityConfig}
        onViewableItemsChanged={onViewableItemsChanged}
        windowSize={3}
        maxToRenderPerBatch={2}
        removeClippedSubviews={true}
        initialNumToRender={2}
      />

      <View style={[styles.bottomNav, { paddingBottom: insets.bottom }]}>
        <Pressable style={styles.navItem}>
          <Feather name="home" size={24} color="#FFFFFF" />
        </Pressable>
        <Pressable style={styles.navItem}>
          <Feather name="compass" size={24} color="#FFFFFF" />
        </Pressable>
        <Pressable style={styles.navItem}>
          <Feather name="heart" size={24} color="#FFFFFF" />
        </Pressable>
        <Pressable style={styles.navItem}>
          <Feather name="user" size={24} color="#FFFFFF" />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#FFFFFF",
    fontFamily: Fonts?.serif,
  },
  notificationButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  reelContainer: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    position: "relative",
  },
  reelImage: {
    width: "100%",
    height: "100%",
  },
  gradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "50%",
  },
  tooltipContainer: {
    position: "absolute",
    top: 100,
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
    bottom: 200,
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
    bottom: 120,
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
  swipeHint: {
    position: "absolute",
    bottom: 90,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  swipeHintText: {
    fontSize: 12,
    color: "rgba(255,255,255,0.7)",
  },
  bottomNav: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: Spacing.sm,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  navItem: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
});
