import React from "react";
import {
  View,
  Modal,
  StyleSheet,
  Pressable,
  Text,
  ScrollView,
  Platform,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";

// ── Zonas do Rio de Janeiro ───────────────────────────────────────────────────

export const LOCATION_OPTIONS = [
  { id: "tanto_faz", name: "Tanto faz (em qualquer lugar)", zone: "", icon: "globe" as const, isTantoFaz: true },
  { id: "zona_sul", name: "Zona Sul", zone: "Zona Sul", icon: "map" as const },
  { id: "zona_norte", name: "Zona Norte", zone: "Zona Norte", icon: "map" as const },
  { id: "zona_oeste", name: "Zona Oeste", zone: "Zona Oeste", icon: "map" as const },
  { id: "sudoeste", name: "Sudoeste", zone: "Sudoeste", icon: "map" as const },
  { id: "centro", name: "Centro", zone: "Centro", icon: "map-pin" as const },
];

// Mantido para compatibilidade com código legado
export const ALL_NEIGHBORHOODS = LOCATION_OPTIONS;
export const ZONES = LOCATION_OPTIONS;
export const ZONES_AND_NEIGHBORHOODS = {};

// ── Datas ─────────────────────────────────────────────────────────────────────

export const DATE_OPTIONS = [
  { id: "today", label: "Hoje", icon: "sun" as const },
  { id: "tomorrow", label: "Amanhã", icon: "sunrise" as const },
  { id: "week", label: "Esta semana", icon: "calendar" as const },
  { id: "specific", label: "Data específica", icon: "clock" as const },
];

// ── Acompanhantes ─────────────────────────────────────────────────────────────

export const COMPANION_OPTIONS = [
  { id: "solo", label: "Prefiro sair só", icon: "user" as const },
  { id: "couple", label: "Prefiro sair com alguém", icon: "heart" as const },
  { id: "group", label: "Prefiro sair em grupo", icon: "users" as const },
  { id: "surprise", label: "Surpreenda-me", icon: "star" as const },
];

// ── Modal shared styles ───────────────────────────────────────────────────────

const SELECTED_BORDER = "#FFFFFF"; // borda branca quando selecionado

// ── OndeModal ─────────────────────────────────────────────────────────────────

interface OndeModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (location: typeof LOCATION_OPTIONS[0]) => void;
  selectedCity: typeof LOCATION_OPTIONS[0] | null;
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
          <Text style={styles.modalTitle}>
            Suas preferências de{" "}
            <Text style={styles.modalTitleHighlight}>LUGAR</Text>
          </Text>
          <View style={styles.closeButton} />
        </View>

        <ScrollView
          style={styles.modalContent}
          contentContainerStyle={styles.optionsContainer}
          showsVerticalScrollIndicator={false}
        >
          {LOCATION_OPTIONS.map((loc) => {
            const isSelected = selectedCity?.id === loc.id;
            return (
              <Pressable
                key={loc.id}
                style={({ pressed }) => [
                  styles.optionItem,
                  isSelected && styles.optionItemSelected,
                  pressed && styles.optionItemPressed,
                ]}
                onPress={() => {
                  onSelect(loc);
                  onClose();
                }}
              >
                <View style={styles.optionIcon}>
                  <Feather name={loc.icon} size={20} color={Colors.dark.primary} />
                </View>
                <View style={styles.optionTextContainer}>
                  <Text style={[styles.optionTitle, loc.isTantoFaz && styles.optionTitleHighlight]}>
                    {loc.name}
                  </Text>
                </View>
                {isSelected && <Feather name="check" size={20} color={SELECTED_BORDER} />}
              </Pressable>
            );
          })}
        </ScrollView>
      </View>
    </Modal>
  );
}

// ── QuandoModal ───────────────────────────────────────────────────────────────

interface QuandoModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (option: typeof DATE_OPTIONS[0]) => void;
  selectedOption: typeof DATE_OPTIONS[0] | null;
}

export function QuandoModal({ visible, onClose, onSelect, selectedOption }: QuandoModalProps) {
  const insets = useSafeAreaInsets();
  const [showPicker, setShowPicker] = useState(false);
  const [dateValue, setDateValue] = useState(new Date());

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
          <Text style={styles.modalTitle}>
            Suas preferências de{" "}
            <Text style={styles.modalTitleHighlight}>DATA</Text>
          </Text>
          <View style={styles.closeButton} />
        </View>

        {!showPicker ? (
          <ScrollView
            style={styles.modalContent}
            contentContainerStyle={styles.optionsContainer}
            showsVerticalScrollIndicator={false}
          >
            {DATE_OPTIONS.map((opt) => {
              const isSelected = selectedOption?.id === opt.id;
              return (
                <Pressable
                  key={opt.id}
                  style={({ pressed }) => [
                    styles.optionItem,
                    isSelected && styles.optionItemSelected,
                    pressed && styles.optionItemPressed,
                  ]}
                  onPress={() => {
                    if (opt.id === "specific") {
                      setShowPicker(true);
                    } else {
                      onSelect(opt);
                      onClose();
                    }
                  }}
                >
                  <View style={styles.optionIcon}>
                    <Feather name={opt.icon} size={20} color={Colors.dark.primary} />
                  </View>
                  <View style={styles.optionTextContainer}>
                    <Text style={styles.optionTitle}>{opt.label}</Text>
                  </View>
                  {isSelected && <Feather name="check" size={20} color={SELECTED_BORDER} />}
                </Pressable>
              );
            })}
          </ScrollView>
        ) : (
          <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: Spacing.xl }}>
            <Text style={{ fontSize: 16, fontWeight: "600", color: Colors.dark.text, marginBottom: Spacing.lg }}>
              Escolha a data:
            </Text>
            <DateTimePicker
              value={dateValue}
              mode="date"
              display={Platform.OS === "ios" ? "inline" : "default"}
              minimumDate={new Date()}
              onChange={(event, date) => {
                if (Platform.OS !== "ios") {
                  setShowPicker(false);
                  if (event.type === "set" && date) {
                    setDateValue(date);
                    const formatted = date.toLocaleDateString("pt-BR");
                    onSelect({ id: "specific", label: formatted, icon: "clock" });
                    onClose();
                  }
                } else if (date) {
                  setDateValue(date);
                }
              }}
            />
            {Platform.OS === "ios" && (
              <View style={{ flexDirection: "row", gap: Spacing.md, marginTop: Spacing.lg }}>
                <Pressable
                  style={({ pressed }) => [
                    { paddingVertical: Spacing.md, paddingHorizontal: Spacing.xl, borderRadius: 12, backgroundColor: "#F0F0F0" },
                    pressed && { opacity: 0.8 },
                  ]}
                  onPress={() => setShowPicker(false)}
                >
                  <Text style={{ fontSize: 15, color: Colors.dark.textSecondary, fontWeight: "500" }}>Voltar</Text>
                </Pressable>
                <Pressable
                  style={({ pressed }) => [
                    { paddingVertical: Spacing.md, paddingHorizontal: Spacing.xl, borderRadius: 12, backgroundColor: Colors.dark.brand },
                    pressed && { opacity: 0.9 },
                  ]}
                  onPress={() => {
                    const formatted = dateValue.toLocaleDateString("pt-BR");
                    onSelect({ id: "specific", label: formatted, icon: "clock" });
                    setShowPicker(false);
                    onClose();
                  }}
                >
                  <Text style={{ fontSize: 15, color: "#FFFFFF", fontWeight: "600" }}>Confirmar</Text>
                </Pressable>
              </View>
            )}
          </View>
        )}
      </View>
    </Modal>
  );
}

// ── ComQuemModal ──────────────────────────────────────────────────────────────

interface ComQuemModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (option: typeof COMPANION_OPTIONS[0]) => void;
  selectedOption: typeof COMPANION_OPTIONS[0] | null;
  // Props do microfone mantidas por compatibilidade (não renderizadas)
  onMicPress?: () => void;
  isRecording?: boolean;
  isTranscribing?: boolean;
  transcript?: string;
}

export function ComQuemModal({
  visible,
  onClose,
  onSelect,
  selectedOption,
}: ComQuemModalProps) {
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
          <Text style={styles.modalTitle}>
            Suas preferências de{" "}
            <Text style={styles.modalTitleHighlight}>PESSOA</Text>
          </Text>
          <View style={styles.closeButton} />
        </View>

        <ScrollView
          style={styles.modalContent}
          contentContainerStyle={styles.optionsContainer}
          showsVerticalScrollIndicator={false}
        >
          {COMPANION_OPTIONS.map((opt) => {
            const isSelected = selectedOption?.id === opt.id;
            return (
              <Pressable
                key={opt.id}
                style={({ pressed }) => [
                  styles.optionItem,
                  isSelected && styles.optionItemSelected,
                  pressed && styles.optionItemPressed,
                ]}
                onPress={() => {
                  onSelect(opt);
                  onClose();
                }}
              >
                <View style={styles.optionIcon}>
                  <Feather name={opt.icon} size={20} color={Colors.dark.primary} />
                </View>
                <View style={styles.optionTextContainer}>
                  <Text style={styles.optionTitle}>{opt.label}</Text>
                </View>
                {isSelected && <Feather name="check" size={20} color={SELECTED_BORDER} />}
              </Pressable>
            );
          })}
        </ScrollView>
      </View>
    </Modal>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

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
    fontSize: 16,
    fontWeight: "500",
    color: Colors.dark.textSecondary,
    textAlign: "center",
    flex: 1,
  },
  modalTitleHighlight: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.dark.primary,
    textTransform: "uppercase",
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
    padding: Spacing.md,
    backgroundColor: Colors.dark.backgroundDefault,
    borderRadius: BorderRadius.lg,
    gap: Spacing.md,
    borderWidth: 1,
    borderColor: "transparent",
  },
  optionItemSelected: {
    borderColor: SELECTED_BORDER,
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  optionItemPressed: {
    opacity: 0.8,
  },
  optionIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.dark.primary + "20",
    alignItems: "center",
    justifyContent: "center",
  },
  optionTextContainer: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 15,
    fontWeight: "500",
    color: Colors.dark.text,
  },
  optionTitleHighlight: {
    color: Colors.dark.primary,
    fontWeight: "600",
  },
  optionSubtitle: {
    fontSize: 13,
    color: Colors.dark.textSecondary,
    marginTop: 2,
  },
});
