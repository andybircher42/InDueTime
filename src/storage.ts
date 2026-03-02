import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Entry {
  id: string;
  name: string;
  weeks: number;
  days: number;
}

const STORAGE_KEY = '@gestation_entries';
const AGREEMENT_KEY = '@hipaa_agreement_accepted';

export const loadEntries = async (): Promise<Entry[]> => {
  const json = await AsyncStorage.getItem(STORAGE_KEY);
  return json ? JSON.parse(json) : [];
};

export const saveEntries = async (entries: Entry[]): Promise<void> => {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
};

export const checkAgreement = async (): Promise<boolean> => {
  const accepted = await AsyncStorage.getItem(AGREEMENT_KEY);
  return !!accepted;
};

export const acceptAgreement = async (): Promise<void> => {
  await AsyncStorage.setItem(AGREEMENT_KEY, 'true');
};

export const resetAgreement = async (): Promise<void> => {
  await AsyncStorage.removeItem(AGREEMENT_KEY);
};
