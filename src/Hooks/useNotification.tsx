import { AlertVariant } from '@patternfly/react-core';
import type { PortalNotificationConfig } from '@redhat-cloud-services/frontend-components-notifications/Portal';
import { addNotification } from '@redhat-cloud-services/frontend-components-notifications/redux';
import { useDispatch } from 'react-redux';

export interface NotificationPayload {
  title: React.ReactNode | string;
  variant: AlertVariant;
  description?: React.ReactNode | string;
  id: string | number;
  dismissable?: boolean;
}

export default function useNotification() {
  const dispatch = useDispatch();
  const notify = (payload: PortalNotificationConfig) => dispatch(addNotification(payload));

  return { notify };
}
