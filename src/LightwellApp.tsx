import '../styles/lightwell-chrome-overrides.scss';
import { useChrome } from '@redhat-cloud-services/frontend-components/useChrome';
import { Bullseye, Spinner } from '@patternfly/react-core';
import { useEffect } from 'react';
import { Route, Routes } from 'react-router-dom';

import { ErrorPage } from 'components/Error/ErrorPage';
import usePageSafe from 'Hooks/usePageSafe';
import PackagesTable from 'Pages/Lightwell/Packages/PackagesTable';
import PackageDetails from 'Pages/Lightwell/Packages/PackageDetails';
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
      <Routes>
        <Route index element={<RepositoriesTable />} />
        <Route path=':repoName/:group/:packageName' element={<PackageDetails />} />
        <Route path=':repoName/:packageName' element={<PackageDetails />} />
        <Route path=':repoName' element={<PackagesTable />} />
      </Routes>
    </ErrorPage>
  );
}
