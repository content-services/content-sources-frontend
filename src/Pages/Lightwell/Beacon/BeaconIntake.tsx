import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Bullseye, Content, Flex, FlexItem, Spinner } from '@patternfly/react-core';
import PlusCircleIcon from '@patternfly/react-icons/dist/esm/icons/plus-circle-icon';
import HelpIcon from '@patternfly/react-icons/dist/esm/icons/help-icon';
import TimesIcon from '@patternfly/react-icons/dist/esm/icons/times-icon';

import {
  LwPageHeader,
  PageChromeSlot,
  PageChromeSlots,
  PageTitleStack,
} from 'kit/components/assemblies';
import { LwButton, LwPopover } from 'kit/components/primitives';
import { useAppContext } from 'middleware/AppContext';
import { isFeatureOn } from 'services/Features/FeatureApi';
import { CLEARINGHOUSE_SUBMISSIONS_KEY } from 'services/Lightwell/ClearinghouseQueries';

import FileUploadCard from '../components/FileUploadCard';
import BeaconSubmissionDetail from './components/BeaconSubmissionDetail';
import BeaconSubmissionsTable from './components/BeaconSubmissionsTable';
import { useBeaconIntake } from './hooks/useBeaconIntake';

const INTAKE_DESCRIPTION =
  'Submit vulnerability findings using the shared JSON / OpenAPI intake contract—without emailing files to your STAM.';

const IntakeHelpPopover = () => (
  <LwPopover
    hasHeader='Vulnerability report intake'
    hasBody={
      <Content>
        <p>
          Upload a single findings report that follows the shared JSON / OpenAPI intake contract. It
          is stored as the submission&apos;s <code>submission.json</code>.
        </p>
        <p>You can attach reproducer files to the submission after it is created.</p>
      </Content>
    }
    hasTrigger={
      <LwButton isCircle variant='plain' aria-label='Intake help'>
        <HelpIcon />
      </LwButton>
    }
  />
);

/**
 * Clearinghouse intake view, shown when the user has `lightwellclearinghouse` or
 * `lightwellclearinghouseread`. A Lens-style hero: title + description (and, after
 * upload, the submission detail) on the left; the "Upload Form" button — which
 * swaps in place for the JSON upload form — on the right. The submissions table
 * sits inside the hero below.
 */
const BeaconIntake = () => {
  const { step, file, fileError, createdUuid, onDropAccepted, reset } = useBeaconIntake();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const queryClient = useQueryClient();
  const { features } = useAppContext();

  // Uploading (creating a submission) requires the clearinghouse write feature.
  // Read-only users still see the submissions table and can process submitted ones.
  const canUpload = isFeatureOn(features?.lightwellclearinghouse);

  const showForm = canUpload && step === 'select' && isFormOpen;
  const showUploading = canUpload && step === 'uploading';
  const showDetail = canUpload && step === 'detail' && !!createdUuid;
  const showUploadButton = canUpload && step === 'select' && !isFormOpen;

  const handleReset = () => {
    reset();
    setIsFormOpen(false);
  };

  // Closing the detail (Save for later / submitted / deleted) is when the author
  // is done staging: refetch the list so the submission shows up in the table now.
  const handleCloseDetail = () => {
    queryClient.invalidateQueries({ queryKey: [CLEARINGHOUSE_SUBMISSIONS_KEY] });
    handleReset();
  };

  return (
    <LwPageHeader hero bodyWidth='100%' bodyMaxWidth='100%'>
      <PageChromeSlots>
        <PageChromeSlot>
          <PageTitleStack
            title='Intake'
            description={INTAKE_DESCRIPTION}
            ouiaId='lightwell-beacon-intake-header'
          />
          {showDetail ? (
            <BeaconSubmissionDetail
              uuid={createdUuid}
              onDeleted={handleCloseDetail}
              onSubmitted={handleCloseDetail}
              onClose={handleCloseDetail}
            />
          ) : null}
        </PageChromeSlot>

        <PageChromeSlot>
          {showUploadButton ? (
            <LwButton
              variant='primary'
              icon={<PlusCircleIcon />}
              onClick={() => setIsFormOpen(true)}
              ouiaId='beacon-upload-form-toggle'
            >
              Submit
            </LwButton>
          ) : null}

          {showForm ? (
            <FileUploadCard
              title='Select vulnerability report to upload'
              action={
                <Flex
                  alignItems={{ default: 'alignItemsCenter' }}
                  spaceItems={{ default: 'spaceItemsXs' }}
                >
                  <FlexItem>
                    <IntakeHelpPopover />
                  </FlexItem>
                  <FlexItem>
                    <LwButton
                      isCircle
                      variant='plain'
                      aria-label='Close upload form'
                      onClick={handleReset}
                      ouiaId='beacon-intake-close'
                    >
                      <TimesIcon />
                    </LwButton>
                  </FlexItem>
                </Flex>
              }
              dropzoneTitle='Drag and drop findings JSON file'
              infoText='.json required · attach reproducers after selection'
              file={file}
              fileError={fileError}
              onDropAccepted={onDropAccepted}
            />
          ) : null}

          {showUploading ? (
            <Bullseye>
              <Spinner aria-label='Creating submission' />
            </Bullseye>
          ) : null}
        </PageChromeSlot>
      </PageChromeSlots>

      <PageChromeSlots>
        <PageChromeSlot>
          <BeaconSubmissionsTable />
        </PageChromeSlot>
      </PageChromeSlots>
    </LwPageHeader>
  );
};

export default BeaconIntake;
