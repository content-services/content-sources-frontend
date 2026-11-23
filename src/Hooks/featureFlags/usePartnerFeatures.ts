import { useFeatureFlag } from './useFeatureFlag';

/**
 * Partner repositories feature flags.
 * - partnerReposOn: the partner feature and terminology are shown when enabled for the
 *   environment or when the current user is a partner admin.
 * - isPartnerAdmin: the current user can administer partner repositories (mark as partner, publish snapshots).
 */
export const usePartnerFeatures = () => {
  const partnerReposFlagOn = useFeatureFlag('partnerrepos');
  const adminPartnerReposFlagOn = useFeatureFlag('adminpartnerrepositories');

  return {
    partnerReposOn: partnerReposFlagOn || adminPartnerReposFlagOn,
    isPartnerAdmin: adminPartnerReposFlagOn,
  };
};
