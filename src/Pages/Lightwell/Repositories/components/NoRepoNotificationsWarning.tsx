import { Alert } from '@patternfly/react-core';

type NoRepoNotificationsWarningProps = {
  className?: string;
};

const NoRepoNotificationsWarning = ({ className }: NoRepoNotificationsWarningProps) => (
  <Alert
    variant='warning'
    isInline
    ouiaId='lightwell-no-repo-notifications-warning'
    title='You will not receive any notifications'
    className={className}
  >
    You have enabled notifications, but no repositories are selected. Use the Notify toggles below
    to choose which repositories to receive email notifications for.
  </Alert>
);

export default NoRepoNotificationsWarning;
