import { useContentListQuery } from 'services/Content/ContentQueries';
import { ContentItem } from 'services/Content/ContentApi';
import { LIGHTWELL_FEATURE_NAME } from './constants';
import { getRepositoryNameFromPathSlug } from './helpers';
import { useLightwellDemo } from './LightwellDemoContext';
import { getMockLightwellRepositoryBySlug } from './mockRepositories';

interface UseLightwellRepositoryResult {
  repository: ContentItem | undefined;
  repoUUID: string;
  isLoading: boolean;
  isError: boolean;
  error: unknown;
}

const useLightwellRepository = (repoSlug: string): UseLightwellRepositoryResult => {
  const isDemo = useLightwellDemo();
  const repositoryName = getRepositoryNameFromPathSlug(repoSlug);

  const { data, isLoading, isError, error } = useContentListQuery(
    1,
    1,
    { feature_name: LIGHTWELL_FEATURE_NAME, name: repositoryName },
    '',
    [],
    !!repositoryName && !isDemo,
  );

  if (isDemo) {
    const mockRepo = getMockLightwellRepositoryBySlug(repoSlug);
    return {
      repository: mockRepo,
      repoUUID: mockRepo?.uuid ?? '',
      isLoading: false,
      isError: false,
      error: undefined,
    };
  }

  const repository = data?.data[0];

  return {
    repository,
    repoUUID: repository?.uuid ?? '',
    isLoading,
    isError,
    error,
  };
};

export default useLightwellRepository;
