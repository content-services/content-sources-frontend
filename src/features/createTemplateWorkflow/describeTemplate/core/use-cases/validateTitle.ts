import { useCallback, useLayoutEffect, useMemo, useState } from 'react';
import { validateUserInput } from '../domain/validateUserInput';
import {
  useDescriptionSlice,
  useTemplateRequestApi,
} from 'features/createTemplateWorkflow/workflow/store/TemplateRequestStore';
import { ValidateTemplateTitle } from '../ports';
import { TemplateTitle } from 'features/createTemplateWorkflow/shared/types.simple';

type ValidateTitle = {
  isValidated: 'error' | 'default';
  validateTitle: ValidateTemplateTitle;
  error: string;
  text: TemplateTitle;
};

export const useValidateTitle = (): ValidateTitle => {
  const [error, setError] = useState('');
  const [text, setText] = useState('');

  const { setTitle } = useTemplateRequestApi();
  const { title } = useDescriptionSlice();

  // read from TemplateStore in case it has been already filled
  // when the components is mounted, as it can be
  // (un)mounted number of times as a user browses
  useLayoutEffect(() => {
    if (title) {
      setText(title);
    }
  }, []);

  const validateTitle = useCallback((rawValue) => {
    const { data: validated, error } = validateUserInput('title', rawValue);
    if (error) {
      setError(error);
      setText(rawValue);
      setTitle('');
    } else {
      setError('');
      setText(validated);
      setTitle(validated);
    }
  }, []);

  const isValidated = useMemo(() => (error ? 'error' : 'default'), [error]);

  return { validateTitle, error, text, isValidated };
};
