import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import api from "./api";

const PUSH_TOKEN_STORAGE_KEY = "pushToken";

// Make foreground notifications show a banner + play a sound, same as when
// the app is backgrounded — otherwise iOS/Android suppress alerts while the
// app is open by default.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

const getProjectId = (): string | undefined => {
  return (
    Constants.expoConfig?.extra?.eas?.projectId ??
    Constants.easConfig?.projectId
  );
};

export const registerForPushNotificationsAsync = async (): Promise<
  string | null
> => {
  if (!Device.isDevice) {
    // Push tokens aren't available on simulators/emulators.
    return null;
  }

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "Default",
      importance: Notifications.AndroidImportance.MAX,
      sound: "default",
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#2E7D32",
    });
  }

  const existingStatus = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus.status;

  if (finalStatus !== "granted") {
    const requested = await Notifications.requestPermissionsAsync();
    finalStatus = requested.status;
  }

  if (finalStatus !== "granted") {
    return null;
  }

  const projectId = getProjectId();
  if (!projectId) {
    console.warn(
      "Push notifications: missing EAS projectId, cannot get push token.",
    );
    return null;
  }

  try {
    const tokenResponse = await Notifications.getExpoPushTokenAsync({
      projectId,
    });
    return tokenResponse.data;
  } catch (error) {
    console.error("Failed to get Expo push token:", error);
    return null;
  }
};

export const registerPushToken = async (token: string): Promise<void> => {
  await api.post("/push-tokens", {
    token,
    platform: Platform.OS === "ios" ? "ios" : "android",
  });
};

export const unregisterPushToken = async (token: string): Promise<void> => {
  await api.delete("/push-tokens", { data: { token } });
};

export const setupPushNotifications = async (): Promise<void> => {
  try {
    const token = await registerForPushNotificationsAsync();
    if (token) {
      await registerPushToken(token);
      await AsyncStorage.setItem(PUSH_TOKEN_STORAGE_KEY, token);
    }
  } catch (error) {
    console.error("Push notification setup failed:", error);
  }
};

export const teardownPushNotifications = async (): Promise<void> => {
  try {
    const token = await AsyncStorage.getItem(PUSH_TOKEN_STORAGE_KEY);
    if (token) {
      await unregisterPushToken(token);
    }
  } catch (error) {
    console.error("Push notification teardown failed:", error);
  } finally {
    await AsyncStorage.removeItem(PUSH_TOKEN_STORAGE_KEY);
  }
};
