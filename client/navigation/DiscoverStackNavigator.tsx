import React from "react";
import { Pressable, StyleSheet, Text } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import DiscoverScreen from "@/screens/DiscoverScreen";
import EventDetailsScreen from "@/screens/EventDetailsScreen";
import { useScreenOptions } from "@/hooks/useScreenOptions";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";

export type DiscoverStackParamList = {
  Discover: undefined;
  EventDetails: { eventId: string };
};

const Stack = createNativeStackNavigator<DiscoverStackParamList>();

function SignUpButton() {
  return (
    <Pressable style={headerStyles.signUpButton} hitSlop={8}>
      <Text style={headerStyles.signUpText}>Sign Up</Text>
    </Pressable>
  );
}

function LogInButton() {
  return (
    <Pressable style={headerStyles.logInButton} hitSlop={8}>
      <Text style={headerStyles.logInText}>Log In</Text>
    </Pressable>
  );
}

const headerStyles = StyleSheet.create({
  signUpButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
  },
  signUpText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.dark.brand,
  },
  logInButton: {
    backgroundColor: Colors.dark.brand,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.md,
  },
  logInText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.dark.buttonText,
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
    </Stack.Navigator>
  );
}
