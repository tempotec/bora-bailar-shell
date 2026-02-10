import React from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Pressable,
    Image,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";

const MOCK_CONVERSATIONS = [
    {
        id: "1",
        name: "Thiago Alca",
        lastMessage: "Vamos dançar hoje?",
        time: "10:30",
        unread: 2,
        image: require("../../attached_assets/stock_images/person_dancing_happi_798bff4b.jpg"),
    },
    {
        id: "2",
        name: "Luiza Leoncio",
        lastMessage: "Adorei a aula de ontem!",
        time: "09:15",
        unread: 0,
        image: require("../../attached_assets/stock_images/person_dancing_happi_214e72d0.jpg"),
    },
    {
        id: "3",
        name: "Academia Dança Rio",
        lastMessage: "Nova turma de Salsa começando semana que vem",
        time: "Ontem",
        unread: 1,
        image: require("../../attached_assets/stock_images/ballroom_dancing_cou_4ebc2182.jpg"),
    },
    {
        id: "4",
        name: "Prof. Ana Costa",
        lastMessage: "Confirmado para sábado às 15h",
        time: "Ontem",
        unread: 0,
        image: require("../../attached_assets/stock_images/person_dancing_happi_0e460040.jpg"),
    },
];

function ConversationItem({
    conversation
}: {
    conversation: typeof MOCK_CONVERSATIONS[0];
}) {
    return (
        <Pressable style={styles.conversationItem}>
            <Image source={conversation.image} style={styles.avatar} />

            <View style={styles.conversationContent}>
                <View style={styles.conversationHeader}>
                    <Text style={styles.conversationName}>{conversation.name}</Text>
                    <Text style={styles.conversationTime}>{conversation.time}</Text>
                </View>

                <View style={styles.conversationFooter}>
                    <Text
                        style={[
                            styles.lastMessage,
                            conversation.unread > 0 && styles.lastMessageUnread
                        ]}
                        numberOfLines={1}
                    >
                        {conversation.lastMessage}
                    </Text>
                    {conversation.unread > 0 && (
                        <View style={styles.unreadBadge}>
                            <Text style={styles.unreadText}>{conversation.unread}</Text>
                        </View>
                    )}
                </View>
            </View>
        </Pressable>
    );
}

export default function ChatScreen() {
    const insets = useSafeAreaInsets();

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Mensagens</Text>
                <Pressable style={styles.headerButton}>
                    <Feather name="edit" size={24} color={Colors.dark.text} />
                </Pressable>
            </View>

            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <Feather name="search" size={20} color={Colors.dark.textSecondary} />
                <Text style={styles.searchPlaceholder}>Buscar conversas...</Text>
            </View>

            {/* Conversations List */}
            <ScrollView style={styles.conversationsList}>
                {MOCK_CONVERSATIONS.map((conversation) => (
                    <ConversationItem key={conversation.id} conversation={conversation} />
                ))}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.dark.backgroundRoot,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.md,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: "800",
        color: Colors.dark.text,
    },
    headerButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: Colors.dark.backgroundDefault,
        alignItems: "center",
        justifyContent: "center",
    },
    searchContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: Colors.dark.backgroundDefault,
        marginHorizontal: Spacing.lg,
        marginBottom: Spacing.md,
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        borderRadius: BorderRadius.md,
        gap: Spacing.sm,
    },
    searchPlaceholder: {
        fontSize: 16,
        color: Colors.dark.textSecondary,
    },
    conversationsList: {
        flex: 1,
    },
    conversationItem: {
        flexDirection: "row",
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.md,
        gap: Spacing.md,
        backgroundColor: Colors.dark.backgroundRoot,
    },
    avatar: {
        width: 56,
        height: 56,
        borderRadius: 28,
    },
    conversationContent: {
        flex: 1,
    },
    conversationHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 4,
    },
    conversationName: {
        fontSize: 16,
        fontWeight: "600",
        color: Colors.dark.text,
    },
    conversationTime: {
        fontSize: 12,
        color: Colors.dark.textSecondary,
    },
    conversationFooter: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    lastMessage: {
        flex: 1,
        fontSize: 14,
        color: Colors.dark.textSecondary,
    },
    lastMessageUnread: {
        fontWeight: '600',
        color: Colors.dark.text,
    },
    unreadBadge: {
        backgroundColor: Colors.dark.primary,
        borderRadius: 10,
        minWidth: 20,
        height: 20,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 6,
        marginLeft: Spacing.sm,
    },
    unreadText: {
        fontSize: 12,
        fontWeight: "700",
        color: "#FFFFFF",
    },
});
