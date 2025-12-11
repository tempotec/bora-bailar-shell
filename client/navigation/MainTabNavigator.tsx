import React from "react";
import { View, StyleSheet, Pressable, Platform } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { Feather } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  useAnimatedStyle,
  withSpring,
  interpolate,
  Extrapolation,
} from "react-native-reanimated";

import DiscoverStackNavigator from "@/navigation/DiscoverStackNavigator";
import MyEventsStackNavigator from "@/navigation/MyEventsStackNavigator";
import MessagesStackNavigator from "@/navigation/MessagesStackNavigator";
import ProfileStackNavigator from "@/navigation/ProfileStackNavigator";
import { useTabBar } from "@/contexts/TabBarContext";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";

export type MainTabParamList = {
  DiscoverTab: undefined;
  MyEventsTab: undefined;
  MessagesTab: undefined;
  ProfileTab: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

const TAB_BAR_HEIGHT = 60;

function AnimatedTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const { isTabBarVisible } = useTabBar();

  const animatedStyle = useAnimatedStyle(() => {
    const translateY = interpolate(
      isTabBarVisible.value ? 1 : 0,
      [0, 1],
      [TAB_BAR_HEIGHT + insets.bottom + 20, 0],
      Extrapolation.CLAMP
    );

    return {
      transform: [
        {
          translateY: withSpring(translateY, {
            damping: 20,
            stiffness: 150,
            mass: 0.5,
          }),
        },
      ],
    };
  });

  const tabBarStyle = {
    paddingBottom: insets.bottom,
    height: TAB_BAR_HEIGHT + insets.bottom,
  };

  return (
    <Animated.View style={[styles.tabBarContainer, tabBarStyle, animatedStyle]}>
      {Platform.OS === "ios" ? (
        <BlurView
          intensity={80}
          tint="light"
          style={StyleSheet.absoluteFill}
        />
      ) : (
        <View style={[StyleSheet.absoluteFill, styles.androidBackground]} />
      )}
      <View style={styles.tabBarContent}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: "tabLongPress",
              target: route.key,
            });
          };

          let iconName: keyof typeof Feather.glyphMap = "home";
          switch (route.name) {
            case "DiscoverTab":
              iconName = "home";
              break;
            case "MyEventsTab":
              iconName = "compass";
              break;
            case "MessagesTab":
              iconName = "heart";
              break;
            case "ProfileTab":
              iconName = "user";
              break;
          }

          const color = isFocused
            ? Colors.dark.primary
            : Colors.dark.textSecondary;

          return (
            <Pressable
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              onPress={onPress}
              onLongPress={onLongPress}
              style={styles.tabButton}
              hitSlop={8}
            >
              <View style={styles.iconContainer}>
                <Feather name={iconName} size={24} color={color} />
              </View>
            </Pressable>
          );
        })}
      </View>
    </Animated.View>
  );
}

export default function MainTabNavigator() {
  return (
    <View style={styles.container}>
      <Tab.Navigator
        initialRouteName="DiscoverTab"
        tabBar={(props) => <AnimatedTabBar {...props} />}
        screenOptions={{
          headerShown: false,
        }}
      >
        <Tab.Screen
          name="DiscoverTab"
          component={DiscoverStackNavigator}
          options={{
            title: "Descobrir",
          }}
        />
        <Tab.Screen
          name="MyEventsTab"
          component={MyEventsStackNavigator}
          options={{
            title: "Eventos",
          }}
        />
        <Tab.Screen
          name="MessagesTab"
          component={MessagesStackNavigator}
          options={{
            title: "Mensagens",
          }}
        />
        <Tab.Screen
          name="ProfileTab"
          component={ProfileStackNavigator}
          options={{
            title: "Perfil",
          }}
        />
      </Tab.Navigator>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabBarContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(0,0,0,0.1)",
    overflow: "hidden",
  },
  androidBackground: {
    backgroundColor: Colors.dark.backgroundRoot,
  },
  tabBarContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingHorizontal: Spacing.lg,
  },
  tabButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.sm,
  },
  iconContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
});
