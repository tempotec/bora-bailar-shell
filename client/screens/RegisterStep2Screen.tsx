import React, { useState, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { Colors, Spacing, BorderRadius, Fonts } from "@/constants/theme";
import { useNavigation, useRoute, RouteProp, CommonActions } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { AuthContext } from "@/contexts/AuthContext";
import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type RouteProps = RouteProp<RootStackParamList, "RegisterStep2">;

function EnvelopeIcon() {
  return (
    <View style={styles.iconContainer}>
      <Feather name="mail" size={32} color={Colors.dark.brand} />
    </View>
  );
}

export default function RegisterStep2Screen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  const { setIsLoggedIn, setUserName, setUserEmail } = useContext(AuthContext);
  const [email, setEmail] = useState("");

  const userName = route.params?.userName || "";

  const handleGoBack = () => {
    navigation.goBack();
  };

  const isValidEmail = (text: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(text);
  };

  const handleComplete = () => {
    if (isValidEmail(email)) {
      setUserName(userName);
      setUserEmail(email.trim());
      setIsLoggedIn(true);
      
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: "Main" }],
        })
      );
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={handleGoBack}>
          <Feather name="chevron-left" size={28} color={Colors.dark.text} />
        </Pressable>
        
        <Text style={styles.stepIndicator}>Passo 2 de 2</Text>
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: "100%" }]} />
        </View>
      </View>

      <KeyboardAwareScrollViewCompat
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + Spacing.xl },
        ]}
      >
        <View style={styles.iconWrapper}>
          <EnvelopeIcon />
        </View>

        <Text style={styles.title}>Qual é seu e-mail?</Text>
        <Text style={styles.subtitle}>
          Seu e-mail é importante para confirmação{"\n"}e recuperação da sua conta.
        </Text>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Seu e-mail"
            placeholderTextColor={Colors.dark.textSecondary}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        <View style={styles.spacer} />

        <Pressable
          style={[
            styles.nextButton,
            !isValidEmail(email) && styles.nextButtonDisabled,
          ]}
          onPress={handleComplete}
          disabled={!isValidEmail(email)}
        >
          <Text style={styles.nextButtonText}>Próximo</Text>
        </Pressable>
      </KeyboardAwareScrollViewCompat>
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
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  backButton: {
    padding: Spacing.xs,
  },
  stepIndicator: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
    fontWeight: "500",
  },
  progressContainer: {
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.xl,
  },
  progressBar: {
    height: 4,
    backgroundColor: "#E0E0E0",
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: Colors.dark.brand,
    borderRadius: 2,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
    flexGrow: 1,
  },
  iconWrapper: {
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#FFF0F0",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: Colors.dark.text,
    textAlign: "center",
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: Spacing.xl,
  },
  inputContainer: {
    marginTop: Spacing.md,
  },
  input: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    fontSize: 16,
    color: Colors.dark.text,
    backgroundColor: "#FFFFFF",
  },
  spacer: {
    flex: 1,
    minHeight: Spacing.xl * 2,
  },
  nextButton: {
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: Colors.dark.text,
    borderRadius: BorderRadius.xl,
    paddingVertical: Spacing.md,
    alignItems: "center",
    marginTop: Spacing.lg,
  },
  nextButtonDisabled: {
    borderColor: "#E0E0E0",
    opacity: 0.5,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.dark.text,
  },
});
