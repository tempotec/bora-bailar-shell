import React, { useState, useRef, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Image,
  Pressable,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Dimensions,
  Animated,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { Feather, FontAwesome, Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { VideoView, useVideoPlayer } from "expo-video";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";
import { videoService } from "@/services/videoService";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const VIDEO_ASPECT = SCREEN_WIDTH / (SCREEN_WIDTH * 1.25);

type Step = 1 | 2 | 3;

const STEPS = ["Prévia", "Detalhes", "Publicar"];

// ─── Step 1: Video Preview ─────────────────────────────────────────────────
function VideoPreviewStep({
  videoUri,
  onNext,
  onCancel,
}: {
  videoUri: string;
  onNext: () => void;
  onCancel: () => void;
}) {
  const player = useVideoPlayer(videoUri, (p) => {
    p.loop = true;
    p.play();
  });
  const [playing, setPlaying] = useState(true);

  const togglePlay = useCallback(() => {
    if (playing) {
      player.pause();
    } else {
      player.play();
    }
    setPlaying((prev) => !prev);
  }, [playing, player]);

  return (
    <View style={styles.step1Container}>
      <Pressable style={styles.videoWrapper} onPress={togglePlay}>
        <VideoView
          player={player}
          style={styles.videoPlayer}
          contentFit="cover"
          nativeControls={false}
        />
        {!playing && (
          <View style={styles.playOverlay}>
            <View style={styles.playIconCircle}>
              <Feather name="play" size={32} color="#FFF" />
            </View>
          </View>
        )}
        {/* Volume/mute indicator could go here */}
      </Pressable>

      {/* Hint */}
      <View style={styles.step1Hint}>
        <Feather name="info" size={14} color="rgba(255,255,255,0.6)" />
        <Text style={styles.step1HintText}>Toque no vídeo para pausar/retomar</Text>
      </View>
    </View>
  );
}

// ─── Step 2: Caption & Details ────────────────────────────────────────────
function CaptionStep({
  thumbnailUri,
  caption,
  onCaptionChange,
  location,
  onLocationChange,
  rating,
  onRatingChange,
}: {
  thumbnailUri: string;
  caption: string;
  onCaptionChange: (v: string) => void;
  location: string;
  onLocationChange: (v: string) => void;
  rating: number;
  onRatingChange: (v: number) => void;
}) {
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        style={styles.step2Scroll}
        contentContainerStyle={styles.step2Content}
        keyboardShouldPersistTaps="handled"
      >
        {/* Top row: thumbnail + caption textarea */}
        <View style={styles.captionRow}>
          <Image
            source={{ uri: thumbnailUri }}
            style={styles.captionThumb}
            resizeMode="cover"
          />
          <TextInput
            style={styles.captionInput}
            placeholder="Escreva uma legenda, #hashtag ou @menção..."
            placeholderTextColor={Colors.dark.textSecondary}
            value={caption}
            onChangeText={onCaptionChange}
            multiline
            maxLength={300}
            autoFocus
            textAlignVertical="top"
          />
        </View>
        <Text style={styles.captionCount}>{caption.length}/300</Text>

        <View style={styles.divider} />

        {/* Hashtag suggestions */}
        <View style={styles.hashtagRow}>
          {["#dança", "#borabailar", "#balada", "#ritmo", "#momentodança"].map((tag) => (
            <Pressable
              key={tag}
              style={styles.hashtagChip}
              onPress={() => onCaptionChange(caption + " " + tag)}
            >
              <Text style={styles.hashtagChipText}>{tag}</Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.divider} />

        {/* Location */}
        <View style={styles.fieldRow}>
          <Feather name="map-pin" size={20} color={Colors.dark.textSecondary} />
          <TextInput
            style={styles.fieldInput}
            placeholder="Adicionar localização"
            placeholderTextColor={Colors.dark.textSecondary}
            value={location}
            onChangeText={onLocationChange}
          />
          <Feather name="chevron-right" size={18} color="#CCC" />
        </View>

        <View style={styles.divider} />

        {/* Rating */}
        <View style={styles.ratingSection}>
          <Text style={styles.ratingLabel}>Dê a sua avaliação</Text>
          <View style={styles.starsRow}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Pressable key={star} onPress={() => onRatingChange(star)} hitSlop={8}>
                <FontAwesome
                  name={star <= rating ? "star" : "star-o"}
                  size={36}
                  color={star <= rating ? "#FFD700" : "#CCC"}
                />
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.divider} />

        {/* Advanced options row */}
        <View style={styles.fieldRow}>
          <Feather name="tag" size={20} color={Colors.dark.textSecondary} />
          <Text style={[styles.fieldInput, { color: Colors.dark.textSecondary }]}>
            Marcar pessoas
          </Text>
          <Feather name="chevron-right" size={18} color="#CCC" />
        </View>

        <View style={styles.divider} />

        <View style={styles.fieldRow}>
          <Feather name="eye" size={20} color={Colors.dark.textSecondary} />
          <Text style={[styles.fieldInput, { color: Colors.dark.text }]}>
            Visibilidade: Todos
          </Text>
          <Feather name="chevron-right" size={18} color="#CCC" />
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ─── Step 3: Final Preview ─────────────────────────────────────────────────
function PreviewStep({
  thumbnailUri,
  caption,
  location,
  rating,
}: {
  thumbnailUri: string;
  caption: string;
  location: string;
  rating: number;
}) {
  return (
    <ScrollView
      style={styles.step3Scroll}
      contentContainerStyle={styles.step3Content}
    >
      <Text style={styles.previewLabel}>Como vai aparecer no feed</Text>

      {/* Simulated Feed Card */}
      <View style={styles.feedCard}>
        {/* User header */}
        <View style={styles.feedCardHeader}>
          <View style={styles.feedAvatar}>
            <Feather name="user" size={18} color="#FFF" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.feedUsername}>Você</Text>
            {location ? (
              <View style={styles.feedLocationRow}>
                <Feather name="map-pin" size={11} color={Colors.dark.textSecondary} />
                <Text style={styles.feedLocation}>{location}</Text>
              </View>
            ) : null}
          </View>
          <Ionicons name="ellipsis-horizontal" size={20} color={Colors.dark.textSecondary} />
        </View>

        {/* Video thumbnail */}
        <View style={styles.feedCardMedia}>
          <Image
            source={{ uri: thumbnailUri }}
            style={styles.feedMediaImage}
            resizeMode="cover"
          />
          <View style={styles.feedVideoPlayIcon}>
            <Feather name="play" size={28} color="#FFF" />
          </View>
          {rating > 0 && (
            <View style={styles.feedRatingBadge}>
              <Feather name="star" size={11} color="#FFD700" />
              <Text style={styles.feedRatingText}>{rating}.0</Text>
            </View>
          )}
        </View>

        {/* Actions */}
        <View style={styles.feedActions}>
          <View style={styles.feedActionsLeft}>
            <Feather name="heart" size={22} color={Colors.dark.text} style={{ marginRight: 14 }} />
            <Feather name="message-circle" size={22} color={Colors.dark.text} style={{ marginRight: 14 }} />
            <Feather name="send" size={22} color={Colors.dark.text} />
          </View>
          <Feather name="bookmark" size={22} color={Colors.dark.text} />
        </View>

        {/* Caption */}
        {caption ? (
          <View style={styles.feedCaption}>
            <Text style={styles.feedCaptionText}>
              <Text style={styles.feedCaptionUser}>você </Text>
              {caption}
            </Text>
          </View>
        ) : null}

        <Text style={styles.feedTime}>agora mesmo</Text>
      </View>

      <View style={styles.uploadNote}>
        <Feather name="info" size={14} color={Colors.dark.textSecondary} />
        <Text style={styles.uploadNoteText}>
          Após publicar, seu vídeo será revisado e aparecerá no feed em instantes.
        </Text>
      </View>
    </ScrollView>
  );
}

// ─── Main Screen ───────────────────────────────────────────────────────────
export default function UploadPostScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();

  const { videoUri, thumbnailUri } = route.params || {};

  const [step, setStep] = useState<Step>(1);
  const [caption, setCaption] = useState("");
  const [location, setLocation] = useState("");
  const [rating, setRating] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  // Animated progress bar
  const progressAnim = useRef(new Animated.Value(1 / 3)).current;

  const goToStep = (next: Step) => {
    setStep(next);
    Animated.timing(progressAnim, {
      toValue: next / 3,
      duration: 280,
      useNativeDriver: false,
    }).start();
  };

  const handleNext = () => {
    if (step === 1) goToStep(2);
    else if (step === 2) goToStep(3);
  };

  const handleBack = () => {
    if (step === 2) goToStep(1);
    else if (step === 3) goToStep(2);
    else navigation.goBack();
  };

  const handleShare = async () => {
    if (!videoUri || !thumbnailUri) {
      Alert.alert("Erro", "Vídeo ou capa não encontrados.");
      return;
    }
    setIsUploading(true);
    try {
      await videoService.uploadVideo(videoUri, thumbnailUri, caption, {
        title: caption.slice(0, 60),
        location,
        rating,
      });
      Alert.alert("Publicado! 🎉", "Seu momento dança foi compartilhado!", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (error: any) {
      Alert.alert("Erro ao publicar", error.message);
    } finally {
      setIsUploading(false);
    }
  };

  const stepTitles: Record<Step, string> = {
    1: "Prévia do Vídeo",
    2: "Legenda & Detalhes",
    3: "Pré-visualização",
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <Pressable onPress={handleBack} style={styles.headerIconBtn} hitSlop={12}>
          <Feather name={step === 1 ? "x" : "arrow-left"} size={24} color={Colors.dark.text} />
        </Pressable>

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>{stepTitles[step]}</Text>
          <Text style={styles.headerStepLabel}>
            {step} de {STEPS.length}
          </Text>
        </View>

        <View style={styles.headerRight}>
          {step < 3 ? (
            <Pressable onPress={handleNext} style={styles.nextBtn} hitSlop={8}>
              <Text style={styles.nextBtnText}>Próximo</Text>
              <Feather name="chevron-right" size={16} color={Colors.dark.brand} />
            </Pressable>
          ) : (
            <Pressable
              onPress={handleShare}
              disabled={isUploading}
              style={styles.shareBtn}
            >
              {isUploading ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <>
                  <Feather name="check" size={16} color="#FFF" />
                  <Text style={styles.shareBtnText}>Publicar</Text>
                </>
              )}
            </Pressable>
          )}
        </View>
      </View>

      {/* ── Progress bar ── */}
      <View style={styles.progressTrack}>
        <Animated.View
          style={[
            styles.progressFill,
            {
              width: progressAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ["0%", "100%"],
              }),
            },
          ]}
        />
      </View>

      {/* ── Step Indicators ── */}
      <View style={styles.stepDots}>
        {STEPS.map((label, i) => (
          <View key={label} style={styles.stepDotItem}>
            <View
              style={[
                styles.stepDot,
                i + 1 <= step && styles.stepDotActive,
                i + 1 === step && styles.stepDotCurrent,
              ]}
            >
              {i + 1 < step ? (
                <Feather name="check" size={10} color="#FFF" />
              ) : (
                <Text style={[styles.stepDotNum, i + 1 <= step && { color: "#FFF" }]}>
                  {i + 1}
                </Text>
              )}
            </View>
            <Text style={[styles.stepLabel, i + 1 === step && styles.stepLabelActive]}>
              {label}
            </Text>
          </View>
        ))}
      </View>

      {/* ── Step Content ── */}
      <View style={{ flex: 1 }}>
        {step === 1 && videoUri && (
          <VideoPreviewStep
            videoUri={videoUri}
            onNext={() => goToStep(2)}
            onCancel={() => navigation.goBack()}
          />
        )}
        {step === 2 && (
          <CaptionStep
            thumbnailUri={thumbnailUri}
            caption={caption}
            onCaptionChange={setCaption}
            location={location}
            onLocationChange={setLocation}
            rating={rating}
            onRatingChange={setRating}
          />
        )}
        {step === 3 && (
          <PreviewStep
            thumbnailUri={thumbnailUri}
            caption={caption}
            location={location}
            rating={rating}
          />
        )}
      </View>
    </View>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  headerIconBtn: {
    width: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  headerCenter: {
    flex: 1,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.dark.text,
  },
  headerStepLabel: {
    fontSize: 11,
    color: Colors.dark.textSecondary,
    marginTop: 1,
  },
  headerRight: {
    width: 90,
    alignItems: "flex-end",
  },
  nextBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  nextBtnText: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.dark.brand,
  },
  shareBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.dark.brand,
    paddingVertical: 7,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.lg,
    gap: 4,
  },
  shareBtnText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFF",
  },
  // Progress bar
  progressTrack: {
    height: 3,
    backgroundColor: "#F0F0F0",
  },
  progressFill: {
    height: 3,
    backgroundColor: Colors.dark.brand,
  },
  // Step dots
  stepDots: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: Spacing.sm,
    gap: 40,
  },
  stepDotItem: {
    alignItems: "center",
    gap: 4,
  },
  stepDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#F0F0F0",
    borderWidth: 2,
    borderColor: "#E0E0E0",
    alignItems: "center",
    justifyContent: "center",
  },
  stepDotActive: {
    backgroundColor: Colors.dark.brand,
    borderColor: Colors.dark.brand,
  },
  stepDotCurrent: {
    borderColor: Colors.dark.brand,
    backgroundColor: Colors.dark.brand,
  },
  stepDotNum: {
    fontSize: 10,
    fontWeight: "700",
    color: Colors.dark.textSecondary,
  },
  stepLabel: {
    fontSize: 10,
    color: Colors.dark.textSecondary,
    fontWeight: "500",
  },
  stepLabelActive: {
    color: Colors.dark.brand,
    fontWeight: "700",
  },
  // Step 1: Video
  step1Container: {
    flex: 1,
    backgroundColor: "#000",
  },
  videoWrapper: {
    flex: 1,
    position: "relative",
  },
  videoPlayer: {
    flex: 1,
    width: "100%",
  },
  playOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  playIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "rgba(0,0,0,0.6)",
    alignItems: "center",
    justifyContent: "center",
  },
  step1Hint: {
    position: "absolute",
    bottom: Spacing.xl,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.xs,
  },
  step1HintText: {
    fontSize: 12,
    color: "rgba(255,255,255,0.65)",
  },
  // Step 2: Caption
  step2Scroll: {
    flex: 1,
  },
  step2Content: {
    paddingBottom: 40,
  },
  captionRow: {
    flexDirection: "row",
    padding: Spacing.md,
    gap: Spacing.md,
    alignItems: "flex-start",
  },
  captionThumb: {
    width: 64,
    height: 84,
    borderRadius: BorderRadius.sm,
    backgroundColor: "#F5F5F5",
  },
  captionInput: {
    flex: 1,
    fontSize: 15,
    color: Colors.dark.text,
    minHeight: 84,
    padding: 0,
    lineHeight: 22,
  },
  captionCount: {
    fontSize: 11,
    color: Colors.dark.textSecondary,
    textAlign: "right",
    paddingRight: Spacing.md,
    marginTop: -4,
    marginBottom: Spacing.sm,
  },
  hashtagRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  hashtagChip: {
    backgroundColor: Colors.dark.brand + "12",
    borderRadius: BorderRadius.xl,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: Colors.dark.brand + "30",
  },
  hashtagChipText: {
    fontSize: 12,
    color: Colors.dark.brand,
    fontWeight: "600",
  },
  divider: {
    height: 1,
    backgroundColor: "#F0F0F0",
    marginHorizontal: Spacing.md,
    marginVertical: 2,
  },
  fieldRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    gap: Spacing.md,
  },
  fieldInput: {
    flex: 1,
    fontSize: 15,
    color: Colors.dark.text,
    padding: 0,
  },
  ratingSection: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
  },
  ratingLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.dark.text,
  },
  starsRow: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  // Step 3: Preview
  step3Scroll: {
    flex: 1,
    backgroundColor: "#F8F8F8",
  },
  step3Content: {
    padding: Spacing.md,
    paddingBottom: 40,
  },
  previewLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.dark.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: Spacing.md,
    textAlign: "center",
  },
  feedCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: BorderRadius.lg,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  feedCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  feedAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.dark.brand,
    alignItems: "center",
    justifyContent: "center",
  },
  feedUsername: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.dark.text,
  },
  feedLocationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    marginTop: 1,
  },
  feedLocation: {
    fontSize: 11,
    color: Colors.dark.textSecondary,
  },
  feedCardMedia: {
    width: "100%",
    aspectRatio: 4 / 5,
    backgroundColor: "#F0F0F0",
    position: "relative",
  },
  feedMediaImage: {
    width: "100%",
    height: "100%",
  },
  feedVideoPlayIcon: {
    position: "absolute",
    bottom: Spacing.md,
    right: Spacing.md,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(0,0,0,0.55)",
    alignItems: "center",
    justifyContent: "center",
  },
  feedRatingBadge: {
    position: "absolute",
    top: Spacing.sm,
    right: Spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: BorderRadius.md,
    paddingHorizontal: 6,
    paddingVertical: 3,
    gap: 3,
  },
  feedRatingText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#FFF",
  },
  feedActions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  feedActionsLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  feedCaption: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  feedCaptionText: {
    fontSize: 13,
    color: Colors.dark.text,
    lineHeight: 18,
  },
  feedCaptionUser: {
    fontWeight: "700",
  },
  feedTime: {
    fontSize: 11,
    color: Colors.dark.textSecondary,
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
  },
  uploadNote: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.xs,
    marginTop: Spacing.lg,
    paddingHorizontal: Spacing.sm,
  },
  uploadNoteText: {
    flex: 1,
    fontSize: 12,
    color: Colors.dark.textSecondary,
    lineHeight: 17,
  },
});
