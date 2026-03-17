import React from "react";
import { StyleSheet, ActivityIndicator, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useFonts } from "expo-font";

import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/query-client";

import RootStackNavigator from "@/navigation/RootStackNavigator";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { TabBarProvider } from "@/contexts/TabBarContext";
import { AuthProvider } from "@/contexts/AuthContext";

export default function App() {
  const [fontsLoaded] = useFonts({
    Montserrat_400Regular: require("../assets/fonts/Montserrat_400Regular.ttf"),
    Montserrat_500Medium: require("../assets/fonts/Montserrat_500Medium.ttf"),
    Montserrat_600SemiBold: require("../assets/fonts/Montserrat_600SemiBold.ttf"),
    Montserrat_700Bold: require("../assets/fonts/Montserrat_700Bold.ttf"),
    Montserrat_400Regular_Italic: require("../assets/fonts/Montserrat_400Regular_Italic.ttf"),
  });

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#FFFFFF" }}>
        <ActivityIndicator size="large" color="#C41E3A" />
      </View>
    );
  }

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <SafeAreaProvider>
            <GestureHandlerRootView style={styles.root}>
              <KeyboardProvider>
                <TabBarProvider>
                  <NavigationContainer>
                    <RootStackNavigator />
                  </NavigationContainer>
                </TabBarProvider>
                <StatusBar style="dark" />
              </KeyboardProvider>
            </GestureHandlerRootView>
          </SafeAreaProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
