import { useMemo, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { Entry } from "../storage";

type SortBy = "dueDate" | "name";
type SortDir = "asc" | "desc";

const DEFAULT_DIR: Record<SortBy, SortDir> = {
  dueDate: "desc",
  name: "asc",
};

interface EntryRowProps {
  item: Entry;
  onDelete: (id: string) => void;
}

interface EntryListProps {
  entries: Entry[];
  onDelete: (id: string) => void;
}

function EntryRow({ item, onDelete }: EntryRowProps) {
  return (
    <View style={styles.entry}>
      <View style={styles.entryInfo}>
        <Text style={styles.entryName}>{item.name}</Text>
        <Text style={styles.entryAge}>
          {item.weeks}w {item.days}d
        </Text>
      </View>
      <Pressable
        onPress={() => onDelete(item.id)}
        style={styles.deleteButton}
        hitSlop={8}
      >
        <Text style={styles.deleteText}>✕</Text>
      </Pressable>
    </View>
  );
}

/** Scrollable list of gestation entries with swipe-to-delete support. */
export default function EntryList({ entries, onDelete }: EntryListProps) {
  const [sortBy, setSortBy] = useState<SortBy>("dueDate");
  const [sortDir, setSortDir] = useState<SortDir>(DEFAULT_DIR.dueDate);

  const handleSortPress = (field: SortBy) => {
    if (field === sortBy) {
      setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(field);
      setSortDir(DEFAULT_DIR[field]);
    }
  };

  const sorted = useMemo(() => {
    const copy = [...entries];
    const dir = sortDir === "asc" ? 1 : -1;
    if (sortBy === "dueDate") {
      copy.sort((a, b) => {
        const ageDiff = a.weeks * 7 + a.days - (b.weeks * 7 + b.days);
        if (ageDiff !== 0) {
          return dir * ageDiff;
        }
        return a.name.localeCompare(b.name, undefined, { sensitivity: "base" });
      });
    } else {
      copy.sort((a, b) => {
        const nameDiff = a.name.localeCompare(b.name, undefined, { sensitivity: "base" });
        if (nameDiff !== 0) {
          return dir * nameDiff;
        }
        return (b.weeks * 7 + b.days) - (a.weeks * 7 + a.days);
      });
    }
    return copy;
  }, [entries, sortBy, sortDir]);

  return (
    <View style={styles.listContainer}>
      {entries.length > 0 && (
        <View style={styles.sortRow}>
          <Pressable
            style={[
              styles.sortButton,
              sortBy === "dueDate" && styles.sortButtonActive,
            ]}
            onPress={() => handleSortPress("dueDate")}
            accessibilityRole="button"
          >
            <Text
              style={[
                styles.sortText,
                sortBy === "dueDate" && styles.sortTextActive,
              ]}
            >
              Due Date {sortBy === "dueDate" && (sortDir === "asc" ? "↑" : "↓")}
            </Text>
          </Pressable>
          <Pressable
            style={[
              styles.sortButton,
              sortBy === "name" && styles.sortButtonActive,
            ]}
            onPress={() => handleSortPress("name")}
            accessibilityRole="button"
          >
            <Text
              style={[
                styles.sortText,
                sortBy === "name" && styles.sortTextActive,
              ]}
            >
              Name {sortBy === "name" && (sortDir === "asc" ? "↑" : "↓")}
            </Text>
          </Pressable>
        </View>
      )}
      <FlatList
        data={sorted}
        renderItem={({ item }) => <EntryRow item={item} onDelete={onDelete} />}
        keyExtractor={(item) => item.id}
        style={styles.list}
        contentContainerStyle={
          entries.length === 0 ? styles.emptyList : undefined
        }
        ListEmptyComponent={
          <Text style={styles.emptyText}>No entries yet</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  listContainer: {
    flex: 1,
  },
  sortRow: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#4a90d9",
    overflow: "hidden",
  },
  sortButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    backgroundColor: "#fff",
  },
  sortButtonActive: {
    backgroundColor: "#4a90d9",
  },
  sortText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4a90d9",
  },
  sortTextActive: {
    color: "#fff",
  },
  list: {
    flex: 1,
  },
  emptyList: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    color: "#999",
    fontSize: 16,
  },
  entry: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginTop: 12,
    padding: 16,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  entryInfo: {
    flex: 1,
  },
  entryName: {
    fontSize: 17,
    fontWeight: "600",
    color: "#333",
  },
  entryAge: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  deleteButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
  },
  deleteText: {
    color: "#999",
    fontSize: 16,
    fontWeight: "600",
  },
});
