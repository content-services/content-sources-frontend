import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React, { useEffect } from 'react';
import { Provider as ReduxProvider } from 'react-redux';
import * as Redux from 'redux';
import { AccessCheck } from '@project-kessel/react-kessel-access-check';

import LightwellApp from './LightwellApp';
import { ContextProvider } from './middleware/AppContext';
import { createStore, restoreStore } from './store';
import { ENABLE_MASTHEAD_POC, patchChromeMasthead } from './utils/patchChromeMasthead';

interface LightwellAppEntryProps {
  logger?: Redux.Middleware;
}

let chromeShellCleanup: (() => void) | undefined;

if (ENABLE_MASTHEAD_POC && typeof document !== 'undefined') {
  chromeShellCleanup = patchChromeMasthead({ hide: true });
}

export default function LightwellAppEntry({ logger }: LightwellAppEntryProps) {
  const store = React.useMemo(() => {
    restoreStore();
    if (logger) {
      return createStore(logger).store;
    }
    return createStore().store;
  }, [logger]);

  useEffect(() => {
    insights?.chrome?.appAction?.('view-list-page');
  }, []);

  useEffect(() => () => chromeShellCleanup?.(), []);

  const kesselBaseUrl = window.location.origin;

  const [queryClient] = React.useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  return (
    <ReduxProvider store={store}>
      <QueryClientProvider client={queryClient}>
        <AccessCheck.Provider baseUrl={kesselBaseUrl} apiPath='/api/kessel/v1beta2'>
          <ContextProvider>
            <LightwellApp />
          </ContextProvider>
        </AccessCheck.Provider>
      </QueryClientProvider>
    </ReduxProvider>
  );
}
