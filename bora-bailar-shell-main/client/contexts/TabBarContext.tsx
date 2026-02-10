import React, { createContext, useContext, ReactNode } from "react";
import { useSharedValue, SharedValue } from "react-native-reanimated";

type TabBarContextType = {
  isTabBarVisible: SharedValue<boolean>;
};

const TabBarContext = createContext<TabBarContextType | null>(null);

export function TabBarProvider({ children }: { children: ReactNode }) {
  const isTabBarVisible = useSharedValue(true);

  return (
    <TabBarContext.Provider value={{ isTabBarVisible }}>
      {children}
    </TabBarContext.Provider>
  );
}

export function useTabBar() {
  const context = useContext(TabBarContext);
  if (!context) {
    return {
      isTabBarVisible: { value: true } as SharedValue<boolean>,
    };
  }
  return context;
}
