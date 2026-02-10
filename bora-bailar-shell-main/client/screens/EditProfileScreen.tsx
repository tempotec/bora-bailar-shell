import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";
import { AuthContext } from "@/contexts/AuthContext";
import AsyncStorage from "@react-native-async-storage/async-storage";

const DANCE_STYLES = [
  "Salsa",
  "Forró",
  "Samba",
  "Hip Hop",
  "Funk",
  "Zouk",
  "Bachata",
  "Kizomba",
  "Tango",
  "Samba de Gafieira",
];

const EXPERIENCE_LEVELS = [
  "Iniciante",
  "Intermediário",
  "Avançado",
  "Profissional",
];
const SKILL_LEVELS = ["Básico", "Intermediário", "Avançado"];

export default function EditProfileScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const authContext = React.useContext(AuthContext);
  const user = authContext?.user;

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [birthdate, setBirthdate] = useState("");
  const [bio, setBio] = useState("");
  const [city, setCity] = useState("");
  const [selectedStyles, setSelectedStyles] = useState<string[]>([]);
  const [experience, setExperience] = useState("");
  const [skillLevel, setSkillLevel] = useState("");

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
    }
    // Load from AsyncStorage
    loadProfileData();
  }, [user]);

  const loadProfileData = async () => {
    try {
      const data = await AsyncStorage.getItem("USER_PROFILE_" + user?.id);
      if (data) {
        const profile = JSON.parse(data);
        setPhone(profile.phone || "");
        setBio(profile.bio || "");
        setCity(profile.city || "");
        setSelectedStyles(profile.danceStyles || []);
        setExperience(profile.experience || "");
        setSkillLevel(profile.skillLevel || "");
        setBirthdate(profile.birthdate || "");
      }
    } catch (error) {
      console.log("Error loading profile:", error);
    }
  };

  const toggleStyle = (style: string) => {
    setSelectedStyles((prev) =>
      prev.includes(style) ? prev.filter((s) => s !== style) : [...prev, style],
    );
  };

  const handleSave = async () => {
    if (!user?.id) return;

    try {
      const profileData = {
        phone,
        bio,
        city,
        danceStyles: selectedStyles,
        experience,
        skillLevel,
        birthdate,
      };

      await AsyncStorage.setItem(
        "USER_PROFILE_" + user.id,
        JSON.stringify(profileData),
      );

      Alert.alert(
        "Perfil atualizado! ✅",
        "Suas informações foram salvas com sucesso.",
        [
          {
            text: "OK",
            onPress: () => navigation.goBack(),
          },
        ],
      );
    } catch (error) {
      Alert.alert("Erro", "Não foi possível salvar as alterações.");
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Feather name="chevron-left" size={24} color={Colors.dark.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Editar Perfil</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 100 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Photo */}
        <View style={styles.photoSection}>
          <View style={styles.photoCircle}>
            <Feather name="user" size={48} color={Colors.dark.textSecondary} />
          </View>
          <Text style={styles.photoText}>Ative a sua foto de perfil</Text>
        </View>

        {/* Personal Information */}
        <Text style={styles.sectionTitle}>Informações pessoais</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Nome e sobrenome</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="João Thomas Molnar"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="seuemail@borabailar.com"
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>BR (+55)</Text>
          <TextInput
            style={styles.input}
            value={phone}
            onChangeText={setPhone}
            placeholder="(21) 98876-0524"
            keyboardType="phone-pad"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Data de nascimento</Text>
          <TextInput
            style={styles.input}
            value={birthdate}
            onChangeText={setBirthdate}
            placeholder="18 / 02 / 2000"
          />
        </View>

        {/* Bio */}
        <Text style={styles.sectionTitle}>Bio</Text>
        <TextInput
          style={[styles.input, styles.bioInput]}
          value={bio}
          onChangeText={setBio}
          placeholder="Digite sobre você..."
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />

        {/* Location */}
        <Text style={styles.sectionTitle}>Localização</Text>
        <TextInput
          style={styles.input}
          value={city}
          onChangeText={setCity}
          placeholder="Selecione sua cidade"
        />

        {/* Dance Styles */}
        <Text style={styles.sectionTitle}>Estilos de dança</Text>
        <View style={styles.tagsContainer}>
          {DANCE_STYLES.map((style) => (
            <Pressable
              key={style}
              style={[
                styles.tag,
                selectedStyles.includes(style) && styles.tagSelected,
              ]}
              onPress={() => toggleStyle(style)}
            >
              <Text
                style={[
                  styles.tagText,
                  selectedStyles.includes(style) && styles.tagTextSelected,
                ]}
              >
                {style}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Experience */}
        <Text style={styles.sectionTitle}>Experiência</Text>
        <View style={styles.tagsContainer}>
          {EXPERIENCE_LEVELS.map((level) => (
            <Pressable
              key={level}
              style={[styles.tag, experience === level && styles.tagSelected]}
              onPress={() => setExperience(level)}
            >
              <Text
                style={[
                  styles.tagText,
                  experience === level && styles.tagTextSelected,
                ]}
              >
                {level}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Skill Level */}
        <Text style={styles.sectionTitle}>Nível</Text>
        <View style={styles.tagsContainer}>
          {SKILL_LEVELS.map((level) => (
            <Pressable
              key={level}
              style={[styles.tag, skillLevel === level && styles.tagSelected]}
              onPress={() => setSkillLevel(level)}
            >
              <Text
                style={[
                  styles.tagText,
                  skillLevel === level && styles.tagTextSelected,
                ]}
              >
                {level}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Save Button */}
        <Pressable style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Salvar</Text>
        </Pressable>
      </ScrollView>
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
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  backButton: {
    padding: Spacing.xs,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.dark.text,
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
  },
  photoSection: {
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  photoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#F5F5F5",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.sm,
  },
  photoText: {
    fontSize: 14,
    color: Colors.dark.primary,
    fontWeight: "600",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.dark.text,
    marginTop: Spacing.lg,
    marginBottom: Spacing.md,
  },
  inputGroup: {
    marginBottom: Spacing.md,
  },
  label: {
    fontSize: 12,
    color: Colors.dark.textSecondary,
    marginBottom: Spacing.xs,
    fontWeight: "600",
  },
  input: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: 14,
    color: Colors.dark.text,
    backgroundColor: "#FAFAFA",
  },
  bioInput: {
    minHeight: 100,
    paddingTop: Spacing.sm,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  tag: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    backgroundColor: "#FFFFFF",
  },
  tagSelected: {
    backgroundColor: Colors.dark.primary,
    borderColor: Colors.dark.primary,
  },
  tagText: {
    fontSize: 13,
    color: Colors.dark.text,
    fontWeight: "500",
  },
  tagTextSelected: {
    color: "#FFFFFF",
  },
  saveButton: {
    backgroundColor: Colors.dark.brand,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    marginTop: Spacing.xl,
    marginBottom: Spacing.xl,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});
