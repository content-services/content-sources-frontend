import { Table, TableVariant, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import EmptyPackageState from '../../../Pages/ContentListTable/components/PackageModal/components/EmptyPackageState';
import { ErrataItem } from '../../../services/Content/ContentApi';
import Hide from '../../Hide/Hide';
import { Grid } from '@patternfly/react-core';
import { SkeletonTable } from '@redhat-cloud-services/frontend-components';
import { global_BackgroundColor_100 } from '@patternfly/react-tokens';
import { createUseStyles } from 'react-jss';

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
  const columnHeaders = ['Name', 'Version', 'Release', 'Arch'];

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
                {columnHeaders.map((columnHeader) => (
                  <Th key={columnHeader + '_column'}>{columnHeader}</Th>
                ))}
              </Tr>
            </Thead>
          </Hide>
          <Tbody>
            {errataList.map(
              ({
                id,
                errata_id,
                title,

                type,
                severity,
                //   reboot_suggested,
              }: ErrataItem) => (
                <Tr key={id}>
                  <Td>{errata_id}</Td>
                  <Td>{title}</Td>
                  <Td>{severity}</Td>
                  <Td>{type}</Td>
                </Tr>
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
