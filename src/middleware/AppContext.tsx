import { createContext, ReactNode, useContext, useState } from 'react';
import { useFlag } from '@unleash/proxy-client-react';
import { Rbac } from '@redhat-cloud-services/insights-common-typescript';

export interface AppContextInterface {
  hidePackageVerification: boolean;
  rbac?: { read: boolean; write: boolean };
  setRbac: (rbac?: Rbac) => void;
}

export const AppContext = createContext({} as AppContextInterface);

export const ContextProvider = ({ children }: { children: ReactNode }) => {
  const [rbac, setRbac] = useState<Rbac | undefined>(undefined);
  const hidePackageVerification = useFlag('content-sources.hide-package-verification') || false;

  return (
    <AppContext.Provider
      value={{
        hidePackageVerification,
        setRbac,
        rbac: rbac
          ? {
              read: rbac?.hasPermission('content-sources', 'repositories', 'read'),
              write: rbac?.hasPermission('content-sources', 'repositories', 'write'),
            }
          : undefined,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
