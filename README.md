# Auxly

A shared soundtrack for your circle. A fresh React Native project built with Expo,
TypeScript, Expo Router, NativeWind 4, and Tailwind CSS 3.

## Run the project

Use Node.js 22.13 or newer and npm. Dependencies are locked in `package-lock.json`.

```sh
npm ci
npm start
```

Scan the QR code with a compatible Expo Go app, or press `i` for an installed iOS
simulator and `a` for an installed Android emulator. For a browser preview:

```sh
npm run web
```

Expo SDK 57 was selected to match stable NativeWind support. Custom native modules
are supported through development builds. Google/Apple sign-in on mobile requires
an Auxly development build so the app can receive its own `auxly://` callbacks.
Use `npm run dev` for that build, or `npm run start:go` for an Expo Go UI/email preview.

## What is included

- A responsive welcome screen featuring the supplied Auxly logo.
- An expandable explanation of the planned playlist workflow.
- A `/theme` screen with interactive status previews and button states.
- Orange/yellow accents, dark backgrounds, and the requested status colors.
- Shared button and safe-area screen components, TypeScript, and ESLint.
- App icon, splash screen, and web favicon using the original, unmodified logo.
- Google sign-in, native Apple sign-in on iOS, and Apple browser OAuth on other platforms.
- Email/password signup, confirmation, sign-in, recovery, and confirmation resend.
- Session restoration, native encrypted storage, guarded screens, and sign-out.
- A signed-in home and an honest placeholder for future music-service connections.

Music-account connections, rooms, and playlist creation are not implemented yet.
No music connection is simulated. One person will be able to connect multiple
music accounts and select a destination connection for each playlist.

## Configure authentication

Follow [the authentication setup guide](docs/auth-setup.md). Copy `.env.example`
to `.env`, add your Supabase URL and publishable key, enable Google/Apple/Email
in Supabase, and allow the documented callback URLs. Restart Expo afterward.
Until those settings are supplied, the UI works but real sign-in is unavailable.
No provider secret or Supabase admin key belongs in the app.

The session provider restores the signed-in person once, then shares the session
with all screens. Expo Router guards the `(app)` group:

```tsx
<Stack.Protected guard={Boolean(session) && !isRecovering}>
  <Stack.Screen name="(app)" />
</Stack.Protected>
```

This keeps signed-out users out of the home/services screens and keeps password
recovery in its own flow. Future database permissions still need backend RLS.

## How the styling works

`src/theme/colors.json` is the single source for colors. `tailwind.config.js`
extends NativeWind's preset with those values. `src/constants/theme.ts` exposes
the same values to native props such as icon colors and gradients.

```tsx
<View className="rounded-2xl bg-surface p-5">
  <Text className="text-secondary">Your next great mix</Text>
</View>
```

NativeWind converts those Tailwind utility classes into React Native styles.
`bg-surface` selects a dark card color, `p-5` adds padding, and `text-secondary`
uses the brand yellow. Change one token to update its uses across the app.

The remaining setup connects the pipeline:

- `babel.config.js` enables NativeWind's JSX transform.
- `metro.config.js` compiles `src/global.css` with NativeWind.
- `nativewind-env.d.ts` adds TypeScript support for `className`.
- `src/app/_layout.tsx` imports global styles once and provides dark navigation,
  safe areas, and the status bar.

## Main files

```text
src/
  app/
    _layout.tsx       Navigation and app-wide providers
    index.tsx         Welcome screen
    (auth)/           Login, signup, and email confirmation screens
    (app)/            Guarded home and music-services placeholder
    auth/callback.tsx OAuth/email callback handler
    forgot-password.tsx Password-reset email request
    reset-password.tsx Recovery-only password form
    theme.tsx         Palette and component previews
    +not-found.tsx    Missing-route screen
  components/
    ui/button.tsx    Gradient and secondary buttons
    ui/icon.tsx      Decorative icons with accessible labels excluded
    ui/screen.tsx    Safe-area, scrollable page container
    ui/form-field.tsx Accessible text/password input
    wordmark.tsx     Compact header wordmark
  constants/theme.ts Shared native colors and navigation theme
  lib/auth/          Auth actions, validation, callbacks, and secure storage
  lib/supabase.ts    Shared Supabase PKCE client
  providers/         Shared authentication state and session lifecycle
  theme/colors.json  Shared brand and status colors
  global.css         Tailwind directives
assets/images/auxly-logo.png
```

## Check the project

```sh
npm run typecheck
npm run lint
npm test
npx expo install --check
npx expo-doctor
npx expo export --platform all
```

The initial dependency audit reports 36 advisories (21 high, 15 moderate) in
the selected Expo/Metro and Tailwind dependency trees. Several suggested fixes
require incompatible SDK downgrades or a Tailwind major-version migration;
no forced dependency changes have been applied. Review `npm audit` as upstream
patches become available.

Setup references: [Expo](https://docs.expo.dev/get-started/create-a-project/) and
[NativeWind](https://www.nativewind.dev/docs/getting-started/installation).
