import React, { useState, useRef, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  Pressable,
  Animated,
  PanResponder,
  Dimensions,
  Modal,
  ScrollView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";
import { AuthContext } from "@/contexts/AuthContext";
import { SWIPE_CARDS_DATA } from "@/shared/mockSwipeData";
import { MainTabParamList } from "@/navigation/MainTabNavigator";
import { MessagesStackParamList } from "@/navigation/MessagesStackNavigator";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const SWIPE_THRESHOLD = 120;

type SwipeCard = typeof SWIPE_CARDS_DATA[0];
type MessagesScreenNavigationProp = NativeStackNavigationProp<MessagesStackParamList>;

// Mock matches data (people who liked you)
const MOCK_MATCHES = [
  {
    id: "match-1",
    name: "Luiza Leoncio",
    age: 25,
    image: require("../../attached_assets/stock_images/person_dancing_happi_214e72d0.jpg"),
    bio: "Estudante de Medicina e apaixonada pela dança.",
    tags: ["FORRÓ", "ZOUK"],
    experience: "EXPERIÊNCIA",
    level: "Aluno",
    city: "Rio de Janeiro",
    district: "Iniciante",
  },
  {
    id: "match-2",
    name: "Sonia Maria",
    age: 23,
    image: require("../../attached_assets/stock_images/person_dancing_happi_0e460040.jpg"),
    bio: "Professora de dança e coreógrafa.",
    tags: ["SAMBA", "SALSA"],
    experience: "PROFESSORA",
    level: "Profissional",
    city: "Rio de Janeiro",
    district: "Barra da Tijuca",
  },
  {
    id: "match-3",
    name: "Mel Maia",
    age: 22,
    image: require("../../attached_assets/stock_images/person_dancing_happi_24afcbbe.jpg"),
    bio: "Dançarina e atriz.",
    tags: ["ZOUK"],
    experience: "PROFISSIONAL",
    level: "Avançado",
    city: "Rio de Janeiro",
    district: "Leblon",
  },
  {
    id: "match-4",
    name: "Pedro Villa",
    age: 30,
    image: require("../../attached_assets/stock_images/person_dancing_happi_798bff4b.jpg"),
    bio: "Professor de Sertanejo e Forró.",
    tags: ["SERTANEJO", "FORRÓ"],
    experience: "PROFESSOR",
    level: "Profissional",
    city: "Rio de Janeiro",
    district: "Centro",
  },
];

function LoginRequiredModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={styles.loginModal}>
          <Text style={styles.loginTitle}>Bem vindo a tela de Matches!</Text>
          <Text style={styles.loginSubtitle}>Logo em breve teremos mais informações!</Text>
          <Pressable style={styles.loginButton} onPress={onClose}>
            <Text style={styles.loginButtonText}>Voltar para home</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

function MatchModal({
  visible,
  onClose,
  matchedCard
}: {
  visible: boolean;
  onClose: () => void;
  matchedCard: SwipeCard | null;
}) {
  if (!matchedCard) return null;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={styles.matchModal}>
          <View style={styles.matchImagesContainer}>
            <View style={styles.matchImageWrapper}>
              <Image
                source={matchedCard.image}
                style={styles.matchImage}
                resizeMode="cover"
              />
            </View>
            <View style={[styles.matchImageWrapper, styles.matchImageSecond]}>
              <Image
                source={matchedCard.image}
                style={styles.matchImage}
                resizeMode="cover"
              />
            </View>
          </View>

          <Text style={styles.matchTitle}>Deu Match!</Text>
          <Text style={styles.matchSubtitle}>
            Você e {matchedCard.name} curtiram um ao outro
          </Text>

          <Pressable style={styles.matchSendButton} onPress={onClose}>
            <Feather name="message-circle" size={20} color="#FFFFFF" />
            <Text style={styles.matchSendText}>Enviar mensagem</Text>
          </Pressable>

          <Pressable style={styles.matchCloseButton} onPress={onClose}>
            <Text style={styles.matchCloseText}>Fechar</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

function ProfileModal({
  visible,
  onClose,
  profile,
}: {
  visible: boolean;
  onClose: () => void;
  profile: typeof MOCK_MATCHES[0] | null;
}) {
  if (!profile) return null;

  return (
    <Modal visible={visible} animationType="slide">
      <View style={styles.profileContainer}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.profileHeader}>
            <Pressable style={styles.backButton} onPress={onClose}>
              <Feather name="chevron-left" size={28} color={Colors.dark.text} />
            </Pressable>
            <Text style={styles.profileHeaderTitle}>{profile.name}, {profile.age}</Text>
            <View style={{ width: 44 }} />
          </View>

          {/* Profile Image */}
          <Image source={profile.image} style={styles.profileImage} resizeMode="cover" />

          {/* Profile Info */}
          <View style={styles.profileContent}>
            <Text style={styles.profileSectionTitle}>Sobre mim</Text>
            <Text style={styles.profileBio}>{profile.bio}</Text>

            <Text style={styles.profileSectionTitle}>Estilos de dança</Text>
            <View style={styles.profileTagsContainer}>
              {profile.tags.map((tag, index) => (
                <View key={index} style={styles.profileTag}>
                  <Text style={styles.profileTagText}>{tag}</Text>
                </View>
              ))}
            </View>

            <Text style={styles.profileSectionTitle}>Experiência</Text>
            <View style={styles.profileInfoRow}>
              <Text style={styles.profileInfoLabel}>Aluno</Text>
            </View>

            <Text style={styles.profileSectionTitle}>Nível</Text>
            <View style={styles.profileInfoRow}>
              <Text style={styles.profileInfoLabel}>{profile.district}</Text>
            </View>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

function MatchItem({
  match,
  onChatPress,
  onProfilePress,
}: {
  match: typeof MOCK_MATCHES[0];
  onChatPress: () => void;
  onProfilePress: () => void;
}) {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <View style={styles.matchItem}>
      <Image source={match.image} style={styles.matchAvatar} />
      <View style={styles.matchInfo}>
        <Text style={styles.matchName}>{match.name}, {match.age}</Text>
      </View>

      {showMenu && (
        <Pressable
          style={styles.matchMenuButton}
          onPress={() => setShowMenu(false)}
        >
          <Text style={styles.matchMenuText}>Amagar</Text>
        </Pressable>
      )}

      <View style={styles.matchActions}>
        <Pressable style={styles.matchActionButton} onPress={onChatPress}>
          <Feather name="message-circle" size={24} color={Colors.dark.textSecondary} />
        </Pressable>
        <Pressable style={styles.matchActionButton} onPress={onProfilePress}>
          <Feather name="eye" size={24} color={Colors.dark.textSecondary} />
        </Pressable>
        <Pressable
          style={styles.matchActionButton}
          onPress={() => setShowMenu(!showMenu)}
        >
          <Feather name="more-vertical" size={24} color={Colors.dark.textSecondary} />
        </Pressable>
      </View>
    </View>
  );
}

function MatchesListTab({
  onChatPress,
  onProfilePress,
}: {
  onChatPress: (match: typeof MOCK_MATCHES[0]) => void;
  onProfilePress: (match: typeof MOCK_MATCHES[0]) => void;
}) {
  if (MOCK_MATCHES.length === 0) {
    return (
      <View style={styles.emptyState}>
        <Feather name="users" size={64} color={Colors.dark.textSecondary} />
        <Text style={styles.emptyTitle}>Nenhuma pessoa curtida</Text>
        <Text style={styles.emptySubtitle}>Curta pessoas no Descobrir para vê-los aqui!</Text>
        <Pressable style={styles.emptyButton}>
          <Text style={styles.emptyButtonText}>Descobrir</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView style={styles.matchesList}>
      {MOCK_MATCHES.map((match) => (
        <MatchItem
          key={match.id}
          match={match}
          onChatPress={() => onChatPress(match)}
          onProfilePress={() => onProfilePress(match)}
        />
      ))}
    </ScrollView>
  );
}

export default function MessagesScreen() {
  const insets = useSafeAreaInsets();
  const { isLoggedIn } = useContext(AuthContext);
  const navigation = useNavigation<MessagesScreenNavigationProp>();

  const [showLoginModal, setShowLoginModal] = useState(!isLoggedIn);
  const [activeTab, setActiveTab] = useState<"discover" | "matches">("discover");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [matchModalVisible, setMatchModalVisible] = useState(false);
  const [matchedCard, setMatchedCard] = useState<SwipeCard | null>(null);
  const [profileModalVisible, setProfileModalVisible] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<typeof MOCK_MATCHES[0] | null>(null);

  const position = useRef(new Animated.ValueXY()).current;

  const handleSwipeComplete = (direction: "left" | "right") => {
    if (direction === "right") {
      const isMatch = Math.random() > 0.5;
      if (isMatch) {
        setMatchedCard(SWIPE_CARDS_DATA[currentIndex]);
        setMatchModalVisible(true);
      }
    }

    setTimeout(() => {
      setCurrentIndex(prev => (prev + 1) % SWIPE_CARDS_DATA.length);
      position.setValue({ x: 0, y: 0 });
    }, 300);
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gesture) => {
        // Only allow horizontal movement
        position.setValue({ x: gesture.dx, y: 0 });
      },
      onPanResponderRelease: (_, gesture) => {
        if (gesture.dx > SWIPE_THRESHOLD) {
          Animated.spring(position, {
            toValue: { x: SCREEN_WIDTH + 100, y: 0 },
            useNativeDriver: false,
          }).start(() => handleSwipeComplete("right"));
        } else if (gesture.dx < -SWIPE_THRESHOLD) {
          Animated.spring(position, {
            toValue: { x: -SCREEN_WIDTH - 100, y: 0 },
            useNativeDriver: false,
          }).start(() => handleSwipeComplete("left"));
        } else {
          Animated.spring(position, {
            toValue: { x: 0, y: 0 },
            useNativeDriver: false,
          }).start();
        }
      },
    })
  ).current;

  const handleLike = () => {
    Animated.spring(position, {
      toValue: { x: SCREEN_WIDTH + 100, y: 0 },
      useNativeDriver: false,
    }).start(() => handleSwipeComplete("right"));
  };

  const handleDislike = () => {
    Animated.spring(position, {
      toValue: { x: -SCREEN_WIDTH - 100, y: 0 },
      useNativeDriver: false,
    }).start(() => handleSwipeComplete("left"));
  };

  const handleChatPress = (match: typeof MOCK_MATCHES[0]) => {
    // Navigate to chat screen (will be implemented)
    console.log("Chat with", match.name);
  };

  const handleProfilePress = (match: typeof MOCK_MATCHES[0]) => {
    setSelectedProfile(match);
    setProfileModalVisible(true);
  };

  const currentCard = SWIPE_CARDS_DATA[currentIndex];
  const nextCard = SWIPE_CARDS_DATA[(currentIndex + 1) % SWIPE_CARDS_DATA.length];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header with Tabs */}
      <View style={styles.header}>
        <Pressable
          style={styles.headerTab}
          onPress={() => setActiveTab("discover")}
        >
          <Text style={[
            styles.headerTabText,
            activeTab === "discover" && styles.headerTabTextActive
          ]}>
            Descobrir
          </Text>
          {activeTab === "discover" && <View style={styles.headerTabIndicator} />}
        </Pressable>

        <Pressable
          style={styles.headerTab}
          onPress={() => setActiveTab("matches")}
        >
          <Text style={[
            styles.headerTabText,
            activeTab === "matches" && styles.headerTabTextActive
          ]}>
            Matches
          </Text>
          {activeTab === "matches" && <View style={styles.headerTabIndicator} />}
        </Pressable>
      </View>

      {/* Content */}
      {activeTab === "discover" ? (
        <>
          {/* Swipe Cards */}
          <View style={styles.cardsContainer}>
            {nextCard && (
              <View style={[styles.card, styles.cardBehind]}>
                <Image source={nextCard.image} style={styles.cardImage} resizeMode="cover" />
              </View>
            )}

            {currentCard && (
              <Animated.View
                {...panResponder.panHandlers}
                style={[
                  styles.card,
                  {
                    transform: [
                      { translateX: position.x },
                      { translateY: position.y },
                      {
                        rotate: position.x.interpolate({
                          inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
                          outputRange: ["-30deg", "0deg", "30deg"],
                          extrapolate: "clamp",
                        }),
                      },
                    ],
                  },
                ]}
              >
                <Image source={currentCard.image} style={styles.cardImage} resizeMode="cover" />
                <LinearGradient
                  colors={["transparent", "rgba(0,0,0,0.8)"]}
                  style={styles.cardGradient}
                />

                <View style={styles.cardContent}>
                  <View style={styles.cardHeader}>
                    <Text style={styles.cardName}>
                      {currentCard.name}{currentCard.type === "user" && currentCard.age ? `, ${currentCard.age}` : ""}
                    </Text>
                    {currentCard.location && (
                      <View style={styles.cardLocationRow}>
                        <Feather name="map-pin" size={14} color="#FFFFFF" />
                        <Text style={styles.cardLocation}>{currentCard.location}</Text>
                      </View>
                    )}
                  </View>

                  {currentCard.bio && (
                    <Text style={styles.cardBio} numberOfLines={2}>{currentCard.bio}</Text>
                  )}

                  {currentCard.tags && currentCard.tags.length > 0 && (
                    <View style={styles.tagsContainer}>
                      {currentCard.tags.map((tag, index) => (
                        <View key={index} style={styles.tag}>
                          <Text style={styles.tagText}>{tag}</Text>
                        </View>
                      ))}
                    </View>
                  )}

                  {(currentCard.experience || currentCard.category) && (
                    <View style={styles.categoryRow}>
                      <Text style={styles.categoryText}>
                        {currentCard.experience || currentCard.category}
                      </Text>
                      <Pressable>
                        <Text style={styles.profileLink}>Ver perfil completo</Text>
                      </Pressable>
                    </View>
                  )}
                </View>
              </Animated.View>
            )}
          </View>

          {/* Action Buttons */}
          <View style={styles.actionsContainer}>
            <Pressable style={[styles.actionButton, styles.dislikeButton]} onPress={handleDislike}>
              <Feather name="x" size={32} color="#FF6B6B" />
            </Pressable>
            <Pressable style={[styles.actionButton, styles.likeButton]} onPress={handleLike}>
              <Feather name="heart" size={32} color="#4CAF50" />
            </Pressable>
          </View>
        </>
      ) : (
        <MatchesListTab
          onChatPress={handleChatPress}
          onProfilePress={handleProfilePress}
        />
      )}

      {/* Modals */}
      <LoginRequiredModal visible={showLoginModal} onClose={() => setShowLoginModal(false)} />
      <MatchModal
        visible={matchModalVisible}
        onClose={() => setMatchModalVisible(false)}
        matchedCard={matchedCard}
      />
      <ProfileModal
        visible={profileModalVisible}
        onClose={() => setProfileModalVisible(false)}
        profile={selectedProfile}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  header: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
    backgroundColor: "#FFFFFF",
    zIndex: 100,
  },
  headerTab: {
    flex: 1,
    paddingVertical: Spacing.md,
    alignItems: "center",
    position: "relative",
  },
  headerTabText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.dark.textSecondary,
  },
  headerTabTextActive: {
    color: Colors.dark.text,
  },
  headerTabIndicator: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: Colors.dark.text,
  },
  cardsContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.lg,
  },
  card: {
    position: "absolute",
    width: SCREEN_WIDTH - 40,
    height: SCREEN_HEIGHT * 0.65,
    borderRadius: BorderRadius.xl,
    overflow: "hidden",
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  cardBehind: {
    transform: [{ scale: 0.95 }],
    opacity: 0.8,
  },
  cardImage: {
    width: "100%",
    height: "100%",
  },
  cardGradient: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: "60%",
  },
  cardContent: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: Spacing.lg,
  },
  cardHeader: {
    marginBottom: Spacing.sm,
  },
  cardName: {
    fontSize: 28,
    fontWeight: "800",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  cardLocationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  cardLocation: {
    fontSize: 14,
    color: "#FFFFFF",
    opacity: 0.9,
  },
  cardBio: {
    fontSize: 14,
    color: "#FFFFFF",
    marginBottom: Spacing.md,
    lineHeight: 20,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.xs,
    marginBottom: Spacing.md,
  },
  tag: {
    backgroundColor: "#FF1493",
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  categoryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  categoryText: {
    fontSize: 12,
    color: "#FFFFFF",
    opacity: 0.8,
  },
  profileLink: {
    fontSize: 12,
    color: "#FFFFFF",
    textDecorationLine: "underline",
  },
  actionsContainer: {
    position: "absolute",
    bottom: 100,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    gap: Spacing.xl * 2,
    paddingVertical: Spacing.md,
    backgroundColor: "transparent",
    zIndex: 10,
  },
  actionButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  dislikeButton: {
    borderWidth: 2,
    borderColor: "#FF6B6B",
  },
  likeButton: {
    borderWidth: 2,
    borderColor: "#4CAF50",
  },

  // Matches List
  matchesList: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  matchItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.md,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  matchAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  matchInfo: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  matchName: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.dark.text,
  },
  matchActions: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  matchActionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F5F5F5",
    alignItems: "center",
    justifyContent: "center",
  },
  matchMenuButton: {
    position: "absolute",
    right: Spacing.lg,
    top: -8,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 10,
  },
  matchMenuText: {
    fontSize: 14,
    color: Colors.dark.text,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.xl,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.dark.text,
    marginTop: Spacing.lg,
    marginBottom: Spacing.xs,
  },
  emptySubtitle: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
    textAlign: "center",
    marginBottom: Spacing.xl,
  },
  emptyButton: {
    backgroundColor: Colors.dark.brand,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl * 2,
    borderRadius: BorderRadius.xl,
  },
  emptyButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },

  // Profile Modal
  profileContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  profileHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  profileHeaderTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.dark.text,
  },
  profileImage: {
    width: "100%",
    height: 300,
  },
  profileContent: {
    padding: Spacing.lg,
  },
  profileSectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.dark.text,
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  profileBio: {
    fontSize: 14,
    color: Colors.dark.text,
    lineHeight: 20,
  },
  profileTagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.xs,
  },
  profileTag: {
    backgroundColor: "#FF1493",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: 12,
  },
  profileTagText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  profileInfoRow: {
    paddingVertical: Spacing.sm,
  },
  profileInfoLabel: {
    fontSize: 14,
    color: Colors.dark.text,
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.xl,
  },
  loginModal: {
    backgroundColor: "#FFFFFF",
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl * 1.5,
    alignItems: "center",
    width: "100%",
    maxWidth: 320,
  },
  loginTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.dark.text,
    marginBottom: Spacing.sm,
    textAlign: "center",
  },
  loginSubtitle: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
    marginBottom: Spacing.xl,
    textAlign: "center",
  },
  loginButton: {
    backgroundColor: Colors.dark.brand,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl * 2,
    borderRadius: BorderRadius.md,
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  matchModal: {
    backgroundColor: "#FFE5F0",
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl * 1.5,
    alignItems: "center",
    width: "100%",
    maxWidth: 340,
  },
  matchImagesContainer: {
    flexDirection: "row",
    marginBottom: Spacing.xl,
    height: 120,
  },
  matchImageWrapper: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: "#FFFFFF",
    overflow: "hidden",
    backgroundColor: "#FFF",
  },
  matchImageSecond: {
    marginLeft: -30,
  },
  matchImage: {
    width: "100%",
    height: "100%",
  },
  matchTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: Colors.dark.text,
    marginBottom: Spacing.xs,
  },
  matchSubtitle: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
    marginBottom: Spacing.xl,
    textAlign: "center",
  },
  matchSendButton: {
    backgroundColor: Colors.dark.brand,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl * 2,
    borderRadius: BorderRadius.xl,
    marginBottom: Spacing.md,
  },
  matchSendText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  matchCloseButton: {
    paddingVertical: Spacing.sm,
  },
  matchCloseText: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
  },
});
