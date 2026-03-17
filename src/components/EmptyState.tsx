import { useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { ColorTokens, useTheme } from "@/theme";
import { lineHeight } from "@/util";

interface EmptyStateProps {
  icon?: keyof typeof Ionicons.glyphMap;
  emoji?: string;
  title: string;
  subtitle: string;
  onPress?: () => void;
  accessibilityLabel?: string;
}

/** Centered empty state with icon/emoji, title, and subtitle. */
export default function EmptyState({
  icon,
  emoji,
  title,
  subtitle,
  onPress,
  accessibilityLabel,
}: EmptyStateProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const content = (
    <>
      {emoji ? (
        <Text style={styles.emoji}>{emoji}</Text>
      ) : icon ? (
        <Ionicons name={icon} size={48} color={colors.textTertiary} />
      ) : null}
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </>
  );

  if (onPress) {
    return (
      <Pressable
        style={styles.container}
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel ?? title}
      >
        {content}
      </Pressable>
    );
  }

  return <View style={styles.container}>{content}</View>;
}

function createStyles(colors: ColorTokens) {
  return StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: 32,
      gap: 8,
    },
    emoji: {
      fontSize: 48,
    },
    title: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.textPrimary,
    },
    subtitle: {
      fontSize: 14,
      color: colors.textTertiary,
      textAlign: "center",
      lineHeight: lineHeight(20),
    },
  });
}
