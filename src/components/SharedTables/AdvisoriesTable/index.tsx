import {
  BaseCellProps,
  ExpandableRowContent,
  Table,
  TableVariant,
  Tbody,
  Td,
  Th,
  ThProps,
  Thead,
  Tr,
} from '@patternfly/react-table';
import { ErrataItem } from 'services/Content/ContentApi';
import Hide from '../../Hide/Hide';
import { Flex, FlexItem, Grid, Stack, Content } from '@patternfly/react-core';
import { SkeletonTable } from '@patternfly/react-component-groups';

import { createUseStyles } from 'react-jss';
import useDeepCompareEffect from 'Hooks/useDeepCompareEffect';
import React, { useEffect, useState } from 'react';
import { isEmpty } from 'lodash';
import { formatDateDDMMMYYYY, formatDescription, reduceStringToCharsWithEllipsis } from 'helpers';
import UrlWithExternalIcon from '../../UrlWithLinkIcon/UrlWithLinkIcon';
import EmptyTableState from 'components/EmptyTableState/EmptyTableState';
import ErrataTypeCell from './components/ErrataTypeCell';
import SeverityCell from './components/SeverityCell';
import RebootStatus from './components/RebootStatus';
import { columnsConfig } from './constants';

const useStyles = createUseStyles({
  mainContainer: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
  },
  expansionBox: {
    padding: '16px 0',
  },
  retainSpaces: { whiteSpace: 'pre-line' },
});

interface Props {
  isFetchingOrLoading: boolean;
  isLoadingOrZeroCount: boolean;
  errataList: ErrataItem[];
  clearSearch: () => void;
  perPage: number;
  sortParams: (columnIndex: number) => ThProps['sort'];
  hasFilters: boolean;
}

export default function AdvisoriesTable({
  isFetchingOrLoading,
  isLoadingOrZeroCount,
  errataList,
  clearSearch,
  perPage,
  sortParams,
  hasFilters,
}: Props) {
  const classes = useStyles();
  const [prevLength, setPrev] = useState(perPage || 10);

  const [expandState, setExpandState] = useState({});

  useDeepCompareEffect(() => {
    if (!isEmpty(expandState)) setExpandState({});
  }, [errataList]);

  useEffect(() => {
    setPrev(errataList.length || 10);
  }, [errataList.length]);

  return (
    <>
      <Hide hide={!isFetchingOrLoading}>
        <Grid className={classes.mainContainer}>
          <SkeletonTable
            rows={prevLength}
            columnsCount={columnsConfig.length}
            variant={TableVariant.compact}
          />
        </Grid>
      </Hide>
      <Hide hide={isFetchingOrLoading}>
        <Table aria-label='errata table' ouiaId='errata_table' variant='compact'>
          <Hide hide={isLoadingOrZeroCount}>
            <Thead>
              <Tr>
                <Th screenReaderText='empty' />
                {columnsConfig.map(({ name, width }, index) =>
                  name === 'Name' || name === 'Synopsis' ? (
                    <Th width={width as BaseCellProps['width']} key={index + name + '_header'}>
                      {name}
                    </Th>
                  ) : (
                    <Th
                      width={width as BaseCellProps['width']}
                      key={index + name + '_header'}
                      sort={sortParams(index)}
                    >
                      {name}
                    </Th>
                  ),
                )}
              </Tr>
            </Thead>
          </Hide>
          {[...new Map(errataList.map((e) => [e.errata_id, e])).values()].map(
            (
              {
                errata_id,
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
              <Tbody key={errata_id + rowIndex + '-column'}>
                <Tr>
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
                    <ErrataTypeCell type={type} />
                  </Td>
                  <Td>
                    <SeverityCell severity={severity} />
                  </Td>
                  <Td>{formatDateDDMMMYYYY(issued_date)}</Td>
                </Tr>
                <Hide hide={!expandState[rowIndex]}>
                  <Tr>
                    <Td />
                    <Td dataLabel={rowIndex + '-content-label'} colSpan={3}>
                      <ExpandableRowContent key={rowIndex + '-expandablecontent'}>
                        <Stack hasGutter className={classes.expansionBox}>
                          <Flex direction={{ default: 'row' }}>
                            <FlexItem>
                              <strong>Updated date</strong>
                              <Content component='p'>
                                {updated_date ? formatDateDDMMMYYYY(updated_date) : 'N/A'}
                              </Content>
                            </FlexItem>
                          </Flex>
                          <Grid>
                            <strong>Description</strong>
                            <Content component='p' className={classes.retainSpaces}>
                              {formatDescription(description)}
                            </Content>
                          </Grid>
                          <RebootStatus rebootSuggested={reboot_suggested} />
                          <Grid>
                            <div>
                              {errata_id.startsWith('RH') ? (
                                <UrlWithExternalIcon
                                  href={`https://access.redhat.com/errata/${errata_id}`}
                                  customText='View packages and errata at access.redhat.com'
                                />
                              ) : (
                                ''
                              )}
                            </div>
                          </Grid>
                        </Stack>
                      </ExpandableRowContent>
                    </Td>
                  </Tr>
                </Hide>
              </Tbody>
            ),
          )}
        </Table>
        <Hide hide={!isLoadingOrZeroCount}>
          <EmptyTableState
            notFiltered={!hasFilters}
            clearFilters={clearSearch}
            itemName='advisories'
            notFilteredBody='You may need to add repositories that contain advisories.'
          />
        </Hide>
      </Hide>
    </>
  );
}
