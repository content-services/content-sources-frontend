import { Table, TableVariant, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import EmptyPackageState from '../../../Pages/ContentListTable/components/PackageModal/components/EmptyPackageState';
import { ErrataItem } from '../../../services/Content/ContentApi';
import Hide from '../../Hide/Hide';
import { Grid } from '@patternfly/react-core';
import { SkeletonTable } from '@redhat-cloud-services/frontend-components';
import { global_BackgroundColor_100 } from '@patternfly/react-tokens';
import { createUseStyles } from 'react-jss';
import useDeepCompareEffect from '../../../Hooks/useDeepCompareEffect';
import { useState } from 'react';
import { isEmpty } from 'lodash';

const useStyles = createUseStyles({
  mainContainer: {
    backgroundColor: global_BackgroundColor_100.value,
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
  },
});

interface Props {
  isFetchingOrLoading: boolean;
  isLoadingOrZeroCount: boolean;
  errataList: ErrataItem[];
  clearSearch: () => void;
  perPage: number;
}

export default function ErrataTable({
  isFetchingOrLoading,
  isLoadingOrZeroCount,
  errataList,
  clearSearch,
  perPage,
}: Props) {
  const classes = useStyles();
  const columnHeaders = ['Name', 'Synopsis', 'Type', 'Severity'];
  const [expandState, setExpandState] = useState({});

  useDeepCompareEffect(() => {
    if (!isEmpty(expandState)) setExpandState({});
  }, [errataList]);

  return (
    <>
      <Hide hide={!isFetchingOrLoading}>
        <Grid className={classes.mainContainer}>
          <SkeletonTable
            rows={perPage}
            numberOfColumns={columnHeaders.length}
            variant={TableVariant.compact}
          />
        </Grid>
      </Hide>
      <Hide hide={isFetchingOrLoading}>
        <Table aria-label='errata table' ouiaId='errata_table' variant='compact'>
          <Hide hide={isLoadingOrZeroCount}>
            <Thead>
              <Tr>
                <Th />
                {columnHeaders.map((columnHeader) => (
                  <Th key={columnHeader + '_column'}>{columnHeader}</Th>
                ))}
              </Tr>
            </Thead>
          </Hide>
          <Tbody>
            {errataList.map(
              (
                {
                  id,
                  errata_id,
                  title,
                  summary,
                  description,
                  issued_date,
                  type,
                  severity,
                  reboot_suggested,
                }: ErrataItem,
                rowIndex,
              ) => (
                <>
                  <Tr key={id + '-column'}>
                    <Td
                      expand={{
                        rowIndex,
                        isExpanded: !!expandState[rowIndex],
                        onToggle: () =>
                          setExpandState((prev) => ({ ...prev, [rowIndex]: !prev[rowIndex] })),
                        expandId: 'expandable-',
                      }}
                    />
                    <Td>{errata_id}</Td>
                    <Td>{summary}</Td>
                    <Td>{type}</Td>
                    <Td>{severity}</Td>
                  </Tr>
                  <Hide hide={!expandState[rowIndex]}>
                    {title}
                    {issued_date}
                    {description}
                    {reboot_suggested}
                  </Hide>
                </>
              ),
            )}
            <Hide hide={!isLoadingOrZeroCount}>
              <EmptyPackageState clearSearch={clearSearch} />
            </Hide>
          </Tbody>
        </Table>
      </Hide>
    </>
  );
}
