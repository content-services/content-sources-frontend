import {
  Button,
  Card,
  Content,
  Flex,
  FlexItem,
  Grid,
  Label,
  PageSection,
  Pagination,
  PaginationVariant,
  Stack,
} from '@patternfly/react-core';
import { CodeIcon, JavaIcon, PythonIcon } from '@patternfly/react-icons';
import { SkeletonTable } from '@patternfly/react-component-groups';
import { Table, TableVariant, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createUseStyles } from 'react-jss';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';

import EmptyTableState from './components/EmptyTableState';
import Header from 'components/Header/Header';
import Hide from 'components/Hide/Hide';
import { FilterData } from 'services/Content/ContentApi';
import { useContentListQuery } from 'services/Content/ContentQueries';

import { LIGHTWELL_FEATURE_NAME, LIGHTWELL_USE_MOCK, lightwellReposPerPageKey } from '../constants';
import { getMockLightwellRepositoryList } from '../mockRepositories';
import {
  getEcosystemFromContentType,
  formatEcosystemDisplay,
  getRepositoryDescription,
  formatRepositoryName,
  displayValue,
} from '../helpers';
import ConnectRepositoryPopover from './components/ConnectRepositoryPopover';
import { capitalize } from 'lodash';

const useStyles = createUseStyles({
  topContainer: {
    justifyContent: 'space-between',
    padding: '16px 24px',
    height: 'fit-content',
  },
  bottomContainer: {
    justifyContent: 'space-between',
  },
});

const columns = [
  { name: 'Repository', sortAttribute: 'name' },
  { name: 'Ecosystem', sortAttribute: 'content_type' },
  { name: 'Security level', sortAttribute: 'security_level' },
  { name: 'Packages', sortAttribute: null },
  { name: 'Builds', sortAttribute: null },
] as const;

const RepositoriesTable = () => {
  const classes = useStyles();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const storedPerPage = Number(localStorage.getItem(lightwellReposPerPageKey)) || 20;
  const [perPage, setPerPage] = useState(storedPerPage);
  const filters: FilterData = {
    feature_name: LIGHTWELL_FEATURE_NAME,
  };

  const useMock = LIGHTWELL_USE_MOCK;

  const mockQuery = useQuery({
    queryKey: ['lightwell-repositories-mock', page, perPage, filters],
    queryFn: () => getMockLightwellRepositoryList(page, perPage, filters),
    placeholderData: keepPreviousData,
    staleTime: 20000,
    enabled: useMock,
  });

  const apiQuery = useContentListQuery(page, perPage, filters, '', [], !useMock);

  const {
    isLoading,
    isError,
    error,
    data = { data: [], meta: { count: 0, limit: 20, offset: 0 } },
  } = useMock ? mockQuery : apiQuery;

  const {
    data: repositories = [],
    meta: { count = 0 },
  } = data;

  if (isError) throw error;

  const onSetPage = (_, newPage: number) => setPage(newPage);

  const onPerPageSelect = (_, newPerPage: number, newPage: number) => {
    localStorage.setItem(lightwellReposPerPageKey, newPerPage.toString());
    setPerPage(newPerPage);
    setPage(newPage);
  };

  const paginationProps = {
    isDisabled: isLoading,
    itemCount: count,
    perPage,
    page,
    onSetPage,
    onPerPageSelect,
  };

  const countIsZero = count === 0;

  return (
    <>
      <Header
        title='Repositories'
        ouiaId='lightwell-header'
        paragraph='Browse Lightwell repositories by ecosystem and security level.'
        showOpenSourceBadge={false}
      />
      <PageSection hasBodyWrapper={false} className={spacing.pb_2xl}>
        <Grid data-ouia-component-id='lightwell-repositories-page'>
          <Hide hide={countIsZero || count < 10}>
            <Flex
              className={classes.topContainer}
              data-ouia-component-id='lightwell-repositories-toolbar'
            >
              <FlexItem></FlexItem>
              <FlexItem>
                <Pagination
                  id='lightwell-top-pagination'
                  widgetId='lightwellTopPaginationWidgetId'
                  isCompact
                  {...paginationProps}
                />
              </FlexItem>
            </Flex>
          </Hide>
          <Hide hide={!isLoading}>
            <Stack>
              <SkeletonTable
                rows={perPage}
                columnsCount={columns.length}
                variant={TableVariant.compact}
              />
            </Stack>
          </Hide>
          <Hide hide={countIsZero || isLoading}>
            <Stack>
              <Card className={`${spacing.ptLg} ${spacing.pbXl} ${spacing.pxLg}`}>
                <Stack>
                  <Table
                    aria-label='Lightwell repositories table'
                    ouiaId='lightwell-repositories-table'
                    variant={TableVariant.compact}
                  >
                    <Thead>
                      <Tr>
                        {columns.map((column) => (
                          <Th key={column.name}>{column.name}</Th>
                        ))}
                      </Tr>
                    </Thead>
                    <Tbody>
                      {repositories.map((repo) => {
                        const {
                          uuid,
                          name,
                          content_type,
                          published_distribution_url,
                          security_level,
                          package_count,
                          builds,
                        } = repo;
                        const ecosystem = getEcosystemFromContentType(content_type);

                        return (
                          <Tr key={uuid}>
                            <Td dataLabel={columns[0].name} className={spacing.pMd}>
                              <Flex direction={{ default: 'column' }} gap={{ default: 'gapSm' }}>
                                <FlexItem>
                                  {content_type === 'maven' ? (
                                    <JavaIcon className={spacing.mrSm} />
                                  ) : (
                                    <PythonIcon className={spacing.mrSm} />
                                  )}
                                  <Button
                                    variant='link'
                                    isInline
                                    ouiaId={`lightwell-repo-${uuid}`}
                                    onClick={() => navigate(uuid)}
                                  >
                                    {formatRepositoryName(ecosystem, security_level)}
                                  </Button>
                                </FlexItem>
                                <FlexItem>
                                  <Content component='small'>
                                    {displayValue(getRepositoryDescription(content_type))}
                                  </Content>
                                </FlexItem>
                                <FlexItem>
                                  <ConnectRepositoryPopover
                                    repository={{
                                      uuid,
                                      name,
                                      published_distribution_url,
                                      content_type,
                                    }}
                                  >
                                    <Label
                                      isCompact
                                      icon={<CodeIcon />}
                                      variant='outline'
                                      color='blue'
                                      tabIndex={0}
                                    >
                                      Connect to this repository
                                    </Label>
                                  </ConnectRepositoryPopover>
                                </FlexItem>
                              </Flex>
                            </Td>
                            <Td className={spacing.pMd} dataLabel={columns[1].name}>
                              {displayValue(formatEcosystemDisplay(content_type))}
                            </Td>
                            <Td className={spacing.pMd} dataLabel={columns[2].name}>
                              {security_level === 'validated' ? (
                                <Label variant='outline' color='purple'>
                                  {capitalize(security_level)}
                                </Label>
                              ) : security_level === 'remediated' ? (
                                <Label color='purple'>{capitalize(security_level)}</Label>
                              ) : (
                                '—'
                              )}
                            </Td>
                            <Td className={spacing.pMd} dataLabel={columns[3].name}>
                              {package_count.toLocaleString()}
                            </Td>
                            <Td className={spacing.pMd} dataLabel={columns[4].name}>
                              {builds ? builds.toLocaleString() : 0}
                            </Td>
                          </Tr>
                        );
                      })}
                    </Tbody>
                  </Table>
                  <Hide hide={countIsZero || count < 10}>
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
          <Hide hide={!countIsZero || isLoading}>
            <Stack>
              <EmptyTableState />
            </Stack>
          </Hide>
        </Grid>
      </PageSection>
    </>
  );
};

export default RepositoriesTable;
