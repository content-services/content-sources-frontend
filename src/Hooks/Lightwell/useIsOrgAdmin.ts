import useChrome from '@redhat-cloud-services/frontend-components/useChrome';
import { useEffect, useState } from 'react';

import type { Features } from 'services/Features/FeatureApi';

/**
 * Returns whether the current Console user is an org admin.
 * Defaults to false while loading; backend still enforces this on privileged Lightwell APIs.
 */
export const useIsOrgAdmin = (): { isOrgAdmin: boolean; isLoading: boolean } => {
  const chrome = useChrome();
  const [isOrgAdmin, setIsOrgAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const user = await chrome.auth.getUser();
        if (!cancelled) {
          setIsOrgAdmin(!!user?.identity?.user?.is_org_admin);
        }
      } catch {
        if (!cancelled) {
          setIsOrgAdmin(false);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [chrome.auth]);

  return { isOrgAdmin, isLoading };
};

/** Org admin with Lightwell enabled and accessible (tokens, package browsing). */
export const canAccessLightwellAdminFeatures = (
  features: Features | null | undefined,
  isOrgAdmin: boolean,
): boolean => !!(features?.lightwell?.enabled && features.lightwell?.accessible && isOrgAdmin);

export const canManageLightwellTokens = canAccessLightwellAdminFeatures;

export const canViewLightwellPackages = canAccessLightwellAdminFeatures;

export default useIsOrgAdmin;
