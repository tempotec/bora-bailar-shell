import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import MainTabNavigator from "@/navigation/MainTabNavigator";
import SignUpScreen from "@/screens/SignUpScreen";
import { useScreenOptions } from "@/hooks/useScreenOptions";

export type RootStackParamList = {
  Main: undefined;
  SignUp: undefined;
  Login: undefined;
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
    </Stack.Navigator>
  );
}
