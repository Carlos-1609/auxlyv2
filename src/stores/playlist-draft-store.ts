import { createStore } from 'zustand/vanilla';

import type { PlaylistDraft } from '../types/music';

export type PlaylistDraftStore = PlaylistDraft & {
  setName(name: string): void;
  setTracksPerPerson(count: number): boolean;
  setSelectedFriendIds(friendIds: readonly string[]): void;
  toggleFriend(friendId: string): void;
  setDestinationConnectionId(connectionId: PlaylistDraft['destinationConnectionId']): void;
  resetDraft(): void;
};

function createEmptyDraft(): PlaylistDraft {
  return {
    name: '',
    selectedFriendIds: [],
    tracksPerPerson: 10,
    destinationConnectionId: null,
  };
}

// A factory gives each signed-in user their own store, rather than one global store.
export function createPlaylistDraftStore() {
  return createStore<PlaylistDraftStore>()((set) => ({
    ...createEmptyDraft(),

    setName: (name) => set({ name }),

    setTracksPerPerson: (count) => {
      if (!Number.isSafeInteger(count) || count < 1) return false;
      set({ tracksPerPerson: count });
      return true;
    },

    setSelectedFriendIds: (friendIds) => set({
      selectedFriendIds: [...new Set(friendIds.filter((id) => id.trim().length > 0))],
    }),

    toggleFriend: (friendId) => {
      if (!friendId.trim()) return;
      set((state) => ({
        selectedFriendIds: state.selectedFriendIds.includes(friendId)
          ? state.selectedFriendIds.filter((id) => id !== friendId)
          : [...state.selectedFriendIds, friendId],
      }));
    },

    setDestinationConnectionId: (connectionId) => set({
      destinationConnectionId: connectionId?.trim() ? connectionId : null,
    }),

    // Merge new draft values so the action functions remain available after reset.
    resetDraft: () => set(createEmptyDraft()),
  }));
}

export type PlaylistDraftStoreApi = ReturnType<typeof createPlaylistDraftStore>;
