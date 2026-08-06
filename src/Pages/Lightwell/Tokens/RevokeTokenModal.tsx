import {
  Button,
  Content,
  Flex,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  ModalVariant,
} from '@patternfly/react-core';

import { useRevokeLightwellToken } from 'services/LightwellTokens/LightwellTokensQueries';
import type { LightwellTokenResponse } from 'services/LightwellTokens/LightwellTokensApi';

type RevokeTokenModalProps = {
  token: Pick<LightwellTokenResponse, 'uuid' | 'name'>;
  onClose: () => void;
};

const RevokeTokenModal = ({ token, onClose }: RevokeTokenModalProps) => {
  const { mutateAsync: revokeToken, isPending } = useRevokeLightwellToken();

  const onRevoke = async () => {
    try {
      await revokeToken(token.uuid);
      onClose();
    } catch {
      // Error toast is handled by the mutation
    }
  };

  return (
    <Modal
      variant={ModalVariant.medium}
      position='top'
      isOpen
      onClose={onClose}
      aria-labelledby='lightwell-revoke-token-modal-title'
      ouiaId='lightwell-revoke-token-modal'
    >
      <ModalHeader
        title='Revoke access token?'
        labelId='lightwell-revoke-token-modal-title'
        titleIconVariant='warning'
      />
      <ModalBody>
        <Content component='p'>
          Token <b>{token.name}</b> will be revoked immediately and can no longer be used. This
          action cannot be undone.
        </Content>
      </ModalBody>
      <ModalFooter>
        <Flex columnGap={{ default: 'columnGapLg' }}>
          <Button
            key='confirm'
            variant='danger'
            isLoading={isPending}
            isDisabled={isPending}
            onClick={onRevoke}
            ouiaId='lightwell-revoke-token-confirm'
          >
            Revoke
          </Button>
          <Button
            key='cancel'
            variant='link'
            onClick={onClose}
            isDisabled={isPending}
            ouiaId='lightwell-revoke-token-cancel'
          >
            Cancel
          </Button>
        </Flex>
      </ModalFooter>
    </Modal>
  );
};

export default RevokeTokenModal;
