import { useEffect, useRef } from "react";
import { Platform } from "react-native";
import * as Haptics from "expo-haptics";

const SHAKE_THRESHOLD = 1.8;
const COOLDOWN_MS = 1000;

/**
 * Detects a shake gesture and invokes the callback.
 * Only active when `enabled` is true (i.e., there's something to undo).
 */
export default function useShakeUndo(
  onShake: (() => void) | undefined,
  enabled: boolean,
) {
  const lastShake = useRef(0);
  const onShakeRef = useRef(onShake);
  onShakeRef.current = onShake;

  useEffect(() => {
    if (!enabled || Platform.OS === "web") {
      return;
    }

    let subscription: { remove: () => void } | null = null;
    let cancelled = false;

    // Lazy import to avoid loading the native expo-sensors module at
    // the top level — the module includes Pedometer which may not be
    // available in dev client builds without a native rebuild.
    import("expo-sensors")
      .then(({ Accelerometer }) => {
        if (cancelled) {return;}

        Accelerometer.setUpdateInterval(100);

        subscription = Accelerometer.addListener(({ x, y, z }) => {
          const magnitude = Math.sqrt(x * x + y * y + z * z);
          if (magnitude > SHAKE_THRESHOLD) {
            const now = Date.now();
            if (now - lastShake.current > COOLDOWN_MS) {
              lastShake.current = now;
              Haptics.notificationAsync(
                Haptics.NotificationFeedbackType.Success,
              ).catch(() => {});
              onShakeRef.current?.();
            }
          }
        });
      })
      .catch(() => {
        // Native module not available (dev client without rebuild)
      });

    return () => {
      cancelled = true;
      subscription?.remove();
    };
  }, [enabled]);
}
