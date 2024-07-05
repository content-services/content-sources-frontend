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
  // TODO: Uncomment this for SYSTEMS support
  //   SYSTEMS_ROUTE,
  TEMPLATES_ROUTE,
} from './constants';
import { useAppContext } from 'middleware/AppContext';
import TemplateDetails from 'Pages/Templates/TemplateDetails/TemplateDetails';
import { AddTemplate } from 'Pages/Templates/TemplatesTable/components/AddTemplate/AddTemplate';
import TemplatesTable from 'Pages/Templates/TemplatesTable/TemplatesTable';
import { NoPermissionsPage } from 'components/NoPermissionsPage/NoPermissionsPage';
import TemplatePackageTab from 'Pages/Templates/TemplateDetails/components/TemplatePackageDetails';
import TemplateErrataDetails from 'Pages/Templates/TemplateDetails/components/TemplateErrataDetails';
import GlitchtipError from '../components/Error/GlitchtipError';

export default function RepositoriesRoutes() {
  const key = useMemo(() => Math.random(), []);
  const repositoryRoutes = useRepositoryRoutes();
  const { zeroState, rbac } = useAppContext();

  return (
    <ErrorPage>
      <GlitchtipError>
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
              <Route path={ADVISORIES_ROUTE} element={<TemplateErrataDetails />} />
              <Route path='*' element={<Navigate to={PACKAGES_ROUTE} replace />} />
            </Route>

            {/*
             // TODO: Uncomment this for SYSTEMS support
            <Route path={SYSTEMS_ROUTE}>
              <Route path='' element={<Navigate to='other' replace />} />
              <Route path='other' element={<>other</>} />
              <Route path='thing' element={<>thing</>} />
              <Route path='*' element={<Navigate to='other' replace />} />
            </Route> */}
            <Route path='*' element={<Navigate to='content' replace />} />
          </Route>
          <Route path={TEMPLATES_ROUTE} element={<TemplatesTable />}>
            {...rbac?.templateWrite
              ? [
                  <Route key='1' path={ADD_ROUTE} element={<AddTemplate />} />,
                  <Route key='2' path={`:templateUUID/${EDIT_ROUTE}`} element={<AddTemplate />} />,
                ]
              : []}
          </Route>
          <Route path='*' element={<Navigate to={REPOSITORIES_ROUTE} replace />} />
        </Routes>
      </GlitchtipError>
    </ErrorPage>
  );
}
