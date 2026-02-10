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
} from "react-native-reanimated";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";
import {
    ALL_NEIGHBORHOODS,
    ZONES,
    DATE_OPTIONS,
    COMPANION_OPTIONS,
} from "./SearchModals";

interface WizardSearchModalProps {
    visible: boolean;
    onClose: () => void;
    onSearch: (filters: {
        city: typeof ALL_NEIGHBORHOODS[0] | null;
        date: typeof DATE_OPTIONS[0] | null;
        companion: typeof COMPANION_OPTIONS[0] | null;
    }) => void;
    initialCity?: typeof ALL_NEIGHBORHOODS[0] | null;
    initialDate?: typeof DATE_OPTIONS[0] | null;
    initialCompanion?: typeof COMPANION_OPTIONS[0] | null;
    onMicPress?: () => void;
    isRecording?: boolean;
    isTranscribing?: boolean;
    transcript?: string;
}

type WizardStep = "onde" | "quando" | "comquem";

export function WizardSearchModal({
    visible,
    onClose,
    onSearch,
    initialCity = null,
    initialDate = null,
    initialCompanion = null,
    onMicPress,
    isRecording = false,
    isTranscribing = false,
    transcript = "",
}: WizardSearchModalProps) {
    const insets = useSafeAreaInsets();
    const [currentStep, setCurrentStep] = useState<WizardStep>("onde");
    const [selectedCity, setSelectedCity] = useState<typeof ALL_NEIGHBORHOODS[0] | null>(initialCity);
    const [selectedDate, setSelectedDate] = useState<typeof DATE_OPTIONS[0] | null>(initialDate);
    const [selectedCompanion, setSelectedCompanion] = useState<typeof COMPANION_OPTIONS[0] | null>(initialCompanion);

    // Sync with initial values when modal opens
    useEffect(() => {
        if (visible) {
            setSelectedCity(initialCity);
            setSelectedDate(initialDate);
            setSelectedCompanion(initialCompanion);
            // Start from the first unfilled step
            if (!initialCity) {
                setCurrentStep("onde");
            } else if (!initialDate) {
                setCurrentStep("quando");
            } else if (!initialCompanion) {
                setCurrentStep("comquem");
            } else {
                setCurrentStep("onde");
            }
        }
    }, [visible, initialCity, initialDate, initialCompanion]);

    const handleCitySelect = (city: typeof ALL_NEIGHBORHOODS[0]) => {
        setSelectedCity(city);
        setCurrentStep("quando");
    };

    const handleDateSelect = (date: typeof DATE_OPTIONS[0]) => {
        setSelectedDate(date);
        setCurrentStep("comquem");
    };

    const handleCompanionSelect = (companion: typeof COMPANION_OPTIONS[0]) => {
        setSelectedCompanion(companion);
    };

    const handleSearch = () => {
        onSearch({
            city: selectedCity,
            date: selectedDate,
            companion: selectedCompanion,
        });
        onClose();
    };

    const handleClearFilters = () => {
        setSelectedCity(null);
        setSelectedDate(null);
        setSelectedCompanion(null);
        setCurrentStep("onde");
    };

    // Mic button animation
    const pulseScale = useSharedValue(1);
    useEffect(() => {
        if (isRecording) {
            const pulse = () => {
                pulseScale.value = withSpring(1.15, { damping: 10 }, () => {
                    pulseScale.value = withSpring(1, { damping: 10 });
                });
            };
            const interval = setInterval(pulse, 800);
            return () => clearInterval(interval);
        } else {
            pulseScale.value = withTiming(1);
        }
    }, [isRecording]);

    const micButtonStyle = useAnimatedStyle(() => ({
        transform: [{ scale: pulseScale.value }],
    }));

    const renderCollapsedStep = (
        step: WizardStep,
        label: string,
        value: string | null,
        isActive: boolean
    ) => {
        if (isActive) return null;

        return (
            <Pressable
                style={styles.collapsedStep}
                onPress={() => setCurrentStep(step)}
            >
                <Text style={styles.collapsedLabel}>{label}</Text>
                <Text style={styles.collapsedValue}>
                    {value || `Adicionar ${label.toLowerCase()}`}
                </Text>
            </Pressable>
        );
    };

    const renderOndeStep = () => {
        if (currentStep !== "onde") {
            return renderCollapsedStep(
                "onde",
                "Onde",
                selectedCity?.name || null,
                false
            );
        }

        return (
            <View style={styles.stepContainer}>
                <Text style={styles.stepTitle}>Onde?</Text>

                {/* Search input placeholder for recent searches */}
                <View style={styles.searchInputContainer}>
                    <Feather name="search" size={18} color={Colors.dark.textSecondary} />
                    <Text style={styles.searchInputPlaceholder}>Buscar destinos</Text>
                </View>

                {/* Recent searches placeholder */}
                <Text style={styles.sectionLabel}>Buscas recentes</Text>
                <View style={styles.recentSearchesPlaceholder}>
                    <Feather name="clock" size={16} color={Colors.dark.textSecondary} />
                    <Text style={styles.recentSearchesText}>Nenhuma busca recente</Text>
                </View>

                {/* Zones */}
                <Text style={styles.sectionLabel}>Por Zona</Text>
                {ZONES.map((zone) => (
                    <Pressable
                        key={zone.id}
                        style={({ pressed }) => [
                            styles.optionItem,
                            selectedCity?.zone === zone.name && styles.optionItemSelected,
                            pressed && styles.optionItemPressed,
                        ]}
                        onPress={() => handleCitySelect({
                            id: zone.id,
                            name: zone.name,
                            zone: zone.name,
                            isZone: true
                        } as any)}
                    >
                        <View style={styles.optionIcon}>
                            <Feather name="map" size={18} color={Colors.dark.brand} />
                        </View>
                        <Text style={styles.optionTitle}>{zone.name}</Text>
                        {selectedCity?.zone === zone.name && (
                            <Feather name="check" size={18} color={Colors.dark.brand} />
                        )}
                    </Pressable>
                ))}

                {/* Neighborhoods */}
                <Text style={[styles.sectionLabel, { marginTop: Spacing.md }]}>Por Bairro</Text>
                {ALL_NEIGHBORHOODS.map((neighborhood) => (
                    <Pressable
                        key={neighborhood.id}
                        style={({ pressed }) => [
                            styles.optionItem,
                            selectedCity?.id === neighborhood.id && styles.optionItemSelected,
                            pressed && styles.optionItemPressed,
                        ]}
                        onPress={() => handleCitySelect(neighborhood)}
                    >
                        <View style={styles.optionIcon}>
                            <Feather name="map-pin" size={18} color={Colors.dark.brand} />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.optionTitle}>{neighborhood.name}</Text>
                            <Text style={styles.optionSubtitle}>{neighborhood.zone}</Text>
                        </View>
                        {selectedCity?.id === neighborhood.id && (
                            <Feather name="check" size={18} color={Colors.dark.brand} />
                        )}
                    </Pressable>
                ))}
            </View>
        );
    };

    const renderQuandoStep = () => {
        if (currentStep !== "quando") {
            return renderCollapsedStep(
                "quando",
                "Quando",
                selectedDate?.label || null,
                false
            );
        }

        return (
            <View style={styles.stepContainer}>
                <Text style={styles.stepTitle}>Quando?</Text>

                {DATE_OPTIONS.map((option) => (
                    <Pressable
                        key={option.id}
                        style={({ pressed }) => [
                            styles.optionItem,
                            selectedDate?.id === option.id && styles.optionItemSelected,
                            pressed && styles.optionItemPressed,
                        ]}
                        onPress={() => handleDateSelect(option)}
                    >
                        <View style={styles.optionIcon}>
                            <Feather name={option.icon} size={18} color={Colors.dark.brand} />
                        </View>
                        <Text style={styles.optionTitle}>{option.label}</Text>
                        {selectedDate?.id === option.id && (
                            <Feather name="check" size={18} color={Colors.dark.brand} />
                        )}
                    </Pressable>
                ))}
            </View>
        );
    };

    const renderComQuemStep = () => {
        if (currentStep !== "comquem") {
            return renderCollapsedStep(
                "comquem",
                "Com quem",
                selectedCompanion?.label || null,
                false
            );
        }

        return (
            <View style={styles.stepContainer}>
                <Text style={styles.stepTitle}>Com quem?</Text>

                {/* Voice section */}
                {onMicPress && (
                    <View style={styles.voiceSection}>
                        <Text style={styles.voiceHint}>
                            {isRecording
                                ? "Gravando... Toque para parar"
                                : isTranscribing
                                    ? "Transcrevendo..."
                                    : "Toque no microfone e fale"}
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
                                    <Feather name="mic" size={24} color="#FFFFFF" />
                                )}
                            </Pressable>
                        </Animated.View>
                        {transcript ? (
                            <Text style={styles.transcriptText}>"{transcript}"</Text>
                        ) : null}
                    </View>
                )}

                <Text style={styles.orDivider}>ou escolha uma opção:</Text>

                {COMPANION_OPTIONS.map((option) => (
                    <Pressable
                        key={option.id}
                        style={({ pressed }) => [
                            styles.optionItem,
                            selectedCompanion?.id === option.id && styles.optionItemSelected,
                            pressed && styles.optionItemPressed,
                        ]}
                        onPress={() => handleCompanionSelect(option)}
                    >
                        <View style={styles.optionIcon}>
                            <Feather name={option.icon} size={18} color={Colors.dark.brand} />
                        </View>
                        <Text style={styles.optionTitle}>{option.label}</Text>
                        {selectedCompanion?.id === option.id && (
                            <Feather name="check" size={18} color={Colors.dark.brand} />
                        )}
                    </Pressable>
                ))}
            </View>
        );
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={onClose}
        >
            <View style={[styles.container, { paddingTop: insets.top || Spacing.lg }]}>
                {/* Header */}
                <View style={styles.header}>
                    <Pressable onPress={onClose} style={styles.closeButton}>
                        <Feather name="x" size={24} color={Colors.dark.text} />
                    </Pressable>
                    <View style={styles.closeButton} />
                </View>

                {/* Content */}
                <ScrollView
                    style={styles.content}
                    contentContainerStyle={styles.contentContainer}
                    showsVerticalScrollIndicator={false}
                >
                    {renderOndeStep()}
                    {renderQuandoStep()}
                    {renderComQuemStep()}
                </ScrollView>

                {/* Footer */}
                <View style={[styles.footer, { paddingBottom: insets.bottom || Spacing.lg }]}>
                    <Pressable onPress={handleClearFilters}>
                        <Text style={styles.clearFiltersText}>Remover filtros</Text>
                    </Pressable>
                    <Pressable
                        style={({ pressed }) => [
                            styles.searchButton,
                            pressed && { opacity: 0.9 },
                        ]}
                        onPress={handleSearch}
                    >
                        <Feather name="search" size={18} color="#FFFFFF" />
                        <Text style={styles.searchButtonText}>Buscar</Text>
                    </Pressable>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.dark.backgroundRoot,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.sm,
    },
    closeButton: {
        width: 40,
        height: 40,
        alignItems: "center",
        justifyContent: "center",
    },
    content: {
        flex: 1,
    },
    contentContainer: {
        paddingHorizontal: Spacing.lg,
        paddingBottom: Spacing.xl,
    },
    stepContainer: {
        backgroundColor: "#FFFFFF",
        borderRadius: BorderRadius.xl,
        padding: Spacing.lg,
        marginBottom: Spacing.md,
        ...Platform.select({
            ios: {
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
            },
            android: {
                elevation: 4,
            },
        }),
    },
    stepTitle: {
        fontSize: 24,
        fontWeight: "700",
        color: Colors.dark.text,
        marginBottom: Spacing.lg,
    },
    collapsedStep: {
        backgroundColor: "#FFFFFF",
        borderRadius: BorderRadius.xl,
        padding: Spacing.lg,
        marginBottom: Spacing.md,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        ...Platform.select({
            ios: {
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 4,
            },
            android: {
                elevation: 2,
            },
        }),
    },
    collapsedLabel: {
        fontSize: 14,
        color: Colors.dark.textSecondary,
    },
    collapsedValue: {
        fontSize: 14,
        color: Colors.dark.text,
        fontWeight: "500",
    },
    searchInputContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#F5F5F5",
        borderRadius: BorderRadius.lg,
        padding: Spacing.md,
        marginBottom: Spacing.lg,
        gap: Spacing.sm,
    },
    searchInputPlaceholder: {
        fontSize: 15,
        color: Colors.dark.textSecondary,
    },
    sectionLabel: {
        fontSize: 12,
        fontWeight: "600",
        color: Colors.dark.textSecondary,
        textTransform: "uppercase",
        letterSpacing: 0.5,
        marginBottom: Spacing.sm,
        marginTop: Spacing.sm,
    },
    recentSearchesPlaceholder: {
        flexDirection: "row",
        alignItems: "center",
        gap: Spacing.sm,
        paddingVertical: Spacing.md,
        opacity: 0.6,
    },
    recentSearchesText: {
        fontSize: 14,
        color: Colors.dark.textSecondary,
    },
    optionItem: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: Spacing.md,
        paddingHorizontal: Spacing.sm,
        borderRadius: BorderRadius.md,
        gap: Spacing.md,
    },
    optionItemSelected: {
        backgroundColor: Colors.dark.brand + "10",
    },
    optionItemPressed: {
        backgroundColor: "#F5F5F5",
    },
    optionIcon: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: Colors.dark.brand + "15",
        alignItems: "center",
        justifyContent: "center",
    },
    optionTitle: {
        flex: 1,
        fontSize: 15,
        color: Colors.dark.text,
        fontWeight: "500",
    },
    optionSubtitle: {
        fontSize: 13,
        color: Colors.dark.textSecondary,
        marginTop: 2,
    },
    voiceSection: {
        alignItems: "center",
        paddingVertical: Spacing.lg,
        gap: Spacing.md,
    },
    voiceHint: {
        fontSize: 14,
        color: Colors.dark.textSecondary,
        textAlign: "center",
    },
    micButton: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: Colors.dark.brand,
        alignItems: "center",
        justifyContent: "center",
    },
    micButtonRecording: {
        backgroundColor: Colors.dark.error,
    },
    micButtonTranscribing: {
        backgroundColor: Colors.dark.secondary,
        opacity: 0.8,
    },
    transcriptText: {
        fontSize: 14,
        color: Colors.dark.text,
        fontStyle: "italic",
        textAlign: "center",
    },
    orDivider: {
        fontSize: 13,
        color: Colors.dark.textSecondary,
        textAlign: "center",
        marginVertical: Spacing.md,
    },
    footer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: Spacing.lg,
        paddingTop: Spacing.md,
        borderTopWidth: 1,
        borderTopColor: "#F0F0F0",
        backgroundColor: "#FFFFFF",
    },
    clearFiltersText: {
        fontSize: 15,
        color: Colors.dark.text,
        fontWeight: "500",
        textDecorationLine: "underline",
    },
    searchButton: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: Colors.dark.brand,
        paddingVertical: Spacing.md,
        paddingHorizontal: Spacing.xl,
        borderRadius: BorderRadius.lg,
        gap: Spacing.sm,
    },
    searchButtonText: {
        fontSize: 15,
        color: "#FFFFFF",
        fontWeight: "600",
    },
});
