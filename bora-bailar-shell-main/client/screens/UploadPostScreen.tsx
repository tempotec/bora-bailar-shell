import React, { useState, useCallback } from "react";
import {
  Alert,
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons, MaterialIcons, Feather } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useVideoPlayer, VideoView } from "expo-video";
import { API_CONFIG } from "@/config";
import { tokenStore } from "@/services/tokenStore";

// ─── Types ──────────────────────────────────────────────
type Step = "editor" | "publish";

type UploadPostParams = {
  assetId?: string;
  mediaUri: string;
  mediaType: "photo" | "video";
  filename?: string;
  duration?: number;
};

// ─── Upload Service (XHR for progress) ──────────────────
async function uploadMedia({
  mediaUri,
  mediaType,
  caption,
  onProgress,
}: {
  mediaUri: string;
  mediaType: "photo" | "video";
  caption: string;
  onProgress?: (progress: number) => void;
}) {
  const token = await tokenStore.get();

  const formData = new FormData();
  formData.append("video", {
    uri: mediaUri,
    name: mediaType === "video" ? "upload.mp4" : "upload.jpg",
    type: mediaType === "video" ? "video/mp4" : "image/jpeg",
  } as any);
  formData.append("caption", caption);

  return new Promise<any>((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && onProgress) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    };

    xhr.onreadystatechange = () => {
      if (xhr.readyState !== 4) return;
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(JSON.parse(xhr.responseText));
      } else {
        reject(new Error(xhr.responseText || "Falha no upload"));
      }
    };

    xhr.onerror = () => reject(new Error("Erro de rede"));

    const baseUrl = API_CONFIG.BASE_URL.replace("/api", "");
    xhr.open("POST", `${baseUrl}/api/videos/upload`);
    if (token) {
      xhr.setRequestHeader("Authorization", `Bearer ${token}`);
    }
    xhr.send(formData);
  });
}

// ─── Main Component ─────────────────────────────────────
export default function UploadPostScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const insets = useSafeAreaInsets();
  const { mediaUri, mediaType } = route.params as UploadPostParams;

  const [step, setStep] = useState<Step>("editor");
  const [caption, setCaption] = useState("");
  const [overlayText, setOverlayText] = useState("");
  const [showTextInput, setShowTextInput] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Video player for editor (only created for videos)
  const player =
    mediaType === "video"
      ? useVideoPlayer(mediaUri, (p) => {
          p.loop = true;
        })
      : null;

  const handlePlaceholder = useCallback((name: string) => {
    Alert.alert("Em breve", `${name} estará disponível em uma próxima versão.`);
  }, []);

  const handleUpload = useCallback(async () => {
    try {
      setUploading(true);
      setUploadProgress(0);

      await uploadMedia({
        mediaUri,
        mediaType,
        caption,
        onProgress: setUploadProgress,
      });

      Alert.alert("Sucesso! 🎉", "Seu momento foi compartilhado!", [
        {
          text: "OK",
          onPress: () => {
            // Go back to main screen
            navigation.popToTop();
          },
        },
      ]);
    } catch (e: any) {
      console.error("Upload error:", e);
      Alert.alert("Erro", "Não foi possível enviar a mídia. Tente novamente.");
    } finally {
      setUploading(false);
    }
  }, [mediaUri, mediaType, caption, navigation]);

  // ─── Editor Step ────────────────────────────────────────
  if (step === "editor") {
    return (
      <SafeAreaView style={[styles.editorContainer, { paddingTop: insets.top }]}>
        {/* Close button */}
        <Pressable
          style={styles.editorClose}
          onPress={() => navigation.goBack()}
          hitSlop={12}
        >
          <Ionicons name="close" size={28} color="#fff" />
        </Pressable>

        {/* Media area */}
        <View style={styles.editorMediaWrap}>
          {mediaType === "video" && player ? (
            <VideoView
              player={player}
              style={styles.editorMedia}
              contentFit="contain"
              nativeControls={false}
            />
          ) : (
            <Image
              source={{ uri: mediaUri }}
              style={styles.editorMedia}
              resizeMode="contain"
            />
          )}

          {/* Audio bar (fake) */}
          <View style={styles.audioBar}>
            <View style={styles.audioBarIcon}>
              <Ionicons name="musical-notes" size={14} color="#fff" />
            </View>
            <Text style={styles.audioBarText} numberOfLines={1}>
              Áudio original
            </Text>
            <Pressable hitSlop={8}>
              <Ionicons name="add-circle-outline" size={22} color="#fff" />
            </Pressable>
          </View>

          {/* Overlay text */}
          {!!overlayText && !showTextInput && (
            <Pressable
              style={styles.overlayTextWrap}
              onPress={() => setShowTextInput(true)}
            >
              <Text style={styles.overlayText}>{overlayText}</Text>
            </Pressable>
          )}

          {/* Text hint */}
          {!overlayText && !showTextInput && (
            <Pressable
              style={styles.textHint}
              onPress={() => setShowTextInput(true)}
            >
              <Text style={styles.textHintText}>
                Toque para adicionar texto
              </Text>
            </Pressable>
          )}

          {/* Text input overlay */}
          {showTextInput && (
            <Pressable
              style={styles.textInputOverlay}
              onPress={() => setShowTextInput(false)}
            >
              <View style={styles.textInputCard}>
                <TextInput
                  value={overlayText}
                  onChangeText={setOverlayText}
                  placeholder="Digite seu texto..."
                  placeholderTextColor="#aaa"
                  style={styles.textInput}
                  autoFocus
                  onSubmitEditing={() => setShowTextInput(false)}
                  returnKeyType="done"
                />
              </View>
            </Pressable>
          )}
        </View>

        {/* Toolbar */}
        <View style={styles.toolbar}>
          <ToolItem
            icon={<Ionicons name="musical-notes-outline" size={24} color="#fff" />}
            label="Áudio"
            onPress={() => handlePlaceholder("Áudio")}
          />
          <ToolItem
            icon={<MaterialIcons name="text-fields" size={24} color="#fff" />}
            label="Texto"
            onPress={() => setShowTextInput((v) => !v)}
          />
          <ToolItem
            icon={<Ionicons name="images-outline" size={24} color="#fff" />}
            label="Sobreposição"
            onPress={() => handlePlaceholder("Sobreposição")}
          />
          <ToolItem
            icon={<Ionicons name="sparkles-outline" size={24} color="#fff" />}
            label="Filtro"
            onPress={() => handlePlaceholder("Filtro")}
          />
          <ToolItem
            icon={<Ionicons name="settings-outline" size={24} color="#fff" />}
            label="Editar"
            onPress={() => handlePlaceholder("Editar")}
          />
        </View>

        {/* Next button */}
        <Pressable
          style={[styles.nextFloatingButton, { bottom: insets.bottom + 100 }]}
          onPress={() => setStep("publish")}
        >
          <Text style={styles.nextFloatingButtonText}>Avançar</Text>
          <Ionicons name="arrow-forward" size={18} color="#fff" />
        </Pressable>
      </SafeAreaView>
    );
  }

  // ─── Publish Step ───────────────────────────────────────
  return (
    <SafeAreaView style={[styles.publishContainer, { paddingTop: insets.top }]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {/* Header */}
        <View style={styles.publishHeader}>
          <Pressable onPress={() => setStep("editor")} hitSlop={12}>
            <Ionicons name="arrow-back" size={24} color="#111" />
          </Pressable>
          <Text style={styles.publishHeaderTitle}>Novo post</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
          {/* Caption card */}
          <View style={styles.captionCard}>
            <Image
              source={{ uri: mediaUri }}
              style={styles.captionThumb}
            />
            <TextInput
              value={caption}
              onChangeText={setCaption}
              placeholder="Escreva uma legenda..."
              placeholderTextColor="#999"
              multiline
              style={styles.captionInput}
            />
          </View>

          {/* Chips */}
          <View style={styles.chipsRow}>
            <Chip label="Enquete" icon="stats-chart-outline" />
            <Chip label="Comando" icon="chatbox-outline" />
          </View>

          {/* Options */}
          <OptionRow
            icon="musical-notes-outline"
            label="Adicionar áudio"
            onPress={() => handlePlaceholder("Adicionar áudio")}
          />
          <OptionRow
            icon="person-outline"
            label="Marcar pessoas"
            onPress={() => handlePlaceholder("Marcar pessoas")}
          />
          <OptionRow
            icon="location-outline"
            label="Adicionar localização"
            onPress={() => handlePlaceholder("Adicionar localização")}
          />
          <OptionRow
            icon="eye-outline"
            label="Público"
            value="Todos"
            onPress={() => handlePlaceholder("Visibilidade")}
          />
          <OptionRow
            icon="share-social-outline"
            label="Compartilhar também no..."
            value="Desativado"
            onPress={() => handlePlaceholder("Compartilhar também no")}
          />
          <OptionRow
            icon="ellipsis-horizontal"
            label="Mais opções"
            onPress={() => handlePlaceholder("Mais opções")}
          />
        </ScrollView>

        {/* Share button */}
        <View style={[styles.shareButtonWrap, { paddingBottom: insets.bottom || 16 }]}>
          {uploading && (
            <View style={styles.progressBar}>
              <View
                style={[styles.progressFill, { width: `${uploadProgress}%` }]}
              />
            </View>
          )}
          <Pressable
            style={[styles.shareButton, uploading && { opacity: 0.7 }]}
            onPress={handleUpload}
            disabled={uploading}
          >
            {uploading ? (
              <View style={styles.uploadingRow}>
                <ActivityIndicator color="#fff" size="small" />
                <Text style={styles.shareButtonText}>
                  Enviando... {uploadProgress}%
                </Text>
              </View>
            ) : (
              <Text style={styles.shareButtonText}>Compartilhar</Text>
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ─── Sub-Components ─────────────────────────────────────

function ToolItem({
  icon,
  label,
  onPress,
}: {
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.toolItem,
        pressed && { opacity: 0.6 },
      ]}
    >
      {icon}
      <Text style={styles.toolItemLabel}>{label}</Text>
    </Pressable>
  );
}

function Chip({ label, icon }: { label: string; icon: string }) {
  return (
    <Pressable style={styles.chip}>
      <Ionicons name={icon as any} size={14} color="#111" />
      <Text style={styles.chipText}>{label}</Text>
    </Pressable>
  );
}

function OptionRow({
  icon,
  label,
  value,
  onPress,
}: {
  icon: string;
  label: string;
  value?: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.optionRow,
        pressed && { backgroundColor: "#f8f8f8" },
      ]}
      onPress={onPress}
    >
      <View style={styles.optionLeft}>
        <Ionicons name={icon as any} size={22} color="#111" />
        <Text style={styles.optionLabel}>{label}</Text>
      </View>
      <View style={styles.optionRight}>
        {!!value && <Text style={styles.optionValue}>{value}</Text>}
        <Ionicons name="chevron-forward" size={18} color="#bbb" />
      </View>
    </Pressable>
  );
}

// ─── Styles ─────────────────────────────────────────────

const styles = StyleSheet.create({
  // ── Editor ──
  editorContainer: {
    flex: 1,
    backgroundColor: "#000",
  },
  editorClose: {
    position: "absolute",
    top: 60,
    left: 16,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.4)",
    alignItems: "center",
    justifyContent: "center",
  },
  editorMediaWrap: {
    flex: 1,
    position: "relative",
    backgroundColor: "#000",
  },
  editorMedia: {
    width: "100%",
    height: "100%",
  },
  audioBar: {
    position: "absolute",
    top: 16,
    left: 56,
    right: 16,
    borderRadius: 999,
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  audioBarIcon: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  audioBarText: {
    flex: 1,
    color: "#fff",
    fontWeight: "600",
    fontSize: 13,
  },
  overlayTextWrap: {
    position: "absolute",
    alignSelf: "center",
    top: "45%",
  },
  overlayText: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "800",
    textShadowColor: "rgba(0,0,0,0.6)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  textHint: {
    position: "absolute",
    alignSelf: "center",
    top: "50%",
  },
  textHintText: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 16,
  },
  textInputOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  textInputCard: {
    width: "100%",
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 12,
    padding: 16,
  },
  textInput: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
  },
  nextFloatingButton: {
    position: "absolute",
    right: 16,
    backgroundColor: "#3797EF",
    borderRadius: 999,
    paddingHorizontal: 20,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  nextFloatingButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },
  toolbar: {
    height: 88,
    backgroundColor: "#111",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#222",
  },
  toolItem: {
    alignItems: "center",
    gap: 6,
    minWidth: 56,
  },
  toolItemLabel: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "500",
  },

  // ── Publish ──
  publishContainer: {
    flex: 1,
    backgroundColor: "#fff",
  },
  publishHeader: {
    height: 56,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  publishHeaderTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111",
  },
  captionCard: {
    flexDirection: "row",
    padding: 16,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  captionThumb: {
    width: 84,
    height: 84,
    borderRadius: 12,
    backgroundColor: "#ddd",
  },
  captionInput: {
    flex: 1,
    minHeight: 84,
    textAlignVertical: "top",
    fontSize: 15,
    color: "#111",
    paddingTop: 0,
  },
  chipsRow: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  chip: {
    backgroundColor: "#f3f3f3",
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 9,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  chipText: {
    color: "#111",
    fontWeight: "600",
    fontSize: 14,
  },
  optionRow: {
    minHeight: 56,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f3f3",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  optionLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  optionLabel: {
    fontSize: 15,
    color: "#111",
  },
  optionRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  optionValue: {
    fontSize: 14,
    color: "#999",
  },
  shareButtonWrap: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  progressBar: {
    height: 4,
    backgroundColor: "#e0e0e0",
    borderRadius: 2,
    marginBottom: 8,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#3797EF",
    borderRadius: 2,
  },
  shareButton: {
    height: 52,
    borderRadius: 14,
    backgroundColor: "#3797EF",
    alignItems: "center",
    justifyContent: "center",
  },
  shareButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  uploadingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
});
