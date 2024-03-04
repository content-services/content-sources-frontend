import { useMemo } from 'react';
import AdminTaskTable from '../../Pages/AdminTaskTable/AdminTaskTable';
import ViewPayloadModal from '../../Pages/AdminTaskTable/components/ViewPayloadModal/ViewPayloadModal';
import ContentListTable from '../../Pages/ContentListTable/ContentListTable';
import AddContent from '../../Pages/ContentListTable/components/AddContent/AddContent';
import EditContentModal from '../../Pages/ContentListTable/components/EditContentModal/EditContentModal';
import DeleteContentModal from '../../Pages/ContentListTable/components/DeleteContentModal/DeleteContentModal';
import PackageModal from '../../Pages/ContentListTable/components/PackageModal/PackageModal';
import PopularRepositoriesTable from '../../Pages/PopularRepositoriesTable/PopularRepositoriesTable';
import { useAppContext } from '../../middleware/AppContext';
import SnapshotListModal from '../../Pages/ContentListTable/components/SnapshotListModal/SnapshotListModal';
import {
  ADD_ROUTE,
  ADMIN_TASKS_ROUTE,
  DELETE_ROUTE,
  EDIT_ROUTE,
  POPULAR_REPOSITORIES_ROUTE,
  REPOSITORIES_ROUTE,
  TabbedRouteItem,
} from '../constants';

export default function useRepositoryRoutes(): TabbedRouteItem[] {
  const { features, rbac } = useAppContext();
  const hasWrite = rbac?.write;

  // Wrap in a memo to prevent recalculation if values haven't changed.
  const tabs = useMemo(
    () => [
      {
        title: 'Your repositories',
        route: REPOSITORIES_ROUTE,
        Element: ContentListTable,
        ChildRoutes: [
          ...(hasWrite // These child routes are only permitted with rbac?.write access
            ? [
                { path: EDIT_ROUTE, Element: EditContentModal },
                { path: ADD_ROUTE, Element: AddContent },
                { path: DELETE_ROUTE, Element: DeleteContentModal },
              ]
            : []),
          ...(features?.snapshots?.enabled && features.snapshots?.accessible
            ? [{ path: ':repoUUID/snapshots', Element: SnapshotListModal }]
            : []),
          { path: ':repoUUID/packages', Element: PackageModal },
        ],
      },
      {
        title: 'Popular repositories',
        route: POPULAR_REPOSITORIES_ROUTE,
        Element: PopularRepositoriesTable,
      },
      ...(features?.admintasks?.enabled && features.admintasks?.accessible
        ? [
            {
              title: 'Admin tasks',
              route: ADMIN_TASKS_ROUTE,
              Element: AdminTaskTable,
              ChildRoutes: [{ path: ':taskUUID', Element: ViewPayloadModal }],
            },
          ]
        : []),
    ],
    [hasWrite, features],
  );

  return tabs;
}
