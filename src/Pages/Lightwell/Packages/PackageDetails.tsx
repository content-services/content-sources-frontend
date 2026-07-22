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
import { CodeIcon, JavaIcon, PythonIcon } from '@patternfly/react-icons';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import { createUseStyles } from 'react-jss';
import { createRef, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import EmptyTableState from 'components/EmptyTableState/EmptyTableState';
import Loader from 'components/Loader';
import {
  useLightwellRepositoryPackagesQuery,
  useMavenPackageVersionsListQuery,
  usePythonPackageVersionsQuery,
} from 'services/Content/ContentQueries';
import { LIGHTWELL_USE_MOCK } from '../constants';
import {
  compareVersionsDesc,
  formatDistributionUrl,
  formatRepositoryName,
  lightwellReleaseNum,
  sortVersionsDesc,
  stripLightwellVersionSuffix,
} from '../helpers';
import {
  getMockLightwellPackages,
  getMockMavenPackageVersionsList,
  getMockPythonPackageVersions,
} from '../mockPackages';
import RemediatedDataWarning from '../RemediatedDataWarning';
import ConnectRepositoryModal from '../Repositories/components/ConnectRepositoryModal';
import useLightwellRepository from '../useLightwellRepository';
import PackageOverviewTab from './components/PackageOverviewTab';
import PackageReleasesTab, { buildVersionFromRelease } from './components/PackageReleasesTab';
import PackageSidebar from './components/PackageSidebar';
import PackageVersionsTab from './components/PackageVersionsTab';

const useStyles = createUseStyles({
  topContainer: {
    padding: '16px 24px',
  },
  titleWrapper: {
    padding: '16px 0 0',
  },
  detailCard: {
    overflow: 'visible',
  },
});

const PackageDetails = () => {
  const classes = useStyles();
  const navigate = useNavigate();

  const {
    repoName: repoSlug = '',
    group: groupParam = '',
    packageName: packageNameParam = '',
  } = useParams();

  const packageName = packageNameParam ? decodeURIComponent(packageNameParam) : '';
  const packageGroup = decodeURIComponent(groupParam);

  const [activeTabKey, setActiveTabKey] = useState(0);
  const [selectedVersion, setSelectedVersion] = useState<string>('');
  const [versionDropdownOpen, setVersionDropdownOpen] = useState(false);
  const copyTooltipTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

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
    20,
    packageName,
    !!repoUUID && !!packageName && !useMock,
  );

  const packageItem = useMemo(() => {
    if (useMock) {
      return getMockLightwellPackages(repoUUID).find((pkg) => pkg.name === packageName);
    }

    return (apiPackagesQuery.data?.results ?? []).find((pkg) => pkg.name === packageName);
  }, [useMock, repoUUID, packageName, apiPackagesQuery.data?.results]);

  const packageVersion = packageItem?.versions[0] ?? '';
  const hasRelease = (packageItem?.latest_releases ?? []).some((r) => !!r.release);
  const isMaven = repository?.content_type === 'maven';
  const isPython = repository?.content_type === 'python';

  const activeVersion = selectedVersion || packageVersion;

  const mavenVersionsListQuery = useMavenPackageVersionsListQuery(
    repoUUID,
    packageGroup,
    packageName,
    !useMock,
  );

  const pythonPackageVersionsQuery = usePythonPackageVersionsQuery(
    repoUUID,
    packageName,
    isPython && !!repoUUID && !!packageName && !useMock,
  );

  const mockMavenVersionsList = useMemo(
    () =>
      useMock && isMaven
        ? getMockMavenPackageVersionsList(repoUUID, packageGroup, packageName)
        : undefined,
    [useMock, isMaven, repoUUID, packageGroup, packageName],
  );

  const mockPythonVersions = useMemo(
    () => (useMock && isPython ? getMockPythonPackageVersions(repoUUID, packageName) : undefined),
    [useMock, isPython, repoUUID, packageName],
  );

  const mavenDetail = (
    useMock ? mockMavenVersionsList : mavenVersionsListQuery.data
  )?.versions.find(
    (v) => stripLightwellVersionSuffix(v.version) === stripLightwellVersionSuffix(activeVersion),
  );

  const mavenVersionsData = useMock ? mockMavenVersionsList : mavenVersionsListQuery.data;

  const mavenBuilds = useMemo(() => {
    if (!isMaven || !hasRelease || !mavenVersionsData?.versions) return [];

    const upstream = stripLightwellVersionSuffix(activeVersion);

    return mavenVersionsData.versions
      .filter((v) => stripLightwellVersionSuffix(v.version) === upstream)
      .flatMap((v) => v.builds)
      .sort((a, b) => lightwellReleaseNum(b.release) - lightwellReleaseNum(a.release));
  }, [isMaven, hasRelease, mavenVersionsData?.versions, activeVersion]);

  const mavenDeduplicatedVersions = useMemo(() => {
    const versions = packageItem?.versions ?? [];

    if (!isMaven || !hasRelease) {
      return sortVersionsDesc(versions.map(stripLightwellVersionSuffix));
    }

    const seen = new Set<string>();

    return [...(packageItem?.versions ?? [])]
      .sort((a, b) => lightwellReleaseNum(b) - lightwellReleaseNum(a))
      .filter((v) => {
        const upstream = stripLightwellVersionSuffix(v);
        if (seen.has(upstream)) {
          return false;
        }
        seen.add(upstream);
        return true;
      })
      .map(stripLightwellVersionSuffix)
      .sort(compareVersionsDesc);
  }, [isMaven, hasRelease, packageItem?.versions]);

  const pythonVersionsData = useMock ? mockPythonVersions : pythonPackageVersionsQuery.data;

  const pythonVersionsFromApi = useMemo(
    () => pythonVersionsData?.versions?.map((version) => version.version) ?? [],
    [pythonVersionsData?.versions],
  );

  const pythonVersions = useMemo(() => {
    const versions =
      useMock && !pythonVersionsData ? (packageItem?.versions ?? []) : pythonVersionsFromApi;
    return sortVersionsDesc(versions.map(stripLightwellVersionSuffix));
  }, [useMock, pythonVersionsData, packageItem?.versions, pythonVersionsFromApi]);

  const pythonDetail = useMemo(
    () => pythonVersionsData?.versions.find((version) => version.version === activeVersion),
    [pythonVersionsData?.versions, activeVersion],
  );

  const pythonVersionReleases = useMemo(() => {
    if (pythonVersionsData?.versions) {
      return pythonVersionsData.versions.map((version) => ({
        version: version.version,
        release: '',
        created_at: version.last_updated,
      }));
    }

    return (packageItem?.latest_releases ?? []).map((release) => ({
      version: release.version,
      release: release.release,
      created_at: release.created_at,
    }));
  }, [pythonVersionsData?.versions, packageItem?.latest_releases]);

  const pythonBuilds = useMemo(() => {
    if (!isPython || !packageItem) return [];

    const upstream = stripLightwellVersionSuffix(activeVersion);
    return (packageItem.latest_releases ?? [])
      .filter(
        (release) => !!release.release && stripLightwellVersionSuffix(release.version) === upstream,
      )
      .map((release) => ({
        version: buildVersionFromRelease(release),
        release: release.release,
        created_at: release.created_at,
      }));
  }, [isPython, packageItem, activeVersion]);

  const versionOptions = isPython ? pythonVersions : mavenDeduplicatedVersions;

  useEffect(() => {
    if (!versionOptions.length) {
      return;
    }

    if (
      !selectedVersion ||
      !versionOptions.includes(stripLightwellVersionSuffix(selectedVersion))
    ) {
      setSelectedVersion(versionOptions[0]);
    }
  }, [versionOptions, selectedVersion]);

  useEffect(
    () => () => {
      if (copyTooltipTimeoutRef.current) {
        clearTimeout(copyTooltipTimeoutRef.current);
      }
    },
    [],
  );

  const isLoadingDetail = useMock
    ? false
    : isMaven
      ? mavenVersionsListQuery.isLoading
      : pythonPackageVersionsQuery.isLoading && !pythonPackageVersionsQuery.data;

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

  const builds = isMaven && hasRelease ? mavenBuilds : (mavenDetail?.builds ?? []);
  const latestBuild = builds[0];

  const latestVersion = isMaven ? (latestBuild?.version ?? activeVersion) : activeVersion;
  const upstreamVersion = stripLightwellVersionSuffix(isMaven ? latestVersion : activeVersion);
  const pythonBuildVersion = pythonBuilds[0]?.version;

  const displayVersion = isMaven
    ? hasRelease
      ? latestVersion
      : selectedVersion || packageVersion
    : hasRelease && pythonBuildVersion
      ? pythonBuildVersion
      : activeVersion;

  const formatReleaseCopyText = (version: string) =>
    isMaven
      ? `${packageGroup}:${packageName}:${version}`
      : `pip install ${packageName}==${version}`;

  const lastUpdated = isMaven
    ? (builds
        .map((b) => b.created_at)
        .sort()
        .at(-1) ?? '')
    : (pythonDetail?.last_updated ?? '');

  const packagesReady = useMock || (!apiPackagesQuery.isLoading && !!apiPackagesQuery.data);
  const detailReady = !isLoadingDetail;
  const doneLoading = !!packageItem && packagesReady && detailReady;

  const hasDetail =
    !!packageItem &&
    detailReady &&
    (isMaven
      ? builds.length > 0 || (!hasRelease && !!packageItem.versions.length)
      : hasRelease
        ? pythonBuilds.length > 0
        : pythonVersions.length > 0);

  const showEmpty = packagesReady && detailReady && !hasDetail;

  const showVersionsTab = isMaven
    ? !hasRelease
    : isPython && !hasRelease && pythonVersions.length > 0;

  const showReleasesTab = hasRelease && (isMaven || isPython);

  if (!doneLoading && !showEmpty) {
    return <Loader />;
  }

  return (
    <>
      <Grid className={classes.topContainer}>
        <Stack>
          <StackItem>
            <Breadcrumb ouiaId='lightwell-package-details-breadcrumb'>
              <BreadcrumbItem
                component='button'
                onClick={() => navigate(groupParam ? '../../..' : '../..', { relative: 'path' })}
              >
                Lightwell
              </BreadcrumbItem>
              <BreadcrumbItem
                component='button'
                onClick={() => navigate(groupParam ? '../..' : '..', { relative: 'path' })}
              >
                {repositoryName}
              </BreadcrumbItem>
              <BreadcrumbItem isActive>
                {isMaven ? `${packageGroup}:${packageName}` : packageName || '—'}
              </BreadcrumbItem>
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
                    {isMaven ? `${packageGroup}:${packageName}` : packageName || 'Package details'}
                  </Title>
                </FlexItem>
                {versionOptions.length === 1 && (selectedVersion || activeVersion) ? (
                  <FlexItem>
                    <Label variant='outline' style={{ fontSize: '14px', padding: '8px 16px' }}>
                      {isMaven && hasRelease ? upstreamVersion : selectedVersion || activeVersion}
                    </Label>
                  </FlexItem>
                ) : null}
                {versionOptions.length > 1 ? (
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
                          {isMaven && hasRelease
                            ? stripLightwellVersionSuffix(selectedVersion)
                            : selectedVersion || activeVersion}
                        </MenuToggle>
                      )}
                      onOpenChange={(isOpen) => setVersionDropdownOpen(isOpen)}
                      isOpen={versionDropdownOpen}
                    >
                      <DropdownList>
                        {versionOptions.map((v) => (
                          <DropdownItem key={v} value={v} isSelected={selectedVersion === v}>
                            {isMaven && hasRelease ? stripLightwellVersionSuffix(v) : v}
                          </DropdownItem>
                        ))}
                      </DropdownList>
                    </Dropdown>
                  </FlexItem>
                ) : null}
              </Flex>
              <FlexItem align={{ default: 'alignRight' }}>
                <ConnectRepositoryModal
                  repository={{
                    uuid: repository.uuid,
                    name: repository.name,
                    published_distribution_url: formatDistributionUrl(
                      repository.published_distribution_url || '',
                    ),
                    content_type: repository.content_type,
                  }}
                >
                  <Button size='sm' variant='secondary' icon={<CodeIcon />}>
                    Connect
                  </Button>
                </ConnectRepositoryModal>
              </FlexItem>
            </Flex>
          </StackItem>
          {repository.security_level === 'remediated' && (
            <StackItem className={spacing.ptMd}>
              <RemediatedDataWarning />
            </StackItem>
          )}
        </Stack>
      </Grid>

      {showEmpty ? (
        <Grid className={spacing.pxLg}>
          <EmptyTableState
            notFiltered
            clearFilters={() => undefined}
            itemName='package details'
            notFilteredBody='No details available yet for this package.'
          />
        </Grid>
      ) : null}

      {hasDetail ? (
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
                  {showReleasesTab && (
                    <Tab
                      eventKey={1}
                      title={<TabTitleText>Releases</TabTitleText>}
                      tabContentRef={releasesTabRef}
                      ouiaId='lightwell-package-releases-tab'
                    />
                  )}
                  {showVersionsTab && (
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
                      isMaven={isMaven}
                      group={packageGroup}
                      name={packageName}
                      latestRelease={displayVersion}
                      hasRelease={hasRelease}
                      summary={isMaven ? mavenDetail?.summary : pythonDetail?.summary}
                      sourceUrl={formatDistributionUrl(repository.published_distribution_url ?? '')}
                      repository={{
                        uuid: repository.uuid,
                        name: repository.name,
                        published_distribution_url: formatDistributionUrl(
                          repository.published_distribution_url ?? '',
                        ),
                        content_type: repository.content_type ?? '',
                      }}
                    />
                  </TabContentBody>
                </TabContent>
                {showReleasesTab && (
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
                        builds={isMaven ? mavenBuilds : pythonBuilds}
                        allVersions={packageItem?.versions ?? []}
                        latestReleases={packageItem?.latest_releases ?? []}
                        onVersionSelect={setSelectedVersion}
                        formatCopyText={formatReleaseCopyText}
                      />
                    </TabContentBody>
                  </TabContent>
                )}
                {showVersionsTab && (
                  <TabContent
                    eventKey={1}
                    id='lightwell-package-versions-panel'
                    ref={versionsTabRef}
                    aria-label='Versions'
                    hidden
                  >
                    <TabContentBody hasPadding>
                      <PackageVersionsTab
                        currentVersion={selectedVersion || activeVersion}
                        versions={versionOptions}
                        latestReleases={
                          isPython ? pythonVersionReleases : (packageItem?.latest_releases ?? [])
                        }
                        onVersionSelect={setSelectedVersion}
                      />
                    </TabContentBody>
                  </TabContent>
                )}
              </GridItem>
              <GridItem md={4}>
                <PackageSidebar
                  lastUpdated={lastUpdated}
                  groupId={packageGroup}
                  upstreamVersion={upstreamVersion}
                  allVersions={
                    isMaven && !hasRelease
                      ? packageItem?.versions
                      : isPython && pythonVersions.length > 1
                        ? pythonVersions
                        : undefined
                  }
                  license={isMaven ? mavenDetail?.license : pythonDetail?.license}
                  author={isMaven ? mavenDetail?.author : pythonDetail?.author?.name}
                  projectUrl={isMaven ? mavenDetail?.project_url : pythonDetail?.project_url}
                  hasRelease={hasRelease}
                />
              </GridItem>
            </Grid>
          </CardBody>
        </Card>
      ) : null}
    </>
  );
};

export default PackageDetails;
