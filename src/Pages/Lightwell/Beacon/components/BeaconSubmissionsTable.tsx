import { useState } from 'react';
import {
  Alert,
  Content,
  Label,
  Pagination,
  PaginationVariant,
  Stack,
  StackItem,
} from '@patternfly/react-core';
import { SkeletonTable } from '@patternfly/react-component-groups';
import { Table, TableVariant, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import { capitalize } from 'lodash';

import Hide from 'components/Hide/Hide';
import { formatDateDDMMMYYYY } from '../../../../helpers';
import { useSubmissionsListQuery } from 'services/Lightwell/ClearinghouseQueries';
import type {
  ClearinghouseSubmission,
  SubmissionStatus,
} from 'services/Lightwell/ClearinghouseApi';

import BeaconSubmissionDetail from './BeaconSubmissionDetail';

const SUBMISSION_MAIN_FILENAME = 'submission.json';

const columnHeaders = ['Filename', 'Status', 'Date', 'Added by', 'Processed at'];

const statusColor: Record<SubmissionStatus, 'blue' | 'green' | 'grey'> = {
  uploading: 'blue',
  submitted: 'green',
  processed: 'grey',
};

const getFilename = (submission: ClearinghouseSubmission) => {
  if (submission.filename) return submission.filename;
  const files = submission.files ?? [];
  const main = files.find((file) => file.filename === SUBMISSION_MAIN_FILENAME) ?? files[0];
  return main?.filename ?? SUBMISSION_MAIN_FILENAME;
};

/**
 * Lists clearinghouse submissions in a repository-style table. Each row expands
 * into a `BeaconSubmissionDetail` accordion for managing that submission's files.
 */
const BeaconSubmissionsTable = () => {
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(20);
  const [expandedUuid, setExpandedUuid] = useState<string | undefined>();

  const { data, isLoading, isError } = useSubmissionsListQuery(page, perPage);

  const submissions = data?.data ?? [];
  const count = data?.meta?.count ?? 0;
  const isEmpty = !isLoading && !isError && submissions.length === 0;

  const paginationProps = {
    isDisabled: isLoading,
    itemCount: count,
    perPage,
    page,
    onSetPage: (_event: unknown, newPage: number) => setPage(newPage),
    onPerPageSelect: (_event: unknown, newPerPage: number, newPage: number) => {
      setPerPage(newPerPage);
      setPage(newPage);
    },
  };

  return (
    <Stack hasGutter data-ouia-component-id='beacon-submissions' style={{ width: '100%' }}>
      <StackItem>
        <Content component='h3'>Submissions</Content>
        <Content component='small'>
          Original JSON and reproducer archives are not available for download here.
        </Content>
      </StackItem>

      <Hide hide={!isError}>
        <Alert
          variant='danger'
          isInline
          isPlain
          title='Could not load submissions'
          data-ouia-component-id='beacon-submissions-error'
        />
      </Hide>

      <Hide hide={!isLoading || isError}>
        <div data-ouia-component-id='beacon-submissions-skeleton'>
          <SkeletonTable
            rows={perPage}
            columnsCount={columnHeaders.length + 1}
            variant={TableVariant.compact}
          />
        </div>
      </Hide>

      <Hide hide={isLoading || isEmpty || isError}>
        <Table
          aria-label='Clearinghouse submissions table'
          ouiaId='beacon-submissions-table'
          variant={TableVariant.compact}
          isStriped
        >
          <Thead>
            <Tr>
              <Th screenReaderText='Expand row' />
              {columnHeaders.map((title) => (
                <Th key={`${title}-column`}>{title}</Th>
              ))}
            </Tr>
          </Thead>
          {submissions.map((submission, rowIndex) => {
            const isExpanded = expandedUuid === submission.uuid;
            return (
              <Tbody key={submission.uuid} isExpanded={isExpanded}>
                <Tr>
                  <Td
                    expand={{
                      rowIndex,
                      isExpanded,
                      onToggle: () => setExpandedUuid(isExpanded ? undefined : submission.uuid),
                      expandId: `submission-${submission.uuid}`,
                    }}
                  />
                  <Td dataLabel={columnHeaders[0]}>
                    <code>{getFilename(submission)}</code>
                  </Td>
                  <Td dataLabel={columnHeaders[1]}>
                    <Label isCompact color={statusColor[submission.status]}>
                      {capitalize(submission.status)}
                    </Label>
                  </Td>
                  <Td dataLabel={columnHeaders[2]}>{formatDateDDMMMYYYY(submission.created_at)}</Td>
                  <Td dataLabel={columnHeaders[3]}>{submission.username}</Td>
                  <Td dataLabel={columnHeaders[4]}>
                    {submission.processed_at ? formatDateDDMMMYYYY(submission.processed_at) : '—'}
                  </Td>
                </Tr>
                <Tr isExpanded={isExpanded}>
                  <Td />
                  <Td dataLabel='Submission detail' colSpan={columnHeaders.length}>
                    {isExpanded ? <BeaconSubmissionDetail uuid={submission.uuid} /> : null}
                  </Td>
                </Tr>
              </Tbody>
            );
          })}
        </Table>
      </Hide>

      <Hide hide={isLoading || isEmpty || count < 10}>
        <Pagination
          id='beacon-submissions-bottom-pagination'
          widgetId='beaconSubmissionsBottomPagination'
          variant={PaginationVariant.bottom}
          isStatic
          {...paginationProps}
        />
      </Hide>

      <Hide hide={!isEmpty}>
        <Content component='small' data-ouia-component-id='beacon-submissions-empty'>
          No submissions yet. Submit a vulnerability findings JSON payload to see it listed here.
        </Content>
      </Hide>
    </Stack>
  );
};

export default BeaconSubmissionsTable;
