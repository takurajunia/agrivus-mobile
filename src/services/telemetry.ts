import * as Sentry from "@sentry/react-native";
import NetInfo from "@react-native-community/netinfo";
import Constants from "expo-constants";
import type { AxiosError } from "axios";

/**
 * Error reporting.
 *
 * The DSN comes from the environment so that nothing is hard-coded and the SDK
 * stays completely inert until one is configured — local builds and CI need no
 * setup. EXPO_PUBLIC_* variables are inlined at build time by Expo.
 */
const dsn =
  process.env.EXPO_PUBLIC_SENTRY_DSN ||
  (Constants.expoConfig?.extra as { sentryDsn?: string } | undefined)?.sentryDsn;

export const isTelemetryEnabled = (): boolean => !!dsn;

export const initTelemetry = (): void => {
  if (!dsn) return;

  Sentry.init({
    dsn,
    environment: __DEV__ ? "development" : "production",
    release: Constants.expoConfig?.version,

    // Errors are always sent; traces are sampled because they are billed by
    // volume.
    tracesSampleRate: 0.1,

    // This app handles wallets, payments and personal details, so never let
    // the SDK attach user identifiers or request contents on its own.
    sendDefaultPii: false,

    beforeBreadcrumb(breadcrumb) {
      // Network breadcrumbs are the useful ones here, but drop anything that
      // could carry a bearer token.
      if (breadcrumb.data && typeof breadcrumb.data === "object") {
        const data = breadcrumb.data as Record<string, unknown>;
        delete data.Authorization;
        delete data.authorization;
      }
      return breadcrumb;
    },
  });
};

/**
 * A snapshot of the device's connectivity at the moment a request failed.
 *
 * This is the detail that separates the failure modes that otherwise look
 * identical from the server's side: a user with no signal, a user on a working
 * connection who cannot reach us, and a user on a 2G link slow enough to time
 * out. Without it, every one of them is just "a request failed".
 */
export interface ConnectivitySnapshot {
  offline: boolean;
  isConnected: boolean | null;
  isInternetReachable: boolean | null;
  connectionType: string | null;
  cellularGeneration: string | null;
}

export const getConnectivitySnapshot =
  async (): Promise<ConnectivitySnapshot> => {
    try {
      const state = await NetInfo.fetch();
      const cellularGeneration =
        state.type === "cellular"
          ? ((state.details as { cellularGeneration?: string | null } | null)
              ?.cellularGeneration ?? null)
          : null;

      // Only an explicit negative counts as offline: `isInternetReachable` is
      // null while NetInfo is still probing, and treating unknown as offline
      // would tell a connected user their connection is down.
      const offline =
        state.isInternetReachable === false || state.isConnected === false;

      return {
        offline,
        isConnected: state.isConnected,
        isInternetReachable: state.isInternetReachable,
        connectionType: state.type ?? null,
        cellularGeneration,
      };
    } catch {
      return {
        offline: false,
        isConnected: null,
        isInternetReachable: null,
        connectionType: null,
        cellularGeneration: null,
      };
    }
  };

/**
 * Report a request that failed in a way the user actually saw, after retries
 * were exhausted.
 *
 * Deliberately not reported: 4xx responses, which are ordinary validation and
 * permission outcomes rather than faults, and 401, which the app already
 * handles by re-authenticating.
 */
export const captureApiFailure = (
  error: AxiosError,
  snapshot: ConnectivitySnapshot,
  attempts: number,
): void => {
  if (!dsn) return;

  const status = error.response?.status;
  if (status && status < 500) return;

  const method = error.config?.method?.toUpperCase() ?? "UNKNOWN";
  const url = error.config?.url ?? "unknown";

  const kind = status
    ? `http_${status}`
    : snapshot.offline
      ? "device_offline"
      : error.code === "ECONNABORTED"
        ? "timeout"
        : "unreachable";

  Sentry.withScope((scope) => {
    scope.setTag("api.kind", kind);
    scope.setTag("api.endpoint", `${method} ${url}`);
    scope.setTag("net.type", snapshot.connectionType ?? "unknown");
    if (snapshot.cellularGeneration) {
      scope.setTag("net.cellular", snapshot.cellularGeneration);
    }
    scope.setContext("request", {
      method,
      url,
      status: status ?? null,
      code: error.code ?? null,
      attempts,
    });
    scope.setContext("connectivity", { ...snapshot });

    // Group by endpoint and failure kind rather than by message, so the three
    // causes stay separable in the issue list instead of collapsing into one.
    scope.setFingerprint(["api-failure", kind, method, url]);

    Sentry.captureException(error);
  });
};
