import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AlertVariant } from '@patternfly/react-core';
import useErrorNotification from 'Hooks/useErrorNotification';
import useNotification from 'Hooks/useNotification';
import { CONTENT_LIST_KEY } from 'services/Content/ContentQueries';
import { toggleAsPartner } from './PartnerReposApi';

export const useToggleAsPartnerMutate = () => {
  const queryClient = useQueryClient();
  const errorNotifier = useErrorNotification();
  const { notify } = useNotification();

  return useMutation({
    mutationFn: ({ uuid, partner }: { uuid: string; partner: boolean }) =>
      toggleAsPartner(uuid, partner),
    onSuccess: () => {
      notify({
        variant: AlertVariant.success,
        title: 'Repository marked as partner',
      });
      queryClient.invalidateQueries({ queryKey: [CONTENT_LIST_KEY] });
    },
    onError: (err) => {
      errorNotifier(
        'Error marking repository as partner',
        'An error occurred',
        err,
        'toggle-as-partner-error',
      );
    },
  });
};
