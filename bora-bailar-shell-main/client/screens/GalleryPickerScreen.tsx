import React, { useEffect, useState, useCallback } from "react";
import {
  Alert,
  FlatList,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  Image,
} from "react-native";
import * as MediaLibrary from "expo-media-library";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type AssetItem = MediaLibrary.Asset;
type Tab = "POST" | "STORY" | "REEL" | "LIVE";

function formatDuration(seconds: number) {
  const total = Math.floor(seconds);
  const mm = Math.floor(total / 60);
  const ss = total % 60;
  return `${mm}:${String(ss).padStart(2, "0")}`;
}

export default function GalleryPickerScreen() {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const [permission, requestPermission] = MediaLibrary.usePermissions();
  const [assets, setAssets] = useState<AssetItem[]>([]);
  const [selected, setSelected] = useState<AssetItem | null>(null);
  const [tab, setTab] = useState<Tab>("POST");
  const [endCursor, setEndCursor] = useState<string | undefined>();
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    (async () => {
      let current = permission;
      if (!current?.granted) {
        current = await requestPermission();
      }
      if (!current?.granted) {
        Alert.alert(
          "Permissão necessária",
          "Precisamos de acesso à sua galeria para você poder compartilhar seus momentos dança.",
          [{ text: "OK", onPress: () => navigation.goBack() }]
        );
        return;
      }
      await loadAssets();
    })();
  }, []);

  const loadAssets = useCallback(async (after?: string) => {
    const mediaType: MediaLibrary.MediaTypeValue[] =
      tab === "REEL" ? ["video"] : ["photo", "video"];

    const result = await MediaLibrary.getAssetsAsync({
      mediaType,
      first: 80,
      after,
      sortBy: [["creationTime", false]],
    });

    if (after) {
      setAssets((prev) => [...prev, ...result.assets]);
    } else {
      setAssets(result.assets);
      if (result.assets.length > 0) setSelected(result.assets[0]);
    }
    setEndCursor(result.endCursor);
    setHasMore(result.hasNextPage);
  }, [tab]);

  const loadMore = useCallback(() => {
    if (hasMore && endCursor) {
      loadAssets(endCursor);
    }
  }, [hasMore, endCursor, loadAssets]);

  // Reload when tab changes
  useEffect(() => {
    setAssets([]);
    setSelected(null);
    setEndCursor(undefined);
    setHasMore(true);
    if (permission?.granted) {
      loadAssets();
    }
  }, [tab]);

  const handleNext = useCallback(async () => {
    if (!selected) return;

    // Resolve ph:// (iOS Photos) to file:// before navigating
    // React Native's Image component and XHR cannot handle ph:// URIs
    let resolvedUri = selected.uri;
    if (!resolvedUri.startsWith("file://") && !resolvedUri.startsWith("http")) {
      try {
        const info = await MediaLibrary.getAssetInfoAsync(selected);
        if (info.localUri?.startsWith("file://")) {
          resolvedUri = info.localUri;
        }
      } catch {
        // localUri not available — no-op, keep original (will likely fail downstream)
      }
    }

    navigation.navigate("UploadPost", {
      assetId: selected.id,
      mediaUri: resolvedUri,
      mediaType: selected.mediaType === "video" ? "video" : "photo",
      filename: selected.filename,
      duration: selected.duration,
    });
  }, [selected, navigation]);

  const renderItem = useCallback(
    ({ item }: { item: AssetItem }) => {
      const isSelected = selected?.id === item.id;

      return (
        <Pressable style={styles.gridItem} onPress={() => setSelected(item)}>
          <Image source={{ uri: item.uri }} style={styles.gridImage} />
          {item.mediaType === "video" && (
            <View style={styles.videoBadge}>
              <Ionicons name="play" size={10} color="#fff" />
              <Text style={styles.videoBadgeText}>
                {formatDuration(item.duration ?? 0)}
              </Text>
            </View>
          )}
          {isSelected && <View style={styles.selectedOverlay} />}
        </Pressable>
      );
    },
    [selected]
  );

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
          <Ionicons name="close" size={28} color="#fff" />
        </Pressable>
        <Text style={styles.headerTitle}>Novo post</Text>
        <Pressable onPress={handleNext} disabled={!selected} hitSlop={12}>
          <Text
            style={[styles.nextText, !selected && { opacity: 0.4 }]}
          >
            Avançar
          </Text>
        </Pressable>
      </View>

      {/* Preview */}
      <View style={styles.previewContainer}>
        {selected ? (
          <Image
            source={{ uri: selected.uri }}
            style={styles.preview}
            resizeMode="contain"
          />
        ) : (
          <View style={styles.previewPlaceholder}>
            <Ionicons name="images-outline" size={48} color="#555" />
            <Text style={styles.previewPlaceholderText}>
              Selecione uma mídia
            </Text>
          </View>
        )}
      </View>

      {/* Album label */}
      <View style={styles.albumRow}>
        <Text style={styles.albumLabel}>Recentes</Text>
        <Ionicons name="chevron-forward" size={16} color="#fff" />
        <View style={{ flex: 1 }} />
        <Pressable style={styles.selectButton}>
          <Ionicons name="copy-outline" size={14} color="#fff" />
          <Text style={styles.selectButtonText}>Selecionar</Text>
        </Pressable>
      </View>

      {/* Grid */}
      <FlatList
        data={assets}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        numColumns={3}
        contentContainerStyle={styles.grid}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        showsVerticalScrollIndicator={false}
      />

      {/* Tabs */}
      <View style={[styles.tabs, { paddingBottom: insets.bottom || 8 }]}>
        {(["POST", "STORY", "REEL", "LIVE"] as const).map((item) => (
          <Pressable
            key={item}
            onPress={() => setTab(item)}
            style={styles.tabButton}
          >
            <Text
              style={[styles.tabText, tab === item && styles.tabTextActive]}
            >
              {item}
            </Text>
            {tab === item && <View style={styles.tabIndicator} />}
          </Pressable>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  header: {
    height: 56,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
  nextText: {
    color: "#3797EF",
    fontSize: 16,
    fontWeight: "700",
  },
  previewContainer: {
    width: "100%",
    aspectRatio: 1,
    backgroundColor: "#111",
  },
  preview: {
    width: "100%",
    height: "100%",
  },
  previewPlaceholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  previewPlaceholderText: {
    color: "#555",
    fontSize: 14,
  },
  albumRow: {
    height: 44,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    gap: 4,
  },
  albumLabel: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },
  selectButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  selectButtonText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
  },
  grid: {},
  gridItem: {
    width: "33.3333%",
    aspectRatio: 1,
    padding: 1,
  },
  gridImage: {
    width: "100%",
    height: "100%",
  },
  videoBadge: {
    position: "absolute",
    right: 6,
    bottom: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  videoBadgeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "700",
  },
  selectedOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 3,
    borderColor: "#3797EF",
    margin: 1,
  },
  tabs: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    backgroundColor: "#000",
    borderTopWidth: 1,
    borderTopColor: "#222",
  },
  tabButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: "center",
  },
  tabText: {
    color: "#888",
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 1,
  },
  tabTextActive: {
    color: "#fff",
  },
  tabIndicator: {
    position: "absolute",
    bottom: -4,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#fff",
  },
});
