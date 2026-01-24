import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import MainTabNavigator from "@/navigation/MainTabNavigator";
import SignUpScreen from "@/screens/SignUpScreen";
import AIChatScreen from "@/screens/AIChatScreen";
import RegisterStep1Screen from "@/screens/RegisterStep1Screen";
import RegisterStep2Screen from "@/screens/RegisterStep2Screen";
import CadastreSeScreen from "@/screens/CadastreSeScreen";
import FaltaPoucoScreen from "@/screens/FaltaPoucoScreen";
import QueroDetailScreen from "@/screens/QueroDetailScreen";
import ReelsScreen, { ReelsScreenParams } from "@/screens/ReelsScreen";
import EventDetailsScreen from "@/screens/EventDetailsScreen";
import { useScreenOptions } from "@/hooks/useScreenOptions";

export type RootStackParamList = {
  Main: undefined;
  SignUp: undefined;
  Login: undefined;
  AIChat: { cardTitle: string; cardDescription: string };
  RegisterStep1: undefined;
  RegisterStep2: { userName: string };
  CadastreSe: undefined;
  FaltaPouco: { eventName?: string; eventDetails?: string; eventImage?: string } | undefined;
  QueroDetail: { queroTitle: string; queroDescription: string };
  Reels: ReelsScreenParams;
  EventDetails: { eventId: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootStackNavigator() {
  const screenOptions = useScreenOptions();

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name="Main"
        component={MainTabNavigator}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="SignUp"
        component={SignUpScreen}
        options={{
          presentation: "modal",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="Login"
        component={SignUpScreen}
        options={{
          presentation: "modal",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="AIChat"
        component={AIChatScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="RegisterStep1"
        component={RegisterStep1Screen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="RegisterStep2"
        component={RegisterStep2Screen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="CadastreSe"
        component={CadastreSeScreen}
        options={{
          presentation: "modal",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="FaltaPouco"
        component={FaltaPoucoScreen}
        options={{
          presentation: "modal",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="QueroDetail"
        component={QueroDetailScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="Reels"
        component={ReelsScreen}
        options={{
          headerShown: false,
          animation: "slide_from_bottom",
        }}
      />
      <Stack.Screen
        name="EventDetails"
        component={EventDetailsScreen}
        options={{
          headerShown: false,
        }}
      />
    </Stack.Navigator>
  );
}
