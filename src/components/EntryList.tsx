import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Animated,
  Easing,
  FlatList,
  LayoutChangeEvent,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { useFormToggle, useSort, useSwipeDismiss } from "@/hooks";
import { Entry } from "@/storage";
import { ColorTokens, useTheme } from "@/theme";
import {
  formatDueDate,
  gestationalAgeFromDueDate,
  getBirthstone,
  getBirthstoneImage,
} from "@/util";

import BirthstoneIcon from "./BirthstoneIcon";
import EntryDetailModal from "./EntryDetailModal";
import InlineFormWrapper from "./InlineFormWrapper";
import SortToolbar from "./SortToolbar";

type EntryStyles = ReturnType<typeof createStyles>;

interface EntryRowProps {
  item: Entry;
  backgroundColor: string;
  textColor: string;
  onDelete: (id: string) => void;
  onDeliver: (id: string) => void;
  onPress: (entry: Entry) => void;
  nameWidth?: number;
  onNameLayout?: (id: string, width: number) => void;
  styles: EntryStyles;
  deleteIconColor: string;
}

interface EntryListProps {
  entries: Entry[];
  onDelete: (id: string) => void;
  onDeliver: (id: string) => void;
  onDeleteAll: () => void;
  onAdd: (entry: { name: string; dueDate: string }) => void;
}

/** Individual entry row with swipe-to-delete support. */
const EntryRow = React.memo(function EntryRow({
  item,
  backgroundColor,
  textColor,
  onDelete,
  onDeliver,
  onPress,
  nameWidth,
  onNameLayout,
  styles,
  deleteIconColor,
}: EntryRowProps) {
  const { weeks, days } = gestationalAgeFromDueDate(item.dueDate);
  const SWIPE_THRESHOLD = 80;
  const { animatedValue: translateX, panHandlers } = useSwipeDismiss({
    axis: "x",
    threshold: SWIPE_THRESHOLD,
    onDismiss: () => onDelete(item.id),
    onDismissPositive: () => onDeliver(item.id),
  });

  const fadeIn = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(fadeIn, {
      toValue: 1,
      duration: 300,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();
  }, [fadeIn]);

  // Show deliver background when swiping right, delete when swiping left
  const deliverBgOpacity = translateX.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });
  const deleteBgOpacity = translateX.interpolate({
    inputRange: [-1, 0],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });

  // Icon opacity and scale ramp up as swipe approaches threshold
  const deliverIconOpacity = translateX.interpolate({
    inputRange: [0, SWIPE_THRESHOLD * 0.3, SWIPE_THRESHOLD],
    outputRange: [0, 0.5, 1],
    extrapolate: "clamp",
  });
  const deliverIconScale = translateX.interpolate({
    inputRange: [0, SWIPE_THRESHOLD * 0.5, SWIPE_THRESHOLD],
    outputRange: [0.6, 0.8, 1],
    extrapolate: "clamp",
  });
  const deleteIconOpacity = translateX.interpolate({
    inputRange: [-SWIPE_THRESHOLD, -SWIPE_THRESHOLD * 0.3, 0],
    outputRange: [1, 0.5, 0],
    extrapolate: "clamp",
  });
  const deleteIconScale = translateX.interpolate({
    inputRange: [-SWIPE_THRESHOLD, -SWIPE_THRESHOLD * 0.5, 0],
    outputRange: [1, 0.8, 0.6],
    extrapolate: "clamp",
  });

  return (
    <Animated.View style={[styles.entryWrapper, { opacity: fadeIn }]}>
      <View style={styles.swipeBackground} testID="delete-background">
        <Animated.View
          style={[
            styles.swipeBgLayer,
            styles.swipeDeliverBg,
            { opacity: deliverBgOpacity },
          ]}
        />
        <Animated.View
          style={[
            styles.swipeBgLayer,
            styles.swipeDeleteBg,
            { opacity: deleteBgOpacity },
          ]}
        />
        <View style={styles.swipeDeliverSide}>
          <Animated.View
            style={[
              styles.swipeIconGroup,
              {
                opacity: deliverIconOpacity,
                transform: [{ scale: deliverIconScale }],
              },
            ]}
          >
            <Ionicons
              name="heart"
              size={22}
              color={deleteIconColor}
              accessible={false}
            />
            <Text style={styles.swipeLabel}>Delivered</Text>
          </Animated.View>
        </View>
        <View style={styles.swipeDeleteSide}>
          <Animated.View
            style={[
              styles.swipeIconGroup,
              {
                opacity: deleteIconOpacity,
                transform: [{ scale: deleteIconScale }],
              },
            ]}
          >
            <Text style={styles.swipeLabel}>Remove</Text>
            <Ionicons
              name="trash-outline"
              size={22}
              color={deleteIconColor}
              accessible={false}
            />
          </Animated.View>
        </View>
      </View>
      <Animated.View
        testID="entry-row"
        style={[
          styles.entry,
          { backgroundColor },
          { transform: [{ translateX }] },
        ]}
        {...panHandlers}
      >
        <Pressable
          style={styles.entryContent}
          onPress={() => onPress(item)}
          accessibilityRole="button"
          accessibilityLabel={`View details for ${item.name}`}
        >
          <Text
            style={[
              styles.entryName,
              { color: textColor },
              (nameWidth ?? 0) > 0 && { minWidth: nameWidth },
            ]}
            numberOfLines={1}
            ellipsizeMode="tail"
            onLayout={(e: LayoutChangeEvent) =>
              onNameLayout?.(item.id, e.nativeEvent.layout.width)
            }
          >
            {item.name}
          </Text>
          <Text style={[styles.entryAge, { color: textColor }]}>
            {weeks}w {days}d
          </Text>
          <Text style={[styles.entryDueDate, { color: textColor }]}>
            {formatDueDate(item.dueDate)}
          </Text>
          {item.birthstone && (
            <BirthstoneIcon
              image={getBirthstoneImage(item.birthstone.name)}
              size={24}
            />
          )}
        </Pressable>
      </Animated.View>
    </Animated.View>
  );
});

/** Scrollable list of gestation entries with swipe-to-delete support. */
export default function EntryList({
  entries,
  onDelete,
  onDeliver,
  onDeleteAll,
  onAdd,
}: EntryListProps) {
  const { colors, rowColors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const { sortBy, sortDir, sorted, cycleSortField, toggleSortDir } = useSort(
    entries,
    { defaultField: "dueDate" },
  );
  const [selectedEntry, setSelectedEntry] = useState<Entry | null>(null);
  const nameWidths = useRef(new Map<string, number>());
  const [maxNameWidth, setMaxNameWidth] = useState(0);
  const { showForm, batchMode, formKey, toggleForm, toggleBatchMode } =
    useFormToggle();

  const handleNameLayout = useCallback((id: string, width: number) => {
    nameWidths.current.set(id, width);
    if (nameWidths.current.size === 0) {
      return;
    }
    const newMax = Math.max(...nameWidths.current.values());
    setMaxNameWidth((prev) => (newMax !== prev ? newMax : prev));
  }, []);

  useEffect(() => {
    const ids = new Set(entries.map((e) => e.id));
    let changed = false;
    for (const key of nameWidths.current.keys()) {
      if (!ids.has(key)) {
        nameWidths.current.delete(key);
        changed = true;
      }
    }
    if (changed) {
      const newMax =
        nameWidths.current.size > 0
          ? Math.max(...nameWidths.current.values())
          : 0;
      setMaxNameWidth(newMax);
    }
  }, [entries]);

  const currentMonthGem = useMemo(
    () => getBirthstoneImage(getBirthstone(new Date().getMonth() + 1).name),
    [],
  );

  const renderItem = useCallback(
    ({ item, index }: { item: Entry; index: number }) => (
      <EntryRow
        item={item}
        backgroundColor={rowColors[index % rowColors.length]}
        textColor={colors.textEntryRow}
        onDelete={onDelete}
        onDeliver={onDeliver}
        onPress={setSelectedEntry}
        nameWidth={maxNameWidth}
        onNameLayout={handleNameLayout}
        styles={styles}
        deleteIconColor={colors.white}
      />
    ),
    [
      rowColors,
      colors,
      onDelete,
      onDeliver,
      maxNameWidth,
      handleNameLayout,
      styles,
    ],
  );

  const keyExtractor = useCallback((item: Entry) => item.id, []);

  return (
    <View style={styles.listContainer}>
      {showForm ? (
        <InlineFormWrapper
          formKey={formKey.current}
          batchMode={batchMode}
          onAdd={onAdd}
          onToggleBatchMode={toggleBatchMode}
          onClose={toggleForm}
        />
      ) : (
        <Pressable
          style={[
            styles.addButton,
            {
              borderColor: colors.primary,
              backgroundColor: colors.primaryLightBg,
            },
          ]}
          onPress={toggleForm}
          accessibilityRole="button"
          accessibilityLabel="Add someone new"
        >
          <BirthstoneIcon image={currentMonthGem} size={20} />
          <Text
            style={[
              styles.addButtonText,
              { color: colors.primary, marginHorizontal: 8 },
            ]}
          >
            Add someone
          </Text>
          <BirthstoneIcon image={currentMonthGem} size={20} />
        </Pressable>
      )}
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
        data={sorted}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        style={styles.list}
        removeClippedSubviews={Platform.OS === "android"}
        initialNumToRender={15}
        maxToRenderPerBatch={10}
        windowSize={11}
        contentContainerStyle={
          sorted.length === 0 ? styles.emptyList : undefined
        }
        ListEmptyComponent={
          <Pressable
            style={styles.emptyContent}
            onPress={toggleForm}
            accessibilityRole="button"
            accessibilityLabel="Track your first pregnancy"
          >
            <Ionicons
              name="calendar-outline"
              size={48}
              color={colors.textTertiary}
            />
            <Text style={styles.emptyTitle}>Track your first pregnancy</Text>
            <Text style={styles.emptySubtitle}>
              Enter a name and due date to start
            </Text>
          </Pressable>
        }
      />
      <EntryDetailModal
        entry={selectedEntry}
        onClose={() => setSelectedEntry(null)}
      />
    </View>
  );
}

/** Creates styles based on the active color palette. */
function createStyles(colors: ColorTokens) {
  return StyleSheet.create({
    listContainer: {
      flex: 1,
    },
    addButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      marginHorizontal: 16,
      marginTop: 12,
      paddingVertical: 12,
      borderRadius: 12,
      borderWidth: 2,
      gap: 10,
    },
    addButtonText: {
      fontSize: 16,
      fontWeight: "600",
    },
    list: {
      flex: 1,
    },
    emptyList: {
      flexGrow: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    emptyContent: {
      alignItems: "center",
      gap: 8,
    },
    emptyTitle: {
      color: colors.textPrimary,
      fontSize: 16,
      fontWeight: "600",
    },
    emptySubtitle: {
      color: colors.textTertiary,
      fontSize: 14,
    },
    entryWrapper: {
      marginHorizontal: 16,
      marginTop: 8,
      borderRadius: 10,
      overflow: "hidden",
    },
    swipeBackground: {
      ...StyleSheet.absoluteFillObject,
      flexDirection: "row",
    },
    swipeBgLayer: {
      ...StyleSheet.absoluteFillObject,
    },
    swipeDeliverBg: {
      backgroundColor: colors.primary,
    },
    swipeDeleteBg: {
      backgroundColor: colors.destructive,
    },
    swipeDeliverSide: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      paddingLeft: 20,
    },
    swipeDeleteSide: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "flex-end",
      paddingRight: 20,
    },
    swipeIconGroup: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    swipeLabel: {
      color: colors.white,
      fontSize: 13,
      fontWeight: "600",
    },
    entry: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 10,
      paddingHorizontal: 16,
      gap: 6,
    },
    entryContent: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    entryName: {
      fontSize: 16,
      fontWeight: "600",
    },
    entryAge: {
      fontSize: 14,
      marginLeft: 8,
    },
    entryDueDate: {
      flex: 1,
      textAlign: "right",
      fontSize: 14,
      marginRight: 12,
    },
  });
}
