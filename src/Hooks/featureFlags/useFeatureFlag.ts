import { useAppContext } from 'middleware/AppContext';
import { Features, isFeatureOn } from 'services/Features/FeatureApi';

/**
 * Returns whether a backend feature flag is on for the current user (enabled and accessible).
 */
export const useFeatureFlag = (name: keyof Features): boolean => {
  const { features } = useAppContext();
  return isFeatureOn(features?.[name]);
};
