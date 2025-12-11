import React from "react";
import { Pressable, StyleSheet, Text } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import DiscoverScreen from "@/screens/DiscoverScreen";
import EventDetailsScreen from "@/screens/EventDetailsScreen";
import SignUpScreen from "@/screens/SignUpScreen";
import { useScreenOptions } from "@/hooks/useScreenOptions";
import { Colors, Spacing } from "@/constants/theme";

export type DiscoverStackParamList = {
  Discover: undefined;
  EventDetails: { eventId: string };
  SignUp: undefined;
};

const Stack = createNativeStackNavigator<DiscoverStackParamList>();

function SignUpButton() {
  const navigation = useNavigation<NativeStackNavigationProp<DiscoverStackParamList>>();
  
  const handlePress = () => {
    navigation.navigate("SignUp");
  };

  return (
    <Pressable style={headerStyles.authButton} hitSlop={8} onPress={handlePress}>
      <Text style={headerStyles.authButtonText}>Sign Up</Text>
    </Pressable>
  );
}

function LogInButton() {
  return (
    <Pressable style={headerStyles.authButton} hitSlop={8}>
      <Text style={headerStyles.authButtonText}>Log In</Text>
    </Pressable>
  );
}

const headerStyles = StyleSheet.create({
  authButton: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  authButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.dark.brand,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
});

export default function DiscoverStackNavigator() {
  const screenOptions = useScreenOptions({ transparent: false });

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name="Discover"
        component={DiscoverScreen}
        options={{
          headerTitle: "",
          headerLeft: () => <SignUpButton />,
          headerRight: () => <LogInButton />,
          headerStyle: {
            backgroundColor: Colors.dark.backgroundRoot,
          },
          headerShadowVisible: false,
        }}
      />
      <Stack.Screen
        name="EventDetails"
        component={EventDetailsScreen}
        options={{
          headerTitle: "",
          headerTransparent: true,
        }}
      />
      <Stack.Screen
        name="SignUp"
        component={SignUpScreen}
        options={{
          headerShown: false,
          presentation: "modal",
        }}
      />
    </Stack.Navigator>
  );
}
