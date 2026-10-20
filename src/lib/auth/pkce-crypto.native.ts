import * as Crypto from 'expo-crypto';

// Supabase needs these Web Crypto methods for a random verifier and an S256
// challenge. Hermes does not provide them on every device; use Expo's native crypto.
const crypto = globalThis.crypto ?? {};
if (!crypto.getRandomValues) Object.defineProperty(crypto, 'getRandomValues', { value: Crypto.getRandomValues });
if (!crypto.randomUUID) Object.defineProperty(crypto, 'randomUUID', { value: Crypto.randomUUID });
if (!crypto.subtle) {
  Object.defineProperty(crypto, 'subtle', {
    value: {
      digest(algorithm: string | { name: string }, data: BufferSource) {
        const name = typeof algorithm === 'string' ? algorithm : algorithm.name;
        if (name.toUpperCase() !== 'SHA-256') throw new Error('Only SHA-256 is provided by the auth crypto adapter.');
        return Crypto.digest(Crypto.CryptoDigestAlgorithm.SHA256, data);
      },
    },
  });
}
if (!globalThis.crypto) Object.defineProperty(globalThis, 'crypto', { value: crypto });
