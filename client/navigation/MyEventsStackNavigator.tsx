import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import MyEventsScreen from "@/screens/MyEventsScreen";
import { useScreenOptions } from "@/hooks/useScreenOptions";

export type MyEventsStackParamList = {
  MyEvents: undefined;
};

const Stack = createNativeStackNavigator<MyEventsStackParamList>();

export default function MyEventsStackNavigator() {
  const screenOptions = useScreenOptions();

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name="MyEvents"
        component={MyEventsScreen}
        options={{
          headerTitle: "Meus Eventos",
        }}
      />
    </Stack.Navigator>
  );
}
