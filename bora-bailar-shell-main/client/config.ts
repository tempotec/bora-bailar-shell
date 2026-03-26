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
    // If EXPO_PUBLIC_DOMAIN is set (e.g. in .env), use it directly
    const domain = process.env.EXPO_PUBLIC_DOMAIN;

    // Web: use localhost directly (browser can reach localhost, not network IP)
    if (Platform.OS === "web") {
        return "http://localhost:5000/api";
    }

    if (domain) {
        return `http://${domain}/api`;
    }

    // Android emulator uses 10.0.2.2 to reach host machine
    if (Platform.OS === "android") {
        return "http://10.0.2.2:5000/api";
    }

    // Physical device or iOS: try to get Metro host IP
    const host = metroHost();
    if (host) {
        return `http://${host}:5000/api`;
    }

    // Fallback for iOS simulator
    return "http://localhost:5000/api";
}

export const API_CONFIG = {
    // Em dev: auto-detecta IP da máquina local (via EXPO_PUBLIC_DOMAIN ou Metro)
    // Em prod: usa EXPO_PUBLIC_DOMAIN do .env.production
    BASE_URL: __DEV__
        ? getDevBaseUrl()
        : `http://${process.env.EXPO_PUBLIC_DOMAIN || "34.162.38.179"}/api`,
    TIMEOUT: 10000,
};

// Log de startup — mostra qual API está sendo usada
if (__DEV__) {
    console.log("[API] BASE_URL:", API_CONFIG.BASE_URL);
    console.log("[API] Ambiente: DESENVOLVIMENTO");
} else {
    console.log("[API] BASE_URL:", API_CONFIG.BASE_URL);
    console.log("[API] Ambiente: PRODUÇÃO");
}
