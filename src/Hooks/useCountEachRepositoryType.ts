import { ContentOrigin } from 'services/Content/ContentApi';
import { useRepositoryCount } from 'services/Content/ContentQueries';

/**
 * Returns total sum of repositories in each of the 3 types:
 * - total sum of Redhat repositories
 * - total sum of EPEL repositories
 * - total sum of Custom repositories for an organization
 */
const useCountEachRepositoryType = () => {
  const { data: redhatCount = 0, isLoading: isLoadingRedhat } = useRepositoryCount(
    ContentOrigin.REDHAT,
  );
  const { data: epelCount = 0, isLoading: isLoadingEpel } = useRepositoryCount(
    ContentOrigin.COMMUNITY,
  );
  const { data: customCount = 0, isLoading: isLoadingCustom } = useRepositoryCount(
    ContentOrigin.CUSTOM,
  );

  return {
    redhatCount,
    epelCount,
    customCount,
    isLoading: isLoadingRedhat || isLoadingEpel || isLoadingCustom,
  };
};

export { useCountEachRepositoryType };
