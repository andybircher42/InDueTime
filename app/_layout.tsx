import { useCallback, useEffect, useRef, useState } from "react";
import { Image, ImageBackground, StyleSheet } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Slot, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as Updates from "expo-updates";

import { useThemePreference } from "@/hooks";
import {
  checkAgreement,
  checkOnboardingComplete,
  getOrCreateDeviceId,
} from "@/storage";
import { ThemeProvider, useTheme } from "@/theme";

import splashBgDark from "../assets/splash-bg-dark.png";
import splashBgLight from "../assets/splash-bg-light.png";
import splashLogoLight from "../assets/splash-icon.png";
import splashLogoDark from "../assets/splash-icon-dark.png";

const SPLASH_DURATION_MS = 2000;

if (!__DEV__) {
  void import("vexo-analytics").then(({ vexo }) =>
    vexo("5febe5d7-f01f-4716-ba33-d3c0b33794c8"),
  );
}

/** Root layout that wraps all routes with providers. */
export default function RootLayout() {
  const {
    personality,
    brightness,
    setPersonality,
    setBrightness,
    loadThemePreference,
  } = useThemePreference();

  return (
    <SafeAreaProvider>
      <ThemeProvider
        personality={personality}
        brightness={brightness}
        setPersonality={setPersonality}
        setBrightness={setBrightness}
      >
        <RootGate loadThemePreference={loadThemePreference} />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

interface RootGateProps {
  loadThemePreference: () => Promise<void>;
}

/** Handles initialization, splash screen, and routing to welcome or home. */
function RootGate({ loadThemePreference }: RootGateProps) {
  const { resolvedTheme } = useTheme();
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const isLoadingRef = useRef(true);

  const isDark = resolvedTheme === "dark";
  const splashLogo = isDark ? splashLogoDark : splashLogoLight;
  const splashBg = isDark ? splashBgDark : splashBgLight;

  const finishSplash = useCallback(() => {
    isLoadingRef.current = false;
    setReady(true);
  }, []);

  useEffect(() => {
    let mounted = true;

    async function init() {
      const [accepted, , , deviceId, onboardingDone] = await Promise.all([
        checkAgreement().catch((e) => {
          console.error("Failed to check agreement", e);
          return false;
        }),
        loadThemePreference().catch((e) =>
          console.error("Failed to load theme preference", e),
        ),
        // Placeholder for entry loading — done in home screen
        Promise.resolve(),
        getOrCreateDeviceId().catch((e) => {
          console.error("Failed to get device ID", e);
          return undefined;
        }),
        checkOnboardingComplete().catch((e) => {
          console.error("Failed to check onboarding", e);
          return false;
        }),
      ]);

      if (!mounted) {
        return;
      }

      const needsWelcome = !accepted || !onboardingDone;

      if (needsWelcome) {
        // Go straight to welcome — no splash delay
        setReady(true);
        setTimeout(() => {
          if (mounted) {
            router.replace("/welcome");
          }
        }, 0);
      } else {
        // Returning user — show splash then go to home
        setTimeout(() => {
          if (mounted) {
            finishSplash();
          }
        }, SPLASH_DURATION_MS);
      }

      if (!__DEV__) {
        if (deviceId) {
          void import("vexo-analytics").then(({ identifyDevice }) =>
            identifyDevice(deviceId),
          );
        }
        Updates.checkForUpdateAsync()
          .then(async (update) => {
            if (update.isAvailable) {
              await Updates.fetchUpdateAsync();
              if (isLoadingRef.current) {
                await Updates.reloadAsync();
              }
            }
          })
          .catch((e) => console.error("Failed to check for updates", e));
      }
    }

    void init();

    return () => {
      mounted = false;
    };
  }, [loadThemePreference, router, finishSplash]);

  if (!ready) {
    return (
      <ImageBackground
        source={splashBg}
        resizeMode="cover"
        style={styles.splashContainer}
        testID="splash-bg"
      >
        <Image
          source={splashLogo}
          style={styles.splashLogo}
          resizeMode="contain"
          testID="splash-logo"
        />
        <StatusBar style="auto" />
      </ImageBackground>
    );
  }

  return <Slot />;
}

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  splashLogo: {
    width: "70%",
    maxWidth: 320,
    aspectRatio: 280 / 160,
  },
});
