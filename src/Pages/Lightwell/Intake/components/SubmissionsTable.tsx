import { useState } from 'react';
import {
  Alert,
  AlertVariant,
  Button,
  ButtonVariant,
  Content,
  Flex,
  FlexItem,
  Label,
  Pagination,
  PaginationVariant,
  Stack,
  StackItem,
} from '@patternfly/react-core';
import { SkeletonTable, WarningModal } from '@patternfly/react-component-groups';
import { Table, TableVariant, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import { DownloadIcon, TrashIcon } from '@patternfly/react-icons';
import { capitalize } from 'lodash';
import { Link } from 'react-router-dom';

import Hide from 'components/Hide/Hide';
import useNotification from 'Hooks/useNotification';
import { formatDateDDMMMYYYY } from '../../../../helpers';
import { useAppContext } from 'middleware/AppContext';
import { isFeatureOn } from 'services/Features/FeatureApi';
import {
  downloadSubmissionArchive,
  type ClearinghouseSubmission,
  type SubmissionStatus,
} from 'services/Lightwell/ClearinghouseApi';
import {
  useDeleteSubmissionMutation,
  useSubmissionsListQuery,
} from 'services/Lightwell/ClearinghouseQueries';

import SubmissionDrawer from './SubmissionDrawer';
import { useSubmissionDrawerParams } from '../hooks/useSubmissionDrawerParams';
import { useCurrentUsername } from '../hooks/useCurrentUsername';

const SUBMISSION_MAIN_FILENAME = 'submission.json';

const baseColumnHeaders = ['Filename', 'Status', 'Created', 'Submitted', 'Processed'];

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
 * A two-row date cell: the formatted date on top, "by <author>" beneath it.
 * The "by <author>" line is omitted when the author is the current user, to avoid
 * the odd "by me" phrasing.
 */
const DateAuthorCell = ({
  date,
  author,
  currentUsername,
}: {
  date?: string;
  author?: string;
  currentUsername?: string;
}) => {
  if (!date) return <>—</>;
  const showAuthor = !!author && author !== currentUsername;
  return (
    <Stack>
      <StackItem>{formatDateDDMMMYYYY(date)}</StackItem>
      {showAuthor ? (
        <StackItem>
          <Content component='small'>by {author}</Content>
        </StackItem>
      ) : null}
    </Stack>
  );
};

/**
 * Lists clearinghouse submissions in a repository-style table. Clicking a row's
 * filename opens that submission in a SubmissionDrawer (an overlay drawer, like
 * the Packages advisory details drawer); the open submission is tracked in the
 * `?submission=<uuid>` URL param. Each row's action column offers downloading the
 * whole submission as a zip and (for the author, while uploading) deleting it; the
 * column is hidden entirely when no visible row supports either action.
 */
const SubmissionsTable = () => {
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(20);
  const [confirmDelete, setConfirmDelete] = useState<ClearinghouseSubmission | null>(null);

  const { notify } = useNotification();
  const { features } = useAppContext();
  const currentUsername = useCurrentUsername();
  const hasWrite = isFeatureOn(features?.lightwellclearinghouse);
  const hasRead = isFeatureOn(features?.lightwellclearinghouseread);

  const { getSubmissionSearch, replaceSubmissionLink } = useSubmissionDrawerParams();
  const { data, isLoading, isError } = useSubmissionsListQuery(page, perPage);
  const deleteMutation = useDeleteSubmissionMutation();

  const submissions = data?.data ?? [];
  const count = data?.meta?.count ?? 0;
  const isEmpty = !isLoading && !isError && submissions.length === 0;

  // Delete is author-only while uploading; downloading the archive is restricted to
  // clearinghouse read users, once the submission is submitted or processed.
  const canDeleteRow = (submission: ClearinghouseSubmission) =>
    hasWrite && submission.status === 'uploading';
  const canDownloadRow = (submission: ClearinghouseSubmission) =>
    hasRead && (submission.status === 'submitted' || submission.status === 'processed');
  const showActions = submissions.some(
    (submission) => canDeleteRow(submission) || canDownloadRow(submission),
  );

  const handleDownload = (submission: ClearinghouseSubmission) =>
    downloadSubmissionArchive(submission.uuid).catch(() =>
      notify({
        variant: AlertVariant.danger,
        title: 'Could not download archive',
        description: 'Please try again.',
      }),
    );

  const handleDelete = (submission: ClearinghouseSubmission) =>
    deleteMutation.mutate(submission.uuid, {
      onSuccess: () => notify({ variant: AlertVariant.success, title: 'Submission deleted' }),
      onError: () =>
        notify({
          variant: AlertVariant.danger,
          title: 'Could not delete submission',
          description: 'Please try again.',
        }),
    });

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
    <SubmissionDrawer>
      <Stack hasGutter data-ouia-component-id='beacon-submissions' style={{ width: '100%' }}>
        <StackItem>
          <Content component='h3'>Submissions</Content>
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
              columnsCount={baseColumnHeaders.length}
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
                {baseColumnHeaders.map((title) => (
                  <Th key={`${title}-column`}>{title}</Th>
                ))}
                {showActions ? <Th screenReaderText='Actions' /> : null}
              </Tr>
            </Thead>
            <Tbody>
              {submissions.map((submission) => (
                <Tr key={submission.uuid}>
                  <Td dataLabel={baseColumnHeaders[0]}>
                    <Button
                      variant='link'
                      isInline
                      component={(props) => (
                        <Link
                          {...props}
                          to={getSubmissionSearch(submission.uuid)}
                          replace={replaceSubmissionLink}
                        />
                      )}
                    >
                      <code>{getFilename(submission)}</code>
                    </Button>
                  </Td>
                  <Td dataLabel={baseColumnHeaders[1]}>
                    <Label isCompact color={statusColor[submission.status]}>
                      {capitalize(submission.status)}
                    </Label>
                  </Td>
                  <Td dataLabel={baseColumnHeaders[2]}>
                    <DateAuthorCell
                      date={submission.created_at}
                      author={submission.username}
                      currentUsername={currentUsername}
                    />
                  </Td>
                  <Td dataLabel={baseColumnHeaders[3]}>
                    <DateAuthorCell
                      date={submission.submitted_at}
                      author={submission.submitted_by}
                      currentUsername={currentUsername}
                    />
                  </Td>
                  <Td dataLabel={baseColumnHeaders[4]}>
                    <DateAuthorCell
                      date={submission.processed_at}
                      author={submission.processed_by}
                      currentUsername={currentUsername}
                    />
                  </Td>
                  {showActions ? (
                    <Td dataLabel='Actions' isActionCell>
                      <Flex
                        spaceItems={{ default: 'spaceItemsNone' }}
                        flexWrap={{ default: 'nowrap' }}
                      >
                        {canDownloadRow(submission) ? (
                          <FlexItem>
                            <Button
                              variant='plain'
                              aria-label={`Download ${getFilename(submission)}`}
                              icon={<DownloadIcon />}
                              onClick={() => handleDownload(submission)}
                            />
                          </FlexItem>
                        ) : null}
                        {canDeleteRow(submission) ? (
                          <FlexItem>
                            <Button
                              variant='plain'
                              aria-label={`Delete ${getFilename(submission)}`}
                              icon={<TrashIcon />}
                              isDisabled={deleteMutation.isPending}
                              onClick={() => setConfirmDelete(submission)}
                            />
                          </FlexItem>
                        ) : null}
                      </Flex>
                    </Td>
                  ) : null}
                </Tr>
              ))}
            </Tbody>
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
            {hasWrite
              ? 'No submissions yet. Submit a vulnerability findings JSON payload to see it listed here.'
              : "No submissions yet. Submissions from customers will appear here once they're received."}
          </Content>
        </Hide>
      </Stack>

      {confirmDelete ? (
        <WarningModal
          isOpen
          title='Delete submission?'
          withCheckbox={false}
          confirmButtonLabel='Delete all'
          confirmButtonVariant={ButtonVariant.danger}
          onConfirm={() => {
            handleDelete(confirmDelete);
            setConfirmDelete(null);
          }}
          onClose={() => setConfirmDelete(null)}
          ouiaId='submissions-delete-confirm'
        >
          {`This permanently deletes "${getFilename(confirmDelete)}" and all of its files. This cannot be undone.`}
        </WarningModal>
      ) : null}
    </SubmissionDrawer>
  );
};

export default SubmissionsTable;
