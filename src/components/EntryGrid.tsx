import React, { useCallback, useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { useFormToggle, useSort } from "@/hooks";
import { Entry } from "@/storage";
import { ColorTokens, RadiiTokens, useTheme } from "@/theme";
import { getBirthstone, getBirthstoneImage } from "@/util";

import BirthstoneIcon from "./BirthstoneIcon";
import EntryCard from "./EntryCard";
import EntryDetailModal from "./EntryDetailModal";
import InlineFormWrapper from "./InlineFormWrapper";
import SortToolbar from "./SortToolbar";

interface EntryGridProps {
  entries: Entry[];
  onDelete: (id: string) => void;
  onDeliver: (id: string) => void;
  onDeleteAll: () => void;
  onAdd: (entry: { name: string; dueDate: string }) => void;
  onUpdateDueDate?: (id: string, dueDate: string) => void;
}

type GridItem = Entry | "add" | "spacer";

/** Cozy 2-column card grid layout for entries. */
export default function EntryGrid({
  entries,
  onDelete,
  onDeliver,
  onDeleteAll,
  onAdd,
  onUpdateDueDate,
}: EntryGridProps) {
  const { colors, radii } = useTheme();
  const styles = useMemo(() => createStyles(colors, radii), [colors, radii]);
  const { showForm, batchMode, formKey, toggleForm, toggleBatchMode } =
    useFormToggle();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selectedEntry = useMemo(
    () =>
      selectedId ? (entries.find((e) => e.id === selectedId) ?? null) : null,
    [entries, selectedId],
  );
  const { sortBy, sortDir, sorted, cycleSortField, toggleSortDir } = useSort(
    entries,
    { defaultField: "none" },
  );

  const currentMonthGem = useMemo(
    () => getBirthstoneImage(getBirthstone(new Date().getMonth() + 1).name),
    [],
  );

  const handleLongPress = useCallback(
    (entry: Entry) => {
      Alert.alert(entry.name, undefined, [
        {
          text: "Delivered",
          onPress: () => onDeliver(entry.id),
        },
        {
          text: "Remove",
          style: "destructive",
          onPress: () => onDelete(entry.id),
        },
        { text: "Cancel", style: "cancel" },
      ]);
    },
    [onDelete, onDeliver],
  );

  const gridData: GridItem[] = useMemo(() => {
    const data: GridItem[] = [...sorted, "add" as const];
    if (data.length % 2 !== 0) {
      data.push("spacer" as const);
    }
    return data;
  }, [sorted]);

  const renderItem = useCallback(
    ({ item }: { item: GridItem }) => {
      if (item === "spacer") {
        return <View style={styles.spacer} />;
      }
      if (item === "add") {
        return (
          <Pressable
            style={styles.addCard}
            onPress={toggleForm}
            accessibilityRole="button"
            accessibilityLabel="Add someone new"
            testID="add-card"
          >
            <BirthstoneIcon image={currentMonthGem} size={40} />
            <Text style={styles.addText}>Add someone</Text>
          </Pressable>
        );
      }
      return (
        <EntryCard
          entry={item}
          onPress={(e: Entry) => setSelectedId(e.id)}
          onLongPress={handleLongPress}
        />
      );
    },
    [styles, toggleForm, handleLongPress, currentMonthGem],
  );

  const keyExtractor = useCallback(
    (item: GridItem) =>
      item === "add" ? "add-btn" : item === "spacer" ? "spacer" : item.id,
    [],
  );

  if (entries.length === 0 && !showForm) {
    return (
      <View style={styles.container}>
        <Pressable
          style={styles.emptyCard}
          onPress={toggleForm}
          accessibilityRole="button"
          accessibilityLabel="Add someone new"
        >
          <BirthstoneIcon image={currentMonthGem} size={64} />
          <Text style={styles.emptyCardTitle}>Track your first pregnancy</Text>
          <Text style={styles.emptyCardSubtitle}>
            Enter a name and due date to start
          </Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {showForm ? (
        <InlineFormWrapper
          formKey={formKey.current}
          batchMode={batchMode}
          onAdd={onAdd}
          onToggleBatchMode={toggleBatchMode}
          onClose={toggleForm}
        />
      ) : null}
      {sorted.length > 0 && (
        <SortToolbar
          sortBy={sortBy}
          sortDir={sortDir}
          itemCount={sorted.length}
          onCycleField={cycleSortField}
          onToggleDir={toggleSortDir}
          onDeleteAll={onDeleteAll}
        />
      )}
      <FlatList
        data={gridData}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        numColumns={2}
        contentContainerStyle={styles.grid}
        columnWrapperStyle={styles.gridRow}
        removeClippedSubviews={Platform.OS === "android"}
        initialNumToRender={10}
        maxToRenderPerBatch={8}
        windowSize={7}
      />
      <EntryDetailModal
        entry={selectedEntry}
        onClose={() => setSelectedId(null)}
        onUpdateDueDate={onUpdateDueDate}
      />
    </View>
  );
}

function createStyles(colors: ColorTokens, radii: RadiiTokens) {
  return StyleSheet.create({
    container: {
      flex: 1,
    },
    grid: {
      padding: 16,
    },
    gridRow: {
      gap: 12,
      marginBottom: 12,
    },
    spacer: {
      flex: 1,
    },
    addCard: {
      flex: 1,
      aspectRatio: 1,
      borderRadius: radii.lg,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.contentBackground,
      justifyContent: "center",
      alignItems: "center",
      gap: 8,
    },
    addText: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.primary,
    },
    emptyCard: {
      marginHorizontal: 32,
      marginTop: 32,
      paddingVertical: 40,
      borderRadius: radii.lg,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.contentBackground,
      alignItems: "center",
      gap: 12,
    },
    emptyCardTitle: {
      color: colors.textPrimary,
      fontSize: 18,
      fontWeight: "600",
    },
    emptyCardSubtitle: {
      color: colors.textTertiary,
      fontSize: 14,
    },
  });
}
