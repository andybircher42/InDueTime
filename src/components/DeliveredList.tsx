import { useMemo, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { Entry } from "@/storage";
import { ColorTokens, useTheme } from "@/theme";
import { deliveryTimingLabel, formatDueDate, lineHeight } from "@/util";

import EntryDetailModal from "./EntryDetailModal";

interface DeliveredListProps {
  entries: Entry[];
  onDelete: (id: string) => void;
}

/** Full-page view showing all delivered entries. */
export default function DeliveredList({
  entries,
  onDelete,
}: DeliveredListProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [selectedEntry, setSelectedEntry] = useState<Entry | null>(null);

  const deliveredEntries = useMemo(
    () =>
      entries
        .filter((e) => !!e.deliveredAt)
        .sort((a, b) => (b.deliveredAt ?? 0) - (a.deliveredAt ?? 0)),
    [entries],
  );

  if (deliveredEntries.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyEmoji}>👶</Text>
        <Text style={styles.emptyTitle}>No deliveries yet</Text>
        <Text style={styles.emptySubtitle}>
          Swipe right on a patient to mark them as delivered
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={deliveredEntries}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <Pressable
            style={styles.row}
            onPress={() => setSelectedEntry(item)}
            accessibilityRole="button"
            accessibilityLabel={`View details for ${item.name}`}
          >
            <Text style={styles.baby}>👶</Text>
            <View style={styles.info}>
              <Text style={styles.name} numberOfLines={1}>
                {item.name}
              </Text>
              <Text style={styles.timing}>
                {item.deliveredAt
                  ? deliveryTimingLabel(item.dueDate, item.deliveredAt)
                  : formatDueDate(item.dueDate)}
              </Text>
            </View>
            <Pressable
              onPress={() => onDelete(item.id)}
              accessibilityRole="button"
              accessibilityLabel={`Remove ${item.name}`}
              hitSlop={8}
            >
              <Ionicons
                name="close-circle-outline"
                size={18}
                color={colors.textTertiary}
              />
            </Pressable>
          </Pressable>
        )}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.headerEmoji}>🎉</Text>
            <Text style={styles.headerTitle}>Delivered</Text>
            <Text style={styles.headerCount}>{deliveredEntries.length}</Text>
          </View>
        }
      />
      <EntryDetailModal
        entry={selectedEntry}
        onClose={() => setSelectedEntry(null)}
      />
    </View>
  );
}

function createStyles(colors: ColorTokens) {
  return StyleSheet.create({
    container: {
      flex: 1,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: 32,
      gap: 8,
    },
    emptyEmoji: {
      fontSize: 48,
    },
    emptyTitle: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.textPrimary,
    },
    emptySubtitle: {
      fontSize: 14,
      color: colors.textTertiary,
      textAlign: "center",
      lineHeight: lineHeight(20),
    },
    listContent: {
      padding: 16,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      marginBottom: 12,
    },
    headerEmoji: {
      fontSize: 18,
    },
    headerTitle: {
      fontSize: 17,
      fontWeight: "700",
      color: colors.textPrimary,
      flex: 1,
    },
    headerCount: {
      fontSize: 13,
      fontWeight: "600",
      color: colors.textTertiary,
      backgroundColor: colors.inputBackground,
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 10,
      overflow: "hidden",
    },
    row: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 10,
      paddingHorizontal: 12,
      borderRadius: 10,
      marginBottom: 6,
      backgroundColor: colors.primaryLightBg,
      gap: 10,
    },
    baby: {
      fontSize: 20,
    },
    info: {
      flex: 1,
    },
    name: {
      fontSize: 15,
      fontWeight: "600",
      color: colors.textPrimary,
    },
    timing: {
      fontSize: 13,
      color: colors.textTertiary,
      marginTop: 2,
    },
  });
}
