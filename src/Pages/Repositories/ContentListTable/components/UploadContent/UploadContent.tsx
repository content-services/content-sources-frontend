import { Button, Flex, Stack, StackItem } from '@patternfly/react-core';
import { Modal, ModalVariant } from '@patternfly/react-core/deprecated';
import { createUseStyles } from 'react-jss';
import { useNavigate, useParams } from 'react-router-dom';
import useRootPath from 'Hooks/useRootPath';
import { REPOSITORIES_ROUTE } from 'Routes/constants';
import FileUploader from './components/FileUploader';
import { useState } from 'react';
import { useAddUploadsQuery } from 'services/Content/ContentQueries';

const useStyles = createUseStyles({
  saveButton: {
    marginRight: '36px',
    transition: 'unset!important',
  },
  modalSize: {
    width: '678px',
  },
});

const UploadContent = () => {
  const classes = useStyles();
  const { repoUUID: uuid } = useParams();
  const [fileUUIDs, setFileUUIDs] = useState<{ sha256: string; uuid: string; href: string }[]>([]);
  const [childLoading, setChildLoading] = useState(false);
  const [confirmModal, setConfirmModal] = useState(false);

  const rootPath = useRootPath();
  const navigate = useNavigate();

  const onCloseClick = () => (fileUUIDs.length ? setConfirmModal(true) : onClose());

  const onClose = () => navigate(`${rootPath}/${REPOSITORIES_ROUTE}`);

  const { mutateAsync: uploadItems, isLoading } = useAddUploadsQuery({
    repoUUID: uuid!,
    uploads: fileUUIDs
      .filter(({ href }) => !href)
      .map(({ sha256, uuid }) => ({
        sha256,
        uuid,
      })),
    artifacts: fileUUIDs
      .filter(({ href }) => href)
      .map(({ sha256, href }) => ({
        sha256,
        href,
      })),
  });

  return (
    <>
      <Modal
        position='top'
        className={classes.modalSize}
        variant={ModalVariant.medium}
        title='Upload content'
        ouiaId='upload_content_modal'
        description='Use the form below to upload content to your repository.'
        isOpen={!!uuid}
        onClose={onCloseClick}
        footer={
          <Stack>
            <StackItem>
              <Button
                className={classes.saveButton}
                key='confirm'
                ouiaId='modal_save'
                variant='primary'
                isLoading={isLoading}
                isDisabled={!fileUUIDs.length || childLoading}
                onClick={() => uploadItems().then(onClose)}
              >
                {fileUUIDs.length && !childLoading
                  ? 'Confirm changes'
                  : childLoading
                    ? 'Uploading'
                    : 'No content uploaded'}
              </Button>
              <Button key='cancel' variant='link' onClick={onCloseClick} ouiaId='modal_cancel'>
                Cancel
              </Button>
            </StackItem>
          </Stack>
        }
      >
        <FileUploader {...{ isLoading, setFileUUIDs, setChildLoading }} />
      </Modal>
      <Modal
        isOpen={confirmModal}
        position='default'
        variant={ModalVariant.small}
        title='You have unsaved uploaded items.'
        ouiaId='are_you_sure'
        onClose={() => setConfirmModal(false)}
        description='Are you sure you want to quit without saving these changes?'
        footer={
          <Flex gap={{ default: 'gap' }}>
            <Button variant='secondary' onClick={onClose}>
              Close without saving
            </Button>
            <Button
              key='cancel'
              variant='primary'
              onClick={() => setConfirmModal(false)}
              ouiaId='modal_cancel'
            >
              Go Back
            </Button>
          </Flex>
        }
      >
        <></>
      </Modal>
    </>
  );
};

export default UploadContent;
