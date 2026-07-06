import '../styles/lightwell-chrome-overrides.scss';
import { useChrome } from '@redhat-cloud-services/frontend-components/useChrome';
import { useEffect } from 'react';
import { Route, Routes } from 'react-router-dom';

import { ErrorPage } from 'components/Error/ErrorPage';
import usePageSafe from 'Hooks/usePageSafe';
import PackagesTable from 'Pages/Lightwell/Packages/PackagesTable';
import PackageDetails from 'Pages/Lightwell/Packages/PackageDetails';
import RepositoriesTable from 'Pages/Lightwell/Repositories/RepositoriesTable';

export default function LightwellApp() {
  const pageSafe = usePageSafe();
  const { hideGlobalFilter } = useChrome();

  useEffect(() => {
    hideGlobalFilter(true);
  }, [hideGlobalFilter]);

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
