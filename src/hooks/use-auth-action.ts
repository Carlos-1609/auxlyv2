import { useCallback, useEffect, useRef, useState } from 'react';

import { AuthCancelledError, authErrorMessage } from '@/lib/auth/errors';

export function useAuthAction() {
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const busy = useRef(false);
  const mounted = useRef(true);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);

  const run = useCallback(async (action: () => Promise<void>) => {
    if (busy.current) return;
    busy.current = true;
    setIsBusy(true);
    setError(null);
    try {
      await action();
    } catch (caught) {
      if (mounted.current && !(caught instanceof AuthCancelledError)) {
        setError(caught instanceof Error && caught.message === 'AUXLY_DEVELOPMENT_BUILD_REQUIRED'
          ? 'Use the Auxly development build for social sign-in. Email sign-in also works in Expo Go.'
          : authErrorMessage(caught));
      }
    } finally {
      busy.current = false;
      if (mounted.current) setIsBusy(false);
    }
  }, []);

  return { isBusy, error, run, clearError: () => setError(null) };
}
