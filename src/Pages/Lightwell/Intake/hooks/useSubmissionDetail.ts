import { AlertVariant } from '@patternfly/react-core';

import useNotification from 'Hooks/useNotification';
import { composeErrorDescription } from 'Hooks/useErrorNotification';
import { useAppContext } from 'middleware/AppContext';
import { isFeatureOn } from 'services/Features/FeatureApi';
import {
  downloadSubmissionArchive,
  downloadSubmissionFile,
} from 'services/Lightwell/ClearinghouseApi';
import {
  useAddSubmissionFilesMutation,
  useDeleteSubmissionFileMutation,
  useDeleteSubmissionMutation,
  useSubmissionQuery,
  useSubmitSubmissionMutation,
  useProcessSubmissionMutation,
} from 'services/Lightwell/ClearinghouseQueries';

type UseSubmissionDetailOptions = {
  uuid: string;
  /** Called after the whole submission is deleted (e.g. to collapse the view). */
  onDeleted?: () => void;
  /** Called after the submission is submitted for validation. */
  onSubmitted?: () => void;
};

/**
 * Drives the SubmissionDetail view: fetches a submission, splits its main
 * report from reproducer files, and exposes add / delete / submit / process /
 * download actions. `canEdit` (uploading + clearinghouse write) gates the
 * add/delete/submit controls; `canProcess` (submitted + clearinghouse read) gates
 * the "Mark as processed" control; `canDownload` gates the per-file / archive
 * download controls, mirroring the backend authorization (author while
 * uploading/submitted, read while submitted/processed). Callers hide controls
 * accordingly.
 */
export const useSubmissionDetail = ({
  uuid,
  onDeleted,
  onSubmitted,
}: UseSubmissionDetailOptions) => {
  const { notify } = useNotification();
  const { features } = useAppContext();
  const { data: submission, isLoading, isError } = useSubmissionQuery(uuid);

  const addFilesMutation = useAddSubmissionFilesMutation(uuid);
  const deleteFileMutation = useDeleteSubmissionFileMutation(uuid);
  const deleteSubmissionMutation = useDeleteSubmissionMutation();
  const submitMutation = useSubmitSubmissionMutation(uuid);
  const processMutation = useProcessSubmissionMutation(uuid);

  // The main report is identified by the submission's top-level `filename`
  // (the original uploaded name the backend now preserves); the rest are reproducers.
  const files = submission?.files ?? [];
  const mainFile = files.find((file) => file.filename === submission?.filename) ?? files[0];
  const reproducerFiles = files.filter((file) => file !== mainFile);

  const status = submission?.status;
  const hasWrite = isFeatureOn(features?.lightwellclearinghouse);
  const hasRead = isFeatureOn(features?.lightwellclearinghouseread);
  const canEdit = status === 'uploading' && hasWrite;
  const canProcess = status === 'submitted' && hasRead;
  // Downloading any file (per-file or the full archive) is restricted to
  // clearinghouse read (STAM / processor) users, and only once the submission is
  // submitted or processed (matching what the backend will serve).
  const canDownload = hasRead && (status === 'submitted' || status === 'processed');

  // Surface the backend's reason (e.g. too many files, duplicate filename)
  // instead of a generic message; fall back to the generic text otherwise.
  const notifyError = (title: string, err?: unknown) => {
    const { title: resolvedTitle, description } = composeErrorDescription(
      title,
      'Please try again.',
      err,
    );
    notify({ variant: AlertVariant.danger, title: resolvedTitle, description });
  };

  const addFiles = (newFiles: File[], opts?: { onSuccess?: () => void }) => {
    if (!newFiles.length) return;
    addFilesMutation.mutate(newFiles, {
      onSuccess: opts?.onSuccess,
      onError: (err) => notifyError('Could not add files', err),
    });
  };

  const deleteFile = (filename: string) => {
    deleteFileMutation.mutate(filename, {
      onError: (err) => notifyError('Could not delete file', err),
    });
  };

  const deleteWholeSubmission = () => {
    deleteSubmissionMutation.mutate(uuid, {
      onSuccess: () => {
        notify({ variant: AlertVariant.success, title: 'Submission deleted' });
        onDeleted?.();
      },
      onError: (err) => notifyError('Could not delete submission', err),
    });
  };

  const submit = () => {
    submitMutation.mutate(undefined, {
      onSuccess: () => {
        notify({
          variant: AlertVariant.success,
          title: 'Submitted for structural validation',
        });
        onSubmitted?.();
      },
      onError: (err) => notifyError('Could not submit submission', err),
    });
  };

  const process = () => {
    processMutation.mutate(undefined, {
      onSuccess: () => {
        notify({ variant: AlertVariant.success, title: 'Submission marked as processed' });
      },
      onError: (err) => notifyError('Could not mark the submission as processed', err),
    });
  };

  const download = (filename: string) => {
    downloadSubmissionFile(uuid, filename).catch((err) =>
      notifyError('Could not download file', err),
    );
  };

  const downloadArchive = () => {
    downloadSubmissionArchive(uuid).catch((err) => notifyError('Could not download archive', err));
  };

  // `addFilesMutation.variables` is the File[] handed to `mutate`, so while the
  // upload is in flight we know how many reproducer rows to show as skeletons.
  const isAddingFiles = addFilesMutation.isPending;
  const addingCount = isAddingFiles ? (addFilesMutation.variables?.length ?? 0) : 0;

  const isMutating =
    addFilesMutation.isPending ||
    deleteFileMutation.isPending ||
    deleteSubmissionMutation.isPending ||
    submitMutation.isPending ||
    processMutation.isPending;

  return {
    submission,
    isLoading,
    isError,
    canEdit,
    canProcess,
    canDownload,
    mainFile,
    reproducerFiles,
    addFiles,
    deleteFile,
    deleteWholeSubmission,
    submit,
    process,
    download,
    downloadArchive,
    isAddingFiles,
    addingCount,
    isMutating,
  };
};
