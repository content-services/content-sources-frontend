import { Routes, Route, Navigate } from 'react-router-dom';
import { useMemo } from 'react';

import { ErrorPage } from 'components/Error/ErrorPage';
import RepositoryLayout from '../Pages/Repositories/RepositoryLayout';
import { ZeroState } from 'components/ZeroState/ZeroState';
import useRepositoryRoutes from './Repositories/useRepositoryRoutes';
import {
  ADD_ROUTE,
  ADVISORIES_ROUTE,
  CONTENT_ROUTE,
  DETAILS_ROUTE,
  EDIT_ROUTE,
  PACKAGES_ROUTE,
  REPOSITORIES_ROUTE,
  SYSTEMS_ROUTE,
  TEMPLATES_ROUTE,
} from './constants';
import { useAppContext } from 'middleware/AppContext';
import TemplateDetails from 'Pages/Templates/TemplateDetails/TemplateDetails';
import { AddTemplate } from 'Pages/Templates/TemplatesTable/components/AddTemplate/AddTemplate';
import TemplatesTable from 'Pages/Templates/TemplatesTable/TemplatesTable';
import { NoPermissionsPage } from 'components/NoPermissionsPage/NoPermissionsPage';
import AddSystemModal from 'Pages/Templates/TemplateDetails/components/AddSystems/AddSystemModal';
import TemplateErrataTab from 'Pages/Templates/TemplateDetails/components/Tabs/TemplateErrataTab';
import TemplateSystemsTab from 'Pages/Templates/TemplateDetails/components/Tabs/TemplateSystemsTab';
import TemplatePackageTab from 'Pages/Templates/TemplateDetails/components/Tabs/TemplatePackageTab';

export default function RepositoriesRoutes() {
  const key = useMemo(() => Math.random(), []);
  const repositoryRoutes = useRepositoryRoutes();
  const { zeroState, rbac } = useAppContext();

  return (
    <ErrorPage>
      <Routes key={key}>
        {zeroState ? <Route path={REPOSITORIES_ROUTE} element={<ZeroState />} /> : <></>}
        <Route element={<RepositoryLayout tabs={repositoryRoutes} />}>
          {repositoryRoutes.map(({ route, Element, ChildRoutes }, key) => (
            <Route key={key.toString()} path={route} element={<Element />}>
              {ChildRoutes?.map(({ path, Element: ChildRouteElement }, childRouteKey) => (
                <Route key={childRouteKey} path={path} element={<ChildRouteElement />} />
              ))}
            </Route>
          ))}
          <Route path='*' element={<Navigate to={REPOSITORIES_ROUTE} replace />} />
        </Route>
        {!rbac?.templateRead ? (
          <Route path={TEMPLATES_ROUTE} element={<NoPermissionsPage />} />
        ) : (
          ''
        )}
        <Route
          path={`${TEMPLATES_ROUTE}/:templateUUID/${DETAILS_ROUTE}`}
          element={<TemplateDetails />}
        >
          <Route path='' element={<Navigate to={`${CONTENT_ROUTE}/${PACKAGES_ROUTE}`} replace />} />
          <Route path={CONTENT_ROUTE}>
            <Route path='' element={<Navigate to={PACKAGES_ROUTE} replace />} />
            <Route path={PACKAGES_ROUTE} element={<TemplatePackageTab />} />
            <Route path={ADVISORIES_ROUTE} element={<TemplateErrataTab />} />
            <Route path='*' element={<Navigate to={PACKAGES_ROUTE} replace />} />
          </Route>
          <Route path={SYSTEMS_ROUTE} element={<TemplateSystemsTab />}>
            {rbac?.templateWrite ? <Route path={ADD_ROUTE} element={<AddSystemModal />} /> : ''}
          </Route>
          <Route path='*' element={<Navigate to={TEMPLATES_ROUTE} replace />} />
        </Route>
        <Route path={TEMPLATES_ROUTE} element={<TemplatesTable />}>
          {...rbac?.templateWrite
            ? [
                <Route key='1' path={ADD_ROUTE} element={<AddTemplate />} />,
                <Route key='2' path={`:templateUUID/${EDIT_ROUTE}`} element={<AddTemplate />} />,
              ]
            : []}
          <Route path='*' element={<Navigate to='' replace />} />
        </Route>
      </Routes>
    </ErrorPage>
  );
}
