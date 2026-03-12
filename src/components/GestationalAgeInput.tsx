import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

interface GestationalAgeInputProps {
  weeks: string;
  days: string;
  onChangeWeeks: (w: string) => void;
  onChangeDays: (d: string) => void;
}

type Phase = "weeks" | "days";

/**
 * Gestational age input with animated label transitions and blinking cursor.
 *
 * The swap icon is NOT part of this component — the parent wraps this
 * in an inputRow alongside the swap button, matching due-date layout.
 */
export default function GestationalAgeInput({
  weeks,
  days,
  onChangeWeeks,
  onChangeDays,
}: GestationalAgeInputProps) {
  const hiddenRef = useRef<TextInput>(null);
  const [phase, setPhase] = useState<Phase>(
    weeks.length >= 2 ? "days" : "weeks",
  );
  const [isFocused, setIsFocused] = useState(true);

  // Blinking cursor
  const cursorOpacity = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    const blink = Animated.loop(
      Animated.sequence([
        Animated.timing(cursorOpacity, {
          toValue: 0,
          duration: 500,
          useNativeDriver: false,
        }),
        Animated.timing(cursorOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: false,
        }),
      ]),
    );
    if (isFocused) {
      blink.start();
    } else {
      blink.stop();
      cursorOpacity.setValue(0);
    }
    return () => blink.stop();
  }, [isFocused, cursorOpacity]);

  // "eeks" fade + collapse, days fade in
  const eeksFade = useRef(
    new Animated.Value(weeks.length >= 2 ? 0 : 1),
  ).current;
  const eeksWidth = useRef(
    new Animated.Value(weeks.length >= 2 ? 0 : 1),
  ).current;
  const daysFade = useRef(
    new Animated.Value(weeks.length >= 2 ? 1 : 0),
  ).current;

  useEffect(() => {
    if (isWeeksComplete(weeks) && phase === "weeks") {
      setPhase("days");
      Animated.parallel([
        Animated.timing(eeksFade, {
          toValue: 0,
          duration: 250,
          useNativeDriver: false,
        }),
        Animated.timing(eeksWidth, {
          toValue: 0,
          duration: 250,
          useNativeDriver: false,
        }),
        Animated.timing(daysFade, {
          toValue: 1,
          duration: 300,
          delay: 100,
          useNativeDriver: false,
        }),
      ]).start();
    }
  }, [weeks, phase, eeksFade, eeksWidth, daysFade]);

  useEffect(() => {
    if (!isWeeksComplete(weeks) && phase === "days") {
      setPhase("weeks");
      onChangeDays("");
      Animated.parallel([
        Animated.timing(eeksFade, {
          toValue: 1,
          duration: 250,
          useNativeDriver: false,
        }),
        Animated.timing(eeksWidth, {
          toValue: 1,
          duration: 250,
          useNativeDriver: false,
        }),
        Animated.timing(daysFade, {
          toValue: 0,
          duration: 200,
          useNativeDriver: false,
        }),
      ]).start();
    }
  }, [weeks, phase, eeksFade, eeksWidth, daysFade, onChangeDays]);

  // A single digit 2-9 counts as a complete weeks entry (auto-advance).
  // 0 or 1 requires a second digit (e.g. 01, 05, 10, 12).
  const isWeeksComplete = (w: string) => {
    if (w.length === 0) {return false;}
    if (w.length >= 2) {return true;}
    const first = parseInt(w[0], 10);
    return first >= 2;
  };

  const handleInput = (text: string) => {
    const digits = text.replace(/[^0-9]/g, "");
    if (phase === "weeks") {
      const first = parseInt(digits[0], 10);
      if (digits.length === 1 && first >= 2) {
        // Single digit 2-9: complete weeks, pad with leading 0
        onChangeWeeks(`0${digits[0]}`);
      } else {
        onChangeWeeks(digits.slice(0, 2));
      }
    } else {
      // In days phase, the hidden input has weeks+days concatenated.
      // Weeks portion length depends on whether it was a single-digit auto-advance.
      const wLen = weeks.length;
      const wDigits = digits.slice(0, wLen);
      const dDigits = digits.slice(wLen, wLen + 1);
      if (digits.length <= wLen) {
        onChangeWeeks(digits);
        onChangeDays("");
      } else {
        onChangeWeeks(wDigits);
        onChangeDays(dDigits);
      }
    }
  };

  const hiddenValue = weeks + days;
  const focusInput = () => hiddenRef.current?.focus();
  const weeksEntered = isWeeksComplete(weeks);
  const daysEntered = days.length >= 1;
  const isSingularWeek = weeks === "01";

  // Inline cursor: zero-width wrapper so it doesn't add space
  const cursor = (
    <View style={styles.cursorWrapper}>
      <Animated.View style={[styles.cursor, { opacity: cursorOpacity }]} />
    </View>
  );

  return (
    <Pressable style={styles.wrapper} onPress={focusInput}>
      {/* All text in a single nested Text for shared baseline */}
      <Text style={styles.baseText}>
        {/* Cursor before placeholder in weeks phase */}
        {phase === "weeks" && weeks.length === 0 && (
          <View style={styles.cursorWrapper}>
            <Animated.View
              style={[styles.cursor, { opacity: cursorOpacity }]}
            />
          </View>
        )}

        {/* Weeks digits or placeholder */}
        {weeks.length > 0 ? (
          <Text style={styles.value}>{weeks}</Text>
        ) : (
          <Text style={styles.placeholder}>00</Text>
        )}

        {/* Cursor after entered weeks digits */}
        {phase === "weeks" && weeks.length > 0 && cursor}

        {/* " week(s)" label — " w" always visible, "eek(s)" fades */}
        <Text style={styles.label}> w</Text>
        <Animated.Text style={[styles.label, { opacity: eeksFade }]}>
          {isSingularWeek ? "eek" : "eeks"}
        </Animated.Text>

        {/* Days section — fades in */}
        <Animated.Text style={{ opacity: daysFade }}>
          <Text style={styles.label}> </Text>
          {daysEntered ? (
            <Text style={styles.value}>{days}</Text>
          ) : (
            weeksEntered && <Text style={styles.placeholder}>00</Text>
          )}
          {phase === "days" && cursor}
          {weeksEntered && !daysEntered && (
            <Text style={styles.label}> days</Text>
          )}
          {daysEntered && <Text style={styles.label}>d</Text>}
        </Animated.Text>
      </Text>

      {/* Hidden input to capture keypad */}
      <TextInput
        ref={hiddenRef}
        style={styles.hiddenInput}
        value={hiddenValue}
        onChangeText={handleInput}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        keyboardType="number-pad"
        autoFocus
        maxLength={3}
        caretHidden
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: "row",
    alignItems: "baseline",
    flex: 1,
    flexShrink: 1,
    minWidth: 0,
  },
  baseText: {
    fontFamily: "DMSans-Bold",
    fontSize: 48,
    color: "#391b59",
  },
  value: {
    fontFamily: "DMSans-Bold",
    fontSize: 48,
    color: "#391b59",
  },
  placeholder: {
    fontFamily: "DMSans-Bold",
    fontSize: 48,
    color: "rgba(0,0,0,0.1)",
  },
  label: {
    fontFamily: "DMSans-Bold",
    fontSize: 48,
    color: "#391b59",
  },
  cursorWrapper: {
    width: 2,
    height: 40,
    alignSelf: "center",
  },
  cursor: {
    width: 2,
    height: 40,
    backgroundColor: "#391b59",
  },
  hiddenInput: {
    position: "absolute",
    opacity: 0,
    height: 0,
    width: 0,
  },
});
