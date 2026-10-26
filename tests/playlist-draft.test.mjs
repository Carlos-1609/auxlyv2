import assert from 'node:assert/strict';
import test from 'node:test';

import { createPlaylistDraftStore } from '../src/stores/playlist-draft-store.ts';

function draftValues(store) {
  const { name, selectedFriendIds, tracksPerPerson, destinationConnectionId } = store.getState();
  return { name, selectedFriendIds, tracksPerPerson, destinationConnectionId };
}

test('a draft starts empty with ten tracks per person and no guessed destination', () => {
  assert.deepEqual(draftValues(createPlaylistDraftStore()), {
    name: '', selectedFriendIds: [], tracksPerPerson: 10, destinationConnectionId: null,
  });
});

test('editing a name preserves typing and does not overwrite other draft fields', () => {
  const store = createPlaylistDraftStore();
  store.getState().toggleFriend('friend-1');
  store.getState().setName('  Our shared mix ');
  assert.equal(store.getState().name, '  Our shared mix ');
  assert.deepEqual(store.getState().selectedFriendIds, ['friend-1']);
  assert.equal(store.getState().tracksPerPerson, 10);
});

test('tracks per person accepts positive whole numbers', () => {
  const store = createPlaylistDraftStore();
  for (const count of [1, 7, 25]) {
    assert.equal(store.getState().setTracksPerPerson(count), true);
    assert.equal(store.getState().tracksPerPerson, count);
  }
});

test('invalid track counts leave the previous state untouched', () => {
  const store = createPlaylistDraftStore();
  const previous = store.getState();
  for (const count of [0, -1, 1.5, NaN, Infinity, -Infinity, Number.MAX_SAFE_INTEGER + 1]) {
    assert.equal(store.getState().setTracksPerPerson(count), false);
    assert.equal(store.getState(), previous);
  }
});

test('toggling friends adds or removes IDs without changing previous arrays', () => {
  const store = createPlaylistDraftStore();
  const empty = store.getState().selectedFriendIds;
  store.getState().toggleFriend('friend-1');
  const firstSelection = store.getState().selectedFriendIds;
  store.getState().toggleFriend('friend-2');
  store.getState().toggleFriend('friend-1');
  assert.deepEqual(store.getState().selectedFriendIds, ['friend-2']);
  assert.deepEqual(empty, []);
  assert.deepEqual(firstSelection, ['friend-1']);
});

test('blank friend IDs cannot be selected', () => {
  const store = createPlaylistDraftStore();
  const previous = store.getState();
  store.getState().toggleFriend('');
  store.getState().toggleFriend('   ');
  assert.equal(store.getState(), previous);
});

test('bulk friend selection removes duplicates and blanks and copies the input', () => {
  const store = createPlaylistDraftStore();
  const input = ['friend-1', 'friend-1', '', '  ', 'friend-2'];
  store.getState().setSelectedFriendIds(input);
  input.push('friend-3');
  assert.deepEqual(store.getState().selectedFriendIds, ['friend-1', 'friend-2']);
  store.getState().setSelectedFriendIds([]);
  assert.deepEqual(store.getState().selectedFriendIds, []);
});

test('a destination stores the exact connection ID, not a music-provider name', () => {
  const store = createPlaylistDraftStore();
  store.getState().setDestinationConnectionId('spotify-personal-connection');
  assert.equal(store.getState().destinationConnectionId, 'spotify-personal-connection');
  store.getState().setDestinationConnectionId('spotify-work-connection');
  assert.equal(store.getState().destinationConnectionId, 'spotify-work-connection');
});

test('a destination can be cleared, and a blank selection means no destination', () => {
  const store = createPlaylistDraftStore();
  for (const empty of [null, '', '  ']) {
    store.getState().setDestinationConnectionId('connection-1');
    store.getState().setDestinationConnectionId(empty);
    assert.equal(store.getState().destinationConnectionId, null);
  }
});

test('reset clears every field, creates a fresh friend list, and preserves actions', () => {
  const store = createPlaylistDraftStore();
  const reset = store.getState().resetDraft;
  store.getState().setName('Friday mix');
  store.getState().toggleFriend('friend-1');
  store.getState().setTracksPerPerson(5);
  store.getState().setDestinationConnectionId('connection-1');
  reset();
  const firstEmptyList = store.getState().selectedFriendIds;
  assert.deepEqual(draftValues(store), draftValues(createPlaylistDraftStore()));
  assert.equal(store.getState().resetDraft, reset);
  reset();
  assert.notEqual(store.getState().selectedFriendIds, firstEmptyList);
  store.getState().setName('A new mix');
  assert.equal(store.getState().name, 'A new mix');
});

test('separate store instances do not share one user’s draft or friend list', () => {
  const first = createPlaylistDraftStore();
  const second = createPlaylistDraftStore();
  assert.notEqual(first.getState().selectedFriendIds, second.getState().selectedFriendIds);
  first.getState().setName('Private draft');
  first.getState().toggleFriend('friend-1');
  first.getState().setDestinationConnectionId('connection-1');
  assert.deepEqual(draftValues(second), {
    name: '', selectedFriendIds: [], tracksPerPerson: 10, destinationConnectionId: null,
  });
  second.getState().resetDraft();
  assert.equal(first.getState().name, 'Private draft');
});

test('updates notify subscribers with a new state while preserving the old snapshot', () => {
  const store = createPlaylistDraftStore();
  const changes = [];
  const unsubscribe = store.subscribe((next, previous) => changes.push({ next, previous }));
  store.getState().setName('Road trip');
  assert.equal(changes.length, 1);
  assert.equal(changes[0].previous.name, '');
  assert.equal(changes[0].next.name, 'Road trip');
  unsubscribe();
  store.getState().setName('Another mix');
  assert.equal(changes.length, 1);
});
