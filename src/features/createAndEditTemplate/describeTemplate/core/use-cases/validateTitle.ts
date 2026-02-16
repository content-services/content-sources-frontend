import { useCallback, useLayoutEffect, useMemo, useState } from 'react';
import { InputAndValidateTemplateTitle } from '../ports';
import {
  useTemplateRequestApi,
  useTemplateRequestState,
} from 'features/createAndEditTemplate/workflow/store/TemplateStore';
import { TemplateTitle } from 'features/createAndEditTemplate/shared/types/types';
import { validateUserInput } from '../domain/validateUserInput';

type ValidateTitle = {
  isValidated: 'error' | 'default';
  validateTitle: InputAndValidateTemplateTitle;
  error: string;
  text: TemplateTitle;
};

export const useValidateTitle = (): ValidateTitle => {
  const [error, setError] = useState('');
  const [text, setText] = useState('');

  const { setTitle } = useTemplateRequestApi();
  const { title } = useTemplateRequestState();

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
