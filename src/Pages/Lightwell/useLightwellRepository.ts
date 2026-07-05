import { useContentListQuery } from 'services/Content/ContentQueries';
import { ContentItem } from 'services/Content/ContentApi';
import { LIGHTWELL_FEATURE_NAME } from './constants';
import { getRepositoryNameFromPathSlug } from './helpers';

interface UseLightwellRepositoryResult {
  repository: ContentItem | undefined;
  repoUUID: string;
  isLoading: boolean;
  isError: boolean;
  error: unknown;
}

const useLightwellRepository = (repoSlug: string): UseLightwellRepositoryResult => {
  const repositoryName = getRepositoryNameFromPathSlug(repoSlug);

  const { data, isLoading, isError, error } = useContentListQuery(
    1,
    1,
    { feature_name: LIGHTWELL_FEATURE_NAME, name: repositoryName },
    '',
    [],
    !!repositoryName,
  );

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
