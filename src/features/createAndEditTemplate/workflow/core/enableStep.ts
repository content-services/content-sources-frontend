import { useCallback } from 'react';
import { useTemplateRequestState } from '../store/TemplateStore';

type Step = number;
type IsStepDisabled = boolean;

const checkIsEnabledDefineContent = () => true;

const checkAreEnabledAdditionalRepos = (templateRequest) => {
  const { selectedArchitecture, selectedOSVersion } = templateRequest;
  return !!selectedArchitecture && !!selectedOSVersion;
};

const checkAreEnabledOtherRepos = (templateRequest) => {
  const { hardcodedUUIDs } = templateRequest;
  return !!hardcodedUUIDs.length;
};

const checkAreEnabledRepositorySnapshots = (templateRequest) => {
  const { hardcodedUUIDs } = templateRequest;
  return !!hardcodedUUIDs.length;
};

const checkIsEnabledTemplateDescription = (templateRequest) => {
  const { isLatestSnapshot, snapshotDate } = templateRequest;
  return isLatestSnapshot || !!snapshotDate;
};

const checkIsEnabledTemplateReview = (templateRequest) => {
  const { isLatestSnapshot, snapshotDate, title } = templateRequest;
  return (isLatestSnapshot || !!snapshotDate) && !!title;
};

const STEPS = {
  '1': checkIsEnabledDefineContent,
  '2': checkAreEnabledAdditionalRepos,
  '3': checkAreEnabledOtherRepos,
  '4': checkAreEnabledRepositorySnapshots,
  '5': checkIsEnabledTemplateDescription,
  '6': checkIsEnabledTemplateReview,
};

export type CheckIfStepIsDisabled = (step: Step) => IsStepDisabled;

export const useCheckIsDisabledStep = () => {
  const templateRequest = useTemplateRequestState();

  const checkIsDisabledStep: CheckIfStepIsDisabled = useCallback(
    (step) => !STEPS[step](templateRequest),
    [templateRequest],
  );

  return { checkIsDisabledStep };
};
