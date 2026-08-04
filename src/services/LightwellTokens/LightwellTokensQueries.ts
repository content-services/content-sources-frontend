import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AlertVariant } from '@patternfly/react-core';

import useErrorNotification from 'Hooks/useErrorNotification';
import useNotification from 'Hooks/useNotification';
import {
  createLightwellToken,
  listLightwellTokens,
  revokeLightwellToken,
  type LightwellTokenCreateRequest,
} from './LightwellTokensApi';

export const LIGHTWELL_TOKENS_KEY = 'LIGHTWELL_TOKENS_KEY';

export const useLightwellTokensQuery = (enabled = true) =>
  useQuery({
    queryKey: [LIGHTWELL_TOKENS_KEY],
    queryFn: listLightwellTokens,
    meta: {
      title: 'Unable to load access tokens',
      id: 'lightwell-tokens-list-error',
    },
    placeholderData: keepPreviousData,
    staleTime: 20000,
    enabled,
  });

export const useCreateLightwellToken = () => {
  const queryClient = useQueryClient();
  const errorNotifier = useErrorNotification();
  const { notify } = useNotification();

  return useMutation({
    mutationFn: (request: LightwellTokenCreateRequest) => createLightwellToken(request),
    onSuccess: (data) => {
      notify({
        variant: AlertVariant.success,
        title: `Access token "${data.name}" created`,
      });
      queryClient.invalidateQueries({ queryKey: [LIGHTWELL_TOKENS_KEY] });
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (err: any) => {
      errorNotifier(
        'Error creating access token',
        'An error occurred',
        err,
        'create-lightwell-token-error',
      );
    },
  });
};

export const useRevokeLightwellToken = () => {
  const queryClient = useQueryClient();
  const errorNotifier = useErrorNotification();
  const { notify } = useNotification();

  return useMutation({
    mutationFn: (uuid: string) => revokeLightwellToken(uuid),
    onSuccess: () => {
      notify({
        variant: AlertVariant.success,
        title: 'Access token revoked',
      });
      queryClient.invalidateQueries({ queryKey: [LIGHTWELL_TOKENS_KEY] });
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (err: any) => {
      errorNotifier(
        'Error revoking access token',
        'An error occurred',
        err,
        'revoke-lightwell-token-error',
      );
    },
  });
};
