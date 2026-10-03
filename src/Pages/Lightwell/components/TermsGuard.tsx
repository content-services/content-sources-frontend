import { type ReactNode, useEffect, useRef } from 'react';

import Loader from 'components/Loader';
import { useChrome } from '@redhat-cloud-services/frontend-components/useChrome';
import { useTermsRequired } from 'services/Lightwell/TermsQueries';

export function buildTermsUrl(termsHost: string, currentUrl: string): string {
  const returnUrl = encodeURIComponent(currentUrl);
  return `${termsHost}/svcrest/terms/presentation/isrequired?site=FIEnrollment&event=FITerms&redirect=${returnUrl}`;
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
      ? 'https://terms.api.redhat.com'
      : 'https://terms.stage.api.redhat.com';

  useEffect(() => {
    if (!isLoading && !isError && data?.required && !redirecting.current) {
      redirecting.current = true;
      window.location.href = buildTermsUrl(termsHost, window.location.href);
    }
  }, [isLoading, isError, data, termsHost]);

  if (isLoading || (data?.required && !isError)) {
    return <Loader />;
  }

  return <>{children}</>;
}
