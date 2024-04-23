import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

export function cxStore_setItem(key: string, value: string) {
    if (Platform.OS === 'web')
        localStorage.setItem(key, value);
    else
        SecureStore.setItem(key, value);
}

export function cxStore_getItem(key: string): string | null {
    if (Platform.OS === 'web')
        return localStorage.getItem(key);
    else
        return SecureStore.getItem(key);
}

export function cxStore_removeItem(key: string) {
    if (Platform.OS === 'web')
        localStorage.setItem(key, '');
    else
        SecureStore.setItem(key, '');
}