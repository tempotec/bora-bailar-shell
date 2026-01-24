import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import ExplorarScreen from "@/screens/ExplorarScreen";
import EventDetailsScreen from "@/screens/EventDetailsScreen";
import { useScreenOptions } from "@/hooks/useScreenOptions";

export type MyEventsStackParamList = {
  MyEvents: undefined;
  EventDetails: { eventId: string };
};

const Stack = createNativeStackNavigator<MyEventsStackParamList>();

export default function MyEventsStackNavigator() {
  const screenOptions = useScreenOptions();

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name="MyEvents"
        component={ExplorarScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="EventDetails"
        component={EventDetailsScreen}
        options={{
          headerTitle: "",
        }}
      />
    </Stack.Navigator>
  );
}
