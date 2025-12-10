import React from "react";
import { Pressable, StyleSheet } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import DiscoverScreen from "@/screens/DiscoverScreen";
import EventDetailsScreen from "@/screens/EventDetailsScreen";
import { useScreenOptions } from "@/hooks/useScreenOptions";
import { Colors, Spacing } from "@/constants/theme";

export type DiscoverStackParamList = {
  Discover: undefined;
  EventDetails: { eventId: string };
};

const Stack = createNativeStackNavigator<DiscoverStackParamList>();

function HeaderMenuButton() {
  return (
    <Pressable style={headerStyles.iconButton} hitSlop={8}>
      <Feather name="menu" size={22} color={Colors.dark.text} />
    </Pressable>
  );
}

function HeaderBellButton() {
  return (
    <Pressable style={headerStyles.iconButton} hitSlop={8}>
      <Feather name="bell" size={22} color={Colors.dark.text} />
    </Pressable>
  );
}

const headerStyles = StyleSheet.create({
  iconButton: {
    padding: Spacing.xs,
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
          headerLeft: () => <HeaderMenuButton />,
          headerRight: () => <HeaderBellButton />,
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
