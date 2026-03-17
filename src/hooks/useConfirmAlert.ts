import { useCallback } from "react";
import { Alert } from "react-native";

interface ConfirmAlertOptions {
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
}

/** Shows a confirmation alert with Cancel and a destructive action button. */
export default function useConfirmAlert() {
  return useCallback(
    ({
      title,
      message,
      confirmLabel = "Remove all",
      onConfirm,
    }: ConfirmAlertOptions) => {
      Alert.alert(title, message, [
        { text: "Cancel", style: "cancel" },
        { text: confirmLabel, style: "destructive", onPress: onConfirm },
      ]);
    },
    [],
  );
}
