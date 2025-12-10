import React from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  Pressable,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";

const CONVERSATIONS = [
  {
    id: "1",
    name: "Club Havana",
    type: "venue",
    lastMessage: "Confirmado! Te esperamos no sabado.",
    time: "2h",
    unread: 1,
  },
  {
    id: "2",
    name: "Maria Silva",
    type: "user",
    lastMessage: "Vamos juntos pro evento?",
    time: "5h",
    unread: 0,
  },
  {
    id: "3",
    name: "Espaco Nordeste",
    type: "venue",
    lastMessage: "Obrigado pela presenca!",
    time: "1d",
    unread: 0,
  },
];

function Avatar({
  name,
  type,
}: {
  name: string;
  type: "venue" | "user";
}) {
  return (
    <View style={styles.avatar}>
      <LinearGradient
        colors={
          type === "venue"
            ? [Colors.dark.primary, Colors.dark.secondary]
            : [Colors.dark.tertiary, Colors.dark.secondary]
        }
        style={StyleSheet.absoluteFill}
      />
      <ThemedText style={styles.avatarText}>
        {name.charAt(0).toUpperCase()}
      </ThemedText>
    </View>
  );
}

function ConversationItem({
  conversation,
}: {
  conversation: (typeof CONVERSATIONS)[0];
}) {
  const { theme } = useTheme();

  return (
    <Pressable
      style={({ pressed }) => [
        styles.conversationItem,
        { backgroundColor: theme.backgroundDefault },
        pressed && styles.pressed,
      ]}
    >
      <Avatar name={conversation.name} type={conversation.type as "venue" | "user"} />
      <View style={styles.conversationContent}>
        <View style={styles.conversationHeader}>
          <ThemedText style={styles.conversationName}>
            {conversation.name}
          </ThemedText>
          <ThemedText style={styles.conversationTime}>
            {conversation.time}
          </ThemedText>
        </View>
        <View style={styles.conversationFooter}>
          <ThemedText
            style={[
              styles.conversationMessage,
              conversation.unread > 0 && styles.unreadMessage,
            ]}
            numberOfLines={1}
          >
            {conversation.lastMessage}
          </ThemedText>
          {conversation.unread > 0 ? (
            <View style={styles.unreadBadge}>
              <ThemedText style={styles.unreadText}>
                {conversation.unread}
              </ThemedText>
            </View>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}

function EmptyState() {
  return (
    <View style={styles.emptyState}>
      <View style={styles.emptyIcon}>
        <Feather name="message-circle" size={48} color={Colors.dark.textSecondary} />
      </View>
      <ThemedText type="h4" style={styles.emptyTitle}>
        Nenhuma mensagem
      </ThemedText>
      <ThemedText style={styles.emptyText}>
        Suas conversas com organizadores e outros participantes aparecerao aqui.
      </ThemedText>
    </View>
  );
}

export default function MessagesScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();

  const hasMessages = CONVERSATIONS.length > 0;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      contentContainerStyle={{
        paddingTop: headerHeight + Spacing.lg,
        paddingBottom: tabBarHeight + Spacing.xl,
        flexGrow: 1,
      }}
      scrollIndicatorInsets={{ bottom: insets.bottom }}
      showsVerticalScrollIndicator={false}
    >
      {hasMessages ? (
        <View style={styles.conversationList}>
          {CONVERSATIONS.map((conversation) => (
            <ConversationItem key={conversation.id} conversation={conversation} />
          ))}
        </View>
      ) : (
        <EmptyState />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  conversationList: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
  },
  conversationItem: {
    flexDirection: "row",
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: Spacing.md,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 20,
    fontWeight: "600",
    color: "#FFF",
  },
  conversationContent: {
    flex: 1,
    justifyContent: "center",
    gap: Spacing.xs,
  },
  conversationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  conversationName: {
    fontSize: 16,
    fontWeight: "600",
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
  conversationMessage: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
    flex: 1,
  },
  unreadMessage: {
    color: Colors.dark.text,
    fontWeight: "500",
  },
  unreadBadge: {
    backgroundColor: Colors.dark.primary,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: Spacing.sm,
  },
  unreadText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#FFF",
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: Spacing.xl,
  },
  emptyIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.dark.backgroundDefault,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  emptyTitle: {
    marginBottom: Spacing.sm,
    textAlign: "center",
  },
  emptyText: {
    color: Colors.dark.textSecondary,
    textAlign: "center",
  },
});
