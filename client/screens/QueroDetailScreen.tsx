import React, { useState, useCallback, useMemo } from "react";
import {
  View,
  StyleSheet,
  Text,
  ScrollView,
  Pressable,
  Image,
  Dimensions,
  Modal,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Spacing, BorderRadius, Colors, Fonts } from "@/constants/theme";
import type { RootStackParamList } from "@/navigation/RootStackNavigator";

const logoImage = require("../../attached_assets/WhatsApp_Image_2025-12-09_at_11.41.04-removebg-preview_1765394422474.png");

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const VIDEO_STORIES_DATA = [
  {
    id: "1",
    title: "Dançando com Julia",
    username: "@Alanzinho",
    location: "@BosqueBar",
    thumbnail: require("../../attached_assets/stock_images/person_dancing_happi_798bff4b.jpg"),
  },
  {
    id: "2",
    title: "Leve como uma folha",
    username: "@Ivete22",
    location: "@ParqueBar",
    thumbnail: require("../../attached_assets/stock_images/person_dancing_happi_214e72d0.jpg"),
  },
  {
    id: "3",
    title: "Na rua é mais legal",
    username: "@LuizaLulu",
    location: "na Lapa",
    thumbnail: require("../../attached_assets/stock_images/person_dancing_happi_8c1c5cba.jpg"),
  },
  {
    id: "4",
    title: "Ritmo do coração",
    username: "@MarceloDance",
    location: "@ClubeDance",
    thumbnail: require("../../attached_assets/stock_images/person_dancing_happi_0e460040.jpg"),
  },
  {
    id: "5",
    title: "Noite de salsa",
    username: "@AnaForró",
    location: "@SalsaHouse",
    thumbnail: require("../../attached_assets/stock_images/person_dancing_happi_24afcbbe.jpg"),
  },
];

const FILTER_TAGS = [
  { id: "filtros", label: "Filtros", count: 4, isSpecial: true },
  { id: "com_homem", label: "Com homem", isActive: true },
  { id: "5km", label: "5km", isActive: true },
  { id: "forro", label: "Forró", isActive: true },
  { id: "salsa", label: "Salsa", isActive: false },
  { id: "samba", label: "Samba", isActive: false },
  { id: "zouk", label: "Zouk", isActive: false },
];

const LOCATIONS = [
  { id: "all", label: "Em Rio de Janeiro" },
  { id: "zona_sul", label: "Zona Sul" },
  { id: "sudoeste", label: "Sudoeste" },
  { id: "centro", label: "Centro" },
];

const FILTER_CATEGORIES = {
  partner: {
    title: "Seu par",
    options: [
      { id: "com_homem", label: "Com homem" },
      { id: "com_mulher", label: "Com mulher" },
    ],
  },
  distance: {
    title: "Distância",
    options: [
      { id: "1km", label: "1km" },
      { id: "2km", label: "2km" },
      { id: "5km", label: "5km" },
      { id: "10km", label: "10km" },
    ],
  },
  danceStyle: {
    title: "Estilo de dança",
    options: [
      { id: "bachata", label: "Bachata" },
      { id: "ballet", label: "Ballet" },
      { id: "forro", label: "Forró" },
      { id: "funk", label: "Funk" },
      { id: "hip_hop", label: "Hip Hop" },
      { id: "kizomba", label: "Kizomba" },
      { id: "pagode", label: "Pagode" },
      { id: "salsa", label: "Salsa" },
      { id: "samba", label: "Samba" },
      { id: "swing", label: "Swing" },
      { id: "tango", label: "Tango" },
      { id: "zouk", label: "Zouk" },
    ],
  },
};

const DAY_ABBREVS = ["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SAB"];

const EVENT_TEMPLATES = [
  {
    title: "QUINTANEJA NO PADANO",
    location: "Barra da Tijuca",
    time: "17h00",
    image: "https://images.unsplash.com/photo-1504609813442-a8924e83f76e?w=100&h=100&fit=crop",
  },
  {
    title: "HAPPY HOUR NO CARIOCA DA GEMA",
    location: "Lapa - Centro",
    time: "18h00",
    image: "https://images.unsplash.com/photo-1545959570-a94084071b5d?w=100&h=100&fit=crop",
  },
  {
    title: "MALHAÇÃO COM DANÇA",
    location: "Leblon",
    time: "15h00",
    image: "https://images.unsplash.com/photo-1508700929628-666bc8bd84ea?w=100&h=100&fit=crop",
  },
  {
    title: "JANTAR DANÇANTE",
    location: "Jacarepaguá",
    time: "18h00",
    image: "https://images.unsplash.com/photo-1566737236500-c8ac43014a67?w=100&h=100&fit=crop",
  },
  {
    title: "CAFÉ DA MANHÃ COM MÚSICA",
    location: "Tijuca",
    time: "10h02",
    image: "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=100&h=100&fit=crop",
  },
];

function generateDynamicEvents() {
  const today = new Date();
  
  return EVENT_TEMPLATES.map((template, index) => {
    const eventDate = new Date(today);
    eventDate.setDate(today.getDate() + index);
    
    const dayOfWeek = eventDate.getDay();
    const dayAbbrev = DAY_ABBREVS[dayOfWeek];
    const formattedDate = `${String(eventDate.getDate()).padStart(2, "0")}/${String(eventDate.getMonth() + 1).padStart(2, "0")}`;
    
    return {
      id: String(index + 1),
      dayAbbrev,
      date: formattedDate,
      title: template.title,
      location: template.location,
      time: template.time,
      image: template.image,
      color: index === 0 ? "#C41E3A" : (index === 1 ? "#22C55E" : "#C41E3A"),
    };
  });
}

type VideoStoryCardProps = {
  title: string;
  username: string;
  location: string;
  thumbnail: any;
  onPress?: () => void;
};

function VideoStoryCard({ title, username, location, thumbnail, onPress }: VideoStoryCardProps) {
  return (
    <Pressable
      style={({ pressed }) => [styles.storyCard, pressed && { opacity: 0.9 }]}
      onPress={onPress}
    >
      <Image source={thumbnail} style={styles.storyImage} resizeMode="cover" />
      <View style={styles.storyOverlay}>
        <Text style={styles.storyTitle} numberOfLines={2}>{title}</Text>
        <Text style={styles.storyUsername}>{username}</Text>
        <Text style={styles.storyLocation}>{location}</Text>
      </View>
    </Pressable>
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
      style={({ pressed }) => [
        styles.filterTag,
        isSpecial && styles.filterTagSpecial,
        isActive && styles.filterTagActive,
        pressed && { opacity: 0.8 },
      ]}
      onPress={onPress}
    >
      {isSpecial ? (
        <View style={styles.filterTagSpecialContent}>
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

type EventCardProps = {
  dayAbbrev: string;
  date: string;
  title: string;
  location: string;
  time: string;
  image: string;
  color: string;
  onReserve?: () => void;
  onDetails?: () => void;
};

function EventCard({ dayAbbrev, date, title, location, time, image, color, onReserve, onDetails }: EventCardProps) {
  return (
    <View style={styles.eventCard}>
      <Image source={{ uri: image }} style={styles.eventImage} resizeMode="cover" />
      <View style={[styles.eventDateBox, { backgroundColor: color }]}>
        <Text style={styles.eventDayAbbrev}>{dayAbbrev}</Text>
        <Text style={styles.eventDate}>{date}</Text>
      </View>
      <View style={styles.eventInfo}>
        <Text style={styles.eventTitle} numberOfLines={2}>{title}</Text>
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
        <Pressable
          style={({ pressed }) => [styles.reserveButton, pressed && { opacity: 0.9 }]}
          onPress={onReserve}
        >
          <Text style={styles.reserveButtonText}>Reservar</Text>
        </Pressable>
        <Pressable onPress={onDetails}>
          <Text style={styles.detailsLink}>Ver detalhes &gt;</Text>
        </Pressable>
      </View>
    </View>
  );
}

export type QueroDetailScreenParams = {
  queroTitle: string;
  queroDescription: string;
};

export default function QueroDetailScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, "QueroDetail">>();
  
  const { queroTitle, queroDescription } = route.params || { queroTitle: "SAIR PRA DANÇAR", queroDescription: "" };
  
  const [selectedLocation, setSelectedLocation] = useState(LOCATIONS[0]);
  const [locationDropdownOpen, setLocationDropdownOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState<string[]>(["com_homem", "5km", "forro"]);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  
  const eventsData = useMemo(() => generateDynamicEvents(), []);
  
  const activeFilterCount = useMemo(() => {
    return activeFilters.length;
  }, [activeFilters]);

  const handleBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleFilterPress = useCallback((filterId: string) => {
    if (filterId === "filtros") {
      setFilterModalVisible(true);
      return;
    }
    setActiveFilters(prev => 
      prev.includes(filterId) 
        ? prev.filter(id => id !== filterId)
        : [...prev, filterId]
    );
  }, []);
  
  const handleFilterOptionToggle = useCallback((optionId: string) => {
    setActiveFilters(prev => 
      prev.includes(optionId) 
        ? prev.filter(id => id !== optionId)
        : [...prev, optionId]
    );
  }, []);

  const handleLocationSelect = useCallback((location: typeof LOCATIONS[0]) => {
    setSelectedLocation(location);
    setLocationDropdownOpen(false);
  }, []);

  const handleReserve = useCallback((eventTitle: string) => {
    navigation.navigate("AIChat", {
      cardTitle: eventTitle,
      cardDescription: "Reserva de evento",
    });
  }, [navigation]);

  const handleDetails = useCallback((eventId: string) => {
    console.log("View details for event:", eventId);
  }, []);

  const handleVideoPress = useCallback((index: number) => {
    navigation.navigate("Reels", { initialIndex: index });
  }, [navigation]);

  const cleanTitle = queroTitle.replace(/\n/g, " ");

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Pressable onPress={handleBack} style={styles.backButton}>
            <Feather name="chevron-left" size={24} color={Colors.dark.text} />
          </Pressable>
        </View>
        <View style={styles.headerCenter}>
          <Image source={logoImage} style={styles.logo} resizeMode="contain" />
          <Text style={styles.brandText}>
            <Text style={styles.brandB}>B</Text>ORA
            <Text style={styles.brandB}>B</Text>AILAR
          </Text>
        </View>
        <View style={styles.headerRight}>
          <Pressable style={styles.iconButton}>
            <Feather name="bell" size={20} color={Colors.dark.text} />
          </Pressable>
        </View>
      </View>

      <View style={styles.searchBar}>
        <Feather name="search" size={18} color={Colors.dark.textSecondary} />
        <Text style={styles.searchText}>Onde, quando e com quem?</Text>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersContainer}
        >
          {FILTER_TAGS.map((tag) => (
            <FilterTag
              key={tag.id}
              label={tag.label}
              count={tag.isSpecial ? activeFilterCount : tag.count}
              isSpecial={tag.isSpecial}
              isActive={tag.isSpecial ? activeFilterCount > 0 : activeFilters.includes(tag.id)}
              onPress={() => handleFilterPress(tag.id)}
            />
          ))}
        </ScrollView>

        <Pressable 
          style={styles.locationDropdown}
          onPress={() => setLocationDropdownOpen(!locationDropdownOpen)}
        >
          <Text style={styles.locationText}>{selectedLocation.label}</Text>
          <Feather 
            name={locationDropdownOpen ? "chevron-up" : "chevron-down"} 
            size={16} 
            color={Colors.dark.text} 
          />
        </Pressable>

        {locationDropdownOpen ? (
          <View style={styles.locationDropdownMenu}>
            {LOCATIONS.map((location) => (
              <Pressable
                key={location.id}
                style={[
                  styles.locationOption,
                  selectedLocation.id === location.id && styles.locationOptionActive,
                ]}
                onPress={() => handleLocationSelect(location)}
              >
                <Text style={[
                  styles.locationOptionText,
                  selectedLocation.id === location.id && styles.locationOptionTextActive,
                ]}>
                  {location.label}
                </Text>
              </Pressable>
            ))}
          </View>
        ) : null}

        <Text style={styles.sectionTitle}>{cleanTitle}</Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.storiesContainer}
        >
          {VIDEO_STORIES_DATA.map((story, index) => (
            <VideoStoryCard
              key={story.id}
              title={story.title}
              username={story.username}
              location={story.location}
              thumbnail={story.thumbnail}
              onPress={() => handleVideoPress(index)}
            />
          ))}
        </ScrollView>

        <View style={styles.eventsSection}>
          {eventsData.map((event) => (
            <EventCard
              key={event.id}
              dayAbbrev={event.dayAbbrev}
              date={event.date}
              title={event.title}
              location={event.location}
              time={event.time}
              image={event.image}
              color={event.color}
              onReserve={() => handleReserve(event.title)}
              onDetails={() => handleDetails(event.id)}
            />
          ))}
        </View>

        <View style={{ height: insets.bottom + Spacing.xl }} />
      </ScrollView>
      
      <Modal
        visible={filterModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setFilterModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.filterModal}>
            <View style={styles.filterModalHeader}>
              <Text style={styles.filterModalTitle}>Filtros</Text>
              <Pressable 
                onPress={() => setFilterModalVisible(false)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Feather name="x" size={24} color={Colors.dark.text} />
              </Pressable>
            </View>
            
            <ScrollView 
              style={styles.filterModalContent}
              showsVerticalScrollIndicator={true}
            >
              <Text style={styles.filterCategoryTitle}>{FILTER_CATEGORIES.partner.title}</Text>
              {FILTER_CATEGORIES.partner.options.map((option) => (
                <Pressable
                  key={option.id}
                  style={styles.filterOption}
                  onPress={() => handleFilterOptionToggle(option.id)}
                >
                  <View style={[
                    styles.filterCheckbox,
                    activeFilters.includes(option.id) && styles.filterCheckboxActive,
                  ]}>
                    {activeFilters.includes(option.id) ? (
                      <Feather name="check" size={14} color="#FFFFFF" />
                    ) : null}
                  </View>
                  <Text style={styles.filterOptionLabel}>{option.label}</Text>
                </Pressable>
              ))}
              
              <Text style={styles.filterCategoryTitle}>{FILTER_CATEGORIES.distance.title}</Text>
              {FILTER_CATEGORIES.distance.options.map((option) => (
                <Pressable
                  key={option.id}
                  style={styles.filterOption}
                  onPress={() => handleFilterOptionToggle(option.id)}
                >
                  <View style={[
                    styles.filterCheckbox,
                    activeFilters.includes(option.id) && styles.filterCheckboxActive,
                  ]}>
                    {activeFilters.includes(option.id) ? (
                      <Feather name="check" size={14} color="#FFFFFF" />
                    ) : null}
                  </View>
                  <Text style={styles.filterOptionLabel}>{option.label}</Text>
                </Pressable>
              ))}
              
              <Text style={styles.filterCategoryTitle}>{FILTER_CATEGORIES.danceStyle.title}</Text>
              {FILTER_CATEGORIES.danceStyle.options.map((option) => (
                <Pressable
                  key={option.id}
                  style={styles.filterOption}
                  onPress={() => handleFilterOptionToggle(option.id)}
                >
                  <View style={[
                    styles.filterCheckbox,
                    activeFilters.includes(option.id) && styles.filterCheckboxActive,
                  ]}>
                    {activeFilters.includes(option.id) ? (
                      <Feather name="check" size={14} color="#FFFFFF" />
                    ) : null}
                  </View>
                  <Text style={styles.filterOptionLabel}>{option.label}</Text>
                </Pressable>
              ))}
              
              <View style={{ height: Spacing.xl }} />
            </ScrollView>
          </View>
        </View>
      </Modal>
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
  headerLeft: {
    width: 40,
  },
  backButton: {
    padding: Spacing.xs,
  },
  headerCenter: {
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
    fontFamily: Fonts?.serif,
    letterSpacing: 1,
  },
  brandB: {
    color: Colors.dark.brand,
  },
  headerRight: {
    width: 40,
    alignItems: "flex-end",
  },
  iconButton: {
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
  filterTagSpecialContent: {
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
  locationDropdownMenu: {
    marginHorizontal: Spacing.lg,
    backgroundColor: "#FFFFFF",
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    marginBottom: Spacing.md,
  },
  locationOption: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  locationOptionActive: {
    backgroundColor: Colors.dark.brand + "10",
  },
  locationOptionText: {
    fontSize: 14,
    color: Colors.dark.text,
  },
  locationOptionTextActive: {
    color: Colors.dark.brand,
    fontWeight: "600",
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
    position: "relative",
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
  eventDayAbbrev: {
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
    marginBottom: 4,
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
    justifyContent: "center",
    alignItems: "flex-end",
    gap: Spacing.xs,
  },
  reserveButton: {
    backgroundColor: Colors.dark.brand,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
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
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
  },
  filterModal: {
    backgroundColor: "#FFFFFF",
    borderRadius: BorderRadius.lg,
    width: "100%",
    maxHeight: "80%",
    paddingVertical: Spacing.lg,
  },
  filterModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  filterModalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.dark.text,
  },
  filterModalContent: {
    paddingHorizontal: Spacing.lg,
  },
  filterCategoryTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.dark.text,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  filterOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  filterCheckbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: "#CCCCCC",
    alignItems: "center",
    justifyContent: "center",
  },
  filterCheckboxActive: {
    backgroundColor: Colors.dark.brand,
    borderColor: Colors.dark.brand,
  },
  filterOptionLabel: {
    fontSize: 14,
    color: Colors.dark.text,
  },
});
