type AsyncStore = {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
};

type Manifest = { version: string; count: number };
const CHUNK_LENGTH = 480; // At most 1920 UTF-8 bytes, including emoji and non-ASCII names.
const MAX_CHUNKS = 256;

export function createChunkedStorage(store: AsyncStore, createId: () => string): AsyncStore {
  async function getManifest(key: string): Promise<Manifest | null> {
    const raw = await store.getItem(`${key}.manifest`);
    if (!raw) return null;
    try {
      const value = JSON.parse(raw);
      return typeof value.version === 'string' && /^[a-zA-Z0-9-]+$/.test(value.version) &&
        Number.isInteger(value.count) && value.count > 0 && value.count <= MAX_CHUNKS ? value : null;
    } catch {
      return null;
    }
  }

  async function removeChunks(key: string, manifest: Manifest) {
    await Promise.all(Array.from({ length: manifest.count }, (_, i) =>
      store.removeItem(`${key}.${manifest.version}.${i}`)));
  }

  return {
    async getItem(key) {
      for (let attempt = 0; attempt < 3; attempt++) {
        const manifest = await getManifest(key);
        if (!manifest) return null;
        const parts = await Promise.all(Array.from({ length: manifest.count }, (_, i) =>
          store.getItem(`${key}.${manifest.version}.${i}`)));
        if (parts.every((part) => part !== null)) return parts.join('');
        // Token refresh may have replaced the manifest and cleaned up old chunks
        // between these reads. Retry the new version instead of losing the session.
        const latest = await getManifest(key);
        if (!latest || latest.version === manifest.version) return null;
      }
      return null;
    },
    async setItem(key, value) {
      const previous = await getManifest(key);
      // Array.from keeps surrogate pairs together before splitting into small pieces.
      const characters = Array.from(value);
      const parts: string[] = [];
      for (let i = 0; i < characters.length; i += CHUNK_LENGTH) parts.push(characters.slice(i, i + CHUNK_LENGTH).join(''));
      if (!parts.length) parts.push('');
      if (parts.length > MAX_CHUNKS) throw new Error('The sign-in session is too large to save.');
      const next = { version: createId(), count: parts.length };
      try {
        const writes = await Promise.allSettled(parts.map((part, i) => store.setItem(`${key}.${next.version}.${i}`, part)));
        const failure = writes.find((write) => write.status === 'rejected');
        if (failure?.status === 'rejected') throw failure.reason;
        // Publish only after all new chunks exist, so a failed write preserves the old session.
        await store.setItem(`${key}.manifest`, JSON.stringify(next));
      } catch (error) {
        await removeChunks(key, next).catch(() => undefined);
        throw error;
      }
      // An obsolete chunk must not make an otherwise successful login fail.
      if (previous) await removeChunks(key, previous).catch(() => undefined);
    },
    async removeItem(key) {
      const previous = await getManifest(key);
      await store.removeItem(`${key}.manifest`);
      if (previous) await removeChunks(key, previous);
    },
  };
}
