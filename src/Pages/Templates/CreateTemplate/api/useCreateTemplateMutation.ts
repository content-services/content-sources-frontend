import { AlertVariant } from '@patternfly/react-core';
import useErrorNotification from 'Hooks/useErrorNotification';
import useNotification from 'Hooks/useNotification';
import { useMutation, useQueryClient } from 'react-query';
import { createTemplate } from 'services/Templates/TemplateApi';
import { FETCH_TEMPLATE_KEY, GET_TEMPLATES_KEY } from 'services/Templates/TemplateQueries';
import { TemplateServer } from '../core/types.server';
import { TemplateRequestToSend } from '../core/types';
import { MutateTemplateRequest } from '../core/ports.output';

export const useCreateTemplateMutation = () => {
  const errorNotifier = useErrorNotification();
  const queryClient = useQueryClient();
  const { notify } = useNotification();

  const mutationFn: MutateTemplateRequest = (request) => createTemplate(request);

  const options = {
    onSuccess: (request) => {
      console.log('request SUCCESS', request);

      notify({
        variant: AlertVariant.success,
        title: `Content Template "${request.name}" created`,
      });

      queryClient.invalidateQueries(GET_TEMPLATES_KEY);
      queryClient.invalidateQueries(FETCH_TEMPLATE_KEY);
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (err: any) => {
      errorNotifier(
        'Error creating content template',
        'An error occurred',
        err,
        'create-template-error',
      );
    },
  };

  const mutation = useMutation<TemplateServer, Error, TemplateRequestToSend>(mutationFn, options);

  return mutation;
};
