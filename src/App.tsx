import '@redhat-cloud-services/frontend-components-utilities/styles/_all';

import { useChrome } from '@redhat-cloud-services/frontend-components/useChrome';
import NotificationsPortal from '@redhat-cloud-services/frontend-components-notifications/NotificationPortal';
import { notificationsReducer } from '@redhat-cloud-services/frontend-components-notifications/redux';
import { getRegistry as _getRegistry } from '@redhat-cloud-services/frontend-components-utilities/Registry';
import { useEffect } from 'react';

import pckg from '../package.json';
import Routes from './Routes';
import { useNavigate } from 'react-router-dom';

// Example of how to re-implement inaccurately typed imports
const getRegistry = _getRegistry as unknown as () => { register: ({ notifications }) => void };

const App = () => {
  const navigate = useNavigate();
  const chrome = useChrome();

  useEffect(() => {
    let unregister;
    if (chrome) {
      const registry = getRegistry();
      registry.register({ notifications: notificationsReducer });
      const { updateDocumentTitle, on: onChromeEvent } = chrome.init();
      // You can use directly the name of your app
      updateDocumentTitle(pckg.insights.appname);
      unregister = onChromeEvent('APP_NAVIGATION', (event) => navigate(`/${event.navId}`));
    }

    return () => {
      unregister();
    };
  }, [chrome, history]);

  return (
    <>
      <NotificationsPortal />
      <Routes />
    </>
  );
};

export default App;
