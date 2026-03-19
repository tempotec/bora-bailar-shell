import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Pressable,
    Image,
    Dimensions,
    Alert,
    ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";
import type { RootStackParamList } from "@/navigation/RootStackNavigator";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/api";

const logoImage = require("../../assets/images/novo_logo.png");

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// Mock data removed - now using API data

const FILTER_TAGS = [
    { id: "filtros", label: "Filtros", count: 4, isSpecial: true },
    { id: "com_homem", label: "Com homem", isActive: true },
    { id: "5km", label: "5km", isActive: true },
    { id: "forro", label: "Forró", isActive: true },
    { id: "salsa", label: "Salsa", isActive: false },
];

type StoryCardProps = {
    title: string;
    username: string;
    location: string;
    thumbnail: any;
    onPress?: () => void;
};

function StoryCard({ title, username, location, thumbnail, onPress }: StoryCardProps) {
    return (
        <Pressable style={styles.storyCard} onPress={onPress}>
            <Image source={thumbnail} style={styles.storyImage} resizeMode="cover" />
            <View style={styles.storyOverlay}>
                <Text style={styles.storyTitle} numberOfLines={2}>
                    {title}
                </Text>
                <Text style={styles.storyUsername}>{username}</Text>
                <Text style={styles.storyLocation}>{location}</Text>
            </View>
        </Pressable>
    );
}

type EventCardProps = {
    dayLabel: string;
    date: string;
    title: string;
    location: string;
    time: string;
    image: string;
    color: string;
    onReserve?: () => void;
    onDetails?: () => void;
};

function EventCard({
    dayLabel,
    date,
    title,
    location,
    time,
    image,
    color,
    onReserve,
    onDetails,
}: EventCardProps) {
    return (
        <View style={styles.eventCard}>
            <Image source={{ uri: image }} style={styles.eventImage} resizeMode="cover" />
            <View style={[styles.eventDateBox, { backgroundColor: color }]}>
                <Text style={styles.eventDayLabel}>{dayLabel}</Text>
                <Text style={styles.eventDate}>{date}</Text>
            </View>
            <View style={styles.eventInfo}>
                <Text style={styles.eventTitle} numberOfLines={2}>
                    {title}
                </Text>
                <View style={styles.eventLocationRow}>
                    <Feather name="map-pin" size={12} color={Colors.dark.textSecondary} />
                    <Text style={styles.eventLocation}>{location}</Text>
                </View>
                <View style={styles.eventTimeRow}>
                    <Feather name="clock" size={12} color={Colors.dark.textSecondary} />
                    <Text style={styles.eventTime}>{time}</Text>
                </View>
            </View>
            <View style={styles.eventActions}>
                <Pressable style={styles.reserveButton} onPress={onReserve}>
                    <Text style={styles.reserveButtonText}>Reservar</Text>
                </Pressable>
                <Pressable onPress={onDetails}>
                    <Text style={styles.detailsLink}>Ver detalhes &gt;</Text>
                </Pressable>
            </View>
        </View>
    );
}

type FilterTagProps = {
    label: string;
    count?: number;
    isSpecial?: boolean;
    isActive?: boolean;
    onPress?: () => void;
};

function FilterTag({ label, count, isSpecial, isActive, onPress }: FilterTagProps) {
    return (
        <Pressable
            style={[
                styles.filterTag,
                isSpecial && styles.filterTagSpecial,
                isActive && styles.filterTagActive,
            ]}
            onPress={onPress}
        >
            {isSpecial ? (
                <View style={styles.filterTagContent}>
                    <Text style={styles.filterTagSpecialText}>{label}</Text>
                    <View style={styles.filterTagCount}>
                        <Text style={styles.filterTagCountText}>{count}</Text>
                    </View>
                </View>
            ) : (
                <Text style={[styles.filterTagText, isActive && styles.filterTagTextActive]}>
                    {label}
                </Text>
            )}
        </Pressable>
    );
}

export default function ExplorarScreen() {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const [locationOpen, setLocationOpen] = useState(false);

    // Fetch data from API
    const { data: discoverData, isLoading } = useQuery({
        queryKey: ["discover"],
        queryFn: api.events.getDiscoverData,
    });

    // Extract stories and events from API data (using recommendations as events source)
    const storiesData = discoverData?.stories || [];
    const eventsData = (discoverData?.recommendations || []).map((event: any, index: number) => {
        const eventDate = event.startsAt ? new Date(event.startsAt) : new Date();
        const dayNames = ["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SAB"];
        const dayLabel = dayNames[eventDate.getDay()];
        const formattedDate = `${String(eventDate.getDate()).padStart(2, "0")}/${String(eventDate.getMonth() + 1).padStart(2, "0")}`;
        const formattedTime = eventDate.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }).replace(":", "h");

        return {
            id: event.id,
            dayLabel,
            date: formattedDate,
            title: event.title,
            location: event.venueName || "Local a definir",
            time: formattedTime,
            image: event.coverImage || "https://images.unsplash.com/photo-1504609813442-a8924e83f76e?w=100&h=100&fit=crop",
            color: index === 1 ? "#22C55E" : "#C41E3A",
        };
    });

    const handleStoryPress = (index: number) => {
        navigation.navigate("Reels", { initialIndex: index });
    };

    const handleEventReserve = (eventId: string) => {
        const event = eventsData.find((e: any) => e.id === eventId);
        if (event) {
            navigation.navigate("AIChat", {
                cardTitle: event.title,
                cardDescription: `${event.location} - ${event.time}`,
            });
        }
    };

    const handleEventDetails = (eventId: string) => {
        navigation.navigate("EventDetails", { eventId });
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerContent}>
                    <Image source={logoImage} style={styles.logo} resizeMode="contain" />
                    <Text style={styles.brandText}>
                        <Text style={styles.brandRed}>B</Text>ORA
                        <Text style={styles.brandRed}>B</Text>AILAR
                    </Text>
                </View>
                <Pressable style={styles.bellButton}>
                    <Feather name="bell" size={20} color={Colors.dark.text} />
                </Pressable>
            </View>

            {/* Search Bar */}
            <View style={styles.searchBar}>
                <Feather name="search" size={18} color={Colors.dark.textSecondary} />
                <Text style={styles.searchText}>Onde, quando e com quem?</Text>
            </View>

            {isLoading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={Colors.dark.brand} />
                    <Text style={styles.loadingText}>Carregando...</Text>
                </View>
            ) : (
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 80 }]}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Filter Tags */}
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.filtersContainer}
                    >
                        {FILTER_TAGS.map((tag) => (
                            <FilterTag
                                key={tag.id}
                                label={tag.label}
                                count={tag.count}
                                isSpecial={tag.isSpecial}
                                isActive={tag.isActive}
                            />
                        ))}
                    </ScrollView>

                    {/* Location Dropdown */}
                    <Pressable
                        style={styles.locationDropdown}
                        onPress={() => setLocationOpen(!locationOpen)}
                    >
                        <Text style={styles.locationText}>Em Rio de Janeiro</Text>
                        <Feather name={locationOpen ? "chevron-up" : "chevron-down"} size={16} color={Colors.dark.text} />
                    </Pressable>

                    {/* Title */}
                    <Text style={styles.sectionTitle}>EXPLORAR</Text>

                    {/* Stories */}
                    {storiesData.length > 0 ? (
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.storiesContainer}
                        >
                            {storiesData.map((story: any, index: number) => (
                                <StoryCard
                                    key={story.id}
                                    title={story.title}
                                    username={story.username}
                                    location=""
                                    thumbnail={story.thumbnail}
                                    onPress={() => handleStoryPress(index)}
                                />
                            ))}
                        </ScrollView>
                    ) : (
                        <View style={styles.emptyState}>
                            <Text style={styles.emptyStateText}>Nenhum vídeo disponível no momento</Text>
                        </View>
                    )}

                    {/* Events */}
                    <View style={styles.eventsSection}>
                        {eventsData.length > 0 ? (
                            eventsData.map((event: any) => (
                                <EventCard
                                    key={event.id}
                                    dayLabel={event.dayLabel}
                                    date={event.date}
                                    title={event.title}
                                    location={event.location}
                                    time={event.time}
                                    image={event.image}
                                    color={event.color}
                                    onReserve={() => handleEventReserve(event.id)}
                                    onDetails={() => handleEventDetails(event.id)}
                                />
                            ))
                        ) : (
                            <View style={styles.emptyState}>
                                <Text style={styles.emptyStateText}>Nenhum evento disponível no momento</Text>
                            </View>
                        )}
                    </View>
                </ScrollView>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FFFFFF",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.sm,
    },
    headerContent: {
        flexDirection: "row",
        alignItems: "center",
        gap: Spacing.xs,
    },
    logo: {
        width: 28,
        height: 28,
    },
    brandText: {
        fontSize: 18,
        fontWeight: "700",
        color: Colors.dark.text,
        letterSpacing: 1,
    },
    brandRed: {
        color: Colors.dark.brand,
    },
    bellButton: {
        padding: Spacing.xs,
    },
    searchBar: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#F5F5F5",
        marginHorizontal: Spacing.lg,
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        borderRadius: BorderRadius.full,
        gap: Spacing.sm,
    },
    searchText: {
        fontSize: 14,
        color: Colors.dark.textSecondary,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingTop: Spacing.md,
    },
    filtersContainer: {
        paddingHorizontal: Spacing.lg,
        gap: Spacing.sm,
        paddingBottom: Spacing.md,
    },
    filterTag: {
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        borderRadius: BorderRadius.full,
        borderWidth: 1,
        borderColor: "#E0E0E0",
        backgroundColor: "#FFFFFF",
    },
    filterTagSpecial: {
        backgroundColor: Colors.dark.brand,
        borderColor: Colors.dark.brand,
    },
    filterTagActive: {
        backgroundColor: Colors.dark.brand,
        borderColor: Colors.dark.brand,
    },
    filterTagContent: {
        flexDirection: "row",
        alignItems: "center",
        gap: Spacing.xs,
    },
    filterTagSpecialText: {
        fontSize: 13,
        fontWeight: "600",
        color: "#FFFFFF",
    },
    filterTagCount: {
        backgroundColor: "#FFFFFF",
        width: 18,
        height: 18,
        borderRadius: 9,
        alignItems: "center",
        justifyContent: "center",
    },
    filterTagCountText: {
        fontSize: 11,
        fontWeight: "700",
        color: Colors.dark.brand,
    },
    filterTagText: {
        fontSize: 13,
        fontWeight: "500",
        color: Colors.dark.text,
    },
    filterTagTextActive: {
        color: "#FFFFFF",
    },
    locationDropdown: {
        flexDirection: "row",
        alignItems: "center",
        gap: Spacing.xs,
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.sm,
    },
    locationText: {
        fontSize: 13,
        color: Colors.dark.text,
    },
    sectionTitle: {
        fontSize: 22,
        fontWeight: "700",
        color: Colors.dark.text,
        paddingHorizontal: Spacing.lg,
        marginBottom: Spacing.md,
    },
    storiesContainer: {
        paddingHorizontal: Spacing.lg,
        gap: Spacing.md,
        paddingBottom: Spacing.lg,
    },
    storyCard: {
        width: 100,
        height: 160,
        borderRadius: BorderRadius.md,
        overflow: "hidden",
    },
    storyImage: {
        width: "100%",
        height: "100%",
    },
    storyOverlay: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        padding: Spacing.sm,
        backgroundColor: "rgba(0,0,0,0.4)",
    },
    storyTitle: {
        fontSize: 11,
        fontWeight: "600",
        color: "#FFFFFF",
        marginBottom: 2,
    },
    storyUsername: {
        fontSize: 10,
        color: "#FFFFFF",
        opacity: 0.9,
    },
    storyLocation: {
        fontSize: 9,
        color: Colors.dark.brand,
        fontWeight: "600",
    },
    eventsSection: {
        paddingHorizontal: Spacing.lg,
        gap: Spacing.md,
    },
    eventCard: {
        flexDirection: "row",
        backgroundColor: "#FFFFFF",
        borderRadius: BorderRadius.md,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: "#E0E0E0",
        padding: Spacing.sm,
        gap: Spacing.sm,
    },
    eventImage: {
        width: 70,
        height: 80,
        borderRadius: BorderRadius.sm,
    },
    eventDateBox: {
        position: "absolute",
        left: Spacing.sm,
        top: Spacing.sm,
        width: 45,
        paddingVertical: Spacing.xs,
        borderRadius: BorderRadius.xs,
        alignItems: "center",
    },
    eventDayLabel: {
        fontSize: 14,
        fontWeight: "700",
        color: "#FFFFFF",
    },
    eventDate: {
        fontSize: 11,
        color: "#FFFFFF",
        opacity: 0.9,
    },
    eventInfo: {
        flex: 1,
        justifyContent: "center",
        paddingLeft: Spacing.sm,
    },
    eventTitle: {
        fontSize: 13,
        fontWeight: "700",
        color: Colors.dark.text,
        marginBottom: Spacing.xs,
    },
    eventLocationRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        marginBottom: 2,
    },
    eventLocation: {
        fontSize: 11,
        color: Colors.dark.textSecondary,
    },
    eventTimeRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },
    eventTime: {
        fontSize: 11,
        color: Colors.dark.textSecondary,
    },
    eventActions: {
        justifyContent: "space-around",
        alignItems: "flex-end",
        paddingLeft: Spacing.sm,
    },
    reserveButton: {
        backgroundColor: "#22C55E",
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.xs,
        borderRadius: BorderRadius.sm,
    },
    reserveButtonText: {
        fontSize: 12,
        fontWeight: "600",
        color: "#FFFFFF",
    },
    detailsLink: {
        fontSize: 11,
        color: Colors.dark.brand,
        fontWeight: "600",
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        gap: Spacing.md,
    },
    loadingText: {
        fontSize: 14,
        color: Colors.dark.textSecondary,
    },
    emptyState: {
        padding: Spacing.xl,
        alignItems: "center",
    },
    emptyStateText: {
        fontSize: 14,
        color: Colors.dark.textSecondary,
        textAlign: "center",
    },
});
