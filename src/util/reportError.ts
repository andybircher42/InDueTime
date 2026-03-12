import { Alert } from "react-native";

/** Reports an error visibly in production (Alert) or to console in dev. */
export function reportError(context: string, error: unknown): void {
  const message =
    error instanceof Error ? error.message : String(error ?? "Unknown error");

  if (__DEV__) {
    console.error(context, error);
  } else {
    Alert.alert(context, message);
  }
}
