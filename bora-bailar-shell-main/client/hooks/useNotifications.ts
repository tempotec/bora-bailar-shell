import { useState, useEffect, useRef } from "react";
import { Platform } from "react-native";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import Constants from "expo-constants";

// Configure how notifications appear when the app is in the foreground
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

const API_BASE = process.env.EXPO_PUBLIC_DOMAIN || "http://localhost:8081";

async function registerForPushNotificationsAsync(): Promise<string | null> {
    // Push notifications only work on physical devices
    if (!Device.isDevice) {
        console.log("[PUSH] Must use physical device for push notifications");
        return null;
    }

    // Check existing permissions
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    // Request permission if not already granted
    if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
    }

    if (finalStatus !== "granted") {
        console.log("[PUSH] Permission not granted");
        return null;
    }

    // Set up Android notification channel
    if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync("default", {
            name: "BoraBailar",
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: "#C41E3A",
        });
    }

    // Get Expo push token
    try {
        const projectId = Constants.expoConfig?.extra?.eas?.projectId;
        const tokenData = await Notifications.getExpoPushTokenAsync({
            projectId,
        });
        return tokenData.data;
    } catch (error) {
        console.error("[PUSH] Error getting push token:", error);
        return null;
    }
}

export function useNotifications() {
    const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
    const [notification, setNotification] = useState<Notifications.Notification | null>(null);
    const notificationListener = useRef<Notifications.EventSubscription | null>(null);
    const responseListener = useRef<Notifications.EventSubscription | null>(null);

    useEffect(() => {
        // Register for push notifications
        registerForPushNotificationsAsync().then(async (token) => {
            if (token) {
                setExpoPushToken(token);
                console.log("[PUSH] Expo Push Token:", token);

                // Send token to backend
                try {
                    await fetch(`${API_BASE}/api/push-token`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ token }),
                    });
                    console.log("[PUSH] Token registered with backend");
                } catch (err) {
                    console.error("[PUSH] Failed to register token with backend:", err);
                }
            }
        });

        // Listener for when a notification is received while app is in foreground
        notificationListener.current = Notifications.addNotificationReceivedListener(
            (notification) => {
                setNotification(notification);
                console.log("[PUSH] Notification received:", notification.request.content.title);
            }
        );

        // Listener for when user taps on a notification
        responseListener.current = Notifications.addNotificationResponseReceivedListener(
            (response) => {
                const data = response.notification.request.content.data;
                console.log("[PUSH] Notification tapped, data:", data);
                // Future: navigate to specific screen based on data
                // e.g., if (data.eventId) navigation.navigate("EventDetails", { id: data.eventId });
            }
        );

        return () => {
            if (notificationListener.current) {
                notificationListener.current.remove();
            }
            if (responseListener.current) {
                responseListener.current.remove();
            }
        };
    }, []);

    return { expoPushToken, notification };
}
