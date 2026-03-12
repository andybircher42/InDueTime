import { useState } from "react";
import { ImageBackground, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";

import { HipaaAgreementModal, OnboardingOverlay } from "@/components";
import {
  acceptAgreement,
  checkAgreement,
  checkOnboardingComplete,
} from "@/storage";
import { useTheme } from "@/theme";

import splashBgDark from "../assets/splash-bg-dark.png";
import splashBgLight from "../assets/splash-bg-light.png";

type Step = "loading" | "hipaa" | "onboarding" | "done";

/** Welcome screen handling HIPAA agreement and onboarding flow. */
export default function WelcomeScreen() {
  const { resolvedTheme } = useTheme();
  const router = useRouter();
  const [step, setStep] = useState<Step>("loading");

  const isDark = resolvedTheme === "dark";
  const splashBg = isDark ? splashBgDark : splashBgLight;

  // Determine starting step on mount
  if (step === "loading") {
    Promise.all([checkAgreement(), checkOnboardingComplete()])
      .then(([accepted, onboardingDone]) => {
        if (!accepted) {
          setStep("hipaa");
        } else if (!onboardingDone) {
          setStep("onboarding");
        } else {
          router.replace("/");
        }
      })
      .catch(() => setStep("hipaa"));
  }

  const handleAcceptAgreement = () => {
    acceptAgreement()
      .then(() => setStep("onboarding"))
      .catch((e) => console.error("Failed to save agreement", e));
  };

  const handleOnboardingComplete = () => {
    setStep("done");
    router.replace("/");
  };

  return (
    <ImageBackground
      source={splashBg}
      resizeMode="cover"
      style={styles.container}
    >
      <HipaaAgreementModal
        visible={step === "hipaa"}
        onAccept={handleAcceptAgreement}
      />
      <OnboardingOverlay
        visible={step === "onboarding"}
        onComplete={handleOnboardingComplete}
      />
      <StatusBar style="auto" />
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
