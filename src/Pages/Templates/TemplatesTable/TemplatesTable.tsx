import {
  Alert,
  AlertActionCloseButton,
  Button,
  Flex,
  FlexItem,
  Grid,
  Pagination,
  PaginationVariant,
  Spinner,
  TooltipPosition,
} from '@patternfly/react-core';
import {
  ActionsColumn,
  Table,
  TableVariant,
  Tbody,
  Td,
  Th,
  Thead,
  ThProps,
  Tr,
  type BaseCellProps,
} from '@patternfly/react-table';
import { global_BackgroundColor_100 } from '@patternfly/react-tokens';
import { useEffect, useMemo, useState } from 'react';
import { createUseStyles } from 'react-jss';
import { SkeletonTable } from '@patternfly/react-component-groups';
import Hide from 'components/Hide/Hide';
import EmptyTableState from 'components/EmptyTableState/EmptyTableState';
import { Outlet, useNavigate } from 'react-router-dom';
import { TemplateFilterData, TemplateItem } from 'services/Templates/TemplateApi';
import ConditionalTooltip from 'components/ConditionalTooltip/ConditionalTooltip';
import { useAppContext } from 'middleware/AppContext';
import TemplateFilters from './components/TemplateFilters';
import { formatDateDDMMMYYYY, formatDateUTC } from 'helpers';
import Header from 'components/Header/Header';
import useRootPath from 'Hooks/useRootPath';
import {
  DELETE_ROUTE,
  DETAILS_ROUTE,
  PATCH_SYSTEMS_ROUTE,
  TEMPLATES_ROUTE,
} from 'Routes/constants';
import useArchVersion from 'Hooks/useArchVersion';
import { useTemplateList } from 'services/Templates/TemplateQueries';
import StatusIcon from './components/StatusIcon';

const useStyles = createUseStyles({
  mainContainer: {
    backgroundColor: global_BackgroundColor_100.value,
    display: 'flex',
    flexDirection: 'column',
    margin: '24px',
    minHeight: '50%',
  },
  topContainer: {
    justifyContent: 'space-between',
    padding: '16px 24px', // This is needed
    height: 'fit-content',
  },
  bottomContainer: {
    justifyContent: 'space-between',
    minHeight: '68px',
  },
  invisible: {
    opacity: 0,
  },
  spinnerMinWidth: {
    width: '50px!important',
  },
  leftPaddingZero: {
    paddingLeft: 0,
  },
  disabledButton: {
    pointerEvents: 'auto',
    cursor: 'default',
  },
  bannerContainer: {
    padding: '24px 24px 0px',
  },
});

const perPageKey = 'templatesPerPage';

const TemplatesTable = () => {
  const classes = useStyles();
  const rootPath = useRootPath();
  const navigate = useNavigate();
  const { rbac, subscriptions } = useAppContext();
  const storedPerPage = Number(localStorage.getItem(perPageKey)) || 20;
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(storedPerPage);
  const [activeSortIndex, setActiveSortIndex] = useState<number>(3); // queued_at
  const [activeSortDirection, setActiveSortDirection] = useState<'asc' | 'desc'>('desc');
  const [polling, setPolling] = useState(false);
  const [pollCount, setPollCount] = useState(0);

  const basePath = rootPath.slice(1).replace('content', '');
  const storedBannerDismissal = !!sessionStorage.getItem('bannerDismissal');
  const [dismissed, setDismissed] = useState(storedBannerDismissal);

  const onDismissBanner = () => {
    sessionStorage.setItem('bannerDismissal', 'true');
    setDismissed(true);
  };

  const defaultValues: TemplateFilterData = {
    arch: '',
    version: '',
    search: '',
    repository_uuids: '',
    snapshot_uuids: '',
  };

  const [filterData, setFilterData] = useState<TemplateFilterData>(defaultValues);

  const clearFilters = () => setFilterData(defaultValues);

  const notFiltered =
    filterData.arch === '' && filterData.version === '' && filterData.search === '';

  const columnSortAttributes = ['name', '', 'arch', 'version', ''];

  const sortString = useMemo(
    () =>
      columnSortAttributes[activeSortIndex]
        ? columnSortAttributes[activeSortIndex] + ':' + activeSortDirection
        : '',
    [activeSortIndex, activeSortDirection],
  );

  const {
    isLoading,
    error,
    isError,
    isFetching,
    data = { data: [], meta: { count: 0, limit: 20, offset: 0 } },
  } = useTemplateList(page, perPage, sortString, filterData, polling);

  useEffect(() => {
    if (isError) {
      setPolling(false);
      setPollCount(0);
      return;
    }
    const containsPending = data?.data?.some(
      ({ last_update_task }) =>
        last_update_task?.status === 'running' || last_update_task?.status === 'pending',
    );
    if (polling && containsPending) {
      // Count each consecutive time polling occurs
      setPollCount(pollCount + 1);
    }
    if (polling && !containsPending) {
      // We were polling, but now the data is valid, we stop the count.
      setPollCount(0);
    }
    if (pollCount > 40) {
      // If polling occurs 40 times in a row, we stop it. Likely a data/kafka issue has occurred with the API.
      return setPolling(false);
    }
    // This sets the polling state based whether the data contains any "pending" or "running" status
    return setPolling(containsPending);
  }, [data?.data]);

  const onSetPage = (_, newPage: number) => setPage(newPage);

  const onPerPageSelect = (_, newPerPage: number, newPage: number) => {
    // Save this value through page refresh for use on next reload
    localStorage.setItem(perPageKey, newPerPage.toString());
    setPerPage(newPerPage);
    setPage(newPage);
  };

  const sortParams = (columnIndex: number): ThProps['sort'] | undefined =>
    columnSortAttributes[columnIndex]
      ? {
          sortBy: {
            index: activeSortIndex,
            direction: activeSortDirection,
            defaultDirection: 'asc', // starting sort direction when first sorting a column. Defaults to 'asc'
          },
          onSort: (_event, index, direction) => {
            setActiveSortIndex(index);
            setActiveSortDirection(direction);
          },
          columnIndex,
        }
      : undefined;

  const columnHeaders: { title: string; width?: BaseCellProps['width'] }[] = [
    { title: 'Name', width: 10 },
    { title: 'Description' },
    { title: 'Architecture', width: 10 },
    { title: 'Version', width: 10 },
    { title: 'Snapshot date', width: 15 },
    { title: 'Status', width: 15 },
  ];

  const {
    isLoading: repositoryParamsLoading,
    error: repositoryParamsError,
    isError: repositoryParamsIsError,
    archesDisplay,
    versionDisplay,
  } = useArchVersion();

  const actionTakingPlace = isLoading || isFetching || repositoryParamsLoading;

  // Error is caught in the wrapper component
  if (isError) throw error;
  if (repositoryParamsIsError) throw repositoryParamsError;

  const {
    data: templateList = [],
    meta: { count = 0 },
  } = data;

  const itemName = 'templates';
  const notFilteredBody = 'To get started, create a content template';

  const countIsZero = count === 0;

  const hasRHELSubscription = !!subscriptions?.red_hat_enterprise_linux;
  const isMissingRequirements = !rbac?.templateWrite || !hasRHELSubscription;
  const missingRequirements =
    rbac?.templateWrite && !hasRHELSubscription ? 'subscription (RHEL)' : 'permission';

  return (
    <>
      <Header
        title='Templates'
        ouiaId='templates_description'
        paragraph='View all content templates within your organization.'
      />
      <Hide hide={dismissed}>
        <Grid className={classes.bannerContainer}>
          <Alert
            variant='info'
            title='Content templates is currently in preview'
            actionClose={<AlertActionCloseButton onClose={onDismissBanner} />}
          >
            <p>
              <b>Note:</b>{' '}
              <Button
                isInline
                variant='link'
                component='a'
                href={`${basePath}${PATCH_SYSTEMS_ROUTE}`}
              >
                Systems within Patch
              </Button>{' '}
              might not properly indicate which template is assigned to a system or which updates
              are installable.
            </p>
          </Alert>
        </Grid>
      </Hide>
      <Grid data-ouia-component-id='content_template_list_page' className={classes.mainContainer}>
        <Outlet />
        <Flex className={classes.topContainer}>
          <TemplateFilters
            isLoading={isLoading}
            setFilterData={(values) => {
              setFilterData(values);
              setPage(1);
            }}
            filterData={filterData}
          />
          <FlexItem>
            <Hide hide={countIsZero}>
              <Pagination
                id='top-pagination-id'
                widgetId='topPaginationWidgetId'
                isDisabled={isLoading}
                itemCount={count}
                perPage={perPage}
                page={page}
                onSetPage={onSetPage}
                isCompact
                onPerPageSelect={onPerPageSelect}
              />
            </Hide>
          </FlexItem>
        </Flex>
        <Hide hide={!isLoading}>
          <Grid className={classes.mainContainer}>
            <SkeletonTable
              rows={perPage}
              columnsCount={columnHeaders.length}
              variant={TableVariant.compact}
            />
          </Grid>
        </Hide>
        <Hide hide={countIsZero || isLoading}>
          <>
            <Table
              aria-label='Content template table'
              ouiaId='content_template_table'
              variant='compact'
            >
              <Thead>
                <Tr>
                  {columnHeaders.map(({ title, width }, index) =>
                    title === 'Status' ? (
                      <Th key={title + 'column'} width={width}>
                        {title}
                      </Th>
                    ) : (
                      <Th key={title + 'column'} width={width} sort={sortParams(index)}>
                        {title}
                      </Th>
                    ),
                  )}
                  <Th className={classes.spinnerMinWidth}>
                    <Spinner size='md' className={actionTakingPlace ? '' : classes.invisible} />
                  </Th>
                </Tr>
              </Thead>
              <Tbody>
                {templateList.map(
                  (
                    {
                      uuid,
                      name,
                      description,
                      arch,
                      version,
                      date,
                      use_latest,
                      last_update_snapshot_error,
                      last_update_task,
                    }: TemplateItem,
                    index,
                  ) => (
                    <Tr key={uuid + index}>
                      <Td>
                        <Button
                          className={classes.leftPaddingZero}
                          variant='link'
                          onClick={() =>
                            navigate(`${rootPath}/${TEMPLATES_ROUTE}/${uuid}/${DETAILS_ROUTE}`)
                          }
                        >
                          {name}
                        </Button>
                      </Td>
                      <Td>{description}</Td>
                      <Td>{archesDisplay(arch)}</Td>
                      <Td>{versionDisplay([version])}</Td>
                      <Td>
                        <ConditionalTooltip
                          show={!use_latest}
                          content={formatDateUTC(date)}
                          position='top-start'
                          enableFlip
                        >
                          <p>{use_latest ? 'Use latest' : formatDateDDMMMYYYY(date)}</p>
                        </ConditionalTooltip>
                      </Td>
                      <Td>
                        <StatusIcon
                          uuid={uuid}
                          last_update_snapshot_error={last_update_snapshot_error}
                          last_update_task={last_update_task}
                        />
                      </Td>
                      <Td>
                        <ConditionalTooltip
                          content='You do not have the required permission to perform this action.'
                          show={!rbac?.templateWrite}
                          setDisabled
                        >
                          <ActionsColumn
                            items={[
                              {
                                id: 'actions-column-edit',
                                className: isMissingRequirements ? classes.disabledButton : '',
                                title: 'Edit',
                                onClick: () => navigate(`${uuid}/edit`),
                                isDisabled: isMissingRequirements,
                                tooltipProps: isMissingRequirements
                                  ? {
                                      isVisible: isMissingRequirements,
                                      content: `You do not have the required ${missingRequirements} to perform this action.`,
                                      position: TooltipPosition.left,
                                      triggerRef: () =>
                                        document.getElementById('actions-column-edit') ||
                                        document.body,
                                    }
                                  : undefined,
                              },
                              { isSeparator: true },
                              {
                                title: 'Delete',
                                onClick: () => navigate(`${uuid}/${DELETE_ROUTE}`),
                              },
                            ]}
                          />
                        </ConditionalTooltip>
                      </Td>
                    </Tr>
                  ),
                )}
              </Tbody>
            </Table>
            <Flex className={classes.bottomContainer}>
              <FlexItem />
              <FlexItem>
                <Pagination
                  id='bottom-pagination-id'
                  widgetId='bottomPaginationWidgetId'
                  itemCount={count}
                  perPage={perPage}
                  page={page}
                  onSetPage={onSetPage}
                  variant={PaginationVariant.bottom}
                  onPerPageSelect={onPerPageSelect}
                />
              </FlexItem>
            </Flex>
          </>
        </Hide>
        <Hide hide={!countIsZero || isLoading}>
          <EmptyTableState
            notFiltered={notFiltered}
            clearFilters={clearFilters}
            itemName={itemName}
            notFilteredBody={notFilteredBody}
            notFilteredButton={
              <ConditionalTooltip
                content={`You do not have the required ${missingRequirements} to perform this action.`}
                show={isMissingRequirements}
                setDisabled
              >
                <Button
                  id='createContentTemplateButton'
                  ouiaId='create_content_template'
                  variant='primary'
                  isDisabled={isLoading}
                  onClick={() => navigate('add')}
                >
                  Add template
                </Button>
              </ConditionalTooltip>
            }
          />
        </Hide>
      </Grid>
    </>
  );
};

export default TemplatesTable;
