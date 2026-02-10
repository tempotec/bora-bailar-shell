/**
 * Secure Token Storage using expo-secure-store
 * Never store tokens in AsyncStorage (less secure)
 */
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const TOKEN_KEY = "bb_auth_token";

// SecureStore doesn't work on web, fallback to localStorage
const isWeb = Platform.OS === "web";

export const tokenStore = {
    get: async (): Promise<string | null> => {
        if (isWeb) {
            return localStorage.getItem(TOKEN_KEY);
        }
        return SecureStore.getItemAsync(TOKEN_KEY);
    },

    set: async (token: string): Promise<void> => {
        if (isWeb) {
            localStorage.setItem(TOKEN_KEY, token);
            return;
        }
        await SecureStore.setItemAsync(TOKEN_KEY, token);
    },

    clear: async (): Promise<void> => {
        if (isWeb) {
            localStorage.removeItem(TOKEN_KEY);
            return;
        }
        await SecureStore.deleteItemAsync(TOKEN_KEY);
    },
};
