import {
  Breadcrumb,
  BreadcrumbItem,
  Button,
  Card,
  CardBody,
  Dropdown,
  DropdownItem,
  DropdownList,
  Flex,
  FlexItem,
  Grid,
  GridItem,
  Icon,
  Label,
  MenuToggle,
  Stack,
  StackItem,
  Tab,
  TabContent,
  TabContentBody,
  Tabs,
  TabTitleText,
  Title,
} from '@patternfly/react-core';
import { CopyIcon, JavaIcon, PythonIcon } from '@patternfly/react-icons';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import { createUseStyles } from 'react-jss';
import { createRef, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import EmptyTableState from 'components/EmptyTableState/EmptyTableState';
import Loader from 'components/Loader';
import {
  useLightwellRepositoryPackagesQuery,
  usePackageDetailQuery,
  usePackageVersionsPreload,
} from 'services/Content/ContentQueries';

import { LIGHTWELL_USE_MOCK } from '../constants';
import { formatRepositoryName, stripLightwellVersionSuffix } from '../helpers';
import { getMockLightwellPackages } from '../mockPackages';
import useLightwellRepository from '../useLightwellRepository';
import PackageOverviewTab from './components/PackageOverviewTab';
import PackageReleasesTab from './components/PackageReleasesTab';
import PackageSidebar from './components/PackageSidebar';
import PackageVersionsTab from './components/PackageVersionsTab';

const useStyles = createUseStyles({
  topContainer: {
    padding: '16px 24px',
  },
  titleWrapper: {
    padding: '24px 0 0',
  },
  detailCard: {
    overflow: 'visible',
  },
});

const PackageDetails = () => {
  const classes = useStyles();
  const navigate = useNavigate();
  const { repoName: repoSlug = '', packageName: packageNameParam = '' } = useParams();
  const packageName = packageNameParam ? decodeURIComponent(packageNameParam) : '';
  const [activeTabKey, setActiveTabKey] = useState(0);
  const [selectedVersion, setSelectedVersion] = useState<string>('');
  const [versionDropdownOpen, setVersionDropdownOpen] = useState(false);

  const overviewTabRef = createRef<HTMLElement>();
  const releasesTabRef = createRef<HTMLElement>();
  const versionsTabRef = createRef<HTMLElement>();

  const useMock = LIGHTWELL_USE_MOCK;

  const {
    repository,
    repoUUID,
    isLoading: isResolvingRepository,
    isError,
    error,
  } = useLightwellRepository(repoSlug);

  const apiPackagesQuery = useLightwellRepositoryPackagesQuery(
    repoUUID,
    1,
    100,
    '',
    !!repoUUID && !useMock,
  );

  const packageItem = useMemo(() => {
    if (useMock) {
      return getMockLightwellPackages(repoUUID).find((pkg) => pkg.name === packageName);
    }

    return (apiPackagesQuery.data?.results ?? []).find((pkg) => pkg.name === packageName);
  }, [useMock, repoUUID, packageName, apiPackagesQuery.data?.results]);

  const packageGroup = packageItem?.group ?? '';
  const packageVersion = packageItem?.versions[0] ?? '';
  const hasRelease = (packageItem?.latest_releases ?? []).some((r) => !!r.release);

  useEffect(() => {
    if (packageItem?.versions.length && !selectedVersion) {
      setSelectedVersion(packageItem.versions[0]);
    }
  }, [packageItem?.versions]);

  const activeVersion = selectedVersion || packageVersion;

  const packageDetailQuery = usePackageDetailQuery(
    repoUUID,
    packageGroup,
    packageName,
    activeVersion,
    !!repoUUID && !!packageGroup && !!activeVersion,
  );

  usePackageVersionsPreload(
    repoUUID,
    packageGroup,
    packageName,
    packageItem?.versions ?? [],
    !hasRelease && !!repoUUID && !!packageGroup,
  );

  const isLoadingPackages = useMock
    ? false
    : apiPackagesQuery.isLoading || apiPackagesQuery.isFetching;

  const isLoadingDetail =
    packageDetailQuery.isLoading || (hasRelease && packageDetailQuery.isFetching);

  if (isResolvingRepository || !repository) {
    return <Loader />;
  }

  if (!repoUUID || isError) throw error;
  if (!useMock && apiPackagesQuery.isError) throw apiPackagesQuery.error;

  const repositoryName = formatRepositoryName(
    repository.content_type,
    repository.security_level,
    repository.name,
  );

  const builds = packageDetailQuery.data?.builds ?? [];
  const latestBuild = builds[0];
  const latestVersion = latestBuild?.version ?? activeVersion;
  const upstreamVersion = stripLightwellVersionSuffix(latestVersion);
  const displayVersion = hasRelease ? latestVersion : selectedVersion || packageVersion;
  const mavenCoordinate = `${packageGroup}:${packageName}:${displayVersion}`;

  const latestCreatedAt = builds
    .map((b) => b.created_at)
    .sort()
    .at(-1);
  const lastUpdated = latestCreatedAt?.split('T')[0] ?? '';

  const doneLoading = !!packageItem && !isLoadingPackages && !isLoadingDetail;
  const hasDetail =
    doneLoading && (builds.length > 0 || (!hasRelease && packageItem!.versions.length > 0));
  const showEmpty = doneLoading && !hasDetail;

  return (
    <>
      <Grid className={classes.topContainer}>
        <Stack>
          <StackItem>
            <Breadcrumb ouiaId='lightwell-package-details-breadcrumb'>
              <BreadcrumbItem
                component='button'
                onClick={() => navigate('../..', { relative: 'path' })}
              >
                Lightwell
              </BreadcrumbItem>
              <BreadcrumbItem
                component='button'
                onClick={() => navigate('..', { relative: 'path' })}
              >
                {repositoryName}
              </BreadcrumbItem>
              <BreadcrumbItem isActive>{packageName || '—'}</BreadcrumbItem>
            </Breadcrumb>
          </StackItem>
          <StackItem className={classes.titleWrapper}>
            <Flex
              alignItems={{ default: 'alignItemsCenter' }}
              justifyContent={{ default: 'justifyContentSpaceBetween' }}
              gap={{ default: 'gapMd' }}
            >
              <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapSm' }}>
                <FlexItem>
                  <Icon size='xl'>
                    {repository.content_type === 'maven' ? <JavaIcon /> : <PythonIcon />}
                  </Icon>
                </FlexItem>
                <FlexItem>
                  <Title headingLevel='h1' ouiaId='lightwell-package-details-header'>
                    {packageName || 'Package details'}
                  </Title>
                </FlexItem>
                {hasRelease &&
                  upstreamVersion &&
                  packageItem &&
                  packageItem.versions.length <= 1 && (
                    <FlexItem>
                      <Label isCompact>{upstreamVersion}</Label>
                    </FlexItem>
                  )}
                {packageItem && packageItem.versions.length > 1 && hasRelease && (
                  <FlexItem>
                    <Dropdown
                      isScrollable
                      onSelect={(_e, val) => {
                        setSelectedVersion(val as string);
                        setVersionDropdownOpen(false);
                      }}
                      toggle={(toggleRef) => (
                        <MenuToggle
                          ref={toggleRef}
                          onClick={() => setVersionDropdownOpen((prev) => !prev)}
                          isExpanded={versionDropdownOpen}
                          ouiaId='lightwell-version-selector'
                        >
                          {stripLightwellVersionSuffix(selectedVersion)}
                        </MenuToggle>
                      )}
                      onOpenChange={(isOpen) => setVersionDropdownOpen(isOpen)}
                      isOpen={versionDropdownOpen}
                    >
                      <DropdownList>
                        {packageItem.versions.map((v) => (
                          <DropdownItem key={v} value={v} isSelected={selectedVersion === v}>
                            {stripLightwellVersionSuffix(v)}
                          </DropdownItem>
                        ))}
                      </DropdownList>
                    </Dropdown>
                  </FlexItem>
                )}
                {!hasRelease && packageItem && packageItem.versions.length > 0 && (
                  <FlexItem>
                    <Dropdown
                      isScrollable
                      onSelect={(_e, val) => {
                        setSelectedVersion(val as string);
                        setVersionDropdownOpen(false);
                      }}
                      toggle={(toggleRef) => (
                        <MenuToggle
                          ref={toggleRef}
                          onClick={() => setVersionDropdownOpen((prev) => !prev)}
                          isExpanded={versionDropdownOpen}
                          ouiaId='lightwell-version-selector'
                        >
                          {selectedVersion}
                        </MenuToggle>
                      )}
                      onOpenChange={(isOpen) => setVersionDropdownOpen(isOpen)}
                      isOpen={versionDropdownOpen}
                    >
                      <DropdownList>
                        {packageItem.versions.map((v) => (
                          <DropdownItem key={v} value={v} isSelected={selectedVersion === v}>
                            {v}
                          </DropdownItem>
                        ))}
                      </DropdownList>
                    </Dropdown>
                  </FlexItem>
                )}
              </Flex>
              {displayVersion && (
                <FlexItem>
                  <Button
                    variant='secondary'
                    icon={<CopyIcon />}
                    iconPosition='end'
                    onClick={() => navigator.clipboard.writeText(mavenCoordinate)}
                  >
                    {mavenCoordinate}
                  </Button>
                </FlexItem>
              )}
            </Flex>
          </StackItem>
        </Stack>
      </Grid>

      {(isLoadingPackages || isLoadingDetail) && <Loader />}

      {showEmpty && (
        <Grid className={spacing.pxLg}>
          <EmptyTableState
            notFiltered
            clearFilters={() => undefined}
            itemName='package details'
            notFilteredBody='No details available yet for this package.'
          />
        </Grid>
      )}

      {hasDetail && (
        <Card className={`${classes.detailCard} ${spacing.mxLg} ${spacing.mbLg}`}>
          <CardBody>
            <Grid hasGutter>
              <GridItem md={8}>
                <Tabs
                  activeKey={activeTabKey}
                  onSelect={(_, eventKey) => setActiveTabKey(eventKey as number)}
                  aria-label='Package detail tabs'
                  ouiaId='lightwell-package-detail-tabs'
                >
                  <Tab
                    eventKey={0}
                    title={<TabTitleText>Overview</TabTitleText>}
                    tabContentRef={overviewTabRef}
                    ouiaId='lightwell-package-overview-tab'
                  />
                  {hasRelease && (
                    <Tab
                      eventKey={1}
                      title={<TabTitleText>Releases</TabTitleText>}
                      tabContentRef={releasesTabRef}
                      ouiaId='lightwell-package-releases-tab'
                    />
                  )}
                  {!hasRelease && (
                    <Tab
                      eventKey={1}
                      title={<TabTitleText>Versions</TabTitleText>}
                      tabContentRef={versionsTabRef}
                      ouiaId='lightwell-package-versions-tab'
                    />
                  )}
                </Tabs>
                <TabContent
                  eventKey={0}
                  id='lightwell-package-overview-panel'
                  ref={overviewTabRef}
                  aria-label='Overview'
                >
                  <TabContentBody hasPadding>
                    <PackageOverviewTab
                      group={packageGroup}
                      name={packageName}
                      latestRelease={displayVersion}
                      hasRelease={hasRelease}
                    />
                  </TabContentBody>
                </TabContent>
                {hasRelease && (
                  <TabContent
                    eventKey={1}
                    id='lightwell-package-releases-panel'
                    ref={releasesTabRef}
                    aria-label='Releases'
                    hidden
                  >
                    <TabContentBody hasPadding>
                      <PackageReleasesTab
                        version={upstreamVersion}
                        builds={builds}
                        allVersions={packageItem?.versions ?? []}
                        latestReleases={packageItem?.latest_releases ?? []}
                        onVersionSelect={setSelectedVersion}
                      />
                    </TabContentBody>
                  </TabContent>
                )}
                {!hasRelease && (
                  <TabContent
                    eventKey={1}
                    id='lightwell-package-versions-panel'
                    ref={versionsTabRef}
                    aria-label='Versions'
                    hidden
                  >
                    <TabContentBody hasPadding>
                      <PackageVersionsTab
                        currentVersion={selectedVersion}
                        versions={packageItem?.versions ?? []}
                        latestReleases={packageItem?.latest_releases ?? []}
                        onVersionSelect={setSelectedVersion}
                      />
                    </TabContentBody>
                  </TabContent>
                )}
              </GridItem>
              <GridItem md={4}>
                <PackageSidebar
                  lastUpdated={lastUpdated}
                  namespace={packageGroup}
                  upstreamVersion={upstreamVersion}
                  allVersions={!hasRelease ? packageItem?.versions : undefined}
                />
              </GridItem>
            </Grid>
          </CardBody>
        </Card>
      )}
    </>
  );
};

export default PackageDetails;
