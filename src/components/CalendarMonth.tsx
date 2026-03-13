import { useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { Entry } from "@/storage";
import { ColorTokens, useTheme } from "@/theme";
import { getBirthstoneImage, lineHeight } from "@/util";

import BirthstoneIcon from "./BirthstoneIcon";

export interface DayCell {
  date: string; // ISO YYYY-MM-DD
  day: number; // day of month (1-31)
  color: string; // heat map color
  load: number; // numeric probability load
  dueEntries: Entry[]; // active entries with dueDate on this date
  deliveredEntries: Entry[]; // entries delivered on this date
}

interface CalendarMonthProps {
  year: number;
  month: number; // 0-indexed (JS Date style)
  dayCells: DayCell[];
  onDayPress?: (date: string, dueEntries: Entry[]) => void;
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

/** Renders a single calendar month grid with heat map colors and birthstone icons. */
export default function CalendarMonth({
  year,
  month,
  dayCells,
  onDayPress,
}: CalendarMonthProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const grid = useMemo(() => {
    const firstDay = new Date(year, month, 1).getDay(); // 0=Sun
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const cellMap = new Map<number, DayCell>();
    for (const cell of dayCells) {
      cellMap.set(cell.day, cell);
    }

    const rows: (DayCell | null)[][] = [];
    let currentRow: (DayCell | null)[] = [];

    // Pad start
    for (let i = 0; i < firstDay; i++) {
      currentRow.push(null);
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const cell = cellMap.get(d) ?? {
        date: "",
        day: d,
        color: "transparent",
        load: 0,
        dueEntries: [],
        deliveredEntries: [],
      };
      currentRow.push(cell);
      if (currentRow.length === 7) {
        rows.push(currentRow);
        currentRow = [];
      }
    }

    // Pad end
    if (currentRow.length > 0) {
      while (currentRow.length < 7) {
        currentRow.push(null);
      }
      rows.push(currentRow);
    }

    return rows;
  }, [year, month, dayCells]);

  return (
    <View style={styles.container}>
      <Text style={styles.monthTitle}>
        {MONTH_NAMES[month]} {year}
      </Text>
      <View style={styles.weekdayRow}>
        {WEEKDAYS.map((d) => (
          <Text key={d} style={styles.weekdayLabel}>
            {d}
          </Text>
        ))}
      </View>
      {grid.map((row, rowIndex) => (
        <View key={rowIndex} style={styles.weekRow}>
          {row.map((cell, cellIndex) => {
            const hasDueEntries = cell != null && cell.dueEntries.length > 0;
            const hasDelivered =
              cell != null && (cell.deliveredEntries?.length ?? 0) > 0;
            const isTappable = hasDueEntries || hasDelivered;
            const CellWrapper = isTappable ? Pressable : View;
            return (
              <CellWrapper
                key={cellIndex}
                style={[
                  styles.dayCell,
                  { backgroundColor: cell ? cell.color : "transparent" },
                  isTappable && styles.dayCellTappable,
                ]}
                {...(isTappable && {
                  onPress: () =>
                    onDayPress?.(cell.date, [
                      ...cell.dueEntries,
                      ...(cell.deliveredEntries ?? []),
                    ]),
                  accessibilityRole: "button" as const,
                  accessibilityLabel: [
                    hasDueEntries &&
                      `${cell.dueEntries.length} due on day ${cell.day}`,
                    hasDelivered &&
                      `${(cell.deliveredEntries ?? []).length} delivered on day ${cell.day}`,
                  ]
                    .filter(Boolean)
                    .join(", "),
                })}
              >
                {cell && (
                  <>
                    <Text style={styles.dayText}>{cell.day}</Text>
                    {(hasDueEntries || hasDelivered) && (
                      <View style={styles.iconsRow}>
                        {(cell.deliveredEntries ?? []).map((e) => (
                          <Text key={e.id} style={styles.babyIcon}>
                            👶
                          </Text>
                        ))}
                        {cell.dueEntries.length <= 3 ? (
                          cell.dueEntries.map((e) => (
                            <BirthstoneIcon
                              key={e.id}
                              image={getBirthstoneImage(
                                e.birthstone?.name ?? "Garnet",
                              )}
                              size={14}
                            />
                          ))
                        ) : (
                          <>
                            <BirthstoneIcon
                              image={getBirthstoneImage(
                                cell.dueEntries[0].birthstone?.name ?? "Garnet",
                              )}
                              size={14}
                            />
                            <Text style={styles.overflowText}>
                              +{cell.dueEntries.length - 1}
                            </Text>
                          </>
                        )}
                      </View>
                    )}
                  </>
                )}
              </CellWrapper>
            );
          })}
        </View>
      ))}
    </View>
  );
}

/** Creates styles based on the active color palette. */
function createStyles(colors: ColorTokens) {
  return StyleSheet.create({
    container: {
      marginBottom: 24,
      paddingHorizontal: 8,
    },
    monthTitle: {
      fontWeight: "700",
      fontSize: 18,
      color: colors.textPrimary,
      marginBottom: 8,
      textAlign: "center",
    },
    weekdayRow: {
      flexDirection: "row",
      marginBottom: 4,
    },
    weekdayLabel: {
      flex: 1,
      textAlign: "center",
      fontWeight: "700",
      fontSize: 12,
      lineHeight: lineHeight(16),
      color: colors.textTertiary,
    },
    weekRow: {
      flexDirection: "row",
    },
    dayCell: {
      flex: 1,
      aspectRatio: 1,
      justifyContent: "flex-start",
      alignItems: "flex-start",
      margin: 1,
      borderRadius: 4,
      padding: 3,
    },
    dayCellTappable: {
      borderWidth: 1.5,
      borderColor: colors.primary,
      padding: 1.5,
    },
    dayText: {
      fontSize: 12,
      lineHeight: lineHeight(14),
      color: colors.textPrimary,
    },
    iconsRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 2,
      marginTop: 1,
    },
    babyIcon: {
      fontSize: 12,
      lineHeight: lineHeight(14),
    },
    overflowText: {
      fontWeight: "700",
      fontSize: 10,
      lineHeight: lineHeight(12),
      color: colors.primary,
    },
  });
}
