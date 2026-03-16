/**
 * API Configuration with automatic BASE_URL detection for Expo
 * Works on: Android emulator, iOS simulator, and physical devices
 */
import Constants from "expo-constants";
import { Platform } from "react-native";

function metroHost(): string | null {
    // hostUri is like "192.168.0.10:8081" when running on physical device
    const hostUri = Constants.expoConfig?.hostUri;
    const host = hostUri?.split(":")[0];
    return host ?? null;
}

function getDevBaseUrl(): string {
    // Android emulator uses 10.0.2.2 to reach host machine
    if (Platform.OS === "android") {
        return "http://10.0.2.2:5001/api";
    }

    // Physical device or iOS: try to get Metro host IP
    const host = metroHost();
    if (host) {
        return `http://${host}:5001/api`;
    }

    // Fallback for iOS simulator
    return "http://localhost:5001/api";
}

export const API_CONFIG = {
    // Production server:
    // BASE_URL: "http://34.162.38.179/api",
    // Local development server (porta 5001):
    BASE_URL: __DEV__ ? getDevBaseUrl() : "http://34.162.38.179/api",
    TIMEOUT: 10000,
};

// Debug: log the BASE_URL on startup
if (__DEV__) {
    console.log("[API] BASE_URL:", API_CONFIG.BASE_URL);
}
