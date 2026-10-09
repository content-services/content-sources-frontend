import { type ReactNode, useEffect, useRef } from 'react';

import Loader from 'components/Loader';
import { useChrome } from '@redhat-cloud-services/frontend-components/useChrome';
import { useTermsRequired } from 'services/Lightwell/TermsQueries';

export function buildTermsUrl(
  termsHost: string,
  currentUrl: string,
  site: string,
  events: string[],
): string {
  const returnUrl = encodeURIComponent(currentUrl);
  const eventParams = events.map((e) => `event=${encodeURIComponent(e)}`).join('&');
  return `${termsHost}/wapps/tnc/ackrequired?site=${encodeURIComponent(site)}&${eventParams}&redirect=${returnUrl}`;
}

interface TermsGuardProps {
  children: ReactNode;
}

export default function TermsGuard({ children }: TermsGuardProps) {
  const { data, isLoading, isError } = useTermsRequired();
  const { getEnvironment } = useChrome();
  const redirecting = useRef(false);

  const termsHost =
    getEnvironment() === 'prod'
      ? 'https://www.redhat.com'
      : 'https://www.stage.redhat.com';

  const canRedirect = data?.required && data.site && !!data.events?.length;

  useEffect(() => {
    if (!isLoading && !isError && canRedirect && !redirecting.current) {
      redirecting.current = true;
      window.location.href = buildTermsUrl(termsHost, window.location.href, data.site!, data.events!);
    }
  }, [isLoading, isError, canRedirect, data, termsHost]);

  if (isLoading || (canRedirect && !isError)) {
    return <Loader />;
  }

  return <>{children}</>;
}
