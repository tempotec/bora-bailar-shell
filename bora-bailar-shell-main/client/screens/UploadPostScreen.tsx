import React, { useState } from "react";
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
  SafeAreaView
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { Feather, FontAwesome } from "@expo/vector-icons";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";
import { videoService } from "@/services/videoService";

export default function UploadPostScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();

  const { videoUri, thumbnailUri } = route.params || {};

  const [title, setTitle] = useState("");
  const [experience, setExperience] = useState("");
  const [location, setLocation] = useState("");
  const [rating, setRating] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = async () => {
    if (!videoUri || !thumbnailUri) {
      Alert.alert("Erro", "Vídeo ou capa não encontrados.");
      return;
    }

    setIsUploading(true);
    try {
      await videoService.uploadVideo(videoUri, thumbnailUri, experience, {
        title,
        location,
        rating
      });
      Alert.alert("Sucesso!", "Sua experiência foi compartilhada com sucesso.", [
        { text: "OK", onPress: () => navigation.goBack() }
      ]);
    } catch (error: any) {
      Alert.alert("Erro ao enviar post", error.message);
    } finally {
      setIsUploading(false);
    }
  };

  const renderStars = () => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Pressable key={star} onPress={() => setRating(star)}>
            <FontAwesome
              name={star <= rating ? "star" : "star-o"}
              size={32}
              color={star <= rating ? "#FFD700" : Colors.dark.textSecondary}
              style={styles.starIcon}
            />
          </Pressable>
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack()} style={styles.headerButton}>
            <Feather name="x" size={24} color={Colors.dark.text} />
          </Pressable>
          <Text style={styles.headerTitle}>Nova Publicação</Text>
          <Pressable 
            onPress={handleUpload} 
            disabled={isUploading}
            style={[styles.headerButton, styles.shareButton]}
          >
            {isUploading ? (
              <ActivityIndicator size="small" color={Colors.dark.brand} />
            ) : (
              <Text style={styles.shareText}>Compartilhar</Text>
            )}
          </Pressable>
        </View>

        <ScrollView style={styles.scrollContent} keyboardShouldPersistTaps="handled">
          
          {/* Header row: Thumbnail + Title Input */}
          <View style={styles.topRow}>
            {thumbnailUri ? (
              <Image source={{ uri: thumbnailUri }} style={styles.previewImage} resizeMode="cover" />
            ) : (
              <View style={[styles.previewImage, styles.previewPlaceholder]}>
                <Feather name="image" size={24} color={Colors.dark.textSecondary} />
              </View>
            )}
            <TextInput
              style={styles.titleInput}
              placeholder="Dê um título para sua experiência..."
              placeholderTextColor={Colors.dark.textSecondary}
              value={title}
              onChangeText={setTitle}
              maxLength={60}
            />
          </View>

          <View style={styles.divider} />

          {/* Experience Input */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Conta aqui como foi sua experiência ontem? Compartilhe seu depoimento.</Text>
            <TextInput
              style={styles.textArea}
              placeholder="Escreva sobre a vibe, as músicas, as pessoas..."
              placeholderTextColor={Colors.dark.textSecondary}
              value={experience}
              onChangeText={setExperience}
              multiline
              textAlignVertical="top"
              maxLength={500}
            />
          </View>

          <View style={styles.divider} />

          {/* Rating */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Dê a sua avaliação</Text>
            {renderStars()}
          </View>

          <View style={styles.divider} />

          {/* Location */}
          <View style={styles.fieldContainer}>
            <View style={styles.locationRow}>
              <Feather name="map-pin" size={20} color={Colors.dark.textSecondary} />
              <TextInput
                style={styles.locationInput}
                placeholder="Adicionar localização..."
                placeholderTextColor={Colors.dark.textSecondary}
                value={location}
                onChangeText={setLocation}
              />
            </View>
          </View>
          
          <View style={styles.divider} />

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  headerButton: {
    padding: Spacing.xs,
    minWidth: 44,
    justifyContent: "center",
  },
  shareButton: {
    alignItems: "flex-end",
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.dark.text,
  },
  shareText: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.dark.brand, // BoraBailar red
  },
  scrollContent: {
    flex: 1,
  },
  topRow: {
    flexDirection: "row",
    padding: Spacing.md,
    alignItems: "center",
    gap: Spacing.md,
  },
  previewImage: {
    width: 60,
    height: 80,
    borderRadius: BorderRadius.sm,
    backgroundColor: "#F5F5F5",
  },
  previewPlaceholder: {
    alignItems: "center",
    justifyContent: "center",
  },
  titleInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.dark.text,
    padding: 0,
    minHeight: 40,
  },
  divider: {
    height: 1,
    backgroundColor: "#F0F0F0",
    marginHorizontal: Spacing.md,
  },
  fieldContainer: {
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.dark.text,
    marginBottom: Spacing.xs,
  },
  textArea: {
    fontSize: 15,
    color: Colors.dark.text,
    minHeight: 100,
    padding: 0,
  },
  starsContainer: {
    flexDirection: "row",
    gap: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  starIcon: {
    marginRight: 4,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  locationInput: {
    flex: 1,
    fontSize: 15,
    color: Colors.dark.text,
    padding: 0,
    minHeight: 30,
  },
});
