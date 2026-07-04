import {
  Button,
  Card,
  Content,
  Flex,
  FlexItem,
  Grid,
  Icon,
  Label,
  PageSection,
  Pagination,
  PaginationVariant,
  Stack,
} from '@patternfly/react-core';
import { CodeIcon, JavaIcon, PythonIcon } from '@patternfly/react-icons';
import { SkeletonTable } from '@patternfly/react-component-groups';
import {
  Table,
  TableVariant,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  type BaseCellProps,
} from '@patternfly/react-table';
import { useState } from 'react';
import { createUseStyles } from 'react-jss';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';

import EmptyTableState from './components/EmptyTableState';
import Header from 'components/Header/Header';
import Hide from 'components/Hide/Hide';
import { FilterData } from 'services/Content/ContentApi';
import { useContentListQuery } from 'services/Content/ContentQueries';

import { LIGHTWELL_FEATURE_NAME, lightwellReposPerPageKey } from '../constants';
import { formatEcosystemDisplay, getRepositoryDescription, formatRepositoryName } from '../helpers';
import { useLightwellNavigate } from '../../../Hooks/useLightwellNavigate';
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

const RepositoriesTable = () => {
  const classes = useStyles();
  const { goToRepositoryPackages } = useLightwellNavigate();
  const [page, setPage] = useState(1);
  const storedPerPage = Number(localStorage.getItem(lightwellReposPerPageKey)) || 20;
  const [perPage, setPerPage] = useState(storedPerPage);
  const filters: FilterData = {
    feature_name: LIGHTWELL_FEATURE_NAME,
  };

  const {
    isLoading,
    isError,
    error,
    data = { data: [], meta: { count: 0, limit: 20, offset: 0 } },
  } = useContentListQuery(page, perPage, filters, '', []);

  const {
    data: repositories = [],
    meta: { count = 0 },
  } = data;

  if (isError) throw error;

  const columnHeaders: { title: string; width?: BaseCellProps['width'] }[] = [
    { title: 'Repository' },
    { title: 'Ecosystem', width: 15 },
    { title: 'Security level', width: 15 },
    { title: 'Packages', width: 10 },
    { title: 'Builds', width: 10 },
  ];

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
                columnsCount={columnHeaders.length}
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
                      {repositories.map((repo) => {
                        const {
                          uuid,
                          name,
                          content_type,
                          published_distribution_url,
                          security_level,
                          package_count,
                          build_count,
                        } = repo;

                        return (
                          <Tr key={uuid}>
                            <Td>
                              <Flex direction={{ default: 'column' }} gap={{ default: 'gapXs' }}>
                                <Flex
                                  alignItems={{ default: 'alignItemsCenter' }}
                                  gap={{ default: 'gapSm' }}
                                >
                                  <Icon size='xl'>
                                    {content_type === 'maven' ? <JavaIcon /> : <PythonIcon />}
                                  </Icon>
                                  <Button
                                    variant='link'
                                    isInline
                                    ouiaId={`lightwell-repo-${uuid}`}
                                    onClick={() => goToRepositoryPackages(uuid)}
                                  >
                                    {formatRepositoryName(content_type, security_level, name)}
                                  </Button>
                                </Flex>
                                <FlexItem>
                                  <Content component='small'>
                                    {getRepositoryDescription(content_type)}
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
                            <Td>{formatEcosystemDisplay(content_type)}</Td>
                            <Td>
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
                            <Td>{package_count}</Td>
                            <Td>{build_count ?? '0'}</Td>
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
