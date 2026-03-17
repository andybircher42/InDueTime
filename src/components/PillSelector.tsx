import { useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { ColorTokens, useTheme } from "@/theme";

export interface PillOption<T extends string> {
  value: T;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}

interface PillSelectorProps<T extends string> {
  options: PillOption<T>[];
  selected: T;
  onSelect: (value: T) => void;
}

/** A row of selectable pill buttons with icons. */
export default function PillSelector<T extends string>({
  options,
  selected,
  onSelect,
}: PillSelectorProps<T>) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.row}>
      {options.map(({ value, label, icon }) => {
        const active = selected === value;
        return (
          <Pressable
            key={value}
            style={[styles.pill, active && styles.pillActive]}
            onPress={() => onSelect(value)}
            accessibilityRole="button"
            accessibilityLabel={label}
            accessibilityState={{ selected: active }}
          >
            <Ionicons
              name={icon}
              size={18}
              color={active ? colors.primary : colors.textTertiary}
            />
            <Text
              style={[styles.label, active && styles.labelActive]}
            >
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function createStyles(colors: ColorTokens) {
  return StyleSheet.create({
    row: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
      marginBottom: 4,
    },
    pill: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      paddingVertical: 6,
      paddingHorizontal: 10,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
    pillActive: {
      borderColor: colors.primary,
      backgroundColor: colors.primaryLightBg,
    },
    label: {
      fontSize: 12,
      color: colors.textTertiary,
    },
    labelActive: {
      color: colors.primary,
      fontWeight: "600",
    },
  });
}
