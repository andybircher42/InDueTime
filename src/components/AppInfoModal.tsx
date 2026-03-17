import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Linking,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import Constants from "expo-constants";

import { checkTesterMode, toggleTesterMode } from "@/storage";

let Updates: { updateId: string | null; isEmbeddedLaunch: boolean } | undefined;
if (!__DEV__) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    Updates = require("expo-updates");
  } catch {
    // Not available in Expo Go
  }
}

import { ColorTokens, useTheme } from "@/theme";

const BUG_REPORT_BASE_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLSd3VdvE17NHIR7qQD8Ams10nBgAgf1n0JQ1mvWUUFKf7C3Z-w/viewform";

/** Builds the bug report URL with app version and OS version pre-filled. */
function buildBugReportUrl(): string {
  const version = Constants.expoConfig?.version ?? "unknown";
  const buildId = (Constants.expoConfig?.extra?.easBuildId as string) || "";
  const updateId = Updates?.updateId ?? null;

  let appVersion =
    buildId !== "" ? `${version} (${buildId.slice(0, 8)})` : version;
  if (updateId != null) {
    appVersion += ` update:${updateId.slice(0, 8)}`;
  }

  const osName = Platform.OS === "ios" ? "iOS" : "Android";
  const osVersion = `${osName} ${Platform.Version}`;

  const params = new URLSearchParams({
    "entry.1845428880": appVersion,
    "entry.765646897": osVersion,
  });
  return `${BUG_REPORT_BASE_URL}?${params.toString()}`;
}

const FEATURE_REQUEST_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLSeLS03h_8s3t0-IYXM04UjVv2fAhH37i2n56fPHB83OuHaQhw/viewform";
const USER_GUIDE_URL = "https://andybircher42.github.io/InDueTime/guide/";
const USER_GUIDE_FALLBACK_URL =
  "https://github.com/andybircher42/InDueTime/blob/main/docs/user-guide.md";

/** Opens the hosted user guide, falling back to GitHub if it 404s. */
async function openUserGuide(): Promise<void> {
  try {
    const res = await fetch(USER_GUIDE_URL, { method: "HEAD" });
    if (res.ok) {
      await Linking.openURL(USER_GUIDE_URL);
      return;
    }
  } catch {
    // Network error — fall through to fallback
  }
  await Linking.openURL(USER_GUIDE_FALLBACK_URL);
}

interface AppInfoModalProps {
  visible: boolean;
  onClose: () => void;
}

/** Centered overlay modal that displays basic app information (name and version). */
export default function AppInfoModal({ visible, onClose }: AppInfoModalProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [isTester, setIsTester] = useState(false);

  useEffect(() => {
    if (visible) {
      checkTesterMode()
        .then(setIsTester)
        .catch(() => {});
    }
  }, [visible]);

  const handleToggleTester = useCallback(() => {
    toggleTesterMode()
      .then((next) => {
        setIsTester(next);
        Alert.alert(
          next ? "Tester mode enabled" : "Tester mode disabled",
          next
            ? "Analytics registration will be skipped on next launch."
            : "Analytics registration will resume on next launch.",
        );
      })
      .catch(() => {});
  }, []);

  const appName = Constants.expoConfig?.name ?? "in due time";
  const appVersion = Constants.expoConfig?.version ?? "unknown";
  const buildId = (Constants.expoConfig?.extra?.easBuildId as string) || "";

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay} accessibilityViewIsModal>
        <View style={styles.modalContent}>
          <Pressable
            onLongPress={handleToggleTester}
            accessibilityLabel="About, long press to toggle tester mode"
          >
            <Text style={styles.modalTitle}>
              About{isTester ? " (tester)" : ""}
            </Text>
          </Pressable>
          <Text style={styles.appName}>{appName}</Text>
          <Text style={styles.versionText}>Version {appVersion}</Text>
          {__DEV__ && <Text style={styles.devBadge}>Development Build</Text>}
          {buildId !== "" && (
            <Pressable
              style={styles.copyRow}
              onPress={() => Clipboard.setStringAsync(buildId)}
              accessibilityLabel="Copy build ID"
              accessibilityRole="button"
            >
              <Text style={styles.detailText}>
                Build: {buildId.slice(0, 8)}…
              </Text>
              <Ionicons
                name="copy-outline"
                size={12}
                color={colors.textTertiary}
              />
            </Pressable>
          )}
          {Updates?.updateId != null && !Updates?.isEmbeddedLaunch && (
            <Pressable
              style={styles.copyRow}
              onPress={() => Clipboard.setStringAsync(Updates!.updateId!)}
              accessibilityLabel="Copy update ID"
              accessibilityRole="button"
            >
              <Text style={styles.detailText}>
                Update: {Updates.updateId.slice(0, 8)}…
              </Text>
              <Ionicons
                name="copy-outline"
                size={12}
                color={colors.textTertiary}
              />
            </Pressable>
          )}
          <Pressable
            style={styles.copyRow}
            onPress={() =>
              Clipboard.setStringAsync(
                `${Platform.OS === "ios" ? "iOS" : "Android"} ${Platform.Version}`,
              )
            }
            accessibilityLabel="Copy platform version"
            accessibilityRole="button"
          >
            <Text style={styles.detailText}>
              {Platform.OS === "ios" ? "iOS" : "Android"} version:{" "}
              {Platform.Version}
            </Text>
            <Ionicons
              name="copy-outline"
              size={12}
              color={colors.textTertiary}
            />
          </Pressable>
          <View style={styles.supportSection}>
            <Pressable
              style={styles.supportRow}
              onPress={() => openUserGuide()}
              accessibilityRole="button"
              accessibilityLabel="Help and FAQ"
            >
              <Ionicons
                name="help-circle-outline"
                size={20}
                color={colors.textPrimary}
                style={styles.supportIcon}
              />
              <Text style={styles.supportLabel}>Help & FAQ</Text>
              <Ionicons
                name="open-outline"
                size={14}
                color={colors.textTertiary}
              />
            </Pressable>
            <Pressable
              style={styles.supportRow}
              onPress={() => Linking.openURL(buildBugReportUrl())}
              accessibilityRole="button"
              accessibilityLabel="Report a Bug"
            >
              <Ionicons
                name="bug-outline"
                size={20}
                color={colors.textPrimary}
                style={styles.supportIcon}
              />
              <Text style={styles.supportLabel}>Report a Bug</Text>
              <Ionicons
                name="open-outline"
                size={14}
                color={colors.textTertiary}
              />
            </Pressable>
            <Pressable
              style={styles.supportRow}
              onPress={() => Linking.openURL(FEATURE_REQUEST_URL)}
              accessibilityRole="button"
              accessibilityLabel="Request a Feature"
            >
              <Ionicons
                name="bulb-outline"
                size={20}
                color={colors.textPrimary}
                style={styles.supportIcon}
              />
              <Text style={styles.supportLabel}>Request a Feature</Text>
              <Ionicons
                name="open-outline"
                size={14}
                color={colors.textTertiary}
              />
            </Pressable>
          </View>
          <Pressable
            style={styles.closeButton}
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="Close"
          >
            <Text style={styles.closeButtonText}>Close</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

/** Creates styles based on the active color palette. */
function createStyles(colors: ColorTokens) {
  return StyleSheet.create({
    modalOverlay: {
      flex: 1,
      backgroundColor: colors.modalOverlay,
      justifyContent: "center",
      alignItems: "center",
      padding: 24,
    },
    modalContent: {
      backgroundColor: colors.contentBackground,
      borderRadius: 16,
      padding: 24,
      width: "100%",
      alignItems: "center",
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: "700",
      color: colors.textPrimary,
      marginBottom: 16,
      textAlign: "center",
    },
    appName: {
      fontSize: 18,
      fontWeight: "600",
      color: colors.textPrimary,
      marginBottom: 8,
    },
    versionText: {
      fontSize: 15,
      color: colors.textModal,
      marginBottom: 4,
    },
    devBadge: {
      fontSize: 12,
      color: colors.destructive,
      fontWeight: "600",
      marginBottom: 4,
    },
    copyRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      minHeight: 44,
    },
    detailText: {
      fontSize: 14,
      color: colors.textTertiary,
      marginBottom: 4,
    },
    lastDetail: {
      marginBottom: 8,
    },
    supportSection: {
      width: "100%",
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: colors.border,
      paddingTop: 8,
      marginBottom: 16,
    },
    supportRow: {
      flexDirection: "row",
      alignItems: "center",
      minHeight: 44,
    },
    supportIcon: {
      marginRight: 12,
    },
    supportLabel: {
      flex: 1,
      fontSize: 15,
      color: colors.textPrimary,
    },
    closeButton: {
      backgroundColor: colors.primary,
      borderRadius: 8,
      padding: 14,
      alignItems: "center",
      width: "100%",
    },
    closeButtonText: {
      color: colors.white,
      fontSize: 16,
      fontWeight: "600",
    },
  });
}
