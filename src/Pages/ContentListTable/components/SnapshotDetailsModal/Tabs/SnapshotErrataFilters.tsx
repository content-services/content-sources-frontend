import { useEffect, useMemo, useState } from 'react';
import {
  Button,
  Chip,
  ChipGroup,
  Flex,
  FlexItem,
  InputGroup,
  TextInput,
  InputGroupItem,
  InputGroupText,
} from '@patternfly/react-core';
import { SelectVariant } from '@patternfly/react-core/deprecated';

import { FilterIcon, SearchIcon } from '@patternfly/react-icons';
import { global_BackgroundColor_100 } from '@patternfly/react-tokens';

import { createUseStyles } from 'react-jss';
import useDebounce from '../../../../../Hooks/useDebounce';
import DropdownSelect from '../../../../../components/DropdownSelect/DropdownSelect';
import Hide from '../../../../../components/Hide/Hide';

const useStyles = createUseStyles({
  chipsContainer: {
    backgroundColor: global_BackgroundColor_100.value,
    paddingTop: '16px',
  },
  clearFilters: {
    marginLeft: '16px',
  },
});

interface Props {
  isLoading?: boolean;
  setFilterData: (filterData: { search: string; type: string; severity: string }) => void;
  filterData: { search: string; type: string; severity: string };
}

export type Filters = 'Name/Synopsis' | 'Type' | 'Severity';

export default function SnapshotErrataFilters({ isLoading, setFilterData, filterData }: Props) {
  const classes = useStyles();
  const filters = ['Name/Synopsis', 'Type', 'Severity'];
  const [filterType, setFilterType] = useState<Filters>('Name/Synopsis');
  const [search, setSearch] = useState('');
  const [type, setType] = useState('');
  const [severity, setSeverity] = useState('');

  const clearFilters = () => {
    setSearch('');
    setType('');
    setSeverity('');
  };

  useEffect(() => {
    // If the filters get cleared at the top level, sense that and clear them here.
    if (!filterData.search && !filterData.type && !filterData.severity) {
      clearFilters();
    }
  }, [filterData]);

  const {
    search: debouncedSearch,
    type: debouncedType,
    severity: debouncedSeverity,
  } = useDebounce(
    {
      search,
      type,
      severity,
    },
    !search && !type && !severity ? 0 : 500,
  );

  useEffect(() => {
    setFilterData({
      search: debouncedSearch,
      type: debouncedType,
      severity: debouncedSeverity,
    });
  }, [debouncedSearch, debouncedType, debouncedSeverity]);

  const Filter = useMemo(() => {
    switch (filterType) {
      case 'Name/Synopsis':
        return (
          <InputGroupItem isFill>
            <TextInput
              isDisabled={isLoading}
              id='search'
              ouiaId='filter_search'
              placeholder='Filter by Name/Synopsis'
              value={search}
              onChange={(_event, value) => setSearch(value)}
            />
            <InputGroupText isDisabled={isLoading} id='search-icon'>
              <SearchIcon />
            </InputGroupText>
          </InputGroupItem>
        );
      case 'Type':
        return (
          <DropdownSelect
            toggleAriaLabel='filter by type'
            toggleId='typeSelect'
            ouiaId='filter_by_type'
            isDisabled={isLoading}
            options={['All', 'bugfix']}
            variant={SelectVariant.single}
            selectedProp={type}
            setSelected={setType}
            placeholderText='Filter by type'
          />
        );
      case 'Severity':
        return (
          <DropdownSelect
            toggleAriaLabel='filter by severity'
            toggleId='severitySelect'
            ouiaId='filter_by_severity'
            isDisabled={isLoading}
            options={['All', 'bugfix']}
            variant={SelectVariant.single}
            selectedProp={severity}
            setSelected={setSeverity}
            placeholderText='Filter by severity'
          />
        );

      default:
        return <></>;
    }
  }, [filterType, isLoading, search, type, severity]);

  return (
    <Flex direction={{ default: 'column' }}>
      <FlexItem>
        <InputGroup>
          <InputGroupItem>
            <FlexItem>
              <DropdownSelect
                toggleId='filterSelectionDropdown'
                ouiaId='filter_type'
                isDisabled={isLoading}
                options={filters}
                variant={SelectVariant.single}
                selectedProp={filterType}
                setSelected={setFilterType}
                placeholderText='filter'
                toggleIcon={<FilterIcon />}
              />
            </FlexItem>
          </InputGroupItem>
          <InputGroupItem>
            <FlexItem>{Filter}</FlexItem>
          </InputGroupItem>
        </InputGroup>
      </FlexItem>
      <Hide hide={!(search !== '' || type !== '' || severity !== '')}>
        <FlexItem className={classes.chipsContainer}>
          {search !== '' && (
            <ChipGroup categoryName='Name/Synopsis'>
              <Chip key='search_chip' onClick={() => setSearch('')}>
                {search}
              </Chip>
            </ChipGroup>
          )}
          {type !== '' && (
            <ChipGroup categoryName='Type'>
              <Chip key='type_chip' onClick={() => setType('')}>
                {type}
              </Chip>
            </ChipGroup>
          )}
          {severity !== '' && (
            <ChipGroup categoryName='Severity'>
              <Chip key='severity_chip' onClick={() => setSeverity('')}>
                {severity}
              </Chip>
            </ChipGroup>
          )}
          {(debouncedSearch !== '' && search !== '') || type !== '' || severity !== '' ? (
            <Button className={classes.clearFilters} onClick={clearFilters} variant='link' isInline>
              Clear filters
            </Button>
          ) : (
            ''
          )}
        </FlexItem>
      </Hide>
    </Flex>
  );
}
