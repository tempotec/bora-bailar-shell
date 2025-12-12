import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withDelay,
  withSequence,
  Easing,
  SharedValue,
} from "react-native-reanimated";
import { Colors, Spacing, BorderRadius, Fonts } from "@/constants/theme";
import { RootStackParamList } from "@/navigation/RootStackNavigator";

const logoImage = require("../../attached_assets/WhatsApp_Image_2025-12-09_at_11.41.04-removebg-preview_1765394422474.png");

function TypingIndicator() {
  const dot1 = useSharedValue(0);
  const dot2 = useSharedValue(0);
  const dot3 = useSharedValue(0);

  useEffect(() => {
    const animateDot = (dotValue: SharedValue<number>, delay: number) => {
      dotValue.value = withDelay(
        delay,
        withRepeat(
          withSequence(
            withTiming(-6, { duration: 300, easing: Easing.out(Easing.ease) }),
            withTiming(0, { duration: 300, easing: Easing.in(Easing.ease) })
          ),
          -1,
          false
        )
      );
    };

    animateDot(dot1, 0);
    animateDot(dot2, 150);
    animateDot(dot3, 300);
  }, [dot1, dot2, dot3]);

  const dot1Style = useAnimatedStyle(() => ({
    transform: [{ translateY: dot1.value }],
  }));

  const dot2Style = useAnimatedStyle(() => ({
    transform: [{ translateY: dot2.value }],
  }));

  const dot3Style = useAnimatedStyle(() => ({
    transform: [{ translateY: dot3.value }],
  }));

  return (
    <View style={typingStyles.container}>
      <View style={typingStyles.bubble}>
        <View style={typingStyles.dotsContainer}>
          <Animated.View style={[typingStyles.dot, dot1Style]} />
          <Animated.View style={[typingStyles.dot, dot2Style]} />
          <Animated.View style={[typingStyles.dot, dot3Style]} />
        </View>
      </View>
    </View>
  );
}

const typingStyles = StyleSheet.create({
  container: {
    alignSelf: "flex-start",
    marginVertical: Spacing.xs,
    maxWidth: "80%",
  },
  bubble: {
    backgroundColor: "#F5F5F5",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderBottomLeftRadius: BorderRadius.xs,
  },
  dotsContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    height: 20,
    justifyContent: "center",
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.dark.textSecondary,
  },
});

type EventCardData = {
  title: string;
  date: string;
  location: string;
  time: string;
  price: string;
};

type Message = {
  id: string;
  text: string;
  isUser: boolean;
  isButton?: boolean;
  buttonText?: string;
  isEventCard?: boolean;
  eventCardData?: EventCardData;
};

type ChatStep = "initial" | "awaiting_confirmation" | "asked_name" | "asked_email" | "complete";

type AIChatMode = "reservation" | "dance_awards" | "dicas_semana";

const getInitialAIMessage = (mode: AIChatMode, cardTitle: string, cardDescription: string) => {
  if (mode === "dance_awards") {
    return `Olá, sou a IA do BORABAILAR. Você gostaria de participar do BORABAILAR TOP DANCE AWARDS?`;
  }
  if (mode === "dicas_semana") {
    const dicaName = cardTitle.replace("DICA_SEMANA:", "");
    return `Olá, sou a IA do BORABAILAR.\nVocê gostou de nossa dica da semana:\n${dicaName}?\n\nVocê prefere falar por áudio? Clique no botão e fale livremente.`;
  }
  return "Maravilha! Estou reservando pra você, me diga qual é seu nome?";
};

const AI_RESPONSES = {
  initial: "Maravilha! Estou reservando pra você, me diga qual é seu nome?",
  asked_name: "Ok. Qual é seu e-mail ou telefone de contato?",
  asked_email: "Maravilha! Agora é hora de completar sua reserva e BoraBailar!",
  dance_awards_yes: "Ah legal. Crie uma conta para você ter mais informações!",
  dicas_semana_yes: "Ah legal. Veja mais informações do evento e garanta já seu lugar!",
};

export default function AIChatScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, "AIChat">>();
  const flatListRef = useRef<FlatList>(null);
  
  const cardTitle = route.params?.cardTitle || "SEXTANEJA NO PADANO";
  const cardDescription = route.params?.cardDescription || "";
  
  const isDanceAwards = cardTitle.includes("DANCE AWARDS") || cardTitle.includes("TOP DANCE");
  const isDicasSemana = cardTitle.startsWith("DICA_SEMANA:");
  const chatMode: AIChatMode = isDanceAwards ? "dance_awards" : isDicasSemana ? "dicas_semana" : "reservation";
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [chatStep, setChatStep] = useState<ChatStep>("initial");
  const [userName, setUserName] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    setIsTyping(true);
    
    const timer = setTimeout(() => {
      setIsTyping(false);
      const aiMessage: Message = {
        id: "1",
        text: getInitialAIMessage(chatMode, cardTitle, cardDescription),
        isUser: false,
      };
      setMessages([aiMessage]);
      setChatStep((chatMode === "dance_awards" || chatMode === "dicas_semana") ? "awaiting_confirmation" : "asked_name");
    }, 1500);

    return () => clearTimeout(timer);
  }, [cardTitle, chatMode]);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, []);

  const parseEventDataFromDescription = useCallback(() => {
    const dicaName = cardTitle.replace("DICA_SEMANA:", "");
    const parts = cardDescription.split("|");
    const dayDatePart = parts[0] || "";
    const price = parts[1] || "R$0";
    
    const dayMatch = dayDatePart.match(/([^(]+)\s*\(([^)]+)\)/);
    const dayName = dayMatch ? dayMatch[1].trim() : "";
    const dateStr = dayMatch ? dayMatch[2].trim() : "";
    
    const dayAbbrev = dayName.substring(0, 3).toUpperCase();
    const dayNumber = dateStr.split("/")[0] || "00";
    const monthNumber = dateStr.split("/")[1] || "00";
    
    return {
      title: dicaName.toUpperCase(),
      date: `${dayAbbrev}\n${dayNumber}/${monthNumber}`,
      location: "Lapa - Centro",
      time: "18h00",
      price,
    };
  }, [cardTitle, cardDescription]);

  const handleSend = useCallback(() => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      isUser: true,
    };

    const currentInput = inputText.trim();
    setMessages(prev => [...prev, userMessage]);
    setInputText("");
    setIsTyping(true);
    scrollToBottom();

    setTimeout(() => {
      setIsTyping(false);
      
      if (chatStep === "awaiting_confirmation") {
        const isPositive = currentInput.toLowerCase().includes("sim") || 
                          currentInput.toLowerCase().includes("quero") ||
                          currentInput.toLowerCase().includes("yes");
        if (isPositive) {
          if (chatMode === "dicas_semana") {
            const aiResponse: Message = {
              id: (Date.now() + 1).toString(),
              text: AI_RESPONSES.dicas_semana_yes,
              isUser: false,
            };
            const eventCardMessage: Message = {
              id: (Date.now() + 2).toString(),
              text: "",
              isUser: false,
              isEventCard: true,
              eventCardData: parseEventDataFromDescription(),
            };
            setMessages(prev => [...prev, aiResponse, eventCardMessage]);
            setChatStep("complete");
          } else {
            const aiResponse: Message = {
              id: (Date.now() + 1).toString(),
              text: AI_RESPONSES.dance_awards_yes,
              isUser: false,
            };
            const buttonMessage: Message = {
              id: (Date.now() + 2).toString(),
              text: "",
              isUser: false,
              isButton: true,
              buttonText: "Bora bailar? Crie sua conta",
            };
            setMessages(prev => [...prev, aiResponse, buttonMessage]);
            setChatStep("complete");
          }
        }
      } else if (chatStep === "asked_name") {
        setUserName(currentInput);
        const aiResponse: Message = {
          id: (Date.now() + 1).toString(),
          text: AI_RESPONSES.asked_name,
          isUser: false,
        };
        setMessages(prev => [...prev, aiResponse]);
        setChatStep("asked_email");
      } else if (chatStep === "asked_email") {
        const aiResponse: Message = {
          id: (Date.now() + 1).toString(),
          text: AI_RESPONSES.asked_email,
          isUser: false,
        };
        const buttonMessage: Message = {
          id: (Date.now() + 2).toString(),
          text: "",
          isUser: false,
          isButton: true,
          buttonText: "Vamos bailar?",
        };
        setMessages(prev => [...prev, aiResponse, buttonMessage]);
        setChatStep("complete");
      }
      scrollToBottom();
    }, 1200);
  }, [inputText, chatStep, chatMode, scrollToBottom, parseEventDataFromDescription]);

  const handleVamosBailar = useCallback(() => {
    navigation.navigate("CadastreSe");
  }, [navigation]);

  const handleFaltaPouco = useCallback(() => {
    navigation.navigate("FaltaPouco");
  }, [navigation]);

  const handleBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const renderEventCard = useCallback((eventData: EventCardData) => {
    const dateLines = eventData.date.split("\n");
    const dayAbbrev = dateLines[0] || "";
    const dateStr = dateLines[1] || "";
    
    return (
      <View style={styles.eventCardContainer}>
        <View style={styles.eventCard}>
          <Image 
            source={require("../../attached_assets/stock_images/person_dancing_happi_798bff4b.jpg")} 
            style={styles.eventCardImage} 
            resizeMode="cover"
          />
          <View style={styles.eventCardDateBox}>
            <Text style={styles.eventCardDayAbbrev}>{dayAbbrev}</Text>
            <Text style={styles.eventCardDateStr}>{dateStr}</Text>
          </View>
          <View style={styles.eventCardInfo}>
            <Text style={styles.eventCardTitle} numberOfLines={2}>{eventData.title}</Text>
            <View style={styles.eventCardLocationRow}>
              <Feather name="map-pin" size={12} color={Colors.dark.textSecondary} />
              <Text style={styles.eventCardLocation}>{eventData.location}</Text>
            </View>
            <View style={styles.eventCardTimeRow}>
              <Feather name="clock" size={12} color={Colors.dark.textSecondary} />
              <Text style={styles.eventCardTime}>{eventData.time}</Text>
            </View>
            <View style={styles.eventCardButtons}>
              <Pressable 
                style={styles.eventCardGreenButton}
                onPress={handleFaltaPouco}
              >
                <Text style={styles.eventCardGreenButtonText}>Quero ir</Text>
              </Pressable>
              <Pressable style={styles.eventCardMoreButton}>
                <Text style={styles.eventCardMoreButtonText}>Ver mais</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </View>
    );
  }, [handleFaltaPouco]);

  const renderMessage = useCallback(({ item }: { item: Message }) => {
    if (item.isButton) {
      return (
        <View style={styles.buttonMessageContainer}>
          <Pressable 
            style={styles.vamosBailarButton}
            onPress={handleVamosBailar}
          >
            <Text style={styles.vamosBailarText}>{item.buttonText}</Text>
            <Feather name="arrow-right" size={16} color="#FFFFFF" />
          </Pressable>
        </View>
      );
    }

    if (item.isEventCard && item.eventCardData) {
      return renderEventCard(item.eventCardData);
    }

    return (
      <View style={[
        styles.messageContainer,
        item.isUser ? styles.userMessageContainer : styles.aiMessageContainer,
      ]}>
        <View style={[
          styles.messageBubble,
          item.isUser ? styles.userBubble : styles.aiBubble,
        ]}>
          <Text style={[
            styles.messageText,
            item.isUser ? styles.userMessageText : styles.aiMessageText,
          ]}>
            {item.text}
          </Text>
        </View>
      </View>
    );
  }, [handleVamosBailar, renderEventCard]);

  const getCurrentTime = () => {
    const now = new Date();
    return `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={handleBack}>
          <Feather name="chevron-left" size={28} color={Colors.dark.text} />
        </Pressable>
        
        <View style={styles.headerCenter}>
          <View style={styles.aiIconContainer}>
            <Text style={styles.aiIconText}>AI</Text>
          </View>
          <Image source={logoImage} style={styles.headerLogo} resizeMode="contain" />
          <Text style={styles.headerBrandName}>
            <Text style={styles.brandRed}>B</Text>
            <Text style={styles.brandGray}>ORA</Text>
            <Text style={styles.brandRed}>B</Text>
            <Text style={styles.brandGray}>AILAR</Text>
          </Text>
        </View>
        
        <Pressable style={styles.bellButton}>
          <Feather name="bell" size={22} color={Colors.dark.textSecondary} />
        </Pressable>
      </View>

      <View style={styles.timeContainer}>
        <Text style={styles.timeText}>Hoje {getCurrentTime()}</Text>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={item => item.id}
        style={styles.messagesList}
        contentContainerStyle={styles.messagesContent}
        onContentSizeChange={scrollToBottom}
        ListFooterComponent={isTyping ? <TypingIndicator /> : null}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={0}
      >
        <View style={[styles.inputContainer, { paddingBottom: insets.bottom + Spacing.sm }]}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.textInput}
              placeholder="Diga-me como você quer bailar"
              placeholderTextColor={Colors.dark.textSecondary}
              value={inputText}
              onChangeText={setInputText}
              onSubmitEditing={handleSend}
              returnKeyType="send"
            />
            <Pressable style={styles.micButton}>
              <Feather name="mic" size={20} color={Colors.dark.brand} />
            </Pressable>
          </View>
          
          <Text style={styles.bottomTagline}>
            É só <Text style={styles.taglineHighlight}>falar</Text> que a gente te{" "}
            <Text style={styles.taglineHighlight}>entende!</Text>
          </Text>
        </View>
      </KeyboardAvoidingView>
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
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  backButton: {
    padding: Spacing.xs,
  },
  headerCenter: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  aiIconContainer: {
    backgroundColor: "#F5F5F5",
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  aiIconText: {
    fontSize: 12,
    fontWeight: "700",
    color: Colors.dark.text,
  },
  headerLogo: {
    width: 36,
    height: 28,
  },
  headerBrandName: {
    fontSize: 18,
    fontFamily: Fonts?.serif,
    letterSpacing: 1,
  },
  brandRed: {
    color: Colors.dark.brand,
    fontWeight: "700",
  },
  brandGray: {
    color: Colors.dark.textSecondary,
    fontWeight: "400",
  },
  bellButton: {
    padding: Spacing.xs,
  },
  timeContainer: {
    alignItems: "center",
    paddingVertical: Spacing.md,
  },
  timeText: {
    fontSize: 12,
    color: Colors.dark.textSecondary,
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
  },
  messageContainer: {
    marginVertical: Spacing.xs,
    maxWidth: "80%",
  },
  userMessageContainer: {
    alignSelf: "flex-end",
  },
  aiMessageContainer: {
    alignSelf: "flex-start",
  },
  messageBubble: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.lg,
  },
  userBubble: {
    backgroundColor: Colors.dark.brand,
    borderBottomRightRadius: BorderRadius.xs,
  },
  aiBubble: {
    backgroundColor: "#F5F5F5",
    borderBottomLeftRadius: BorderRadius.xs,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
  },
  userMessageText: {
    color: "#FFFFFF",
  },
  aiMessageText: {
    color: Colors.dark.text,
  },
  buttonMessageContainer: {
    alignSelf: "flex-start",
    marginVertical: Spacing.sm,
  },
  vamosBailarButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#22C55E",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    gap: Spacing.sm,
  },
  vamosBailarText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  inputContainer: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: 25,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    color: Colors.dark.text,
    paddingVertical: Spacing.xs,
  },
  micButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Colors.dark.brand,
  },
  bottomTagline: {
    textAlign: "center",
    fontSize: 14,
    color: Colors.dark.text,
    marginTop: Spacing.md,
  },
  taglineHighlight: {
    color: Colors.dark.brand,
    fontWeight: "700",
  },
  eventCardContainer: {
    alignSelf: "flex-start",
    marginVertical: Spacing.sm,
    maxWidth: "90%",
  },
  eventCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: BorderRadius.lg,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    flexDirection: "row",
  },
  eventCardImage: {
    width: 80,
    height: 100,
  },
  eventCardDateBox: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: Colors.dark.brand,
    paddingHorizontal: Spacing.xs + 2,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
  },
  eventCardDayAbbrev: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "700",
  },
  eventCardDateStr: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "600",
  },
  eventCardInfo: {
    flex: 1,
    padding: Spacing.sm,
    justifyContent: "space-between",
  },
  eventCardTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.dark.text,
    marginBottom: 2,
  },
  eventCardLocationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  eventCardLocation: {
    fontSize: 11,
    color: Colors.dark.textSecondary,
  },
  eventCardTimeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  eventCardTime: {
    fontSize: 11,
    color: Colors.dark.textSecondary,
  },
  eventCardButtons: {
    flexDirection: "row",
    gap: Spacing.xs,
    marginTop: Spacing.xs,
  },
  eventCardGreenButton: {
    backgroundColor: "#22C55E",
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  eventCardGreenButtonText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "600",
  },
  eventCardMoreButton: {
    backgroundColor: "#F5F5F5",
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  eventCardMoreButtonText: {
    color: Colors.dark.textSecondary,
    fontSize: 11,
    fontWeight: "500",
  },
});
