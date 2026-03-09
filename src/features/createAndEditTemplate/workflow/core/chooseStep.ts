import { useWizardContext } from '@patternfly/react-core';
import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

const DEFAULT_STEP_ID = 'define-content';

const stepIdToIndex: Record<string, number> = {
  'define-content': 2,
  'redhat-repositories': 3,
  'custom-repositories': 4,
  'set-up-date': 5,
  detail: 6,
  review: 7,
};

export const useInitialStep = () => {
  const [urlSearchParams, setUrlSearchParams] = useSearchParams();
  const tabParam = urlSearchParams.get('tab');

  const initialIndex = tabParam && stepIdToIndex[tabParam] ? stepIdToIndex[tabParam] : 2;

  useEffect(() => {
    if (!urlSearchParams.get('tab')) {
      setUrlSearchParams({ tab: DEFAULT_STEP_ID }, { replace: true });
    }
  }, []);

  return initialIndex;
};

// Component to sync URL with wizard state (must be inside Wizard)
export const WizardUrlSync = ({ onCancel }: { onCancel: () => void }) => {
  const { goToStepById, activeStep } = useWizardContext();
  const [urlSearchParams] = useSearchParams();

  const tabParam = urlSearchParams.get('tab');

  useEffect(() => {
    if (tabParam && tabParam !== activeStep?.id) {
      if (stepIdToIndex[tabParam]) {
        goToStepById(tabParam);
      } else if (tabParam === 'content') {
        goToStepById(DEFAULT_STEP_ID);
      } else {
        onCancel();
      }
    }
  }, [tabParam, activeStep?.id, goToStepById, onCancel]);

  return null;
};
