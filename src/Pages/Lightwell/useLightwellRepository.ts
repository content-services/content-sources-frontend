import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';

import { useContentListQuery, useFetchContent } from 'services/Content/ContentQueries';
import { ContentItem } from 'services/Content/ContentApi';

import { LIGHTWELL_FEATURE_NAME, LIGHTWELL_USE_MOCK } from './constants';
import { findRepositoryByPathSlug } from './helpers';
import { getMockLightwellRepositoryBySlug } from './mockRepositories';

interface UseLightwellRepositoryResult {
  repository: ContentItem | undefined;
  repoUUID: string;
  isLoading: boolean;
  isError: boolean;
  error: unknown;
}

const useLightwellRepository = (repoSlug: string): UseLightwellRepositoryResult => {
  const useMock = LIGHTWELL_USE_MOCK;

  const mockRepositoryQuery = useQuery({
    queryKey: ['lightwell-repository-mock', repoSlug],
    queryFn: () => {
      const mockRepository = getMockLightwellRepositoryBySlug(repoSlug);
      if (!mockRepository) {
        throw new Error('Lightwell repository not found');
      }
      return mockRepository;
    },
    staleTime: 20000,
    enabled: useMock && !!repoSlug,
  });

  const apiRepositoryListQuery = useContentListQuery(
    1,
    100,
    { feature_name: LIGHTWELL_FEATURE_NAME },
    '',
    [],
    !useMock && !!repoSlug,
  );

  const repoUUID = useMemo(() => {
    if (useMock) {
      return mockRepositoryQuery.data?.uuid ?? '';
    }

    return findRepositoryByPathSlug(apiRepositoryListQuery.data?.data ?? [], repoSlug)?.uuid ?? '';
  }, [useMock, mockRepositoryQuery.data?.uuid, apiRepositoryListQuery.data?.data, repoSlug]);

  const apiRepositoryQuery = useFetchContent(repoUUID, !!repoUUID && !useMock);

  const {
    data: repository,
    isLoading: isRepositoryLoading,
    isError,
    error,
  } = useMock ? mockRepositoryQuery : apiRepositoryQuery;

  const isLoading = useMock
    ? isRepositoryLoading
    : apiRepositoryListQuery.isLoading || isRepositoryLoading;

  return { repository, repoUUID, isLoading, isError, error };
};

export default useLightwellRepository;
