import {
  BaseCellProps,
  ExpandableRowContent,
  Table,
  TableVariant,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from '@patternfly/react-table';
import EmptyPackageState from '../../../Pages/ContentListTable/components/PackageModal/components/EmptyPackageState';
import { ErrataItem } from '../../../services/Content/ContentApi';
import Hide from '../../Hide/Hide';
import { Flex, FlexItem, Grid, Stack, Text } from '@patternfly/react-core';
import { SkeletonTable } from '@patternfly/react-component-groups';
import {
  global_BackgroundColor_100,
  global_danger_color_200,
  global_success_color_200,
} from '@patternfly/react-tokens';
import { createUseStyles } from 'react-jss';
import useDeepCompareEffect from '../../../Hooks/useDeepCompareEffect';
import { useState } from 'react';
import { capitalize, isEmpty } from 'lodash';
import { OffIcon, OnIcon } from '@patternfly/react-icons';
import { formatDateDDMMMYYYY, reduceStringToCharsWithEllipsis } from '../../../helpers';
import ErrataType from '../../ErrataType/ErrataType';

const red = global_danger_color_200.value;
const green = global_success_color_200.value;

const useStyles = createUseStyles({
  mainContainer: {
    backgroundColor: global_BackgroundColor_100.value,
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
  },
  expansionBox: {
    padding: '16px 0',
  },
  rightMargin: { marginRight: '8px' },
  red: { extend: 'rightMargin', color: red },
  green: { extend: 'rightMargin', color: green },
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
  const columnHeaders = [
    { name: 'Name' },
    { name: 'Synopsis' },
    { name: 'Type', width: 15 },
    { name: 'Severity', width: 10 },
  ];
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
                {columnHeaders.map(({ name, width }) => (
                  <Th width={width as BaseCellProps['width']} key={name + '_column'}>
                    {name}
                  </Th>
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
                  //   title,
                  summary,
                  description,
                  issued_date,
                  updated_date,
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
                    <Td>{reduceStringToCharsWithEllipsis(summary, 70)}</Td>
                    <Td>
                      <div>
                        <ErrataType type={type} iconProps={{ className: classes.rightMargin }} />
                        {capitalize(type)}
                      </div>
                    </Td>
                    <Td>{severity}</Td>
                  </Tr>
                  <Hide hide={!expandState[rowIndex]}>
                    <Td />
                    <Td key={id + '-content'} dataLabel={id + '-content-label'} colSpan={3}>
                      <ExpandableRowContent>
                        <Stack hasGutter className={classes.expansionBox}>
                          <Flex direction={{ default: 'row' }}>
                            <FlexItem>
                              <strong>Issued date</strong>
                              <Text>{formatDateDDMMMYYYY(issued_date)}</Text>
                            </FlexItem>
                            <FlexItem>
                              <strong>Updated date</strong>
                              <Text>{formatDateDDMMMYYYY(updated_date)}</Text>
                            </FlexItem>
                          </Flex>
                          <Grid>
                            <strong>Description</strong>
                            <Text>{description}</Text>
                          </Grid>
                          <Grid>
                            <strong>Reboot</strong>
                            <div>
                              {reboot_suggested ? (
                                <OffIcon className={classes.red} />
                              ) : (
                                <OnIcon className={classes.green} />
                              )}
                              {`Reboot is ${reboot_suggested ? '' : 'not '}required`}
                            </div>
                          </Grid>
                        </Stack>
                      </ExpandableRowContent>
                    </Td>
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
