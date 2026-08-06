import {
  Alert,
  Button,
  ClipboardCopy,
  ClipboardCopyVariant,
  Content,
  DatePicker,
  Flex,
  Form,
  FormGroup,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  ModalVariant,
  TextInput,
} from '@patternfly/react-core';
import useChrome from '@redhat-cloud-services/frontend-components/useChrome';
import dayjs from 'dayjs';
import { useEffect, useRef, useState } from 'react';

import { useCreateLightwellToken } from 'services/LightwellTokens/LightwellTokensQueries';
import type { LightwellTokenCreateRequest } from 'services/LightwellTokens/LightwellTokensApi';

type CreateTokenModalProps = {
  onClose: () => void;
};

const maxExpiryDate = () => dayjs().add(365, 'day').endOf('day');

const CreateTokenModal = ({ onClose }: CreateTokenModalProps) => {
  const chrome = useChrome();
  const [name, setName] = useState('');
  const [userId, setUserId] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [plaintextToken, setPlaintextToken] = useState<string | null>(null);
  const userIdTouchedRef = useRef(false);

  const { mutateAsync: createToken, isPending } = useCreateLightwellToken();

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const user = await chrome.auth.getUser();
        // ChromeUser typings omit user_id, but Console identity includes it at runtime.
        const currentUserId =
          (user?.identity?.user as { user_id?: string } | undefined)?.user_id ?? '';
        if (!cancelled && currentUserId && !userIdTouchedRef.current) {
          setUserId(currentUserId);
        }
      } catch {
        // Leave user_id empty; backend defaults to the caller.
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [chrome.auth]);

  const expiryValidators = [
    (date: Date) => {
      if (dayjs(date).isBefore(dayjs().startOf('day'))) {
        return 'Expiry must be in the future';
      }
      if (dayjs(date).isAfter(maxExpiryDate())) {
        return 'Expiry cannot be more than 365 days from today';
      }
      return '';
    },
  ];

  const canSubmit = name.trim().length > 0 && !isPending;

  const onCreate = async () => {
    const request: LightwellTokenCreateRequest = { name: name.trim() };
    const trimmedUserId = userId.trim();
    if (trimmedUserId) {
      request.user_id = trimmedUserId;
    }
    if (expiresAt) {
      request.expires_at = dayjs(expiresAt).endOf('day').toISOString();
    }

    try {
      const result = await createToken(request);
      setPlaintextToken(result.token ?? null);
    } catch {
      // Error toast is handled by the mutation
    }
  };

  const isRevealStep = plaintextToken !== null;

  return (
    <Modal
      variant={ModalVariant.medium}
      position='top'
      isOpen
      onClose={onClose}
      aria-labelledby='lightwell-create-token-modal-title'
      ouiaId='lightwell-create-token-modal'
    >
      <ModalHeader
        title={isRevealStep ? 'Access token created' : 'Create access token'}
        labelId='lightwell-create-token-modal-title'
      />
      <ModalBody>
        {isRevealStep ? (
          <Flex direction={{ default: 'column' }} gap={{ default: 'gapMd' }}>
            <Alert
              variant='warning'
              isInline
              title='Copy this token now. It will not be shown again.'
            />
            <Content component='p'>
              Token <b>{name.trim()}</b> was created successfully.
            </Content>
            <ClipboardCopy
              isReadOnly
              hoverTip='Copy'
              clickTip='Copied'
              variant={ClipboardCopyVariant.expansion}
              ouiaId='lightwell-token-plaintext'
            >
              {plaintextToken}
            </ClipboardCopy>
          </Flex>
        ) : (
          <Form>
            <FormGroup label='Name' isRequired fieldId='lightwell-token-name'>
              <TextInput
                id='lightwell-token-name'
                ouiaId='lightwell-token-name'
                value={name}
                onChange={(_event, value) => setName(value)}
                isRequired
                maxLength={255}
              />
            </FormGroup>
            <FormGroup label='User ID' fieldId='lightwell-token-user-id'>
              <TextInput
                id='lightwell-token-user-id'
                ouiaId='lightwell-token-user-id'
                value={userId}
                onChange={(_event, value) => {
                  userIdTouchedRef.current = true;
                  setUserId(value);
                }}
                maxLength={255}
              />
              <Content component='p'>
                Optional. Defaults to your Console user ID. Use another org member&apos;s user ID to
                associate the token with them.
              </Content>
            </FormGroup>
            <FormGroup label='Expires on' fieldId='lightwell-token-expires'>
              <DatePicker
                id='lightwell-token-expires'
                value={expiresAt}
                validators={expiryValidators}
                onChange={(_event, value) => setExpiresAt(value)}
                popoverProps={{
                  position: 'right',
                  enableFlip: true,
                }}
              />
              <Content component='p'>Optional. Defaults to 365 days from creation.</Content>
            </FormGroup>
          </Form>
        )}
      </ModalBody>
      <ModalFooter>
        {isRevealStep ? (
          <Button
            key='done'
            variant='primary'
            onClick={onClose}
            ouiaId='lightwell-create-token-done'
          >
            Done
          </Button>
        ) : (
          <Flex columnGap={{ default: 'columnGapLg' }}>
            <Button
              key='create'
              variant='primary'
              isLoading={isPending}
              isDisabled={!canSubmit}
              onClick={onCreate}
              ouiaId='lightwell-create-token-submit'
            >
              Create
            </Button>
            <Button
              key='cancel'
              variant='link'
              onClick={onClose}
              isDisabled={isPending}
              ouiaId='lightwell-create-token-cancel'
            >
              Cancel
            </Button>
          </Flex>
        )}
      </ModalFooter>
    </Modal>
  );
};

export default CreateTokenModal;
