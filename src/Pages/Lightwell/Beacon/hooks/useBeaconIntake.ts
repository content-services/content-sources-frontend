import { useState } from 'react';
import { AlertVariant } from '@patternfly/react-core';

import useNotification from 'Hooks/useNotification';
import { useCreateSubmissionMutation } from 'services/Lightwell/ClearinghouseQueries';
import { validateSubmissionFile } from '../utils/validateSubmissionFile';

export type IntakeStep = 'select' | 'uploading' | 'detail';

/**
 * Drives the clearinghouse intake flow. Selecting a valid JSON file validates it
 * and immediately creates the submission (Lens-style auto-upload); on success the
 * view moves to `detail` with the new submission's uuid. On failure it returns to
 * `select`, keeping the file so the author can retry.
 */
export const useBeaconIntake = () => {
  const { notify } = useNotification();
  const createSubmission = useCreateSubmissionMutation();
  const [step, setStep] = useState<IntakeStep>('select');
  const [file, setFile] = useState<File | undefined>();
  const [fileError, setFileError] = useState<string | undefined>();
  const [createdUuid, setCreatedUuid] = useState<string | undefined>();

  // Uses dropzoneProps.onDropAccepted instead of onFileInputChange to avoid a PF bug
  // where onFileInputChange fires twice when selecting a file via the browser dialog.
  const handleFileAccepted = (acceptedFiles: File[]) => {
    const selectedFile = acceptedFiles[0];
    if (!selectedFile) return;

    const error = validateSubmissionFile(selectedFile);
    setFile(selectedFile);
    setFileError(error);
    if (error) return;

    setStep('uploading');
    createSubmission.mutate(selectedFile, {
      onSuccess: (submission) => {
        setCreatedUuid(submission.uuid);
        setStep('detail');
        notify({
          variant: AlertVariant.success,
          title: 'Submission created',
          description: submission.username
            ? `Submission created by ${submission.username}.`
            : undefined,
        });
      },
      onError: () => {
        setStep('select');
        notify({
          variant: AlertVariant.danger,
          title: 'Submission failed',
          description: 'Could not create the submission. Please try again.',
        });
      },
    });
  };

  const reset = () => {
    setStep('select');
    setFile(undefined);
    setFileError(undefined);
    setCreatedUuid(undefined);
  };

  return {
    step,
    file,
    fileError,
    createdUuid,
    isUploading: createSubmission.isPending,
    onDropAccepted: handleFileAccepted,
    reset,
  };
};
