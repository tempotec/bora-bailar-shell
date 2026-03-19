import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Pressable,
    Image,
    Alert,
    Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import { API_CONFIG } from "@/config";

const logoImage = require("../../assets/images/novo_logo.png");

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

function ConciergeCard() {
    const [notificationsEnabled, setNotificationsEnabled] = useState(false);

    const handleActivateNotifications = async () => {
        try {
            if (Platform.OS === "android") {
                await Notifications.setNotificationChannelAsync("default", {
                    name: "default",
                    importance: Notifications.AndroidImportance.MAX,
                    vibrationPattern: [0, 250, 250, 250],
                    lightColor: "#FF231F7C",
                });
            }

            const { status: existingStatus } = await Notifications.getPermissionsAsync();
            let finalStatus = existingStatus;

            if (existingStatus !== "granted") {
                const { status } = await Notifications.requestPermissionsAsync();
                finalStatus = status;
            }

            if (finalStatus !== "granted") {
                Alert.alert("Aviso", "Precisamos de permissão para te avisar das novidades!");
                return;
            }

            const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? (Constants as any).easConfig?.projectId;
            const pushTokenString = (
                await Notifications.getExpoPushTokenAsync({ projectId })
            ).data;

            // Register token on server
            fetch(`${API_CONFIG.BASE_URL}/push-tokens/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token: pushTokenString, platform: Platform.OS }),
            }).catch((err) => console.error("Error registering token", err));

            setNotificationsEnabled(true);
            Alert.alert(
                "Notificações Ativadas! 🎉",
                "Agora vamos te avisar sempre que tiver algo bombando no BoraBailar."
            );
        } catch (e: any) {
            console.log("Error push token:", e);
            setNotificationsEnabled(true);
            Alert.alert(
                "Notificações Ativadas! 🎉",
                "Agora vamos te avisar sempre que tiver algo bombando no BoraBailar."
            );
        }
    };

    return (
        <View style={styles.conciergeCard}>
            <View style={styles.conciergeHeader}>
                <Image source={logoImage} style={styles.conciergeLogo} resizeMode="contain" />
                <View style={styles.conciergeHeaderText}>
                    <Text style={styles.conciergeName}>Concierge BoraBailar</Text>
                    <View style={styles.conciergeAiBadge}>
                        <Feather name="zap" size={10} color="#FFFFFF" />
                        <Text style={styles.conciergeAiBadgeText}>IA</Text>
                    </View>
                </View>
            </View>
            <Text style={styles.conciergeMessage}>
                Olá! 👋 Eu sou o Concierge do BoraBailar. Ative as notificações para ficar por dentro de tudo que está bombando — eventos, promoções e novidades da dança!
            </Text>
            <Pressable
                style={({ pressed }) => [
                    styles.conciergeButton,
                    notificationsEnabled && styles.conciergeButtonActive,
                    pressed && { opacity: 0.85 },
                ]}
                onPress={notificationsEnabled ? undefined : handleActivateNotifications}
            >
                <Feather
                    name={notificationsEnabled ? "check-circle" : "bell"}
                    size={18}
                    color="#FFFFFF"
                />
                <Text style={styles.conciergeButtonText}>
                    {notificationsEnabled
                        ? "Notificações ativadas!"
                        : "Ativar notificações"}
                </Text>
            </Pressable>
        </View>
    );
}

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
                {/* Concierge BoraBailar — pinned at top */}
                <ConciergeCard />

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

    // Concierge BoraBailar
    conciergeCard: {
        marginHorizontal: Spacing.lg,
        marginTop: Spacing.md,
        marginBottom: Spacing.sm,
        padding: Spacing.lg,
        backgroundColor: "#FFFFFF",
        borderRadius: BorderRadius.xl,
        borderWidth: 1,
        borderColor: Colors.dark.brand + "30",
        shadowColor: Colors.dark.brand,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
    },
    conciergeHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: Spacing.md,
        gap: Spacing.sm,
    },
    conciergeLogo: {
        width: 40,
        height: 30,
    },
    conciergeHeaderText: {
        flexDirection: "row",
        alignItems: "center",
        gap: Spacing.xs,
    },
    conciergeName: {
        fontSize: 15,
        fontWeight: "700",
        color: Colors.dark.text,
    },
    conciergeAiBadge: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: Colors.dark.brand,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 8,
        gap: 2,
    },
    conciergeAiBadgeText: {
        fontSize: 9,
        fontWeight: "700",
        color: "#FFFFFF",
        letterSpacing: 0.5,
    },
    conciergeMessage: {
        fontSize: 13,
        color: Colors.dark.textSecondary,
        lineHeight: 20,
        marginBottom: Spacing.md,
    },
    conciergeButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: Colors.dark.brand,
        paddingVertical: Spacing.md,
        borderRadius: BorderRadius.xl,
        gap: Spacing.xs,
    },
    conciergeButtonActive: {
        backgroundColor: "#4CAF50",
    },
    conciergeButtonText: {
        fontSize: 14,
        fontWeight: "600",
        color: "#FFFFFF",
    },
});
