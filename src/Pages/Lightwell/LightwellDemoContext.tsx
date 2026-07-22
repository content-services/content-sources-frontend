import { createContext, useContext } from 'react';
import { Outlet } from 'react-router-dom';
import { Banner } from '@patternfly/react-core';
import { InfoCircleIcon } from '@patternfly/react-icons';

const LightwellDemoContext = createContext(false);

export const useLightwellDemo = () => useContext(LightwellDemoContext);

export const LightwellDemoLayout = () => (
  <LightwellDemoContext.Provider value={true}>
    <Banner variant='info' screenReaderText='Demo site notice'>
      <InfoCircleIcon />{' '}
      This is a demo site. The data shown here is for demonstration purposes only.
    </Banner>
    <Outlet />
  </LightwellDemoContext.Provider>
);
