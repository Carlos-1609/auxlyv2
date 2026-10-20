import { randomUUID } from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';

import { createChunkedStorage } from './chunked-storage';

// Metro selects this file on iOS/Android. Session tokens never use plain local storage there.
export const sessionStorage = createChunkedStorage({
  getItem: (key) => SecureStore.getItemAsync(key),
  setItem: (key, value) => SecureStore.setItemAsync(key, value, {
    keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
  }),
  removeItem: (key) => SecureStore.deleteItemAsync(key),
}, randomUUID);
