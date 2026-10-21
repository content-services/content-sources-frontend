import { useRef, useState } from 'react';
import {
  Alert,
  ButtonVariant,
  Content,
  Divider,
  Flex,
  FlexItem,
  Spinner,
  Stack,
  StackItem,
} from '@patternfly/react-core';
import { WarningModal } from '@patternfly/react-component-groups';
import { DownloadIcon, PlusCircleIcon, TrashIcon } from '@patternfly/react-icons';

import { LwButton } from 'kit/components/primitives';
import type { ClearinghouseSubmissionFile } from 'services/Lightwell/ClearinghouseApi';

import { useBeaconSubmissionDetail } from '../hooks/useBeaconSubmissionDetail';

export type BeaconSubmissionDetailProps = {
  /** The submission to render; the component fetches it itself. */
  uuid: string;
  /** Fired after the whole submission is deleted (collapse the view). */
  onDeleted?: () => void;
  /** Fired after the submission is submitted for validation. */
  onSubmitted?: () => void;
  /** When provided, renders a "Save for later" link that collapses the view (no delete). */
  onClose?: () => void;
};

type ConfirmState = {
  title: string;
  body: string;
  confirmLabel: string;
  confirmVariant?: ButtonVariant;
  action: () => void;
};

/**
 * Reusable submission detail: lists the main report and its reproducer files with
 * per-file downloads. While `canEdit` (uploading + write) it offers add/delete/submit
 * controls; while `canProcess` (submitted + read) it offers "Mark as processed".
 * Destructive and terminal actions are gated behind a confirmation dialog.
 * Used inline after intake and inside the submissions-table accordion.
 */
const BeaconSubmissionDetail = ({
  uuid,
  onDeleted,
  onSubmitted,
  onClose,
}: BeaconSubmissionDetailProps) => {
  const {
    isLoading,
    isError,
    canEdit,
    canProcess,
    mainFile,
    reproducerFiles,
    addFiles,
    deleteFile,
    deleteWholeSubmission,
    submit,
    process,
    download,
    isMutating,
  } = useBeaconSubmissionDetail({ uuid, onDeleted, onSubmitted });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [confirm, setConfirm] = useState<ConfirmState | null>(null);

  if (isLoading) {
    return <Spinner aria-label='Loading submission' />;
  }

  if (isError || !mainFile) {
    return <Alert variant='danger' isInline isPlain title='Could not load the submission' />;
  }

  const handleUploadClick = () => fileInputRef.current?.click();

  const handleFilesSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(event.target.files ?? []);
    if (selected.length) addFiles(selected);
    event.target.value = '';
  };

  const confirmDeleteFile = (filename: string) =>
    setConfirm({
      title: 'Delete file?',
      body: `"${filename}" will be permanently removed from this submission.`,
      confirmLabel: 'Delete',
      confirmVariant: ButtonVariant.danger,
      action: () => deleteFile(filename),
    });

  const confirmDeleteSubmission = () =>
    setConfirm({
      title: 'Delete submission?',
      body: 'This permanently deletes the submission and all of its files. This cannot be undone.',
      confirmLabel: 'Delete',
      confirmVariant: ButtonVariant.danger,
      action: deleteWholeSubmission,
    });

  const confirmSubmit = () =>
    setConfirm({
      title: 'Submit for structural validation?',
      body: 'After submitting you can no longer add or remove files for this submission.',
      confirmLabel: 'Submit',
      action: submit,
    });

  const confirmProcess = () =>
    setConfirm({
      title: 'Mark as processed?',
      body: 'This marks the submission as processed and records you as the processor.',
      confirmLabel: 'Mark as processed',
      action: process,
    });

  const renderFileRow = (
    file: ClearinghouseSubmissionFile,
    { canDelete, onDelete }: { canDelete: boolean; onDelete?: () => void },
  ) => (
    <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapSm' }}>
      <FlexItem>
        <Content component='p'>
          <code>{file.filename}</code>
        </Content>
      </FlexItem>
      <FlexItem>
        <LwButton
          variant='plain'
          isCircle
          aria-label={`Download ${file.filename}`}
          onClick={() => download(file.filename)}
        >
          <DownloadIcon />
        </LwButton>
      </FlexItem>
      {canDelete ? (
        <FlexItem>
          <LwButton
            variant='plain'
            isCircle
            aria-label={`Delete ${file.filename}`}
            isDisabled={isMutating}
            onClick={onDelete}
          >
            <TrashIcon />
          </LwButton>
        </FlexItem>
      ) : null}
    </Flex>
  );

  return (
    <Stack hasGutter data-ouia-component-id='beacon-submission-detail'>
      <StackItem>
        <Flex alignItems={{ default: 'alignItemsCenter' }} gap={{ default: 'gapSm' }}>
          <FlexItem>
            <Content component='p'>
              <code>{mainFile.filename}</code>
            </Content>
          </FlexItem>
          <FlexItem>
            <LwButton
              variant='plain'
              isCircle
              aria-label={`Download ${mainFile.filename}`}
              onClick={() => download(mainFile.filename)}
            >
              <DownloadIcon />
            </LwButton>
          </FlexItem>
          {canEdit ? (
            <FlexItem>
              <LwButton
                variant='plain'
                isCircle
                aria-label='Delete submission'
                isDisabled={isMutating}
                onClick={confirmDeleteSubmission}
              >
                <TrashIcon />
              </LwButton>
            </FlexItem>
          ) : null}
        </Flex>
      </StackItem>

      <StackItem>
        <Content component='small'>
          <b>Reproducers ({reproducerFiles.length})</b>
        </Content>
        <Stack>
          {reproducerFiles.map((file) => (
            <StackItem key={file.uuid}>
              {renderFileRow(file, {
                canDelete: canEdit,
                onDelete: () => confirmDeleteFile(file.filename),
              })}
            </StackItem>
          ))}
        </Stack>
      </StackItem>

      {canEdit ? (
        <StackItem>
          <input
            ref={fileInputRef}
            type='file'
            multiple
            hidden
            data-ouia-component-id='reproducer-file-input'
            onChange={handleFilesSelected}
          />
          <LwButton
            variant='link'
            isInline
            icon={<PlusCircleIcon />}
            isDisabled={isMutating}
            onClick={handleUploadClick}
            ouiaId='beacon-upload-reproducer'
          >
            Upload reproducer file
          </LwButton>
        </StackItem>
      ) : null}

      {canEdit || canProcess || onClose ? (
        <StackItem>
          <Divider />
        </StackItem>
      ) : null}

      <StackItem>
        <Flex spaceItems={{ default: 'spaceItemsMd' }} alignItems={{ default: 'alignItemsCenter' }}>
          {canEdit ? (
            <FlexItem>
              <LwButton
                variant='primary'
                isLoading={isMutating}
                isDisabled={isMutating}
                onClick={confirmSubmit}
                ouiaId='beacon-submit-for-validation'
              >
                Submit for structural validation by your STAM
              </LwButton>
            </FlexItem>
          ) : null}
          {canProcess ? (
            <FlexItem>
              <LwButton
                variant='primary'
                isLoading={isMutating}
                isDisabled={isMutating}
                onClick={confirmProcess}
                ouiaId='beacon-mark-processed'
              >
                Mark as processed
              </LwButton>
            </FlexItem>
          ) : null}
          {onClose ? (
            <FlexItem>
              <LwButton variant='link' onClick={onClose} ouiaId='beacon-submission-save-later'>
                Save for later
              </LwButton>
            </FlexItem>
          ) : null}
        </Flex>
      </StackItem>

      <WarningModal
        isOpen={!!confirm}
        title={confirm?.title ?? ''}
        withCheckbox={false}
        confirmButtonLabel={confirm?.confirmLabel}
        confirmButtonVariant={confirm?.confirmVariant ?? ButtonVariant.primary}
        onConfirm={() => {
          confirm?.action();
          setConfirm(null);
        }}
        onClose={() => setConfirm(null)}
        ouiaId='beacon-confirm-modal'
      >
        {confirm?.body}
      </WarningModal>
    </Stack>
  );
};

export default BeaconSubmissionDetail;
