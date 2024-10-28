import {
  AlertVariant,
  Bullseye,
  Button,
  Flex,
  FlexItem,
  Grid,
  InputGroup,
  InputGroupItem,
  InputGroupText,
  Modal,
  ModalVariant,
  Pagination,
  PaginationVariant,
  Spinner,
  TextInput,
  ToggleGroup,
  ToggleGroupItem,
} from '@patternfly/react-core';
import { InnerScrollContainer } from '@patternfly/react-table';
import { global_BackgroundColor_100, global_Color_200 } from '@patternfly/react-tokens';
import { useEffect, useMemo, useState } from 'react';
import { createUseStyles } from 'react-jss';
import Hide from 'components/Hide/Hide';
import { SearchIcon, SyncAltIcon } from '@patternfly/react-icons';
import useDebounce from 'Hooks/useDebounce';
import { useNavigate, useParams } from 'react-router-dom';
import useRootPath from 'Hooks/useRootPath';
import {
  GET_SYSTEMS_KEY,
  useAddTemplateToSystemsQuery,
  useSystemsListQuery,
} from 'services/Systems/SystemsQueries';
import EmptyTableState from 'components/EmptyTableState/EmptyTableState';
import { useQueryClient } from 'react-query';
import type { TemplateItem } from 'services/Templates/TemplateApi';
import { FETCH_TEMPLATE_KEY, useFetchTemplate } from 'services/Templates/TemplateQueries';
import Loader from 'components/Loader';
import {
  DETAILS_ROUTE,
  SYSTEMS_ROUTE,
  TEMPLATES_ROUTE,
  PATCH_SYSTEMS_ROUTE,
} from 'Routes/constants';
import ModalSystemsTable from './ModalSystemsTable';
import ConditionalTooltip from 'components/ConditionalTooltip/ConditionalTooltip';
import useNotification from 'Hooks/useNotification';

const useStyles = createUseStyles({
  description: {
    paddingTop: '12px', // 4px on the title bottom padding makes this the "standard" 16 total padding
    paddingBottom: '8px',
    color: global_Color_200.value,
  },
  mainContainer: {
    backgroundColor: global_BackgroundColor_100.value,
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
  },
  topContainer: {
    justifyContent: 'space-between',
    padding: '16px 24px',
    height: 'fit-content',
  },
  bottomContainer: {
    justifyContent: 'space-between',
    minHeight: '68px',
  },
  leftMargin: {
    marginLeft: '1rem',
    '& .pf-v5-c-toggle-group__text': {
      textWrap: 'nowrap',
    },
  },
  refreshSystemsList: {
    paddingTop: '0',
    paddingBottom: '0',
  },
});

const perPageKey = 'templatesPerPage';

export default function AddSystemModal() {
  const queryClient = useQueryClient();
  const classes = useStyles();
  const { templateUUID: uuid = '' } = useParams();
  const rootPath = useRootPath();
  const navigate = useNavigate();
  const storedPerPage = Number(localStorage.getItem(perPageKey)) || 20;
  const [page, setPage] = useState(1);
  const [toggled, setToggled] = useState(false);
  const [perPage, setPerPage] = useState(storedPerPage);
  const [searchQuery, setSearchQuery] = useState('');
  const [selected, setSelected] = useState<string[]>([]);
  const selectedList = useMemo(() => new Set(selected), [selected]);
  const { notify } = useNotification();
  const [pollCount, setPollCount] = useState(0);
  const [polling, setPolling] = useState(false);

  useEffect(() => {
    if (!selectedList.size) {
      setToggled(false);
    }
  }, [selectedList]);

  const debouncedSearchQuery = useDebounce(searchQuery, !searchQuery ? 0 : 500);

  const debouncedSelected = useDebounce(selected, !selected.length ? 0 : 500);

  const { version, name, arch } = queryClient.getQueryData<TemplateItem>([
    FETCH_TEMPLATE_KEY,
    uuid,
  ])!;

  useEffect(() => {
    setPage(1);
  }, [debouncedSearchQuery]);

  const {
    isLoading,
    isFetching,
    isError,
    data = { data: [], meta: { total_items: 0, limit: 20, offset: 0 } },
  } = useSystemsListQuery(page, perPage, debouncedSearchQuery, {
    os: version,
    arch: arch,
    ids: toggled ? debouncedSelected : undefined,
  });

  const {
    data: systemsList = [],
    meta: { total_items = 0 },
  } = data;

  const allSelected = useMemo(
    () =>
      systemsList.every(
        ({ id, attributes: { template_uuid } }) => selectedList.has(id) || template_uuid === uuid,
      ),
    [selectedList, systemsList],
  );

  const { mutateAsync: addSystems, isLoading: isAdding } = useAddTemplateToSystemsQuery(
    queryClient,
    uuid,
    selected,
  );

  useEffect(() => {
    if (isError) {
      onClose();
    }
  }, [isError]);

  const { data: template } = useFetchTemplate(uuid as string, true, polling);

  const templatePending = useMemo(
    () =>
      template?.last_update_task?.status === 'running' ||
      template?.last_update_task?.status === 'pending',
    [template?.last_update_task],
  );

  useEffect(() => {
    if (isError) {
      setPolling(false);
      setPollCount(0);
      return;
    }

    if (polling && templatePending) {
      setPollCount(pollCount + 1);
    }
    if (polling && !templatePending) {
      setPollCount(0);
    }
    if (pollCount > 40) {
      return setPolling(false);
    }
    return setPolling(templatePending);
  }, [templatePending, isError]);

  useEffect(() => {
    if (
      (template?.rhsm_environment_created === false &&
        template?.last_update_task?.status === 'failed') ||
      (template?.rhsm_environment_created === false &&
        template?.last_update_task?.status === 'completed')
    ) {
      notify({
        title: 'Environment not created for template',
        description:
          'An error occurred when creating the environment. Cannot assign this template to a system.',
        variant: AlertVariant.danger,
        id: 'rhsm-environment-error',
        dismissable: true,
      });
    }
  }, [template?.last_update_task]);

  const onSetPage = (_, newPage) => setPage(newPage);

  const onPerPageSelect = (_, newPerPage, newPage) => {
    // Save this value through page refresh for use on next reload
    setPerPage(newPerPage);
    setPage(newPage);
    localStorage.setItem(perPageKey, newPerPage.toString());
  };

  const onClose = () =>
    navigate(`${rootPath}/${TEMPLATES_ROUTE}/${uuid}/${DETAILS_ROUTE}/${SYSTEMS_ROUTE}`);

  const handleSelectItem = (id: string) => {
    if (selectedList.has(id)) {
      const newItems = selected.filter((listId) => listId !== id);

      setSelected([...newItems]);

      if (newItems.length % perPage === 0 && page > 1) {
        setPage((prev) => prev - 1);
      }
    } else {
      setSelected((prev) => [...prev, id]);
    }
  };

  const selectAllToggle = () => {
    if (allSelected) {
      const systemsListSet = new Set(systemsList.map(({ id }) => id));
      setSelected([...selected.filter((id) => !systemsListSet.has(id))]);
    } else {
      setSelected((prev) => [
        ...new Set([
          ...prev,
          ...systemsList
            .filter(({ attributes: { template_uuid } }) => template_uuid !== uuid)
            .map(({ id }) => id),
        ]),
      ]);
    }
  };

  const fetchingOrLoading = isFetching || isLoading;

  const loadingOrZeroCount = fetchingOrLoading || !total_items;

  return (
    <Modal
      key={uuid}
      position='top'
      hasNoBodyWrapper
      aria-label='system modal'
      ouiaId='system_modal'
      ouiaSafe={fetchingOrLoading}
      variant={ModalVariant.medium}
      title='Assign template to systems'
      description={
        <p className={classes.description}>
          Choose the systems to apply <b>{name}</b> template to now. Be aware that assigning a
          template to a system with an existing template will overwrite the previous one. The
          available systems are filtered by the template&apos;s content definition.
          <Button
            id='refreshSystemsList'
            ouiaId='refresh_systems_list'
            variant='link'
            className={classes.refreshSystemsList}
            icon={isFetching ? <Spinner isInline /> : <SyncAltIcon />}
            isDisabled={isLoading || isFetching}
            onClick={() => queryClient.invalidateQueries(GET_SYSTEMS_KEY)}
          >
            Refresh systems list
          </Button>
        </p>
      }
      isOpen
      onClose={onClose}
      footer={
        <>
          <Flex gap={{ default: 'gapMd' }}>
            <ConditionalTooltip
              content='Cannot assign this template to a system yet.'
              show={!template?.rhsm_environment_created}
              setDisabled
            >
              <Button
                isLoading={isAdding}
                isDisabled={
                  isAdding ||
                  !selected.length ||
                  (!template?.rhsm_environment_created &&
                    template?.last_update_task?.status !== 'completed')
                }
                key='add_system'
                variant='primary'
                onClick={() => addSystems().then(onClose)}
              >
                Assign
              </Button>
            </ConditionalTooltip>
            <Button key='close' variant='secondary' onClick={onClose}>
              Close
            </Button>
          </Flex>
        </>
      }
    >
      <InnerScrollContainer>
        <Grid className={classes.mainContainer}>
          <InputGroup className={classes.topContainer}>
            <InputGroupItem>
              <TextInput
                id='search'
                ouiaId='name_search'
                placeholder='Filter by name'
                value={searchQuery}
                onChange={(_event, value) => setSearchQuery(value)}
              />
              <InputGroupText id='search-icon'>
                <SearchIcon />
              </InputGroupText>

              <Hide hide={!total_items}>
                <FlexItem className={classes.leftMargin}>
                  <ToggleGroup aria-label='Default with single selectable'>
                    <ToggleGroupItem
                      text='All'
                      buttonId='custom-repositories-toggle-button'
                      data-ouia-component-id='all-selected-repositories-toggle'
                      isSelected={!toggled}
                      onChange={() => setToggled(false)}
                    />
                    <ToggleGroupItem
                      text={`Selected (${selected.length})`}
                      buttonId='custom-repositories-selected-toggle-button'
                      data-ouia-component-id='custom-selected-repositories-toggle'
                      isSelected={toggled}
                      isDisabled={!selected.length}
                      onChange={() => {
                        setToggled(true);
                        setPage(1);
                      }}
                    />
                  </ToggleGroup>
                </FlexItem>
              </Hide>
            </InputGroupItem>
            <Hide hide={isLoading}>
              <Pagination
                id='top-pagination-id'
                widgetId='topPaginationWidgetId'
                itemCount={total_items}
                perPage={perPage}
                page={page}
                onSetPage={onSetPage}
                isCompact
                onPerPageSelect={onPerPageSelect}
              />
            </Hide>
          </InputGroup>
          <Hide hide={!!total_items || fetchingOrLoading}>
            <Bullseye data-ouia-component-id='systems_list_page'>
              <EmptyTableState
                notFiltered={!searchQuery}
                clearFilters={() => setSearchQuery('')}
                itemName='relevant systems'
                notFilteredBody='It appears as though you have no systems registered for the associated OS.'
                notFilteredButton={
                  <Button
                    id='goToPatchSystemsButton'
                    ouiaId='go_to_patch_systems'
                    variant='primary'
                    isDisabled={isLoading}
                    onClick={() =>
                      navigate(`${rootPath.replace('content', '')}${PATCH_SYSTEMS_ROUTE}`)
                    }
                  >
                    Register a RHEL {version} system
                  </Button>
                }
              />
            </Bullseye>
          </Hide>
          <Hide hide={isLoading}>
            <ModalSystemsTable
              perPage={perPage}
              isFetchingOrLoading={fetchingOrLoading}
              isLoadingOrZeroCount={loadingOrZeroCount}
              systemsList={systemsList}
              selected={selectedList}
              setSelected={(id) => handleSelectItem(id)}
              selectAllToggle={selectAllToggle}
              allSelected={allSelected}
            />
          </Hide>
          <Hide hide={!isLoading}>
            <Loader />
          </Hide>
          <Flex className={classes.bottomContainer}>
            <FlexItem />
            <FlexItem>
              <Hide hide={isLoading}>
                <Pagination
                  id='bottom-pagination-id'
                  widgetId='bottomPaginationWidgetId'
                  itemCount={total_items}
                  perPage={perPage}
                  page={page}
                  onSetPage={onSetPage}
                  variant={PaginationVariant.bottom}
                  onPerPageSelect={onPerPageSelect}
                />
              </Hide>
            </FlexItem>
          </Flex>
        </Grid>
      </InnerScrollContainer>
    </Modal>
  );
}
