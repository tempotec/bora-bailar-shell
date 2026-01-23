import React from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, Image } from "react-native";
import { Feather } from "@expo/vector-icons";
import { Colors, Spacing, BorderRadius, Fonts } from "@/constants/theme";
import { LinearGradient } from "expo-linear-gradient";

// --- Types ---
export interface FilterOption {
    id: string;
    label: string;
    count?: number;
    isPrimary: boolean;
}

// --- Components ---

export function ExploreHeader({ location, onLocationPress }: { location: string; onLocationPress: () => void }) {
    return (
        <View style={styles.headerContainer}>
            <Pressable style={styles.locationRow} onPress={onLocationPress}>
                <Text style={styles.locationPrefix}>Em </Text>
                <Text style={styles.locationText}>{location}</Text>
                <Feather name="chevron-down" size={16} color={Colors.dark.text} />
            </Pressable>
            <Text style={styles.pageTitle}>EXPLORAR</Text>
        </View>
    );
}

export function FilterBar({ filters, onSelect }: { filters: FilterOption[]; onSelect: (id: string) => void }) {
    return (
        <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterContainer}
            style={styles.filterScrollView}
        >
            {filters.map((filter) => (
                <Pressable
                    key={filter.id}
                    style={[
                        styles.filterPill,
                        filter.isPrimary ? styles.filterPillPrimary : styles.filterPillSecondary,
                    ]}
                    onPress={() => onSelect(filter.id)}
                >
                    <Text style={[
                        styles.filterText,
                        filter.isPrimary ? styles.filterTextPrimary : styles.filterTextSecondary,
                    ]}>
                        {filter.label}
                    </Text>
                    {filter.count && (
                        <View style={styles.badge}>
                            <Text style={styles.badgeText}>{filter.count}</Text>
                        </View>
                    )}
                </Pressable>
            ))}
        </ScrollView>
    );
}

export function ExploreStoryCard({
    item,
    onPress
}: {
    item: { id: string; username: string; description: string; thumbnail: any };
    onPress: () => void;
}) {
    return (
        <Pressable style={styles.storyCard} onPress={onPress}>
            <Image source={item.thumbnail} style={styles.storyImage} resizeMode="cover" />
            <LinearGradient
                colors={["transparent", "rgba(0,0,0,0.6)"]}
                style={styles.storyGradient}
            />
            <View style={styles.storyContent}>
                {/* We just show partial info in the card to match screenshot somewhat or keep simple */}
            </View>
            <View style={styles.storyFooter}>
                <Text style={styles.storyTitle} numberOfLines={2}>{item.username}</Text>
                <Text style={styles.storySubtitle} numberOfLines={1}>{item.description}</Text>
            </View>
        </Pressable>
    );
}

export function EventFeedItem({
    event,
    onPress,
    onDetails
}: {
    event: {
        id: string;
        day: string;
        date: string;
        title: string;
        location: string;
        time: string;
        image: any;
        tags: string[];
    };
    onPress: () => void;
    onDetails: () => void;
}) {
    return (
        <Pressable style={styles.eventItem} onPress={onPress}>
            <View style={styles.eventImageContainer}>
                <Image source={event.image} style={styles.eventImage} resizeMode="cover" />
                <View style={styles.tagsContainer}>
                    {event.tags.map((tag, index) => (
                        <View key={index} style={[styles.tag, tag === "Novo" ? styles.tagNovo : styles.tagDefault]}>
                            <Text style={styles.tagText}>{tag}</Text>
                        </View>
                    ))}
                </View>
            </View>

            <View style={styles.eventContent}>
                <View style={styles.dateBox}>
                    <Text style={styles.dateDay}>{event.day}</Text>
                    <Text style={styles.dateNum}>{event.date}</Text>
                </View>

                <View style={styles.eventInfo}>
                    <Text style={styles.eventTitle} numberOfLines={2}>{event.title}</Text>

                    <View style={styles.eventMetaRow}>
                        <Feather name="map-pin" size={12} color={Colors.dark.textSecondary} />
                        <Text style={styles.eventMetaText}>{event.location}</Text>
                    </View>

                    <View style={styles.eventMetaRow}>
                        <Feather name="clock" size={12} color={Colors.dark.textSecondary} />
                        <Text style={styles.eventMetaText}>{event.time}</Text>
                    </View>

                    <Pressable onPress={onDetails} style={styles.detailsLink}>
                        <Text style={styles.detailsLinkText}>Ver detalhes {">"}</Text>
                    </Pressable>
                </View>

                <View style={styles.eventAction}>
                    <Pressable style={styles.reserveButton} onPress={onPress}>
                        <Text style={styles.reserveButtonText}>Reservar</Text>
                    </Pressable>
                </View>
            </View>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    // Header
    headerContainer: {
        paddingHorizontal: Spacing.lg,
        paddingTop: Spacing.sm,
        paddingBottom: Spacing.md,
    },
    locationRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: Spacing.xs,
    },
    locationPrefix: {
        fontSize: 14,
        color: Colors.dark.textSecondary,
        fontWeight: "600",
    },
    locationText: {
        fontSize: 14,
        color: Colors.dark.text,
        fontWeight: "700",
        marginRight: 4,
    },
    pageTitle: {
        fontSize: 28,
        fontWeight: "800",
        color: "#000000",
        letterSpacing: 0.5,
    },

    // Filter Bar
    filterScrollView: {
        marginBottom: Spacing.lg,
    },
    filterContainer: {
        paddingHorizontal: Spacing.lg,
        gap: Spacing.sm,
    },
    filterPill: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
    filterPillPrimary: {
        backgroundColor: "#CC0000", // Dark Red
    },
    filterPillSecondary: {
        backgroundColor: "#FF6B6B", // Light Red / Salmon
    },
    filterText: {
        fontSize: 14,
        fontWeight: "600",
    },
    filterTextPrimary: {
        color: "#FFFFFF",
    },
    filterTextSecondary: {
        color: "#FFFFFF",
    },
    badge: {
        backgroundColor: "#FFFFFF",
        borderRadius: 10,
        width: 20,
        height: 20,
        alignItems: "center",
        justifyContent: "center",
    },
    badgeText: {
        fontSize: 12,
        fontWeight: "700",
        color: "#CC0000",
    },

    // Story Card
    storyCard: {
        width: 140,
        height: 220,
        borderRadius: BorderRadius.md,
        overflow: "hidden",
        backgroundColor: "#EEE",
        marginRight: Spacing.sm,
    },
    storyImage: {
        width: "100%",
        height: "100%",
    },
    storyGradient: {
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        height: "50%",
    },
    storyContent: {
        flex: 1,
    },
    storyFooter: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        padding: Spacing.sm,
    },
    storyTitle: {
        color: "#FFFFFF",
        fontSize: 14,
        fontWeight: "700",
        marginBottom: 2,
        lineHeight: 18,
    },
    storySubtitle: {
        color: "#FFFFFF",
        fontSize: 11,
        opacity: 0.9,
    },

    // Event Feed Item
    eventItem: {
        backgroundColor: "#F5F5F5", // Light grey background like screenshot
        borderRadius: BorderRadius.xl, // Very rounded corners
        overflow: "hidden", // Important for border radius and image
        marginBottom: Spacing.md,
        flexDirection: "row", // Changed to row? No, based on screenshot it looks like Row for desktop but specifically the screenshot shows:
        // Actually the screenshot 2 shows a specific layout:
        // Left: Image (square-ish)
        // Middle/Right: Info + Action
        // Let's adopt the layout from the screenshot (e.g. "SEX 14/09 HAPPY HOUR...")
        padding: Spacing.sm,
        height: 130, // Fixed height for consistent look
        alignItems: "center",
    },
    eventImageContainer: {
        width: 100,
        height: "100%",
        borderRadius: BorderRadius.lg,
        overflow: "hidden",
        marginRight: Spacing.md,
    },
    eventImage: {
        width: "100%",
        height: "100%",
    },
    tagsContainer: {
        position: "absolute",
        top: Spacing.xs,
        left: Spacing.xs,
        flexDirection: "column",
        gap: 4,
    },
    tag: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 8,
        alignSelf: "flex-start",
    },
    tagNovo: {
        backgroundColor: "rgba(0,0,0,0.5)", // Dark semi-transparent
    },
    tagDefault: {
        backgroundColor: "rgba(76, 175, 80, 0.9)", // Green ish
    },
    tagText: {
        color: "#FFFFFF",
        fontSize: 10,
        fontWeight: "600",
    },
    eventContent: {
        flex: 1,
        height: "100%",
        flexDirection: "row",
    },
    dateBox: {
        alignItems: "center",
        marginRight: Spacing.sm,
        justifyContent: "flex-start",
        paddingTop: Spacing.xs,
        borderRightWidth: 1,
        borderRightColor: "#E0E0E0",
        paddingRight: Spacing.sm,
        minWidth: 50,
    },
    dateDay: {
        fontSize: 18, // Large day
        fontWeight: "800",
        color: "#CC0000", // Red color
        textTransform: "uppercase",
    },
    dateNum: {
        fontSize: 14,
        fontWeight: "600",
        color: Colors.dark.textSecondary,
    },
    eventInfo: {
        flex: 1,
        justifyContent: "flex-start",
        paddingTop: Spacing.xs,
    },
    eventTitle: {
        fontSize: 13,
        fontWeight: "800",
        color: Colors.dark.text,
        marginBottom: Spacing.xs,
        textTransform: "uppercase",
    },
    eventMetaRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        marginBottom: 2,
    },
    eventMetaText: {
        fontSize: 10,
        color: Colors.dark.textSecondary,
    },
    detailsLink: {
        marginTop: 4,
    },
    detailsLinkText: {
        fontSize: 10,
        color: "#CC0000",
        fontWeight: "700",
        textAlign: "right", // Align right? Screenshot shows it bottom right of info area
    },
    eventAction: {
        justifyContent: "flex-end",
        paddingBottom: Spacing.xs,
        marginLeft: Spacing.xs,
    },
    reserveButton: {
        backgroundColor: "#4CAF50", // Green button
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 16,
    },
    reserveButtonText: {
        color: "#FFFFFF",
        fontSize: 11,
        fontWeight: "700",
    },
});
