import { createContext, useContext } from 'react';
import { Outlet } from 'react-router-dom';

const LightwellDemoContext = createContext(false);

export const useLightwellDemo = () => useContext(LightwellDemoContext);

export const LightwellDemoLayout = () => (
  <LightwellDemoContext.Provider value={true}>
    <Outlet />
  </LightwellDemoContext.Provider>
);
