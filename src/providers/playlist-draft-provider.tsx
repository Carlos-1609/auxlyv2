import { createContext, useContext, useState, type PropsWithChildren } from 'react';
import { useStore } from 'zustand';

import {
  createPlaylistDraftStore,
  type PlaylistDraftStore,
  type PlaylistDraftStoreApi,
} from '@/stores/playlist-draft-store';

const PlaylistDraftContext = createContext<PlaylistDraftStoreApi | null>(null);

export function PlaylistDraftProvider({ children }: PropsWithChildren) {
  const [store] = useState(() => createPlaylistDraftStore());

  return <PlaylistDraftContext.Provider value={store}>{children}</PlaylistDraftContext.Provider>;
}

// Select only the field a screen needs, instead of subscribing to every draft change.
export function usePlaylistDraft<T>(selector: (state: PlaylistDraftStore) => T): T {
  const store = useContext(PlaylistDraftContext);
  if (!store) throw new Error('usePlaylistDraft must be used inside PlaylistDraftProvider.');
  return useStore(store, selector);
}
