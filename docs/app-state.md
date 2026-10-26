# Auxly app state: the shared playlist notebook

Zustand holds **shared app state**: information several screens need while the
app is open. Think of it as a notebook that the playlist screens share, rather
than each screen keeping a different copy of the same unfinished mix.

Supabase still handles sign-in and backend data. Zustand does not replace it.

## What this first step adds

One focused playlist-draft store contains:

```ts
{
  name: '',
  selectedFriendIds: [],
  tracksPerPerson: 10,
  destinationConnectionId: null,
}
```

An ID identifies one saved record. `destinationConnectionId` identifies a
particular connected account, not just a platform such as Spotify. That will let
someone choose between two Spotify accounts instead of the app guessing.
`null` means no destination has been selected yet.

The default is ten tracks per person, following the original playlist idea.
Only positive whole numbers are accepted. Platform-specific limits can be added
when real music services are connected.

## Where the pieces live

- `src/types/music.ts`: describes the draft's fields and their allowed types.
  TypeScript uses this description to catch mistakes before the app runs.
- `src/stores/playlist-draft-store.ts`: creates a notebook and its **actions**.
  An action is simply a function that changes one part of the notebook.
- `src/providers/playlist-draft-provider.tsx`: gives signed-in screens access to
  their shared notebook. A **provider** is a wrapper that supplies something to
  the components inside it.
- `src/app/(app)/_layout.tsx`: installs that wrapper around the signed-in screens.
- `tests/playlist-draft.test.mjs`: checks editing, selections, validation, resets,
  and independent store instances.

## Reading and changing a draft in a future screen

```tsx
import { usePlaylistDraft } from '@/providers/playlist-draft-provider';

const name = usePlaylistDraft((state) => state.name);
const setName = usePlaylistDraft((state) => state.setName);

// For example, a future text field can call this when its text changes.
setName('Friday with friends');
```

These hook calls belong inside a React component. The function
`(state) => state.name` is a **selector**: it asks for just the notebook entry
this component needs. Changing the selected friends does not need to redraw a
component that only reads the playlist name. Select individual fields, as above;
returning a new object or array from a selector needs Zustand's `useShallow`.

Other actions work the same way:

```tsx
const toggleFriend = usePlaylistDraft((state) => state.toggleFriend);
const setDestination = usePlaylistDraft((state) => state.setDestinationConnectionId);
const setTrackCount = usePlaylistDraft((state) => state.setTracksPerPerson);
const resetDraft = usePlaylistDraft((state) => state.resetDraft);

toggleFriend('friend-id'); // Select the friend; call again to deselect.
setDestination('connection-id'); // A specific account, not "spotify".
const accepted = setTrackCount(10); // false for zero, fractions, or invalid numbers.
resetDraft(); // Start over with an empty draft and ten tracks per person.
```

These IDs are examples, not real or connected accounts. Use actions in user
events, such as button presses; do not call them while a component is rendering.
The friend list is `readonly` so TypeScript discourages editing it with `.push()`.
Actions create a new array instead, allowing Zustand to notice the change.

## Lifetime, safety, and trade-offs

- **One store, not three:** friends and destination are parts of the same draft.
  Keeping them together means one reset can reliably clear the whole mix. More
  unrelated app features can get their own stores later.
- **One instance per signed-in user:** a factory is a function that makes a new
  store. The provider calls it once, not on every screen redraw. The layout's
  React `key` uses the user ID, so changing accounts replaces the notebook.
  Signing out unmounts the signed-in screens and discards their notebook.
  Refreshing a sign-in token for the same user does not change the key.
- **Memory only for now:** the draft survives navigation between signed-in
  screens, but not a full page reload, app restart, or leaving that route group.
  We have not added **persistence**, which means saving the draft so it can be
  restored later. This avoids adding storage and restore timing before the flow
  exists. If added later, saved drafts must be separated by user and must not
  resurrect after sign-out unintentionally.
- **No credentials:** never add passwords, Supabase sessions, or music-service
  access/refresh tokens to this draft. The existing auth setup remains unchanged.
- **Not a security boundary:** a selected friend or connection ID is just a local
  choice. The backend must still check friendships, account ownership, and write
  permissions before generating a playlist. Drafts may be incomplete while the
  user is editing; validate the final request before sending it.

## What is deliberately not implemented yet

No new screens, fake connections, provider OAuth, friend lookups, Supabase tables,
or playlist generation are added in this step. The existing
`PlaylistCreationInput` remains unchanged. It is a backend request shape, whereas
`PlaylistDraft` is the unfinished form that future screens will edit.

Verify with `npm test`, `npm run typecheck`, and `npm run lint`.

References: [Zustand TypeScript guide](https://zustand.docs.pmnd.rs/learn/guides/beginner-typescript.html)
and [Zustand store providers](https://zustand.docs.pmnd.rs/learn/guides/initialize-state-with-props.html).
