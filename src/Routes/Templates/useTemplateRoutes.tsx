import { useMemo } from 'react';
import { useAppContext } from '../../middleware/AppContext';
import { ADD_ROUTE, EDIT_ROUTE, TEMPLATES_ROUTE, TabbedRouteItem } from '../constants';
import TemplatesTable from '../../Pages/TemplatesTable/TemplatesTable';
import { AddTemplate } from '../../Pages/TemplatesTable/components/AddTemplate/AddTemplate';
import { NoPermissionsPage } from '../../components/NoPermissionsPage/NoPermissionsPage';

export default function useTemplateRoutes(): TabbedRouteItem[] {
  const { features, rbac, chrome } = useAppContext();
  const hasWrite = rbac?.templateWrite;

  // Wrap in a memo to prevent recalculation if values haven't changed.
  const tabs = useMemo(
    () =>
      chrome?.isProd()
        ? []
        : [
            {
              title: 'Templates',
              route: TEMPLATES_ROUTE,
              Element: TemplatesTable,
              ChildRoutes: [
                ...(hasWrite // These child routes are only permitted with rbac?.write access
                  ? [
                      { path: ADD_ROUTE, Element: AddTemplate },
                      { path: `:templateUUID/${EDIT_ROUTE}`, Element: AddTemplate },
                    ]
                  : []),
              ],
            },
          ],
    [hasWrite, features],
  );

  if (!rbac?.templateRead) {
    return [
      {
        title: 'Templates',
        route: TEMPLATES_ROUTE,
        Element: () => <NoPermissionsPage />,
        ChildRoutes: [],
      },
    ];
  }

  return tabs;
}
