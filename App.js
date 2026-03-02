import { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import {
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@gestation_entries';
const AGREEMENT_KEY = '@hipaa_agreement_accepted';

export default function App() {
  const [name, setName] = useState('');
  const [weeks, setWeeks] = useState('');
  const [days, setDays] = useState('');
  const [entries, setEntries] = useState([]);
  const [showAgreement, setShowAgreement] = useState(false);
  const [agreementLoaded, setAgreementLoaded] = useState(false);

  useEffect(() => {
    checkAgreement();
    loadEntries();
  }, []);

  const checkAgreement = async () => {
    try {
      const accepted = await AsyncStorage.getItem(AGREEMENT_KEY);
      if (!accepted) setShowAgreement(true);
    } catch (e) {
      console.error('Failed to check agreement', e);
    } finally {
      setAgreementLoaded(true);
    }
  };

  const acceptAgreement = async () => {
    try {
      await AsyncStorage.setItem(AGREEMENT_KEY, 'true');
      setShowAgreement(false);
    } catch (e) {
      console.error('Failed to save agreement', e);
    }
  };

  const loadEntries = async () => {
    try {
      const json = await AsyncStorage.getItem(STORAGE_KEY);
      if (json) setEntries(JSON.parse(json));
    } catch (e) {
      console.error('Failed to load entries', e);
    }
  };

  const saveEntries = async (newEntries) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newEntries));
    } catch (e) {
      console.error('Failed to save entries', e);
    }
  };

  const addEntry = () => {
    const trimmedName = name.trim();
    if (!trimmedName) return;

    const w = parseInt(weeks, 10) || 0;
    const d = parseInt(days, 10) || 0;

    if (w < 0 || w > 42 || d < 0 || d > 6) return;

    const entry = {
      id: Date.now().toString(),
      name: trimmedName,
      weeks: w,
      days: d,
    };

    const newEntries = [entry, ...entries];
    setEntries(newEntries);
    saveEntries(newEntries);

    setName('');
    setWeeks('');
    setDays('');
    Keyboard.dismiss();
  };

  const deleteEntry = (id) => {
    const newEntries = entries.filter((e) => e.id !== id);
    setEntries(newEntries);
    saveEntries(newEntries);
  };

  const renderEntry = ({ item }) => (
    <View style={styles.entry}>
      <View style={styles.entryInfo}>
        <Text style={styles.entryName}>{item.name}</Text>
        <Text style={styles.entryAge}>
          {item.weeks} week{item.weeks !== 1 ? 's' : ''}, {item.days} day
          {item.days !== 1 ? 's' : ''}
        </Text>
      </View>
      <Pressable
        onPress={() => deleteEntry(item.id)}
        style={styles.deleteButton}
        hitSlop={8}
      >
        <Text style={styles.deleteText}>✕</Text>
      </Pressable>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Gestation Tracker</Text>
      </View>

      <View style={styles.form}>
        <TextInput
          style={styles.nameInput}
          placeholder="Name"
          value={name}
          onChangeText={setName}
          returnKeyType="next"
        />
        <View style={styles.ageRow}>
          <TextInput
            style={styles.numberInput}
            placeholder="Weeks"
            value={weeks}
            onChangeText={setWeeks}
            keyboardType="number-pad"
            maxLength={2}
            returnKeyType="next"
          />
          <TextInput
            style={styles.numberInput}
            placeholder="Days"
            value={days}
            onChangeText={setDays}
            keyboardType="number-pad"
            maxLength={1}
            returnKeyType="done"
          />
          <Pressable
            style={[styles.addButton, !name.trim() && styles.addButtonDisabled]}
            onPress={addEntry}
            disabled={!name.trim()}
          >
            <Text style={styles.addButtonText}>Add</Text>
          </Pressable>
        </View>
      </View>

      <FlatList
        data={entries}
        renderItem={renderEntry}
        keyExtractor={(item) => item.id}
        style={styles.list}
        contentContainerStyle={entries.length === 0 && styles.emptyList}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No entries yet</Text>
        }
      />

      <Modal visible={showAgreement && agreementLoaded} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Important Notice</Text>
            <ScrollView style={styles.modalScroll}>
              <Text style={styles.modalText}>
                This app is not HIPAA compliant. By using this app, you agree
                that you will not enter any Protected Health Information (PHI)
                as defined by HIPAA, including but not limited to patient names,
                medical record numbers, or any other information that could be
                used to identify a patient.
              </Text>
              <Text style={styles.modalText}>
                This app stores data locally on your device without encryption
                and is intended for personal, non-clinical use only.
              </Text>
            </ScrollView>
            <Pressable style={styles.agreeButton} onPress={acceptAgreement}>
              <Text style={styles.agreeButtonText}>I Agree</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <StatusBar style="auto" />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 16,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
  },
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
  numberInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fafafa',
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
  list: {
    flex: 1,
  },
  emptyList: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: '#999',
    fontSize: 16,
  },
  entry: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 12,
    padding: 16,
    borderRadius: 10,
    shadowColor: '#000',
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
    fontWeight: '600',
    color: '#333',
  },
  entryAge: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  deleteButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteText: {
    color: '#999',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalScroll: {
    marginBottom: 20,
  },
  modalText: {
    fontSize: 15,
    color: '#444',
    lineHeight: 22,
    marginBottom: 12,
  },
  agreeButton: {
    backgroundColor: '#4a90d9',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
  },
  agreeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
