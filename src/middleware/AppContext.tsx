import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { Features } from 'services/Features/FeatureApi';
import { useFetchFeaturesQuery } from 'services/Features/FeatureQueries';
import { ContentOrigin } from 'services/Content/ContentApi';
import useChrome from '@redhat-cloud-services/frontend-components/useChrome';
import { ChromeAPI } from '@redhat-cloud-services/types';
import { Subscriptions } from 'services/Subscriptions/SubscriptionApi';
import { useFetchSubscriptionsQuery } from 'services/Subscriptions/SubscriptionQueries';
import { useFlag } from '@unleash/proxy-client-react';
import { useKesselWorkspace, useKesselRbac, useTraditionalRbac } from './rbacHelpers';
import { RbacPermissions } from './rbacPermissions';

// Keep existing `import { RbacPermissions } from 'middleware/AppContext'` working.
export { RbacPermissions };

export interface AppContextInterface {
  rbac?: Record<keyof typeof RbacPermissions, boolean>;
  features: Features | null;
  isFetchingPermissions: boolean;
  /** True once permission lookup has failed outright (RBAC/Kessel unreachable or
   * erroring) rather than merely still loading. `rbac` will never resolve in
   * this state. */
  permissionsError: boolean;
  subscriptions?: Subscriptions;
  contentOrigin: ContentOrigin[];
  setContentOrigin: React.Dispatch<React.SetStateAction<ContentOrigin[]>>;
  chrome?: ChromeAPI;
  zeroState: boolean;
  setZeroState: (zeroState: boolean) => void;
  isLightspeedEnabled: boolean;
}

export const AppContext = createContext({} as AppContextInterface);

export const ContextProvider = ({ children }: { children: ReactNode }) => {
  const [zeroState, setZeroState] = useState(true);
  const [features, setFeatures] = useState<Features | null>(null);
  // `useFetchFeaturesQuery`'s `isLoading` starts `false` before the fetch is
  // even kicked off below, which is indistinguishable from "fetch settled."
  // Track that distinctly so RBAC v1 doesn't fire before we know which
  // permission system (Kessel vs traditional) this tenant should use.
  const [featuresSettled, setFeaturesSettled] = useState(false);
  const [contentOrigin, setContentOrigin] = useState<ContentOrigin[]>([
    ContentOrigin.EXTERNAL,
    ContentOrigin.UPLOAD,
    ContentOrigin.COMMUNITY,
  ]);

  const chrome = useChrome();
  const { fetchFeatures, isLoading: isFetchingFeatures } = useFetchFeaturesQuery();
  const { data: subscriptions, isLoading: isFetchingSubscriptions } = useFetchSubscriptionsQuery();
  const isLightspeedEnabled = useFlag('platform.lightspeed-rebrand') || false;

  // Determine which permission system to use
  const useKessel = !!(features?.kessel?.enabled && features.kessel?.accessible);

  // Fetch workspace and permissions based on the enabled system
  const {
    workspaceId,
    loading: workspaceLoading,
    error: workspaceError,
  } = useKesselWorkspace(useKessel);
  const kesselPermissions = useKesselRbac(workspaceId, workspaceLoading, workspaceError);
  const traditionalPermissions = useTraditionalRbac(chrome, featuresSettled, !useKessel);

  // Select the appropriate RBAC and loading state
  const rbac = useKessel ? kesselPermissions.rbac : traditionalPermissions.rbac;
  const rbacLoading = useKessel ? kesselPermissions.loading : traditionalPermissions.loading;
  const permissionsError = useKessel ? kesselPermissions.error : traditionalPermissions.error;

  useEffect(() => {
    (async () => {
      setFeatures(await fetchFeatures());
      setFeaturesSettled(true);
    })();
  }, []);

  return (
    <AppContext.Provider
      value={{
        rbac,
        features,
        isFetchingPermissions: isFetchingFeatures || isFetchingSubscriptions || rbacLoading,
        permissionsError,
        subscriptions,
        contentOrigin,
        setContentOrigin,
        chrome: chrome as ChromeAPI,
        zeroState,
        setZeroState,
        isLightspeedEnabled,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
