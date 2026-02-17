import { useCallback, useMemo } from 'react';
import { useTemplateRequestState } from '../store/AddTemplateContext';
import { isDateValid } from 'helpers';

type CheckIfCurrentStepValid = (index: number) => boolean;

export const useCheckIsDisabledStep = () => {
  const templateRequest = useTemplateRequestState();

  const stepsValidArray = useMemo(() => {
    const {
      selectedArchitecture,
      selectedOSVersion,
      hardcodedUUIDs,
      snapshotDate,
      isLatestSnapshot,
      title,
    } = templateRequest;

    return [
      true,
      selectedArchitecture && selectedOSVersion,
      !!hardcodedUUIDs!.length,
      !!hardcodedUUIDs!.length,
      isLatestSnapshot || isDateValid(snapshotDate ?? ''),
      !!title,
    ] as boolean[];
  }, [templateRequest]);

  const checkIfCurrentStepValid: CheckIfCurrentStepValid = useCallback(
    (stepIndex: number) => {
      const stepsToCheck = stepsValidArray.slice(0, stepIndex + 1);
      return !stepsToCheck.every((step) => step);
    },
    [stepsValidArray],
  );

  return { checkIfCurrentStepValid };
};
