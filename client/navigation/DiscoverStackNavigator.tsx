import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import DiscoverScreen from "@/screens/DiscoverScreen";
import EventDetailsScreen from "@/screens/EventDetailsScreen";
import { HeaderTitle } from "@/components/HeaderTitle";
import { useScreenOptions } from "@/hooks/useScreenOptions";

export type DiscoverStackParamList = {
  Discover: undefined;
  EventDetails: { eventId: string };
};

const Stack = createNativeStackNavigator<DiscoverStackParamList>();

export default function DiscoverStackNavigator() {
  const screenOptions = useScreenOptions();

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name="Discover"
        component={DiscoverScreen}
        options={{
          headerTitle: () => <HeaderTitle title="BoraBailar" />,
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
