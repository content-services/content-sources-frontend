import { useMemo } from 'react';
import { Grid, Tab, Tabs, TabTitleText } from '@patternfly/react-core';
import { Routes, Route, Navigate, useLocation, Link } from 'react-router-dom';
import { global_BackgroundColor_100 } from '@patternfly/react-tokens';

import { createUseStyles } from 'react-jss';
import { ErrorPage } from './components/Error/ErrorPage';
import ContentListTable from './Pages/ContentListTable/ContentListTable';
import PopularRepositoriesTable from './Pages/PopularRepositoriesTable/PopularRepositoriesTable';
import { last } from 'lodash';
import Header from './components/Header/Header';
import QuickStart from './components/QuickStart/QuickStart';
import AdminTaskTable from './Pages/AdminTaskTable/AdminTaskTable';

const useStyles = createUseStyles({
  tabs: {
    backgroundColor: global_BackgroundColor_100.value,
  },
  tab: {
    '& button': {
      padding: 0, // Remove the default button padding
    },
  },
  link: {
    color: 'inherit', // Receives parent "Tab" components color
    textDecoration: 'none',
    padding: '8px 16px', // Add it back so that the entire clickable area works
    '&:focus-visible': {
      outlineOffset: '-6px',
    },
  },
  containerMargin: {
    margin: '24px',
  },
});

export const DEFAULT_ROUTE = '';
export const POPULAR_REPOSITORIES_ROUTE = 'popular-repositories';
export const ADMIN_TASKS_ROUTE = 'admin-tasks';

const tabbedRoutes = [
  {
    title: 'Your repositories',
    route: DEFAULT_ROUTE,
    Element: ContentListTable,
  },
  {
    title: 'Popular repositories',
    route: POPULAR_REPOSITORIES_ROUTE,
    Element: PopularRepositoriesTable,
  },
  {
    title: 'Admin tasks',
    route: ADMIN_TASKS_ROUTE,
    Element: AdminTaskTable,
  },
];

export default function MainRoutes() {
  const classes = useStyles();
  const { pathname, key: locationKey } = useLocation();

  const currentRoute = useMemo(() => last(pathname.split('/')), [pathname]);
  return (
    <>
      <Header />

      <Tabs className={classes.tabs} ouiaId='routed-tabs' activeKey={currentRoute}>
        {tabbedRoutes.map(({ title, route }) => (
          <Tab
            className={classes.tab}
            keyParams={route}
            key={route}
            tabIndex={-1} // This prevents the tab from being targetable by accessibility features.
            eventKey={route || 'content'} // the current route will be "content" when there is no route specified (root)
            aria-label={title}
            ouiaId={title}
            title={
              <Link className={classes.link} accessKey={route} key={route} to={route}>
                <TabTitleText>{title}</TabTitleText>
              </Link>
            }
          />
        ))}
      </Tabs>
      <QuickStart />
      <Routes key={locationKey}>
        {tabbedRoutes.map(({ route, Element }, key) => (
          <Route
            key={key.toString()}
            path={route}
            element={
              <ErrorPage>
                <Grid className={classes.containerMargin}>
                  <Element />
                </Grid>
              </ErrorPage>
            }
          />
        ))}
        <Route path='*' element={<Navigate to={DEFAULT_ROUTE} replace />} />
      </Routes>
    </>
  );
}
