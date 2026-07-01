import { useChrome } from '@redhat-cloud-services/frontend-components/useChrome';
import { Bullseye, Spinner } from '@patternfly/react-core';
import { useEffect } from 'react';

import { ErrorPage } from 'components/Error/ErrorPage';
import usePageSafe from 'Hooks/usePageSafe';
import RepositoriesTable from 'Pages/Lightwell/Repositories/RepositoriesTable';
import { useAppContext } from './middleware/AppContext';

export default function LightwellApp() {
  const { rbac, isFetchingPermissions } = useAppContext();
  const pageSafe = usePageSafe();
  const { hideGlobalFilter } = useChrome();

  useEffect(() => {
    hideGlobalFilter(true);
  }, [hideGlobalFilter]);

  if (!rbac || isFetchingPermissions) {
    return (
      <Bullseye>
        <div data-ouia-safe={false} />
        <Spinner size='xl' />
      </Bullseye>
    );
  }

  return (
    <ErrorPage>
      <div data-ouia-safe={pageSafe} />
      <RepositoriesTable />
    </ErrorPage>
  );
}
