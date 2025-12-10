import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
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

function HeaderAuthButtons() {
  return (
    <View style={headerStyles.container}>
      <Pressable style={headerStyles.signUpButton}>
        <Text style={headerStyles.signUpText}>Sign up</Text>
      </Pressable>
      <Pressable style={headerStyles.logInButton}>
        <Text style={headerStyles.logInText}>Log in</Text>
      </Pressable>
    </View>
  );
}

const headerStyles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  signUpButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
  },
  signUpText: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.dark.text,
  },
  logInButton: {
    backgroundColor: Colors.dark.brand,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.xl,
  },
  logInText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
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
          headerRight: () => <HeaderAuthButtons />,
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
