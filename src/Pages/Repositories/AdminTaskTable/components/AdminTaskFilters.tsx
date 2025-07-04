import { useEffect, useMemo, useState } from 'react';
import {
  Label,
  LabelGroup,
  Button,
  Flex,
  FlexItem,
  MenuToggle,
  TextInput,
  Dropdown,
  DropdownItem,
  DropdownList,
} from '@patternfly/react-core';

import { FilterIcon, SearchIcon } from '@patternfly/react-icons';
import Hide from 'components/Hide/Hide';
import useDebounce from 'Hooks/useDebounce';
import { createUseStyles } from 'react-jss';
import { AdminTaskFilterData } from 'services/Admin/AdminTaskApi';

interface Props {
  isLoading?: boolean;
  setFilterData: (filterData: AdminTaskFilterData) => void;
  filterData: AdminTaskFilterData;
}

const useStyles = createUseStyles({
  chipsContainer: {
    paddingTop: '16px',
  },
  clearFilters: {
    marginLeft: '16px',
  },
  filter: {
    width: 'auto',
    maxWidth: 'unset',
  },
  filterDropdown: {
    width: 'fit-content',
  },
});

const statusValues = ['Running', 'Failed', 'Completed', 'Canceled', 'Pending'];

const typeValues = [
  'snapshot',
  'delete-repository-snapshots',
  'delete-snapshots',
  'introspect',
  'delete-templates',
  'update-template-content',
  'update-repository',
  'add-uploads-repository',
  'update-latest-snapshot',
];

const filters = ['Account ID', 'Org ID', 'Status', 'Type'];

export type AdminTaskFilters = 'Account ID' | 'Org ID' | 'Status' | 'Type';

const AdminTaskFilters = ({ isLoading, setFilterData, filterData }: Props) => {
  const classes = useStyles();
  const [filterType, setFilterType] = useState<AdminTaskFilters>('Account ID');
  const [accountId, setAccountId] = useState('');
  const [typeFilterOpen, setTypeFilterOpen] = useState(false);
  const [isActionOpen, setActionOpen] = useState(false);
  const [orgId, setOrgId] = useState('');
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [selectedTypenames, setSelectedTypenames] = useState<string[]>([]);

  const clearFilters = () => {
    setAccountId('');
    setOrgId('');
    setSelectedStatuses([]);
    setSelectedTypenames([]);
    setFilterData({ accountId: '', orgId: '', statuses: [], typenames: [] });
  };

  const deleteItem = (id: string, chips, setChips) => {
    const copyOfChips = [...chips];
    const filteredCopy = copyOfChips.filter((chip) => chip !== id);
    setChips(filteredCopy);
  };

  useEffect(() => {
    // If the filters get cleared at the top level, sense that and clear them here.
    if (
      filterData.accountId === '' &&
      filterData.orgId === '' &&
      filterData.statuses.length === 0 &&
      (accountId !== '' || orgId !== '' || selectedStatuses.length !== 0)
    ) {
      clearFilters();
    }
  }, [filterData]);

  const {
    accountId: debouncedAccountId,
    orgId: debouncedOrgId,
    selectedStatuses: debouncedSelectedStatuses,
    selectedTypenames: debouncedSelectedTypenames,
  } = useDebounce({
    accountId,
    orgId,
    selectedStatuses,
    selectedTypenames,
  });

  useEffect(() => {
    setFilterData({
      accountId: debouncedAccountId,
      orgId: debouncedOrgId,
      statuses: debouncedSelectedStatuses,
      typenames: debouncedSelectedTypenames,
    });
  }, [debouncedAccountId, debouncedOrgId, debouncedSelectedStatuses, debouncedSelectedTypenames]);

  const Filter = useMemo(() => {
    switch (filterType) {
      case 'Account ID':
        return (
          <TextInput
            type='search'
            customIcon={<SearchIcon />}
            className={classes.filter}
            isDisabled={isLoading}
            id='account-id'
            ouiaId='filter_account_id'
            placeholder='Filter by account ID'
            value={accountId}
            onChange={(_event, value) => setAccountId(value)}
          />
        );
      case 'Org ID':
        return (
          <TextInput
            isDisabled={isLoading}
            id='org-id'
            className={classes.filter}
            type='search'
            customIcon={<SearchIcon />}
            ouiaId='filter_org_id'
            placeholder='Filter by org ID'
            value={orgId}
            onChange={(_event, value) => setOrgId(value)}
          />
        );
      case 'Status':
        return (
          <Dropdown
            onSelect={(_, val) =>
              setSelectedStatuses((prev) =>
                selectedStatuses.includes(val as string)
                  ? prev.filter((item) => item !== (val as string))
                  : [...prev, val as string],
              )
            }
            toggle={(toggleRef) => (
              <MenuToggle
                ref={toggleRef}
                className={classes.filter}
                aria-label='filter status'
                id='statusSelect'
                ouiaId='filter_status'
                onClick={() => setActionOpen((prev) => !prev)}
                isDisabled={isLoading}
                isExpanded={isActionOpen}
              >
                Filter by status
              </MenuToggle>
            )}
            onOpenChange={(isOpen) => setActionOpen(isOpen)}
            isOpen={isActionOpen}
          >
            <DropdownList>
              {statusValues.map((status) => (
                <DropdownItem
                  key={status}
                  hasCheckbox
                  value={status}
                  isSelected={selectedStatuses.includes(status)}
                  component='button'
                  data-ouia-component-id={`filter_${status}`}
                >
                  {status}
                </DropdownItem>
              ))}
            </DropdownList>
          </Dropdown>
        );
      case 'Type':
        return (
          <Dropdown
            onSelect={(_, val) =>
              setSelectedTypenames((prev) =>
                selectedTypenames.includes(val as string)
                  ? prev.filter((item) => item !== (val as string))
                  : [...prev, val as string],
              )
            }
            toggle={(toggleRef) => (
              <MenuToggle
                ref={toggleRef}
                className={classes.filter}
                aria-label='filter type'
                id='typeSelect'
                ouiaId='filter_type'
                onClick={() => setActionOpen((prev) => !prev)}
                isDisabled={isLoading}
                isExpanded={isActionOpen}
              >
                Filter by type
              </MenuToggle>
            )}
            onOpenChange={(isOpen) => setActionOpen(isOpen)}
            isOpen={isActionOpen}
          >
            <DropdownList>
              {typeValues.map((type) => (
                <DropdownItem
                  key={type}
                  hasCheckbox
                  value={type}
                  isSelected={selectedTypenames.includes(type)}
                  component='button'
                  data-ouia-component-id={`filter_${type}`}
                >
                  {type}
                </DropdownItem>
              ))}
            </DropdownList>
          </Dropdown>
        );
      default:
        return <></>;
    }
  }, [filterType, isLoading, accountId, orgId, selectedStatuses, selectedTypenames, isActionOpen]);

  return (
    <Flex direction={{ default: 'column' }}>
      <Flex
        direction={{ default: 'row' }}
        gap={{ default: 'gap' }}
        flexWrap={{ default: 'nowrap' }}
        alignItems={{ default: 'alignItemsCenter' }}
      >
        <Dropdown
          onSelect={(_, val) => {
            setFilterType(val as AdminTaskFilters);
            setTypeFilterOpen(false);
          }}
          toggle={(toggleRef) => (
            <MenuToggle
              icon={<FilterIcon />}
              ref={toggleRef}
              className={classes.filter}
              aria-label='filterSelectionDropdown'
              id='filterSelectionDropdown'
              ouiaId='filter_type'
              onClick={() => setTypeFilterOpen((prev) => !prev)}
              isDisabled={isLoading}
              isExpanded={typeFilterOpen}
            >
              {filterType}
            </MenuToggle>
          )}
          onOpenChange={(isOpen) => setTypeFilterOpen(isOpen)}
          isOpen={typeFilterOpen}
          ouiaId='filter_type'
        >
          <DropdownList>
            {filters.map((filter) => (
              <DropdownItem
                key={filter}
                value={filter}
                isSelected={filterType === filter}
                component='button'
                data-ouia-component-id={`filter_${filter}`}
              >
                {filter}
              </DropdownItem>
            ))}
          </DropdownList>
        </Dropdown>
        <FlexItem className={classes.filterDropdown}>{Filter}</FlexItem>
      </Flex>
      <Hide
        hide={
          !(accountId !== '' || orgId !== '' || selectedStatuses.length || selectedTypenames.length)
        }
      >
        <FlexItem className={classes.chipsContainer}>
          <LabelGroup categoryName='Type'>
            {selectedTypenames.map((type) => (
              <Label
                variant='outline'
                key={type}
                onClose={() => deleteItem(type, selectedTypenames, setSelectedTypenames)}
              >
                {type}
              </Label>
            ))}
          </LabelGroup>
          <LabelGroup categoryName='Status'>
            {selectedStatuses.map((status) => (
              <Label
                variant='outline'
                key={status}
                onClose={() => deleteItem(status, selectedStatuses, setSelectedStatuses)}
              >
                {status}
              </Label>
            ))}
          </LabelGroup>
          {orgId !== '' && (
            <LabelGroup categoryName='Org ID'>
              <Label variant='outline' key='org_id_chip' onClose={() => setOrgId('')}>
                {orgId}
              </Label>
            </LabelGroup>
          )}
          {accountId !== '' && (
            <LabelGroup categoryName='Account ID'>
              <Label variant='outline' key='account_id_chip' onClose={() => setAccountId('')}>
                {accountId}
              </Label>
            </LabelGroup>
          )}
          {((debouncedAccountId !== '' && accountId !== '') ||
            (debouncedOrgId !== '' && orgId !== '') ||
            !!selectedTypenames?.length ||
            !!selectedStatuses?.length) && (
            <Button className={classes.clearFilters} onClick={clearFilters} variant='link' isInline>
              Clear filters
            </Button>
          )}
        </FlexItem>
      </Hide>
    </Flex>
  );
};

export default AdminTaskFilters;
