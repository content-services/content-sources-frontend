import { useCallback, useMemo } from 'react';
import { useAddTemplateContext } from '../store/AddTemplateContext';
import { isDateValid } from 'helpers';

type CheckIfCurrentStepValid = (index: number) => boolean;

export const useCheckIsDisabledStep = () => {
  const { templateRequest, selectedRedhatRepos } = useAddTemplateContext();

  const stepsValidArray = useMemo(() => {
    const { arch, date, name, version, use_latest } = templateRequest;

    return [
      true,
      arch && version,
      !!selectedRedhatRepos.size,
      true,
      use_latest || isDateValid(date ?? ''),
      !!name && name.length < 256,
    ] as boolean[];
  }, [templateRequest, selectedRedhatRepos.size]);

  const checkIfCurrentStepValid: CheckIfCurrentStepValid = useCallback(
    (stepIndex: number) => {
      const stepsToCheck = stepsValidArray.slice(0, stepIndex + 1);
      return !stepsToCheck.every((step) => step);
    },
    [selectedRedhatRepos.size, stepsValidArray],
  );

  return { checkIfCurrentStepValid };
};
