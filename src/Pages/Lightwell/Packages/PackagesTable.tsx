import {
  Breadcrumb,
  BreadcrumbItem,
  Button,
  Card,
  Content,
  Flex,
  FlexItem,
  Grid,
  Icon,
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
import { useState, type ReactNode } from 'react';
import {
  Table,
  TableVariant,
  Tr,
  Td,
  Thead,
  Th,
  Tbody,
  type BaseCellProps,
} from '@patternfly/react-table';

import {
  useLightwellRepositoryPackagesQuery,
  useFetchContent,
} from 'services/Content/ContentQueries';
import { RepositoryPackageItem } from 'services/Content/ContentApi';
import {
  formatRepositoryName,
  getRepositoryDescription,
  stripLightwellVersionSuffix,
} from '../helpers';
import Hide from 'components/Hide/Hide';
import { lightwellPkgsPerPageKey } from '../constants';
import EmptyTableState from 'components/EmptyTableState/EmptyTableState';
import Loader from 'components/Loader';
import { useLightwellNavigate } from '../../../Hooks/useLightwellNavigate';
import ConnectRepositoryPopover from '../Repositories/components/ConnectRepositoryPopover';
import useSafeUUIDParam from 'Hooks/useSafeUUIDParam';

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

type MappedPackage = {
  group_id: string;
  name: string;
  versions: string[];
  latest_releases: string[];
  last_updated: string;
};

const mapRepositoryPackage = (pkg: RepositoryPackageItem): MappedPackage => {
  const latestCreatedAt = pkg.latest_releases
    .map((release) => release.created_at)
    .sort()
    .at(-1);

  return {
    group_id: pkg.group,
    name: pkg.name,
    versions: pkg.versions.map(stripLightwellVersionSuffix),
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

const PackagesTable = () => {
  const classes = useStyles();
  const repoUUID = useSafeUUIDParam('repoUUID');
  const { goToRepositories, goToPackageDetails } = useLightwellNavigate();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const storedPerPage = Number(localStorage.getItem(lightwellPkgsPerPageKey)) || 20;
  const [perPage, setPerPage] = useState(storedPerPage);
  const [expandedPackages, setExpandedPackages] = useState<Set<string>>(new Set());

  const {
    data: repository,
    isLoading: isRepositoryLoading,
    isError: isRepositoryError,
    error: repositoryError,
  } = useFetchContent(repoUUID, !!repoUUID);

  const {
    data: packagesData,
    isLoading: isLoadingPackages,
    isFetching: isFetchingPackages,
    isError: isPackagesError,
    error: packagesError,
  } = useLightwellRepositoryPackagesQuery(repoUUID, page, perPage, search, !!repoUUID);

  const results = packagesData?.results ?? [];
  const packages = results.map(mapRepositoryPackage);
  const packageCount = packagesData?.total ?? 0;

  const countIsZero = packageCount === 0;
  const showPagination = packages.length > 0;

  if (isRepositoryLoading || !repository) {
    return <Loader />;
  }

  if (!repoUUID || isRepositoryError) throw repositoryError;
  if (isPackagesError) throw packagesError;

  const onSetPage = (_, newPage: number) => setPage(newPage);

  const onPerPageSelect = (_, newPerPage: number, newPage: number) => {
    localStorage.setItem(lightwellPkgsPerPageKey, newPerPage.toString());
    setPerPage(newPerPage);
    setPage(newPage);
  };

  const paginationProps = {
    isDisabled: isLoadingPackages || isFetchingPackages,
    itemCount: packageCount,
    perPage,
    page,
    onSetPage,
    onPerPageSelect,
  };

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

  const repositoryName = formatRepositoryName(
    repository.content_type,
    repository.security_level,
    repository.name,
  );
  const isRemediatedRepository = repository.security_level === 'remediated';
  const isJavaRepository = repository.content_type === 'maven';

  const columnHeaders: { title: string; width?: BaseCellProps['width'] }[] = [
    { title: 'Package', width: 25 },
    { title: 'Version', width: 15 },
    ...(isRemediatedRepository
      ? [{ title: 'Latest release', width: 20 as BaseCellProps['width'] }]
      : []),
    ...(isJavaRepository ? [{ title: 'Namespace', width: 20 as BaseCellProps['width'] }] : []),
    { title: 'Last updated', width: 15 },
  ];

  return (
    <>
      <Grid className={classes.topContainer}>
        <Stack>
          <StackItem>
            <Breadcrumb ouiaId='lightwell-packages-breadcrumb'>
              <BreadcrumbItem component='button' onClick={goToRepositories}>
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
                  <Icon size='xl'>
                    {repository?.content_type === 'maven' ? <JavaIcon /> : <PythonIcon />}
                  </Icon>
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
                      navigator.clipboard.writeText(repository.published_distribution_url || '')
                    }
                  >
                    {repository.published_distribution_url}
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
                  <Button size='sm' variant='secondary' icon={<CodeIcon />}>
                    Connect
                  </Button>
                </ConnectRepositoryPopover>
              </FlexItem>
            </Flex>
            <Content className={spacing.pySm}>
              {getRepositoryDescription(repository.content_type)}
            </Content>
          </StackItem>
        </Stack>
      </Grid>

      <Grid className={spacing.pxLg}>
        <Toolbar ouiaId='lightwell-packages-toolbar'>
          <ToolbarContent>
            <ToolbarItem className={classes.filterToolbarItem}>
              <SearchInput
                id='lightwell-package-filter'
                aria-label='Filter by name or namespace'
                placeholder='Filter by name or namespace'
                value={search}
                onChange={(_event, value) => {
                  setSearch(value);
                  setPage(1);
                }}
                onClear={() => {
                  setSearch('');
                  setPage(1);
                }}
              />
            </ToolbarItem>
            <ToolbarItem variant='pagination' align={{ default: 'alignEnd' }}>
              <Hide hide={!showPagination}>
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
            columnsCount={columnHeaders.length}
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
                  isStriped
                >
                  <Thead>
                    <Tr>
                      {columnHeaders.map(({ title, width }) => (
                        <Th key={title + 'column'} width={width} modifier='wrap'>
                          {title}
                        </Th>
                      ))}
                    </Tr>
                  </Thead>
                  <Tbody>
                    {packages.map((pkg) => {
                      const { name, group_id, versions, latest_releases, last_updated } = pkg;
                      const packageKey = `${group_id}-${name}`;
                      const isCollapsed = !expandedPackages.has(packageKey);

                      const renderVersionLabel = (version: string) => (
                        <Label
                          isCompact
                          icon={<CopyIcon />}
                          onClick={() =>
                            navigator.clipboard.writeText(`${group_id}:${name}:${version}`)
                          }
                          aria-label={`Copy ${version}`}
                        >
                          {version}
                        </Label>
                      );

                      const renderReleaseLabel = (release: string) => (
                        <Label
                          isCompact
                          icon={<CopyIcon />}
                          onClick={() =>
                            navigator.clipboard.writeText(`${group_id}:${name}:${release}`)
                          }
                          aria-label={`Copy ${release}`}
                        >
                          {release}
                        </Label>
                      );

                      return (
                        <Tr key={packageKey}>
                          <Td>
                            <Button
                              variant='link'
                              isInline
                              ouiaId={`lightwell-package-${name}`}
                              onClick={() => goToPackageDetails(repoUUID, name)}
                            >
                              {name}
                            </Button>
                          </Td>
                          <Td>
                            <StackedItemsCell
                              items={versions}
                              packageKey={packageKey}
                              isCollapsed={isCollapsed}
                              onToggle={togglePackageExpanded}
                              showToggle
                              renderItem={
                                repository.security_level === 'validated'
                                  ? renderVersionLabel
                                  : undefined
                              }
                            />
                          </Td>
                          {isRemediatedRepository ? (
                            <Td>
                              <StackedItemsCell
                                items={latest_releases}
                                packageKey={packageKey}
                                isCollapsed={isCollapsed}
                                onToggle={togglePackageExpanded}
                                renderItem={renderReleaseLabel}
                              />
                            </Td>
                          ) : null}
                          {isJavaRepository ? <Td>{group_id}</Td> : null}
                          <Td>{last_updated}</Td>
                        </Tr>
                      );
                    })}
                  </Tbody>
                </Table>
                <Hide hide={!showPagination}>
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

export default PackagesTable;
