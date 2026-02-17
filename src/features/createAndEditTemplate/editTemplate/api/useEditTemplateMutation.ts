import { useMutation, useQueryClient } from 'react-query';
import { AlertVariant } from '@patternfly/react-core';

import useErrorNotification from 'Hooks/useErrorNotification';
import useNotification from 'Hooks/useNotification';

import {
  FETCH_TEMPLATE_KEY,
  GET_TEMPLATE_PACKAGES_KEY,
  GET_TEMPLATES_KEY,
  TEMPLATE_ERRATA_KEY,
  TEMPLATE_SNAPSHOTS_KEY,
  TEMPLATES_FOR_SNAPSHOTS,
} from 'services/Templates/TemplateQueries';
import { FullTemplate } from 'features/createAndEditTemplate/shared/types/types.template.full';
import { EditTemplateToSend } from 'features/createAndEditTemplate/shared/types/types.compound';
import { editTemplate } from 'services/Templates/TemplateApi';
import { MutateEditTemplate } from '../core/ports';

export const useEditTemplateMutation = () => {
  const queryClient = useQueryClient();
  const errorNotifier = useErrorNotification();
  const { notify } = useNotification();

  const mutationFn: MutateEditTemplate = (request) => editTemplate(request);

  const options = {
    onSuccess: (response) => {
      notify({
        variant: AlertVariant.success,
        title: `Successfully edited template '${response.name}'`,
      });

      queryClient.invalidateQueries(GET_TEMPLATES_KEY);
      queryClient.invalidateQueries(FETCH_TEMPLATE_KEY);
      queryClient.invalidateQueries(GET_TEMPLATE_PACKAGES_KEY);
      queryClient.invalidateQueries(TEMPLATE_ERRATA_KEY);
      queryClient.invalidateQueries(TEMPLATES_FOR_SNAPSHOTS);
      queryClient.invalidateQueries(TEMPLATE_SNAPSHOTS_KEY);
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (err: any, request) => {
      errorNotifier(
        `Error editing template '${request.name}'`,
        'An error occurred',
        err,
        'edit-template-error',
      );
    },
  };

  const mutation = useMutation<FullTemplate, Error, EditTemplateToSend>(mutationFn, options);

  return mutation;
};
