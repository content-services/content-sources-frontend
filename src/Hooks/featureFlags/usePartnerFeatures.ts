import { useFeatureFlag } from './useFeatureFlag';

/**
 * Partner repositories feature flags.
 * - partnerReposOn: the partner feature and terminology are shown in this environment.
 * - isPartnerAdmin: the current user can administer partner repositories (mark as partner, publish snapshots).
 *   Requires partnerReposOn, so turning off the partner feature also hides the admin UI.
 */
export const usePartnerFeatures = () => {
  const partnerReposOn = useFeatureFlag('partnerrepos');
  const adminPartnerReposOn = useFeatureFlag('adminpartnerrepositories');

  return {
    partnerReposOn,
    isPartnerAdmin: partnerReposOn && adminPartnerReposOn,
  };
};
