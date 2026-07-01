import {
  Breadcrumb,
  BreadcrumbItem,
  Button,
  Card,
  Content,
  Flex,
  FlexItem,
  Grid,
  Label,
  Pagination,
  PaginationVariant,
  SearchInput,
  Stack,
  StackItem,
  Title,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
} from '@patternfly/react-core';
import { CopyIcon, CodeIcon, JavaIcon, PythonIcon } from '@patternfly/react-icons';
import { SkeletonTable } from '@patternfly/react-component-groups';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import { createUseStyles } from 'react-jss';
import { useMemo, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, TableVariant, Tr, Td, Thead, Th, Tbody } from '@patternfly/react-table';

import { useFetchContent, useRepositoryPackagesQuery } from 'services/Content/ContentQueries';
import { RepositoryPackageItem } from 'services/Content/ContentApi';
import { getMockLightwellPackages, LightwellPackage } from '../mockPackages';
import {
  displayValue,
  formatRepositoryName,
  getEcosystemFromContentType,
  getRepositoryDescription,
} from '../helpers';
import Hide from 'components/Hide/Hide';
import { LIGHTWELL_USE_MOCK, lightwellPkgsPerPageKey } from '../constants';
import useSafeUUIDParam from 'Hooks/useSafeUUIDParam';
import EmptyTableState from 'components/EmptyTableState/EmptyTableState';
import Loader from 'components/Loader';
import { getMockLightwellRepository } from '../mockRepositories';
import ConnectRepositoryPopover from '../Repositories/components/ConnectRepositoryPopover';
import { useQuery } from '@tanstack/react-query';

const useStyles = createUseStyles({
  topContainer: {
    padding: '16px 24px',
  },
  titleWrapper: {
    padding: '24px 0 0',
  },
  packagesList: {
    paddingTop: '16px',
  },
  bottomContainer: {
    justifyContent: 'space-between',
  },
  filterToolbarItem: {
    minWidth: '18rem',
    '& .pf-v6-c-search-input': {
      width: '100%',
    },
  },
});

type PackageColumn = {
  id: 'package' | 'versions' | 'latestReleases' | 'namespace' | 'lastUpdated';
  name: string;
  remediatedOnly?: boolean;
  javaOnly?: boolean;
};

const columns: PackageColumn[] = [
  { id: 'package', name: 'Package' },
  { id: 'versions', name: 'Versions' },
  { id: 'latestReleases', name: 'Latest releases', remediatedOnly: true },
  { id: 'namespace', name: 'Namespace', javaOnly: true },
  { id: 'lastUpdated', name: 'Last updated' },
];

const mapRepositoryPackage = (pkg: RepositoryPackageItem): LightwellPackage => {
  const latestCreatedAt = pkg.latest_releases
    .map((release) => release.created_at)
    .sort()
    .at(-1);

  return {
    group_id: pkg.group,
    name: pkg.name,
    versions: pkg.versions,
    latest_releases: pkg.latest_releases.map((release) => release.release),
    last_updated: latestCreatedAt?.split('T')[0] ?? '—',
  };
};

type StackedItemsCellProps = {
  items: string[];
  packageKey: string;
  isCollapsed: boolean;
  onToggle: (key: string) => void;
  showToggle?: boolean;
  renderItem?: (item: string) => ReactNode;
};

const StackedItemsCell = ({
  items,
  packageKey,
  isCollapsed,
  onToggle,
  showToggle = false,
  renderItem = (item) => item,
}: StackedItemsCellProps) => {
  if (items.length === 0) {
    return <>—</>;
  }

  if (items.length === 1) {
    return <>{renderItem(items[0])}</>;
  }

  const [primary, ...rest] = items;
  const isExpanded = !isCollapsed;

  return (
    <Flex
      direction={{ default: 'column' }}
      alignItems={{ default: 'alignItemsFlexStart' }}
      gap={{ default: 'gapXs' }}
    >
      <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapSm' }}>
        <span>{renderItem(primary)}</span>
        {showToggle && (
          <Button variant='link' isInline onClick={() => onToggle(packageKey)}>
            {isExpanded ? 'hide' : `${rest.length} more`}
          </Button>
        )}
      </Flex>
      {isExpanded && rest.map((item) => <span key={item}>{renderItem(item)}</span>)}
    </Flex>
  );
};

const PackagesList = () => {
  const classes = useStyles();
  const repoUUID = useSafeUUIDParam('repoUUID');
  const navigate = useNavigate();
  const useMock = LIGHTWELL_USE_MOCK;
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const storedPerPage = Number(localStorage.getItem(lightwellPkgsPerPageKey)) || 20;
  const [perPage, setPerPage] = useState(storedPerPage);
  const [expandedPackages, setExpandedPackages] = useState<Set<string>>(new Set());

  const togglePackageExpanded = (packageKey: string) => {
    setExpandedPackages((prev) => {
      const next = new Set(prev);
      if (next.has(packageKey)) {
        next.delete(packageKey);
      } else {
        next.add(packageKey);
      }
      return next;
    });
  };

  const mockRepositoryQuery = useQuery({
    queryKey: ['lightwell-repository-mock', repoUUID],
    queryFn: () => {
      const mockRepository = getMockLightwellRepository(repoUUID);
      if (!mockRepository) {
        throw new Error('Lightwell repository not found');
      }
      return mockRepository;
    },
    staleTime: 20000,
    enabled: useMock && !!repoUUID,
  });

  const apiRepositoryQuery = useFetchContent(repoUUID, !!repoUUID && !useMock);
  const packagesQuery = useRepositoryPackagesQuery(repoUUID, page, perPage, !useMock && !!repoUUID);

  const {
    data: repository,
    isLoading: isRepositoryLoading,
    isError,
    error,
  } = useMock ? mockRepositoryQuery : apiRepositoryQuery;

  const { packages, packageCount } = useMemo(() => {
    if (useMock) {
      const mockPackages = getMockLightwellPackages(repoUUID, search);
      const offset = (page - 1) * perPage;
      return {
        packages: mockPackages.slice(offset, offset + perPage),
        packageCount: mockPackages.length,
      };
    }

    const results = packagesQuery.data?.results ?? [];
    return {
      packages: results.map(mapRepositoryPackage),
      packageCount: packagesQuery.data?.total ?? 0,
    };
  }, [useMock, repoUUID, search, page, perPage, packagesQuery.data]);

  const isLoadingPackages = useMock ? false : packagesQuery.isLoading || packagesQuery.isFetching;
  const countIsZero = packageCount === 0;

  if (isError) throw error;
  if (!useMock && packagesQuery.isError) throw packagesQuery.error;

  if (isRepositoryLoading || !repository) {
    return <Loader />;
  }

  const onSetPage = (_, newPage: number) => setPage(newPage);

  const onPerPageSelect = (_, newPerPage: number, newPage: number) => {
    localStorage.setItem(lightwellPkgsPerPageKey, newPerPage.toString());
    setPerPage(newPerPage);
    setPage(newPage);
  };

  const paginationProps = {
    isDisabled: isLoadingPackages,
    itemCount: packageCount,
    perPage,
    page,
    onSetPage,
    onPerPageSelect,
  };

  const ecosystem = getEcosystemFromContentType(repository.content_type);
  const repositoryName = formatRepositoryName(ecosystem, repository.security_level);
  const isRemediatedRepository = repository.security_level === 'remediated';
  const isJavaRepository = repository.content_type === 'maven';
  const visibleColumns = columns.filter((column) => {
    if (column.remediatedOnly && !isRemediatedRepository) {
      return false;
    }
    if (column.javaOnly && !isJavaRepository) {
      return false;
    }
    return true;
  });

  return (
    <>
      <Grid className={classes.topContainer}>
        <Stack>
          <StackItem>
            <Breadcrumb ouiaId='lightwell-packages-breadcrumb'>
              <BreadcrumbItem component='button' onClick={() => navigate('..')}>
                Lightwell
              </BreadcrumbItem>
              <BreadcrumbItem disabled>{repositoryName}</BreadcrumbItem>
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
                  {repository?.content_type === 'maven' ? <JavaIcon /> : <PythonIcon />}
                </FlexItem>
                <FlexItem>
                  <Title headingLevel='h1' ouiaId='lightwell-packages-header'>
                    {repositoryName}
                  </Title>
                </FlexItem>
                <FlexItem>
                  <Label
                    aria-label='Repository URL'
                    icon={<CopyIcon />}
                    isCompact
                    onClick={() =>
                      navigator.clipboard.writeText(repository?.published_distribution_url || '')
                    }
                  >
                    {repository?.published_distribution_url}
                  </Label>
                </FlexItem>
              </Flex>
              <FlexItem align={{ default: 'alignRight' }}>
                <ConnectRepositoryPopover
                  repository={{
                    uuid: repository.uuid,
                    name: repository.name,
                    published_distribution_url: repository.published_distribution_url,
                    content_type: repository.content_type,
                  }}
                >
                  <Button variant='secondary' icon={<CodeIcon />}>
                    Connect
                  </Button>
                </ConnectRepositoryPopover>
              </FlexItem>
            </Flex>
            <Content className={`${spacing.pySm}`}>
              {displayValue(getRepositoryDescription(repository?.content_type))}
            </Content>
          </StackItem>
        </Stack>
      </Grid>

      <Grid className={`${spacing.pxLg}`}>
        <Toolbar ouiaId='lightwell-packages-toolbar'>
          <ToolbarContent>
            <ToolbarItem className={classes.filterToolbarItem}>
              <SearchInput
                id='lightwell-package-filter'
                aria-label='Filter by name or namespace'
                placeholder='Filter by name or namespace'
                value={search}
                onChange={(_event, value) => setSearch(value)}
                onClear={() => setSearch('')}
              />
            </ToolbarItem>
            <ToolbarItem variant='pagination' align={{ default: 'alignEnd' }}>
              <Hide hide={countIsZero || packageCount < 10}>
                <Pagination
                  id='lightwell-top-pagination'
                  widgetId='lightwellTopPaginationWidgetId'
                  isCompact
                  {...paginationProps}
                />
              </Hide>
            </ToolbarItem>
          </ToolbarContent>
        </Toolbar>

        <Hide hide={!isLoadingPackages}>
          <SkeletonTable
            rows={perPage}
            columnsCount={visibleColumns.length}
            variant={TableVariant.compact}
          />
        </Hide>

        <Hide hide={countIsZero || isLoadingPackages}>
          <Stack>
            <Card className={`${spacing.ptLg} ${spacing.pbXl} ${spacing.pxLg}`}>
              <Stack>
                <Table
                  aria-label='Lightwell packages table'
                  ouiaId='lightwell-packages-table'
                  variant={TableVariant.compact}
                >
                  <Thead>
                    <Tr>
                      {visibleColumns.map((column) => (
                        <Th key={column.id}>{column.name}</Th>
                      ))}
                    </Tr>
                  </Thead>
                  <Tbody>
                    {packages.map((pkg) => {
                      const { name, group_id, versions, latest_releases, last_updated } = pkg;
                      const packageKey = `${group_id}-${name}`;
                      const isCollapsed = !expandedPackages.has(packageKey);

                      const renderReleaseLabel = (release: string) => (
                        <Label
                          isCompact
                          icon={<CopyIcon />}
                          onClick={() => navigator.clipboard.writeText(release)}
                          aria-label={`Copy ${release}`}
                        >
                          {release}
                        </Label>
                      );

                      return (
                        <Tr key={packageKey}>
                          {visibleColumns.map((column) => (
                            <Td key={column.id} dataLabel={column.name} className={spacing.pMd}>
                              {column.id === 'package' && (
                                <Button
                                  variant='link'
                                  isInline
                                  ouiaId={`lightwell-package-${name}`}
                                  onClick={() => navigate('#')}
                                >
                                  {name}
                                </Button>
                              )}
                              {column.id === 'versions' && (
                                <StackedItemsCell
                                  items={versions}
                                  packageKey={packageKey}
                                  isCollapsed={isCollapsed}
                                  onToggle={togglePackageExpanded}
                                  showToggle
                                />
                              )}
                              {column.id === 'latestReleases' && (
                                <StackedItemsCell
                                  items={latest_releases}
                                  packageKey={packageKey}
                                  isCollapsed={isCollapsed}
                                  onToggle={togglePackageExpanded}
                                  renderItem={renderReleaseLabel}
                                />
                              )}
                              {column.id === 'namespace' && group_id}
                              {column.id === 'lastUpdated' && last_updated}
                            </Td>
                          ))}
                        </Tr>
                      );
                    })}
                  </Tbody>
                </Table>
                <Hide hide={countIsZero || packageCount < 10}>
                  <Flex className={classes.bottomContainer}>
                    <FlexItem />
                    <FlexItem>
                      <Pagination
                        id='lightwell-bottom-pagination'
                        widgetId='lightwellBottomPaginationWidgetId'
                        variant={PaginationVariant.bottom}
                        {...paginationProps}
                      />
                    </FlexItem>
                  </Flex>
                </Hide>
              </Stack>
            </Card>
          </Stack>
        </Hide>
        <Hide hide={!countIsZero || isLoadingPackages}>
          <Stack>
            <EmptyTableState
              notFiltered={!(search.length > 0)}
              clearFilters={() => setSearch('')}
              itemName='packages'
              notFilteredBody='No packages available yet in this repository.'
            />
          </Stack>
        </Hide>
      </Grid>
    </>
  );
};

export default PackagesList;
