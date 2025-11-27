import { useCallback, useLayoutEffect, useMemo, useState } from 'react';
import { useDescriptionSlice, useTemplateRequestApi } from '../../../store/TemplateRequestStore';
import { validateUserInput } from './validateUserInput';
import { TemplateTitle } from '../../../core/types';

type ValidateTitle = {
  isValidated: 'error' | 'default';
  validateTitle: (rawValue: string) => void;
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
    setText(title);
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
