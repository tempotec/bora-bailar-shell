import React, { useState, useContext } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  Pressable,
  Image,
  Text,
  Modal,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";
import { AuthContext } from "@/contexts/AuthContext";

// Mock user data
const MOCK_USER = {
  name: "Jose Thomaz Wollner",
  bio: "Eu me chamo Jose Thomaz, sou apaixonado por danças e esportes.\n\nEntrei nesse app para criar novas amizades.",
  profileImage: require("../../attached_assets/stock_images/person_dancing_happi_798bff4b.jpg"),
  photos: [
    require("../../attached_assets/stock_images/person_dancing_happi_798bff4b.jpg"),
    require("../../attached_assets/stock_images/person_dancing_happi_214e72d0.jpg"),
    require("../../attached_assets/stock_images/person_dancing_happi_0e460040.jpg"),
    require("../../attached_assets/stock_images/person_dancing_happi_24afcbbe.jpg"),
    require("../../attached_assets/stock_images/person_dancing_happi_8c1c5cba.jpg"),
    require("../../attached_assets/stock_images/ballroom_dancing_cou_a3f721af.jpg"),
  ],
  danceStyles: [
    { name: "Forró", color: "#FF1493" },
    { name: "Hip Hop", color: "#4169E1" },
    { name: "Jazz", color: "#FF8C00" },
  ],
  experience: "Aluno",
  level: "Iniciante",
  birthDate: "18 / 02 / 2000",
};

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { isLoggedIn, signIn, signOut, user } = useContext(AuthContext);
  const [showProfilePreview, setShowProfilePreview] = useState(false);

  const handleLogin = async () => {
    try {
      await signIn("demo@borabailar.com");
    } catch (e) {
      console.error(e);
    }
  };

  const handleLogout = () => {
    signOut();
  };

  const handleViewProfile = () => {
    setShowProfilePreview(true);
  };

  if (!isLoggedIn) {
    // Not logged in - Show login screen
    return (
      <ScrollView
        style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
        contentContainerStyle={{
          paddingTop: insets.top + Spacing.xl,
          paddingBottom: 100,
          flexGrow: 1,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.emptyStateContainer}>
          <View style={styles.iconContainer}>
            <Feather name="user" size={48} color={Colors.dark.primary} />
          </View>

          <ThemedText type="h3" style={styles.emptyTitle}>
            Entre na sua conta
          </ThemedText>

          <ThemedText style={styles.emptyDescription}>
            Faça login ou crie uma conta para salvar seus eventos favoritos, seguir amigos e muito mais.
          </ThemedText>

          <View style={styles.buttonsContainer}>
            <Pressable
              style={({ pressed }) => [
                styles.signUpButton,
                pressed && styles.pressed,
              ]}
              onPress={() => handleLogin()} // For now just auto login
            >
              <ThemedText style={styles.signUpButtonText}>Criar conta</ThemedText>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.logInButton,
                pressed && styles.pressed,
              ]}
              onPress={() => handleLogin()}
            >
              <ThemedText style={styles.logInButtonText}>Entrar</ThemedText>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    );
  }

  // Logged in - Show user profile
  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      {/* Fixed Header */}
      <View style={[styles.header, { paddingTop: insets.top + Spacing.md }]}>
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>
            <Text style={styles.logoRed}>33 </Text>
            <Text style={styles.logoGray}>BORABAILAR</Text>
          </Text>
        </View>
        <Feather name="bell" size={24} color={Colors.dark.text} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <Image source={MOCK_USER.profileImage} style={styles.profilePic} />
          <View style={styles.profileHeaderText}>
            <Text style={styles.profileName}>{user?.name || MOCK_USER.name}</Text>
            <View style={styles.profileButtons}>
              <Pressable style={styles.editButton}>
                <Text style={styles.editButtonText}>Editar perfil</Text>
              </Pressable>
              <Pressable style={styles.viewButton} onPress={handleViewProfile}>
                <Feather name="eye" size={14} color={Colors.dark.primary} />
                <Text style={styles.viewButtonText}>Ver perfil</Text>
              </Pressable>
            </View>
          </View>
        </View>

        {/* Photos Grid */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Minhas fotos e videos</Text>
          <View style={styles.photosGrid}>
            {MOCK_USER.photos.map((photo, index) => (
              <Image
                key={index}
                source={photo}
                style={styles.photoItem}
                resizeMode="cover"
              />
            ))}
          </View>
        </View>

        {/* Bio */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Bio</Text>
          <View style={styles.bioContainer}>
            <Text style={styles.bioText}>{MOCK_USER.bio}</Text>
          </View>
        </View>

        {/* Dance Styles */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Estilos de dança</Text>
          <View style={styles.tagsContainer}>
            {MOCK_USER.danceStyles.map((style, index) => (
              <View key={index} style={[styles.tag, { backgroundColor: style.color }]}>
                <Text style={styles.tagText}>{style.name}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Experience */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Experiência</Text>
          <Text style={styles.infoText}>{MOCK_USER.experience}</Text>
        </View>

        {/* Level */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Nível</Text>
          <Text style={styles.infoText}>{MOCK_USER.level}</Text>
        </View>

        {/* Birth Date */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data de nascimento</Text>
          <Text style={styles.infoText}>{MOCK_USER.birthDate}</Text>
        </View>

        {/* Logout Button */}
        <Pressable
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <Feather name="log-out" size={16} color={Colors.dark.primary} />
          <Text style={styles.logoutButtonText}>Sair</Text>
        </Pressable>
      </ScrollView>

      {/* Profile Preview Modal */}
      <Modal visible={showProfilePreview} animationType="slide">
        <View style={styles.previewContainer}>
          {/* Header */}
          <View style={[styles.previewHeader, { paddingTop: insets.top + Spacing.md }]}>
            <Pressable
              style={styles.previewBackButton}
              onPress={() => setShowProfilePreview(false)}
            >
              <Feather name="chevron-left" size={28} color={Colors.dark.text} />
            </Pressable>
            <Text style={styles.previewHeaderTitle}>{MOCK_USER.name}, 25</Text>
            <View style={{ width: 44 }} />
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Profile Image */}
            <View style={styles.previewImageContainer}>
              <Image
                source={MOCK_USER.profileImage}
                style={styles.previewImage}
                resizeMode="cover"
              />
              {/* Photo indicator */}
              <View style={styles.photoIndicator}>
                <View style={[styles.indicatorDot, styles.indicatorDotActive]} />
                <View style={styles.indicatorDot} />
                <View style={styles.indicatorDot} />
              </View>
            </View>

            {/* Profile Content */}
            <View style={styles.previewContent}>
              {/* Bio */}
              <View style={styles.previewSection}>
                <Text style={styles.previewSectionTitle}>Sobre mim</Text>
                <Text style={styles.previewText}>{MOCK_USER.bio}</Text>
              </View>

              {/* Dance Styles */}
              <View style={styles.previewSection}>
                <Text style={styles.previewSectionTitle}>Estilos de dança</Text>
                <View style={styles.tagsContainer}>
                  {MOCK_USER.danceStyles.map((style, index) => (
                    <View key={index} style={[styles.tag, { backgroundColor: style.color }]}>
                      <Text style={styles.tagText}>{style.name}</Text>
                    </View>
                  ))}
                </View>
              </View>

              {/* Experience */}
              <View style={styles.previewSection}>
                <Text style={styles.previewSectionTitle}>Experiência</Text>
                <Text style={styles.previewText}>{MOCK_USER.experience}</Text>
              </View>

              {/* Level */}
              <View style={styles.previewSection}>
                <Text style={styles.previewSectionTitle}>Nível</Text>
                <Text style={styles.previewText}>{MOCK_USER.level}</Text>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  logoText: {
    fontSize: 18,
    fontWeight: "700",
  },
  logoRed: {
    color: "#CC0000",
  },
  logoGray: {
    color: "#808080",
  },

  scrollView: {
    flex: 1,
  },

  // Not Logged In Styles
  emptyStateContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: Spacing.xl,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.dark.primary + "15",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  emptyTitle: {
    marginBottom: Spacing.md,
    textAlign: "center",
  },
  emptyDescription: {
    color: Colors.dark.textSecondary,
    textAlign: "center",
    marginBottom: Spacing.xl,
    lineHeight: 22,
  },
  buttonsContainer: {
    width: "100%",
    gap: Spacing.md,
  },
  signUpButton: {
    backgroundColor: Colors.dark.primary,
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.lg,
    alignItems: "center",
  },
  signUpButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },
  logInButton: {
    backgroundColor: "transparent",
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.dark.primary,
    alignItems: "center",
  },
  logInButtonText: {
    color: Colors.dark.primary,
    fontSize: 16,
    fontWeight: "600",
  },
  pressed: {
    opacity: 0.8,
  },

  // Profile Header
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  profilePic: {
    width: 70,
    height: 70,
    borderRadius: 35,
  },
  profileHeaderText: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.dark.text,
    marginBottom: Spacing.sm,
  },
  profileButtons: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  editButton: {
    backgroundColor: Colors.dark.primary,
    paddingVertical: 6,
    paddingHorizontal: Spacing.md,
    borderRadius: 6,
  },
  editButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  viewButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#FFFFFF",
    paddingVertical: 6,
    paddingHorizontal: Spacing.md,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.dark.primary,
  },
  viewButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.dark.primary,
  },

  // Sections
  section: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.dark.textSecondary,
    marginBottom: Spacing.md,
  },

  // Photos Grid
  photosGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  photoItem: {
    width: "31%",
    aspectRatio: 1,
    borderRadius: BorderRadius.md,
    backgroundColor: "#E0E0E0",
  },

  // Bio
  bioContainer: {
    backgroundColor: "#F5F5F5",
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  bioText: {
    fontSize: 14,
    color: Colors.dark.text,
    lineHeight: 20,
  },

  // Tags
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.xs,
  },
  tag: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: 6,
  },
  tagText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#FFFFFF",
  },

  // Info Text
  infoText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.dark.text,
  },

  // Logout Button
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.xs,
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.lg,
    marginBottom: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.dark.primary,
    backgroundColor: "#FFFFFF",
  },
  logoutButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.dark.primary,
  },

  // Profile Preview Modal
  previewContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  previewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  previewBackButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  previewHeaderTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.dark.text,
  },
  previewImageContainer: {
    width: "100%",
    height: 400,
    position: "relative",
  },
  previewImage: {
    width: "100%",
    height: "100%",
  },
  photoIndicator: {
    position: "absolute",
    top: Spacing.md,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
  },
  indicatorDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.4)",
  },
  indicatorDotActive: {
    backgroundColor: "#FFFFFF",
    width: 24,
  },
  previewContent: {
    padding: Spacing.lg,
  },
  previewSection: {
    marginBottom: Spacing.xl,
  },
  previewSectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.dark.textSecondary,
    marginBottom: Spacing.sm,
  },
  previewText: {
    fontSize: 14,
    color: Colors.dark.text,
    lineHeight: 20,
  },
});
