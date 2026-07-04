import { Breadcrumb, BreadcrumbItem, Grid, Stack, StackItem, Title } from '@patternfly/react-core';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';
import { createUseStyles } from 'react-jss';
import { useParams } from 'react-router-dom';

import EmptyTableState from 'components/EmptyTableState/EmptyTableState';
import Loader from 'components/Loader';
import useSafeUUIDParam from 'Hooks/useSafeUUIDParam';
import {
  useFetchContent,
  useLightwellRepositoryPackagesQuery,
} from 'services/Content/ContentQueries';

import { formatRepositoryName } from '../helpers';
import { useLightwellNavigate } from '../../../Hooks/useLightwellNavigate';

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
  const repoUUID = useSafeUUIDParam('repoUUID');
  const { packageName: packageNameParam = '' } = useParams();
  const { goToRepositories, goToRepositoryPackages } = useLightwellNavigate();
  const packageName = packageNameParam ? decodeURIComponent(packageNameParam) : '';

  const {
    data: repository,
    isLoading: isRepositoryLoading,
    isError: isRepositoryError,
    error: repositoryError,
  } = useFetchContent(repoUUID, !!repoUUID);

  const {
    data: packages,
    isLoading: isPackagesLoading,
    isError: isPackagesError,
    error: packagesError,
  } = useLightwellRepositoryPackagesQuery(repoUUID, 1, 100, packageName, !!repoUUID);

  if (isRepositoryLoading || !repository || isPackagesLoading || !packages) {
    return <Loader />;
  }

  if (!repoUUID || isRepositoryError) throw repositoryError;
  if (isPackagesError) throw packagesError;

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
              <BreadcrumbItem component='button' onClick={goToRepositories}>
                Lightwell
              </BreadcrumbItem>
              <BreadcrumbItem component='button' onClick={() => goToRepositoryPackages(repoUUID)}>
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
        <Stack>
          <EmptyTableState
            notFiltered
            clearFilters={() => undefined}
            itemName='package details'
            notFilteredBody='No details available yet for this package.'
          />
        </Stack>
      </Grid>
    </>
  );
};

export default PackageDetails;
