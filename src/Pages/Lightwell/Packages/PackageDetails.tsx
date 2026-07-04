import { Breadcrumb, BreadcrumbItem, Grid, Stack, StackItem, Title } from '@patternfly/react-core';
import { SkeletonTable } from '@patternfly/react-component-groups';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import { useQuery } from '@tanstack/react-query';
import { createUseStyles } from 'react-jss';
import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { TableVariant } from '@patternfly/react-table';

import EmptyTableState from 'components/EmptyTableState/EmptyTableState';
import Hide from 'components/Hide/Hide';
import Loader from 'components/Loader';
import {
  useContentListQuery,
  useFetchContent,
  useLightwellRepositoryPackagesQuery,
} from 'services/Content/ContentQueries';

import { LIGHTWELL_FEATURE_NAME, LIGHTWELL_USE_MOCK } from '../constants';
import { findRepositoryByPathSlug, formatRepositoryName } from '../helpers';
import { getMockLightwellPackages } from '../mockPackages';
import { getMockLightwellRepositoryBySlug } from '../mockRepositories';

const useStyles = createUseStyles({
  topContainer: {
    padding: '16px 24px',
  },
  titleWrapper: {
    padding: '24px 0 0',
  },
});

const PackageDetails = () => {
  const classes = useStyles();
  const navigate = useNavigate();
  const { repoName: repoSlug = '', packageName: packageNameParam = '' } = useParams();
  const packageName = packageNameParam ? decodeURIComponent(packageNameParam) : '';

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
  const apiPackagesQuery = useLightwellRepositoryPackagesQuery(
    repoUUID,
    1,
    100,
    '',
    !!repoUUID && !useMock,
  );

  const {
    data: repository,
    isLoading: isRepositoryLoading,
    isError,
    error,
  } = useMock ? mockRepositoryQuery : apiRepositoryQuery;

  const isResolvingRepository = useMock
    ? isRepositoryLoading
    : apiRepositoryListQuery.isLoading || isRepositoryLoading;

  const packageItem = useMemo(() => {
    if (useMock) {
      return getMockLightwellPackages(repoUUID).find((pkg) => pkg.name === packageName);
    }

    return (apiPackagesQuery.data?.results ?? []).find((pkg) => pkg.name === packageName);
  }, [useMock, repoUUID, packageName, apiPackagesQuery.data?.results]);

  const isLoadingPackages = useMock
    ? false
    : apiPackagesQuery.isLoading || apiPackagesQuery.isFetching;

  if (isResolvingRepository || !repository) {
    return <Loader />;
  }

  if (!repoUUID || isError) throw error;
  if (!useMock && apiPackagesQuery.isError) throw apiPackagesQuery.error;

  const repositoryName = formatRepositoryName(
    repository.content_type,
    repository.security_level,
    repository.name,
  );

  return (
    <>
      <Grid className={classes.topContainer}>
        <Stack>
          <StackItem>
            <Breadcrumb ouiaId='lightwell-package-details-breadcrumb'>
              <BreadcrumbItem
                component='button'
                onClick={() => navigate('../..', { relative: 'path' })}
              >
                Lightwell
              </BreadcrumbItem>
              <BreadcrumbItem
                component='button'
                onClick={() => navigate('..', { relative: 'path' })}
              >
                {repositoryName}
              </BreadcrumbItem>
              <BreadcrumbItem disabled>{packageName || '—'}</BreadcrumbItem>
            </Breadcrumb>
          </StackItem>
          <StackItem className={classes.titleWrapper}>
            <Title headingLevel='h1' ouiaId='lightwell-package-details-header'>
              {packageName || 'Package details'}
            </Title>
          </StackItem>
        </Stack>
      </Grid>

      <Grid className={spacing.pxLg}>
        <Hide hide={!isLoadingPackages}>
          <SkeletonTable rows={5} columnsCount={4} variant={TableVariant.compact} />
        </Hide>

        <Hide hide={isLoadingPackages || !packageItem}>
          <Stack>
            <EmptyTableState
              notFiltered
              clearFilters={() => undefined}
              itemName='package details'
              notFilteredBody='No package details available yet for this package.'
            />
          </Stack>
        </Hide>
      </Grid>
    </>
  );
};

export default PackageDetails;
