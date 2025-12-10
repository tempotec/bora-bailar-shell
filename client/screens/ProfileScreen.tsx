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

const USER_PROFILE = {
  name: "Ana Costa",
  bio: "Amante de salsa e forro. Sempre procurando a proxima festa!",
  eventsAttended: 24,
  following: 156,
  followers: 89,
};

const MENU_ITEMS = [
  { id: "saved", icon: "bookmark", title: "Eventos Salvos", count: 5 },
  { id: "venues", icon: "map-pin", title: "Locais Favoritos", count: 3 },
  { id: "activity", icon: "activity", title: "Minha Atividade" },
  { id: "notifications", icon: "bell", title: "Notificacoes" },
  { id: "privacy", icon: "shield", title: "Privacidade" },
  { id: "help", icon: "help-circle", title: "Ajuda e Suporte" },
];

function StatItem({
  value,
  label,
}: {
  value: number | string;
  label: string;
}) {
  return (
    <View style={styles.statItem}>
      <ThemedText type="h3" style={styles.statValue}>
        {value}
      </ThemedText>
      <ThemedText style={styles.statLabel}>{label}</ThemedText>
    </View>
  );
}

function MenuItem({
  item,
}: {
  item: (typeof MENU_ITEMS)[0];
}) {
  const { theme } = useTheme();

  return (
    <Pressable
      style={({ pressed }) => [
        styles.menuItem,
        { backgroundColor: theme.backgroundDefault },
        pressed && styles.pressed,
      ]}
    >
      <View style={styles.menuIcon}>
        <Feather name={item.icon as any} size={20} color={Colors.dark.primary} />
      </View>
      <ThemedText style={styles.menuTitle}>{item.title}</ThemedText>
      <View style={styles.menuRight}>
        {item.count ? (
          <ThemedText style={styles.menuCount}>{item.count}</ThemedText>
        ) : null}
        <Feather name="chevron-right" size={20} color={theme.textSecondary} />
      </View>
    </Pressable>
  );
}

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      contentContainerStyle={{
        paddingTop: headerHeight + Spacing.lg,
        paddingBottom: tabBarHeight + Spacing.xl,
      }}
      scrollIndicatorInsets={{ bottom: insets.bottom }}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.profileHeader}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <LinearGradient
              colors={[Colors.dark.primary, Colors.dark.secondary]}
              style={StyleSheet.absoluteFill}
            />
            <ThemedText style={styles.avatarText}>AC</ThemedText>
          </View>
          <Pressable style={styles.editAvatarButton}>
            <Feather name="camera" size={14} color="#FFF" />
          </Pressable>
        </View>

        <ThemedText type="h3" style={styles.userName}>
          {USER_PROFILE.name}
        </ThemedText>
        <ThemedText style={styles.userBio}>{USER_PROFILE.bio}</ThemedText>

        <View style={styles.statsRow}>
          <StatItem value={USER_PROFILE.eventsAttended} label="Eventos" />
          <View style={styles.statDivider} />
          <StatItem value={USER_PROFILE.following} label="Seguindo" />
          <View style={styles.statDivider} />
          <StatItem value={USER_PROFILE.followers} label="Seguidores" />
        </View>
      </View>

      <View style={styles.menuSection}>
        {MENU_ITEMS.map((item) => (
          <MenuItem key={item.id} item={item} />
        ))}
      </View>

      <Pressable
        style={({ pressed }) => [
          styles.logoutButton,
          pressed && styles.pressed,
        ]}
      >
        <Feather name="log-out" size={20} color={Colors.dark.error} />
        <ThemedText style={styles.logoutText}>Sair da Conta</ThemedText>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  profileHeader: {
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  avatarContainer: {
    position: "relative",
    marginBottom: Spacing.lg,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 36,
    fontWeight: "600",
    color: "#FFF",
  },
  editAvatarButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.dark.primary,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: Colors.dark.backgroundRoot,
  },
  userName: {
    marginBottom: Spacing.xs,
  },
  userBio: {
    color: Colors.dark.textSecondary,
    textAlign: "center",
    marginBottom: Spacing.xl,
    paddingHorizontal: Spacing.xl,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.dark.backgroundDefault,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xl,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statValue: {
    marginBottom: Spacing.xs,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.dark.textSecondary,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: Colors.dark.backgroundSecondary,
  },
  menuSection: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.dark.primary + "20",
    justifyContent: "center",
    alignItems: "center",
    marginRight: Spacing.md,
  },
  menuTitle: {
    flex: 1,
    fontSize: 16,
  },
  menuRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  menuCount: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.lg,
    marginHorizontal: Spacing.lg,
    gap: Spacing.sm,
  },
  logoutText: {
    color: Colors.dark.error,
    fontSize: 16,
    fontWeight: "500",
  },
});
