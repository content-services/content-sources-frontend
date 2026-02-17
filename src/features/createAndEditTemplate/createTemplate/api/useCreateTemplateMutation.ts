import { useMutation, useQueryClient } from 'react-query';
import { AlertVariant } from '@patternfly/react-core';

import useErrorNotification from 'Hooks/useErrorNotification';
import useNotification from 'Hooks/useNotification';

import { FETCH_TEMPLATE_KEY, GET_TEMPLATES_KEY } from 'services/Templates/TemplateQueries';

import { createTemplate } from 'services/Templates/TemplateApi';
import { FullTemplate } from 'features/createAndEditTemplate/shared/types/types.template.full';
import { TemplateRequestToSend } from 'features/createAndEditTemplate/shared/types/types.compound';
import { MutateTemplateRequest } from '../core/ports';

export const useCreateTemplateMutation = () => {
  const queryClient = useQueryClient();
  const errorNotifier = useErrorNotification();
  const { notify } = useNotification();

  const mutationFn: MutateTemplateRequest = (request) => createTemplate(request);

  const options = {
    onSuccess: (response) => {
      notify({
        variant: AlertVariant.success,
        title: `Content Template "${response.name}" created`,
      });

      queryClient.invalidateQueries(GET_TEMPLATES_KEY);
      queryClient.invalidateQueries(FETCH_TEMPLATE_KEY);
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (err: any, request) => {
      errorNotifier(
        `Error creating content template '${request.name}'`,
        'An error occurred',
        err,
        'create-template-error',
      );
    },
  };

  const mutation = useMutation<FullTemplate, Error, TemplateRequestToSend>(mutationFn, options);

  return mutation;
};
