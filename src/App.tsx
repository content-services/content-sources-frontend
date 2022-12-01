import '@redhat-cloud-services/frontend-components-utilities/styles/_all';
import NotificationsPortal from '@redhat-cloud-services/frontend-components-notifications/NotificationPortal';
import Routes from './Routes';
import { useAppContext } from './middleware/AppContext';
import { NoPermissionsPage } from './components/NoPermissionsPage/NoPermissionsPage';
import useChrome from '@redhat-cloud-services/frontend-components/useChrome';
import { insights } from '../package.json';

import { getRegistry as _getRegistry } from '@redhat-cloud-services/frontend-components-utilities/Registry';
import { notificationsReducer } from '@redhat-cloud-services/frontend-components-notifications/redux';
import { fetchRBAC } from '@redhat-cloud-services/insights-common-typescript';
import { useEffect } from 'react';
import { Bullseye, Spinner } from '@patternfly/react-core';

const getRegistry = _getRegistry as unknown as () => { register: ({ notifications }) => void };
const { appname } = insights;

export default function App() {
  const { rbac, setRbac } = useAppContext();
  const chrome = useChrome();

  useEffect(() => {
    // Get chrome and register app
    const registry = getRegistry();
    registry.register({ notifications: notificationsReducer });

    if (chrome && !rbac) {
      // Get permissions and store them in context
      chrome.auth.getUser().then(async () => fetchRBAC(appname).then(setRbac));
    }
  }, [!!chrome]);

  switch (true) {
    case !rbac:
      return (
        <Bullseye>
          <Spinner size='xl' />
        </Bullseye>
      );
    case rbac?.read:
      return (
        <>
          <NotificationsPortal />
          <Routes />
        </>
      );

    default:
      return <NoPermissionsPage />;
  }
}
