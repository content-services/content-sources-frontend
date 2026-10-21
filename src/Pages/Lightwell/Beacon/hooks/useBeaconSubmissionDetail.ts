import { AlertVariant } from '@patternfly/react-core';

import useNotification from 'Hooks/useNotification';
import { useAppContext } from 'middleware/AppContext';
import { isFeatureOn } from 'services/Features/FeatureApi';
import { downloadSubmissionFile } from 'services/Lightwell/ClearinghouseApi';
import {
  useAddSubmissionFilesMutation,
  useDeleteSubmissionFileMutation,
  useDeleteSubmissionMutation,
  useSubmissionQuery,
  useSubmitSubmissionMutation,
  useProcessSubmissionMutation,
} from 'services/Lightwell/ClearinghouseQueries';

type UseBeaconSubmissionDetailOptions = {
  uuid: string;
  /** Called after the whole submission is deleted (e.g. to collapse the view). */
  onDeleted?: () => void;
  /** Called after the submission is submitted for validation. */
  onSubmitted?: () => void;
};

/**
 * Drives the BeaconSubmissionDetail view: fetches a submission, splits its main
 * report from reproducer files, and exposes add / delete / submit / process /
 * download actions. `canEdit` (uploading + clearinghouse write) gates the
 * add/delete/submit controls; `canProcess` (submitted + clearinghouse read) gates
 * the "Mark as processed" control. Callers hide controls accordingly.
 */
export const useBeaconSubmissionDetail = ({
  uuid,
  onDeleted,
  onSubmitted,
}: UseBeaconSubmissionDetailOptions) => {
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

  const hasWrite = isFeatureOn(features?.lightwellclearinghouse);
  const hasRead = isFeatureOn(features?.lightwellclearinghouseread);
  const canEdit = submission?.status === 'uploading' && hasWrite;
  const canProcess = submission?.status === 'submitted' && hasRead;

  const notifyError = (title: string) =>
    notify({ variant: AlertVariant.danger, title, description: 'Please try again.' });

  const addFiles = (newFiles: File[]) => {
    if (!newFiles.length) return;
    addFilesMutation.mutate(newFiles, {
      onError: () => notifyError('Could not add files'),
    });
  };

  const deleteFile = (filename: string) => {
    deleteFileMutation.mutate(filename, {
      onError: () => notifyError('Could not delete file'),
    });
  };

  const deleteWholeSubmission = () => {
    deleteSubmissionMutation.mutate(uuid, {
      onSuccess: () => {
        notify({ variant: AlertVariant.success, title: 'Submission deleted' });
        onDeleted?.();
      },
      onError: () => notifyError('Could not delete submission'),
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
      onError: () => notifyError('Could not submit submission'),
    });
  };

  const process = () => {
    processMutation.mutate(undefined, {
      onSuccess: () => {
        notify({ variant: AlertVariant.success, title: 'Submission marked as processed' });
      },
      onError: () => notifyError('Could not mark the submission as processed'),
    });
  };

  const download = (filename: string) => {
    downloadSubmissionFile(uuid, filename).catch(() => notifyError('Could not download file'));
  };

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
    mainFile,
    reproducerFiles,
    addFiles,
    deleteFile,
    deleteWholeSubmission,
    submit,
    process,
    download,
    isMutating,
  };
};
