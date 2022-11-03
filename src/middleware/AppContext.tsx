import { createContext, ReactNode, useContext } from 'react';
import { useFlag } from '@unleash/proxy-client-react';

export interface AppContextInterface {
  hidePackageVerification: boolean;
}

export const AppContext = createContext({} as AppContextInterface);

export const ContextProvider = ({ children }: { children: ReactNode }) => {
  const hidePackageVerification = useFlag('content-sources.hide-package-verification') || false;

  return <AppContext.Provider value={{ hidePackageVerification }}>{children}</AppContext.Provider>;
};

export const useAppContext = () => useContext(AppContext);
