import { Breadcrumb, BreadcrumbItem, Grid, Stack, StackItem, Title } from '@patternfly/react-core';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import { useQuery } from '@tanstack/react-query';
import { createUseStyles } from 'react-jss';
import { useNavigate } from 'react-router-dom';

import EmptyTableState from 'components/EmptyTableState/EmptyTableState';
import Loader from 'components/Loader';
import useSafeUUIDParam from 'Hooks/useSafeUUIDParam';
import { useContentListQuery } from 'services/Content/ContentQueries';

import { getMockLightwellRepository } from '../mockRepositories';
import { LIGHTWELL_FEATURE_NAME } from '../constants';
import { useState } from 'react';
import { FilterData } from 'services/Content/ContentApi';

const useStyles = createUseStyles({
  topContainer: {
    padding: '16px 24px',
  },
  titleWrapper: {
    padding: '24px 0 0',
  },
});

const PackagesList = () => {
  const classes = useStyles();
  const repoUUID = useSafeUUIDParam('repoUUID');
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const useMock = false;
  const [filters, setFilters] = useState<FilterData>({
    feature_name: LIGHTWELL_FEATURE_NAME,
  });

  const mockQuery = useQuery({
    queryKey: ['lightwell-repository-mock', repoUUID],
    queryFn: () => {
      const repository = getMockLightwellRepository(repoUUID);
      if (!repository) {
        throw new Error('Lightwell repository not found');
      }
      return repository;
    },
    staleTime: 20000,
    enabled: useMock && !!repoUUID,
  });

  // const apiQuery = useFetchContent(repoUUID, !!repoUUID && !useMock);

  const apiQuery = useContentListQuery(page, 1, filters, '', [], !useMock);

  const {
    isLoading,
    isError,
    error,
    data = { data: [], meta: { count: 0, limit: 1, offset: 0 } },
  } = useMock ? mockQuery : apiQuery;

  const clearFilters = () => {
    setFilters({ search: '', feature_name: LIGHTWELL_FEATURE_NAME });
    setPage(1);
  };

  // const { data: repository, isLoading, isError, error } = useMock ? mockQuery : apiQuery;

  if (isError) throw error;

  if (isLoading) {
    return <Loader />;
  }

  return (
    <>
      <Grid className={classes.topContainer}>
        <Stack>
          <StackItem>
            <Breadcrumb ouiaId='lightwell-packages-breadcrumb'>
              <BreadcrumbItem component='button' onClick={() => navigate('..')}>
                Repositories
              </BreadcrumbItem>
              <BreadcrumbItem disabled>Packages</BreadcrumbItem>
            </Breadcrumb>
          </StackItem>
          <StackItem className={classes.titleWrapper}>
            <Title headingLevel='h1' ouiaId='lightwell-packages-header'>
              {data[0]?.name}
            </Title>
          </StackItem>
        </Stack>
      </Grid>
      <Grid className={`${spacing.pxLg} ${spacing.ptMd}`}>
        <EmptyTableState
          notFiltered
          itemName='packages'
          notFilteredBody='No packages are available in this repository yet.'
          clearFilters={clearFilters}
        />
      </Grid>
    </>
  );
};

export default PackagesList;
