import {
  useTemplateRequestApi,
  useTemplateRequestState,
} from 'features/createAndEditTemplate/workflow/store/TemplateStore';
import { useCallback, useLayoutEffect, useMemo, useState } from 'react';
import { validateUserInput } from '../domain/validateUserInput';
import { InputAndValidateTemplateDetail } from '../ports';
import { TemplateDetail } from 'features/createAndEditTemplate/shared/types/types';

type ValidateDetail = {
  isValidated: 'error' | 'default';
  validateDetail: InputAndValidateTemplateDetail;
  error: string;
  text: TemplateDetail;
};

export const useValidateDetail = (): ValidateDetail => {
  const [error, setError] = useState('');
  const [text, setText] = useState('');

  const { setDetail } = useTemplateRequestApi();
  const { detail } = useTemplateRequestState();

  // read from TemplateStore in case it has been already filled
  // when the components is mounted, as it can be
  // (un)mounted number of times as a user browses
  useLayoutEffect(() => {
    if (detail) {
      setText(detail);
    }
  }, []);

  const validateDetail = useCallback((rawValue) => {
    const { data: validated, error } = validateUserInput('detail', rawValue);
    if (error) {
      setError(error);
      setText(rawValue);
      setDetail('');
    } else {
      setError('');
      setText(validated);
      setDetail(validated);
    }
  }, []);

  const isValidated = useMemo(() => (error ? 'error' : 'default'), [error]);

  return { validateDetail, error, text, isValidated };
};
