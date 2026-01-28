import React, { useState, useEffect } from "react";
import {
  View,
  Modal,
  StyleSheet,
  Pressable,
  Text,
  ScrollView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from "react-native-reanimated";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";

// Zonas e bairros do Rio de Janeiro
export const ZONES_AND_NEIGHBORHOODS = {
  zonaSul: {
    id: "zona_sul",
    name: "Zona Sul",
    neighborhoods: [
      { id: "leblon", name: "Leblon", zone: "Zona Sul" },
      { id: "ipanema", name: "Ipanema", zone: "Zona Sul" },
      { id: "copacabana", name: "Copacabana", zone: "Zona Sul" },
      { id: "gavea", name: "Gávea", zone: "Zona Sul" },
      { id: "botafogo", name: "Botafogo", zone: "Zona Sul" },
    ]
  },
  sudoeste: {
    id: "sudoeste",
    name: "Sudoeste",
    neighborhoods: [
      { id: "barra", name: "Barra da Tijuca", zone: "Sudoeste" },
      { id: "recreio", name: "Recreio", zone: "Sudoeste" },
      { id: "jacarepagua", name: "Jacarepaguá", zone: "Sudoeste" },
      { id: "freguesia", name: "Freguesia", zone: "Sudoeste" },
    ]
  },
  centro: {
    id: "centro",
    name: "Centro",
    neighborhoods: [
      { id: "lapa", name: "Lapa", zone: "Centro" },
      { id: "rio_comprido", name: "Rio Comprido", zone: "Centro" },
      { id: "tijuca", name: "Tijuca", zone: "Centro" },
      { id: "estacio", name: "Estácio", zone: "Centro" },
    ]
  }
};

// Array flat de todos os bairros para seleção
export const ALL_NEIGHBORHOODS = [
  ...ZONES_AND_NEIGHBORHOODS.zonaSul.neighborhoods,
  ...ZONES_AND_NEIGHBORHOODS.sudoeste.neighborhoods,
  ...ZONES_AND_NEIGHBORHOODS.centro.neighborhoods,
];

// Array de zonas
export const ZONES = [
  { id: "zona_sul", name: "Zona Sul" },
  { id: "sudoeste", name: "Sudoeste" },
  { id: "centro", name: "Centro" },
];

const DATE_OPTIONS = [
  { id: "today", label: "Hoje", icon: "sun" as const },
  { id: "tomorrow", label: "Amanhã", icon: "sunrise" as const },
  { id: "weekend", label: "Fim de semana", icon: "calendar" as const },
  { id: "week", label: "Esta semana", icon: "calendar" as const },
  { id: "month", label: "Este mês", icon: "calendar" as const },
];

const COMPANION_OPTIONS = [
  { id: "solo", label: "Sozinho(a)", icon: "user" as const },
  { id: "couple", label: "Em casal", icon: "heart" as const },
  { id: "friends", label: "Com amigos", icon: "users" as const },
  { id: "group", label: "Em grupo", icon: "users" as const },
];

interface OndeModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (location: typeof ALL_NEIGHBORHOODS[0]) => void;
  selectedCity: typeof ALL_NEIGHBORHOODS[0] | null;
}

export function OndeModal({ visible, onClose, onSelect, selectedCity }: OndeModalProps) {
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[styles.modalContainer, { paddingTop: insets.top || Spacing.lg }]}>
        <View style={styles.modalHeader}>
          <Pressable onPress={onClose} style={styles.closeButton}>
            <Feather name="x" size={24} color={Colors.dark.text} />
          </Pressable>
          <Text style={styles.modalTitle}>Onde você quer dançar?</Text>
          <View style={styles.closeButton} />
        </View>

        <ScrollView
          style={styles.modalContent}
          contentContainerStyle={styles.optionsContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Zonas */}
          <Text style={styles.sectionTitle}>Por Zona</Text>
          {ZONES.map((zone) => (
            <Pressable
              key={zone.id}
              style={({ pressed }) => [
                styles.optionItem,
                selectedCity?.zone === zone.name && styles.optionItemSelected,
                pressed && styles.optionItemPressed,
              ]}
              onPress={() => {
                // Seleciona primeiro bairro da zona como placeholder
                const firstNeighborhood = ZONES_AND_NEIGHBORHOODS[
                  zone.id === "zona_sul" ? "zonaSul" :
                    zone.id === "sudoeste" ? "sudoeste" : "centro"
                ].neighborhoods[0];
                onSelect(firstNeighborhood);
                onClose();
              }}
            >
              <View style={styles.optionIcon}>
                <Feather name="map" size={20} color={Colors.dark.primary} />
              </View>
              <View style={styles.optionTextContainer}>
                <Text style={styles.optionTitle}>{zone.name}</Text>
              </View>
              {selectedCity?.zone === zone.name ? (
                <Feather name="check" size={20} color={Colors.dark.primary} />
              ) : null}
            </Pressable>
          ))}

          {/* Bairros */}
          <Text style={[styles.sectionTitle, { marginTop: Spacing.lg }]}>Por Bairro</Text>
          {ALL_NEIGHBORHOODS.map((neighborhood) => (
            <Pressable
              key={neighborhood.id}
              style={({ pressed }) => [
                styles.optionItem,
                selectedCity?.id === neighborhood.id && styles.optionItemSelected,
                pressed && styles.optionItemPressed,
              ]}
              onPress={() => {
                onSelect(neighborhood);
                onClose();
              }}
            >
              <View style={styles.optionIcon}>
                <Feather name="map-pin" size={20} color={Colors.dark.primary} />
              </View>
              <View style={styles.optionTextContainer}>
                <Text style={styles.optionTitle}>{neighborhood.name}</Text>
                <Text style={styles.optionSubtitle}>{neighborhood.zone}</Text>
              </View>
              {selectedCity?.id === neighborhood.id ? (
                <Feather name="check" size={20} color={Colors.dark.primary} />
              ) : null}
            </Pressable>
          ))}
        </ScrollView>
      </View>
    </Modal>
  );
}

interface QuandoModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (option: typeof DATE_OPTIONS[0]) => void;
  selectedOption: typeof DATE_OPTIONS[0] | null;
}

export function QuandoModal({ visible, onClose, onSelect, selectedOption }: QuandoModalProps) {
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[styles.modalContainer, { paddingTop: insets.top || Spacing.lg }]}>
        <View style={styles.modalHeader}>
          <Pressable onPress={onClose} style={styles.closeButton}>
            <Feather name="x" size={24} color={Colors.dark.text} />
          </Pressable>
          <Text style={styles.modalTitle}>Quando você quer sair?</Text>
          <View style={styles.closeButton} />
        </View>

        <ScrollView
          style={styles.modalContent}
          contentContainerStyle={styles.optionsContainer}
          showsVerticalScrollIndicator={false}
        >
          {DATE_OPTIONS.map((option) => (
            <Pressable
              key={option.id}
              style={({ pressed }) => [
                styles.optionItem,
                selectedOption?.id === option.id && styles.optionItemSelected,
                pressed && styles.optionItemPressed,
              ]}
              onPress={() => {
                onSelect(option);
                onClose();
              }}
            >
              <View style={styles.optionIcon}>
                <Feather name={option.icon} size={20} color={Colors.dark.primary} />
              </View>
              <View style={styles.optionTextContainer}>
                <Text style={styles.optionTitle}>{option.label}</Text>
              </View>
              {selectedOption?.id === option.id ? (
                <Feather name="check" size={20} color={Colors.dark.primary} />
              ) : null}
            </Pressable>
          ))}
        </ScrollView>
      </View>
    </Modal>
  );
}

interface ComQuemModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (option: typeof COMPANION_OPTIONS[0]) => void;
  selectedOption: typeof COMPANION_OPTIONS[0] | null;
  onMicPress: () => void;
  isRecording: boolean;
  isTranscribing?: boolean;
  transcript: string;
}

export function ComQuemModal({
  visible,
  onClose,
  onSelect,
  selectedOption,
  onMicPress,
  isRecording,
  isTranscribing = false,
  transcript,
}: ComQuemModalProps) {
  const insets = useSafeAreaInsets();
  const pulseScale = useSharedValue(1);

  useEffect(() => {
    if (isRecording) {
      const pulse = () => {
        pulseScale.value = withSpring(1.2, { damping: 10 }, () => {
          pulseScale.value = withSpring(1, { damping: 10 });
        });
      };
      const interval = setInterval(pulse, 1000);
      return () => clearInterval(interval);
    } else {
      pulseScale.value = withTiming(1);
    }
  }, [isRecording]);

  const micButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[styles.modalContainer, { paddingTop: insets.top || Spacing.lg }]}>
        <View style={styles.modalHeader}>
          <Pressable onPress={onClose} style={styles.closeButton}>
            <Feather name="x" size={24} color={Colors.dark.text} />
          </Pressable>
          <Text style={styles.modalTitle}>Com quem você quer sair?</Text>
          <View style={styles.closeButton} />
        </View>

        <View style={styles.voiceSection}>
          <Text style={styles.voiceHint}>
            {isRecording
              ? "Gravando... Toque para parar"
              : isTranscribing
                ? "Transcrevendo..."
                : "Toque no microfone e fale o que você procura"}
          </Text>

          <Animated.View style={micButtonStyle}>
            <Pressable
              style={[
                styles.micButton,
                isRecording && styles.micButtonRecording,
                isTranscribing && styles.micButtonTranscribing,
              ]}
              onPress={onMicPress}
              disabled={isTranscribing}
            >
              {isRecording || isTranscribing ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Feather name="mic" size={32} color="#FFFFFF" />
              )}
            </Pressable>
          </Animated.View>

          {transcript ? (
            <View style={styles.transcriptContainer}>
              <Text style={styles.transcriptLabel}>Você disse:</Text>
              <Text style={styles.transcriptText}>"{transcript}"</Text>
            </View>
          ) : null}
        </View>

        <Text style={styles.orDivider}>ou escolha uma opção</Text>

        <ScrollView
          style={styles.modalContent}
          contentContainerStyle={styles.optionsContainer}
          showsVerticalScrollIndicator={false}
        >
          {COMPANION_OPTIONS.map((option) => (
            <Pressable
              key={option.id}
              style={({ pressed }) => [
                styles.optionItem,
                selectedOption?.id === option.id && styles.optionItemSelected,
                pressed && styles.optionItemPressed,
              ]}
              onPress={() => {
                onSelect(option);
                onClose();
              }}
            >
              <View style={styles.optionIcon}>
                <Feather name={option.icon} size={20} color={Colors.dark.primary} />
              </View>
              <View style={styles.optionTextContainer}>
                <Text style={styles.optionTitle}>{option.label}</Text>
              </View>
              {selectedOption?.id === option.id ? (
                <Feather name="check" size={20} color={Colors.dark.primary} />
              ) : null}
            </Pressable>
          ))}
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.dark.backgroundRoot,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.backgroundSecondary,
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.dark.text,
  },
  modalContent: {
    flex: 1,
  },
  optionsContainer: {
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  optionItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    backgroundColor: Colors.dark.backgroundDefault,
    borderRadius: BorderRadius.lg,
    gap: Spacing.md,
  },
  optionItemSelected: {
    backgroundColor: Colors.dark.primary + "15",
    borderWidth: 1,
    borderColor: Colors.dark.primary,
  },
  optionItemPressed: {
    opacity: 0.8,
  },
  optionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.dark.primary + "20",
    alignItems: "center",
    justifyContent: "center",
  },
  optionTextContainer: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: Colors.dark.text,
  },
  optionSubtitle: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
    marginTop: 2,
  },
  voiceSection: {
    alignItems: "center",
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.lg,
    gap: Spacing.lg,
  },
  voiceHint: {
    fontSize: 16,
    color: Colors.dark.textSecondary,
    textAlign: "center",
  },
  micButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.dark.primary,
    alignItems: "center",
    justifyContent: "center",
    ...Platform.select({
      ios: {
        shadowColor: Colors.dark.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  micButtonRecording: {
    backgroundColor: Colors.dark.error,
  },
  micButtonTranscribing: {
    backgroundColor: Colors.dark.secondary,
    opacity: 0.8,
  },
  transcriptContainer: {
    backgroundColor: Colors.dark.backgroundDefault,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    width: "100%",
    alignItems: "center",
  },
  transcriptLabel: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
    marginBottom: Spacing.xs,
  },
  transcriptText: {
    fontSize: 16,
    color: Colors.dark.text,
    fontStyle: "italic",
    textAlign: "center",
  },
  orDivider: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
    textAlign: "center",
    paddingVertical: Spacing.md,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.dark.text,
    marginBottom: Spacing.sm,
    marginTop: Spacing.sm,
  },
});

export { DATE_OPTIONS, COMPANION_OPTIONS };
