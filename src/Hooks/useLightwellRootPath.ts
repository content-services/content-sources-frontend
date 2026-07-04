import { useMemo } from 'react';
import { useHref } from 'react-router-dom';

import { LIGHTWELL_ROUTE } from '../Pages/Lightwell/constants';

// Resolves the Lightwell root path from the current route context
export function useLightwellRootPath(): string {
  const path = useHref(LIGHTWELL_ROUTE);
  return useMemo(() => path.replace(/\/$/, '') || LIGHTWELL_ROUTE, [path]);
}
