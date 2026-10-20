import assert from 'node:assert/strict';
import test from 'node:test';

import { createChunkedStorage } from '../src/lib/auth/chunked-storage.ts';

function fixture() {
  const values = new Map();
  let sequence = 0;
  let fail = false;
  const adapter = createChunkedStorage({
    getItem: async (key) => values.get(key) ?? null,
    setItem: async (key, value) => {
      assert.ok(Buffer.byteLength(value, 'utf8') < 2048, 'every SecureStore payload fits older iOS limits');
      if (fail && key.endsWith('.1')) throw new Error('Simulated native storage error');
      values.set(key, value);
    },
    removeItem: async (key) => { values.delete(key); },
  }, () => `version-${++sequence}`);
  return { adapter, values, failNextWrite: () => { fail = true; } };
}

test('long sessions containing Unicode and emoji round-trip without oversized payloads', async () => {
  const { adapter } = fixture();
  const value = JSON.stringify({ access_token: 'token'.repeat(1500), name: '🟠音楽'.repeat(900) });
  await adapter.setItem('session', value);
  assert.equal(await adapter.getItem('session'), value);
});

test('failed replacement preserves the previous readable session and removes partial new chunks', async () => {
  const { adapter, values, failNextWrite } = fixture();
  await adapter.setItem('session', 'old session');
  failNextWrite();
  await assert.rejects(() => adapter.setItem('session', 'new'.repeat(600)));
  assert.equal(await adapter.getItem('session'), 'old session');
  assert.equal(values.size, 2);
});

test('overwriting and removing sessions also removes obsolete chunks', async () => {
  const { adapter, values } = fixture();
  await adapter.setItem('session', 'long'.repeat(1000));
  await adapter.setItem('session', 'short');
  assert.equal(values.size, 2);
  await adapter.removeItem('session');
  assert.equal(values.size, 0);
  assert.equal(await adapter.getItem('session'), null);
});

test('missing chunks and corrupt manifests fail closed instead of returning partial tokens', async () => {
  const { adapter, values } = fixture();
  await adapter.setItem('session', 'value');
  values.delete('session.version-1.0');
  assert.equal(await adapter.getItem('session'), null);
  values.set('session.manifest', '{broken');
  assert.equal(await adapter.getItem('session'), null);
});

test('a reader retries if token refresh replaces the manifest during a read', async () => {
  let manifestReads = 0;
  const adapter = createChunkedStorage({
    getItem: async (key) => {
      if (key === 'session.manifest') return JSON.stringify({ version: ++manifestReads === 1 ? 'old' : 'new', count: 1 });
      return key === 'session.new.0' ? 'refreshed session' : null;
    },
    setItem: async () => {},
    removeItem: async () => {},
  }, () => 'unused');
  assert.equal(await adapter.getItem('session'), 'refreshed session');
});
