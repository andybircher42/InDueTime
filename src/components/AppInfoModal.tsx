import { useMemo } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import Constants from "expo-constants";

import { ColorTokens, useTheme } from "@/theme";

interface AppInfoModalProps {
  visible: boolean;
  onClose: () => void;
}

/** Centered overlay modal that displays basic app information (name and version). */
export default function AppInfoModal({ visible, onClose }: AppInfoModalProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

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
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>About</Text>
          <Text style={styles.appName}>{appName}</Text>
          <Text style={styles.versionText}>Version {appVersion}</Text>
          <Text style={styles.buildText}>Build {buildId.slice(0, 8)}</Text>
          <Pressable
            style={styles.closeButton}
            onPress={onClose}
            accessibilityRole="button"
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
    buildText: {
      fontSize: 13,
      color: colors.textTertiary,
      marginBottom: 20,
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
