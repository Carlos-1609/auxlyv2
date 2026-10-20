import assert from 'node:assert/strict';
import test from 'node:test';

import { parseAuthRedirect } from '../src/lib/auth/redirect.ts';
import { normalizeEmail, validateAuthForm } from '../src/lib/auth/validation.ts';

const callback = 'auxly://auth/callback';

test('PKCE callbacks keep the flow identifier, without trusting a recovery query parameter', () => {
  assert.deepEqual(parseAuthRedirect(`${callback}?code=code123&sb_flow_id=flow_12345&type=recovery`, callback), {
    kind: 'code', code: 'code123', flowId: 'flow_12345',
  });
});

test('email token hashes require a supported verification type', () => {
  assert.deepEqual(parseAuthRedirect(`${callback}?token_hash=hash123&type=recovery`, callback), {
    kind: 'email', tokenHash: 'hash123', type: 'recovery',
  });
  assert.throws(() => parseAuthRedirect(`${callback}?token_hash=hash123&type=anything`, callback));
});

test('foreign origins, schemes, paths, and embedded credentials are rejected', () => {
  for (const url of ['other://auth/callback?code=x', 'auxly://other/callback?code=x', 'auxly://auth/other?code=x']) {
    assert.throws(() => parseAuthRedirect(url, callback));
  }
  const web = 'https://auxly.example/auth/callback';
  assert.throws(() => parseAuthRedirect('https://evil.example/auth/callback?code=x', web));
  assert.throws(() => parseAuthRedirect('https://user:password@auxly.example/auth/callback?code=x', web));
  assert.throws(() => parseAuthRedirect('http://auxly.example/auth/callback?code=x', web));
});

test('ambiguous parameters, implicit tokens, empty links, and denied access are rejected', () => {
  for (const suffix of ['', '?code=x&code=y', '?code=x&token_hash=y&type=email', '#access_token=x', '?error=access_denied', '?code=x&sb_flow_id=bad%20id']) {
    assert.throws(() => parseAuthRedirect(callback + suffix, callback));
  }
});

test('arbitrary next URLs cannot select a post-login destination', () => {
  assert.deepEqual(parseAuthRedirect(`${callback}?code=x&next=https://evil.example`, callback), {
    kind: 'code', code: 'x', flowId: undefined,
  });
});

test('email normalization never alters the password', () => {
  assert.equal(normalizeEmail('  Person@Example.COM  '), 'person@example.com');
  assert.deepEqual(validateAuthForm('login', { email: 'person@example.com', password: ' x ' }), {});
});

test('signup validates name, email, password length, and matching passwords', () => {
  const errors = validateAuthForm('signup', { name: ' ', email: 'invalid', password: 'short', confirmPassword: 'other' });
  assert.deepEqual(Object.keys(errors).sort(), ['confirmPassword', 'email', 'name', 'password']);
  assert.deepEqual(validateAuthForm('signup', {
    name: 'Carlos', email: 'person@example.com', password: 'a long password', confirmPassword: 'a long password',
  }), {});
});

test('reset requires a strong matching password but no email', () => {
  assert.deepEqual(validateAuthForm('reset', { email: '', password: 'new password 123', confirmPassword: 'new password 123' }), {});
  assert.ok(validateAuthForm('reset', { email: '', password: 'short', confirmPassword: 'short' }).password);
});
