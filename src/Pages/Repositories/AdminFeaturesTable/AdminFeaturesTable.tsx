import { Button, Flex, Form, FormGroup, InputGroup, TextInput } from '@patternfly/react-core';
import { Table, TableVariant, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import { useEffect, useMemo, useState } from 'react';
import { SkeletonTable } from '@patternfly/react-component-groups';
import Hide from 'components/Hide/Hide';
import EmptyTableState from 'components/EmptyTableState/EmptyTableState';
import { useNavigate } from 'react-router-dom';
import DropdownSelect from 'components/DropdownSelect/DropdownSelect';
import useDebounce from 'Hooks/useDebounce';
import useRootPath from 'Hooks/useRootPath';
import { ADMIN_TASKS_ROUTE, REPOSITORIES_ROUTE } from 'Routes/constants';
import { useAdminFeatureListQuery, useFetchAdminFeatureQuery } from 'services/Admin/AdminQueries';
import type { AdminFeature } from 'services/Admin/AdminApi';
import { createUseStyles } from 'react-jss';
import { CopyIcon } from '@patternfly/react-icons';
import JsonView from 'react18-json-view';

const useStyles = createUseStyles({
  '@keyframes flashAnimation': {
    '0%': {
      backgroundColor: 'initial',
    },
    '50%': {
      backgroundColor: '#004080',
    },
    '100%': {
      backgroundColor: 'initial',
    },
  },
  filterContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignContent: 'center',
    '& button,& button::after': {
      borderRadius: 0,
      margin: 'fit-content',
    },
  },
  checkboxMinWidth: {
    minWidth: '45px!important',
  },
  copyButton: {
    transition: 'all 0.1s ease-in-out',
    '&:active': {
      animationName: '$flashAnimation',
      animationDuration: '0.1s',
    },
  },
  featureFilter: { '& .pf-m-inline ': { flexFlow: 'nowrap' } },
});

const AdminFeaturesTable = () => {
  const classes = useStyles();
  const navigate = useNavigate();
  const rootPath = useRootPath();
  const storedFeature = sessionStorage.getItem('feature');
  const [feature, setFeature] = useState<string | undefined>(storedFeature || '');
  const [filterType, setFilterType] = useState<string | undefined>();
  const [search, setSearch] = useState<string | undefined>();
  const [isJsonView, setJsonView] = useState<boolean>(false);
  const [checkedFeatures, setCheckedFeatures] = useState<Set<string>>(new Set<string>());

  const debouncedSearch = useDebounce(search);

  useEffect(() => {
    if (feature) sessionStorage.setItem('feature', feature);
    checkedFeatures.clear();
    setCheckedFeatures(new Set(checkedFeatures));
  }, [feature]);

  const onClose = () => navigate(`${rootPath}/${REPOSITORIES_ROUTE}/${ADMIN_TASKS_ROUTE}`);

  const { isLoading, isFetching, data, isError } = useAdminFeatureListQuery();

  const {
    isLoading: featureDataIsLoading,
    isFetching: featureDataIsFetching,
    data: featureData,
    // isError: featureDataIsError,
  } = useFetchAdminFeatureQuery(feature, !!feature);

  useEffect(() => {
    if (isError) {
      onClose();
    }
  }, [isError]);

  const capitalizeFirst = (val?: string) =>
    val ? String(val).charAt(0).toUpperCase() + String(val).slice(1) : '';

  const subsetList = useMemo(() => {
    const first = featureData?.[0];
    if (first) {
      const keys = Object.keys(first).filter((key) => typeof first[key] === 'string');
      if (keys[0]) setFilterType(keys[0]);
      return keys;
    }
    return [];
  }, [featureData]);

  const featureDataFiltered = useMemo(() => {
    if (!featureData || !filterType || !debouncedSearch) return featureData;
    return featureData.filter((item) => item[filterType].toLowerCase().includes(debouncedSearch));
  }, [featureData, filterType, debouncedSearch]);

  const areAllFeaturesSelected = useMemo(
    () => featureDataFiltered?.every(({ name, url }) => checkedFeatures.has(name + url)) || false,
    [data, checkedFeatures, featureDataFiltered],
  );

  const onSelectRepo = (key: string, value: boolean) => {
    if (value) {
      checkedFeatures.add(key);
    } else {
      checkedFeatures.delete(key);
    }
    setCheckedFeatures(new Set(checkedFeatures));
  };

  const selectAllFeatures = () => {
    if (areAllFeaturesSelected) {
      checkedFeatures.clear();
    } else {
      featureDataFiltered?.forEach(({ name, url }) => {
        checkedFeatures.add(name + url);
      });
    }
    setCheckedFeatures(new Set(checkedFeatures));
  };

  const countIsZero = featureDataFiltered?.length === 0 || !featureData;

  const actionTakingPlace =
    isLoading || isFetching || featureDataIsLoading || featureDataIsFetching;

  const hideTable = !!(
    actionTakingPlace ||
    countIsZero ||
    isLoading ||
    !featureData ||
    !feature ||
    (countIsZero && !!debouncedSearch)
  );

  const showTableLoader = !!feature && hideTable && actionTakingPlace;

  return (
    <Flex
      direction={{ default: 'column' }}
      justifyContent={{ default: 'justifyContentCenter' }}
      flex={{ default: 'flex_1' }}
      gap={{ default: 'gap' }}
    >
      <Form onSubmit={(e) => e.preventDefault()}>
        <InputGroup className={classes.filterContainer}>
          <FormGroup label='Feature' isRequired fieldId='feature'>
            <DropdownSelect
              onSelect={(_, val) => {
                setFeature(val as string);
              }}
              selected={feature}
              menuToggleProps={{
                'aria-label': 'feature select',
                id: 'featureSelection',
              }}
              menuValue={feature}
              dropDownItems={
                data?.features.map((value) => ({
                  value,
                  isSelected: value === feature,
                  children: value,
                })) || []
              }
            />
          </FormGroup>
          <Hide hide={!featureData}>
            <FormGroup label='Filter' fieldId='filter' isInline className={classes.featureFilter}>
              <DropdownSelect
                onSelect={(_, val) => {
                  setFilterType(val as string);
                }}
                selected={filterType}
                menuToggleProps={{
                  'aria-label': 'filterType select',
                  id: 'filterTypeSelection',
                }}
                menuValue={capitalizeFirst(filterType)}
                dropDownItems={
                  subsetList.map((value) => ({
                    value,
                    isSelected: value === filterType,
                    children: capitalizeFirst(value),
                  })) || []
                }
              />
              <TextInput
                id='search'
                type='search'
                value={search}
                onChange={(_, val) => {
                  setSearch(val.toLowerCase());
                }}
              />
            </FormGroup>
            <FormGroup label='View' fieldId='view'>
              <Button
                isInline
                isActive={isJsonView}
                onClick={() => setJsonView(true)}
                variant={isJsonView ? 'primary' : 'secondary'}
              >
                Json
              </Button>
              <Button
                isInline
                isActive={!isJsonView}
                onClick={() => setJsonView(false)}
                variant={!isJsonView ? 'primary' : 'secondary'}
              >
                Table
              </Button>
            </FormGroup>
            <FormGroup label='Copy' fieldId='copy'>
              <Button
                className={classes.copyButton}
                isDisabled={!checkedFeatures.size}
                icon={<CopyIcon />}
                iconPosition='right'
                isInline
                variant='secondary'
                onClick={() => {
                  navigator.clipboard.writeText(
                    JSON.stringify(
                      featureData
                        ?.filter(({ name, url }) => checkedFeatures.has(name + url))
                        .map((item) => item.red_hat_repo_structure),
                    ),
                  );
                }}
              >
                {checkedFeatures.size
                  ? `${checkedFeatures.size} items selected to copy`
                  : 'Check items below to copy'}
              </Button>
            </FormGroup>
          </Hide>
        </InputGroup>
      </Form>
      <Hide hide={!showTableLoader}>
        <SkeletonTable rows={5} columnsCount={2} variant={TableVariant.compact} />
      </Hide>
      <Hide hide={hideTable}>
        <>
          <Hide hide={!isJsonView}>
            <JsonView
              src={featureData
                ?.filter(({ name, url }) => checkedFeatures.has(name + url))
                .map((item) => item.red_hat_repo_structure)}
            />
          </Hide>
          <Hide hide={isJsonView}>
            <Table
              aria-label='Admin features table'
              ouiaId='admin_features_table'
              variant='compact'
            >
              <Thead>
                <Tr>
                  <Th
                    dataLabel='select-feature-checkbox'
                    aria-label='select-feature-checkbox'
                    className={classes.checkboxMinWidth}
                    select={{
                      onSelect: selectAllFeatures,
                      isSelected: areAllFeaturesSelected,
                    }}
                  />
                  {['Name', 'Url'].map((columnHeader) => (
                    <Th key={columnHeader + 'column'}>{columnHeader}</Th>
                  ))}
                </Tr>
              </Thead>
              <Tbody>
                {featureDataFiltered?.map(({ name, url }: AdminFeature, index) => (
                  <Tr isExpanded key={name + url}>
                    <Td
                      select={{
                        rowIndex: index,
                        onSelect: (_event, isSelecting) => onSelectRepo(name + url, isSelecting),
                        isSelected: checkedFeatures.has(name + url),
                      }}
                    />
                    <Td>{name}</Td>
                    <Td>{url}</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Hide>
        </>
      </Hide>
      <Hide hide={!feature || !countIsZero || showTableLoader}>
        <EmptyTableState
          notFiltered={!debouncedSearch}
          clearFilters={() => setSearch('')}
          itemName={!debouncedSearch ? 'features found.' : 'features'}
          notFilteredBody='No data was found for this feature.'
        />
      </Hide>
    </Flex>
  );
};

export default AdminFeaturesTable;
