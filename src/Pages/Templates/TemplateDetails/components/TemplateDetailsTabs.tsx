/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable unused-imports/no-unused-vars */
import { Tab, Tabs, TabTitleText } from '@patternfly/react-core';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  ADVISORIES_ROUTE,
  CONTENT_ROUTE,
  DETAILS_ROUTE,
  PACKAGES_ROUTE,
  SYSTEMS_ROUTE,
} from 'Routes/constants';

type ContentTabType = typeof CONTENT_ROUTE | typeof SYSTEMS_ROUTE;
type ContentSubTabType = typeof PACKAGES_ROUTE | typeof ADVISORIES_ROUTE;

export default function TemplateDetailsTabs() {
  const { pathname } = useLocation();
  const [mainRoute, subpath] = pathname?.split(`${DETAILS_ROUTE}/`) || [];
  const baseRoute = mainRoute + `${DETAILS_ROUTE}`;
  const navigate = useNavigate();

  const [topTabKey, setTopTabKey] = useState<ContentTabType>(CONTENT_ROUTE);
  const [contentTabKey, setContentTabKey] = useState<ContentSubTabType>(PACKAGES_ROUTE);
  const [systemsTabKey, setSystemsTabKey] = useState<string>('other');

  useEffect(() => {
    const [topTabRoute, bottomTabRoute] = subpath?.split('/') || [];

    // Update tabs on route change
    if (!!topTabRoute && !!bottomTabRoute) {
      setTopTabKey(topTabRoute as ContentTabType);
      if (topTabRoute === CONTENT_ROUTE) {
        setContentTabKey(bottomTabRoute as ContentSubTabType);
      } else {
        setSystemsTabKey(bottomTabRoute as string);
      }
    }
  }, [subpath]);

  // TODO: Uncomment this for SYSTEMS support
  const navigateContentTab = (eventKey: string) => {
    if (eventKey === CONTENT_ROUTE) {
      navigate(`${baseRoute}/${eventKey}/${contentTabKey}`);
    } else {
      navigate(`${baseRoute}/${eventKey}/${systemsTabKey}`);
    }
  };
  // TODO: Uncomment this for SYSTEMS support
  // <Tabs
  //   activeKey={topTabKey}
  //   onSelect={(_, eventKey) => navigateContentTab(eventKey as string)}
  //   aria-label='Snapshot detail tabs'
  // >
  //   <Tab
  //     eventKey={CONTENT_ROUTE}
  //     ouiaId='content_tab'
  //     title={<TabTitleText>Content</TabTitleText>}
  //     aria-label='Template package detail tab'
  //   >
  return (
    <Tabs
      activeKey={contentTabKey}
      onSelect={(_, eventKey) => navigate(`${baseRoute}/${topTabKey}/${eventKey}`)}
      aria-label='Template details tab'
    >
      <Tab
        eventKey={PACKAGES_ROUTE}
        ouiaId='packages_tab'
        title={<TabTitleText>Packages</TabTitleText>}
        aria-label='Template package detail tab'
      />
      <Tab
        eventKey={ADVISORIES_ROUTE}
        ouiaId='advisories_tab'
        title={<TabTitleText>Advisories</TabTitleText>}
        aria-label='Template advisories detail tab'
      />
    </Tabs>
  );
  {
    // TODO: Uncomment this for SYSTEMS support
    /* </Tab>
      <Tab
        eventKey={SYSTEMS_ROUTE}
        ouiaId='systems_tab'
        title={<TabTitleText>Systems</TabTitleText>}
        aria-label='Template systems detail tab'
      >
        <Tabs
          activeKey={systemsTabKey}
          onSelect={(_, eventKey) => navigate(`${baseRoute}/${topTabKey}/${eventKey}`)}
          aria-label='Template details tab'
        >
          <Tab
            eventKey='other'
            ouiaId='other_tab'
            title={<TabTitleText>Other</TabTitleText>}
            aria-label='Template other detail tab'
          />
          <Tab
            eventKey='thing'
            ouiaId='thing_tab'
            title={<TabTitleText>Thing</TabTitleText>}
            aria-label='Template thing detail tab'
          />
        </Tabs>
      </Tab>
    </Tabs> */
  }
}
