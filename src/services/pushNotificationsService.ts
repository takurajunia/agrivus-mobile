import { Alert, Linking, Platform } from "react-native";
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

const ensureAndroidChannel = async () => {
  if (Platform.OS !== "android") return;
  await Notifications.setNotificationChannelAsync("default", {
    name: "Default",
    importance: Notifications.AndroidImportance.MAX,
    sound: "default",
    vibrationPattern: [0, 250, 250, 250],
    lightColor: "#2E7D32",
  });
};

/**
 * Requests OS notification permission (shows the native system prompt if
 * status is still undetermined) and, if granted, fetches the Expo push
 * token. Does not show any custom UI of its own — callers decide when it's
 * appropriate to trigger the system prompt.
 */
export const registerForPushNotificationsAsync = async (): Promise<
  string | null
> => {
  if (Platform.OS === "web") {
    // Expo push tokens require a native device; the web build has no FCM/APNs
    // registration to hand back.
    return null;
  }

  if (!Device.isDevice) {
    // Push tokens aren't available on simulators/emulators.
    return null;
  }

  await ensureAndroidChannel();

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

const completeRegistration = async (token: string): Promise<void> => {
  await registerPushToken(token);
  await AsyncStorage.setItem(PUSH_TOKEN_STORAGE_KEY, token);
};

/**
 * Silently (re-)registers the push token, but ONLY if permission was
 * already granted previously — never triggers the OS permission prompt.
 * Safe to call on every login/app-restore: covers the case where the Expo
 * push token rotated, without ever surprising an already-decided user with
 * an unexplained system popup.
 */
export const setupPushNotifications = async (): Promise<void> => {
  try {
    if (!Device.isDevice) return;
    const { status } = await Notifications.getPermissionsAsync();
    if (status !== "granted") return;

    const token = await registerForPushNotificationsAsync();
    if (token) {
      await completeRegistration(token);
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

/**
 * The actual "ask the user" moment — call this once when the app opens
 * (e.g. Home screen mount). Shows nothing if permission is already granted.
 * If the user has never been asked, shows a friendly explainer before the
 * system prompt. If they previously said no, the OS won't show its own
 * dialog again on request — so this offers a path to Settings instead.
 */
export const promptForPushPermissionIfNeeded = async (): Promise<void> => {
  // Alert is a no-op on react-native-web, so the explainer would never render
  // and there is no push token to fetch anyway.
  if (Platform.OS === "web") return;
  if (!Device.isDevice) return;

  try {
    await ensureAndroidChannel();
    const { status, canAskAgain } = await Notifications.getPermissionsAsync();

    if (status === "granted") {
      return; // Already granted — nothing to ask.
    }

    if (status === "denied" && !canAskAgain) {
      Alert.alert(
        "Notifications are off",
        "Turn on notifications in Settings to get alerts for new messages, order updates, and more — even when the app is closed.",
        [
          { text: "Not Now", style: "cancel" },
          { text: "Open Settings", onPress: () => Linking.openSettings() },
        ],
      );
      return;
    }

    Alert.alert(
      "Enable Notifications?",
      "Get notified about new messages, order updates, and more — even when the app is closed.",
      [
        { text: "Not Now", style: "cancel" },
        {
          text: "Enable",
          onPress: async () => {
            const token = await registerForPushNotificationsAsync();
            if (token) {
              await completeRegistration(token);
            }
          },
        },
      ],
    );
  } catch (error) {
    console.error("Push notification permission prompt failed:", error);
  }
};
