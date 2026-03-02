import { useState } from 'react';
import {
  Keyboard,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

interface EntryFormProps {
  onAdd: (entry: { name: string; weeks: number; days: number }) => void;
}

/** Form for adding a new gestation entry with name, weeks, and days fields. */
export default function EntryForm({ onAdd }: EntryFormProps) {
  const [name, setName] = useState('');
  const [weeks, setWeeks] = useState('');
  const [days, setDays] = useState('');

  const handleAdd = () => {
    const trimmedName = name.trim();
    if (!trimmedName) return;

    const w = parseInt(weeks, 10) || 0;
    const d = parseInt(days, 10) || 0;

    if (w < 0 || w > 44 || d < 0 || d > 6) return;

    onAdd({ name: trimmedName, weeks: w, days: d });

    setName('');
    setWeeks('');
    setDays('');
    Keyboard.dismiss();
  };

  return (
    <View style={styles.form}>
      <TextInput
        style={styles.nameInput}
        placeholder="Name"
        value={name}
        onChangeText={setName}
        returnKeyType="next"
      />
      <View style={styles.ageRow}>
        <View style={styles.inputWithHint}>
          <TextInput
            style={styles.numberInput}
            placeholder="Weeks"
            value={weeks}
            onChangeText={setWeeks}
            keyboardType="number-pad"
            maxLength={2}
            returnKeyType="next"
          />
          <Text style={styles.hintText}>0–42</Text>
        </View>
        <View style={styles.inputWithHint}>
          <TextInput
            style={styles.numberInput}
            placeholder="Days"
            value={days}
            onChangeText={setDays}
            keyboardType="number-pad"
            maxLength={1}
            returnKeyType="done"
          />
          <Text style={styles.hintText}>0–6</Text>
        </View>
        <Pressable
          style={[styles.addButton, !name.trim() && styles.addButtonDisabled]}
          onPress={handleAdd}
          disabled={!name.trim()}
        >
          <Text style={styles.addButtonText}>Add</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  form: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  nameInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 10,
    backgroundColor: '#fafafa',
  },
  ageRow: {
    flexDirection: 'row',
    gap: 10,
  },
  inputWithHint: {
    flex: 1,
  },
  numberInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fafafa',
  },
  hintText: {
    fontSize: 11,
    color: '#999',
    marginTop: 2,
    marginLeft: 4,
  },
  addButton: {
    backgroundColor: '#4a90d9',
    borderRadius: 8,
    paddingHorizontal: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonDisabled: {
    backgroundColor: '#a0c4e8',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
