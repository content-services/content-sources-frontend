import { Button, Modal, ModalFooter, ModalHeader, ModalVariant } from '@patternfly/react-core';
import { InnerScrollContainer } from '@patternfly/react-table';
import { useCallback, useEffect, useMemo } from 'react';
import { ContentOrigin, PackageItemWithUUID } from 'services/Content/ContentApi';
import { useFetchContent, useGetPackagesQuery } from 'services/Content/ContentQueries';
import { Outlet, useNavigate, useOutletContext, useParams } from 'react-router-dom';
import useRootPath from 'Hooks/useRootPath';
import { useAppContext } from 'middleware/AppContext';
import PackagesTableWithToolbars, {
  usePackagesTableSelection,
} from 'components/SharedTables/PackagesTable';
import { REPOSITORIES_ROUTE } from 'Routes/constants';
import { usePackageTableFilters } from 'components/SharedTables/PackagesTable/usePackageTableFilters';
import { usePackageTablePagination } from 'components/SharedTables/PackagesTable/usePackageTablePagination';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';

const perPageKey = 'packagePerPage';

export const useOnCloseNavigate = () => {
  const { contentOrigin } = useAppContext();
  const rootPath = useRootPath();
  const navigate = useNavigate();
  const onClose = () =>
    navigate(
      `${rootPath}/${REPOSITORIES_ROUTE}` +
        (contentOrigin.length === 1 && contentOrigin[0] === ContentOrigin.REDHAT
          ? `?origin=${contentOrigin}`
          : ''),
    );

  return onClose;
};

export const useEnableDelete = (repoUUID) => {
  const { data: repository, isError } = useFetchContent(repoUUID);

  const isUploadRepository = repository?.origin === ContentOrigin.UPLOAD;

  return [isUploadRepository, isError];
};

export default function PackageModal() {
  const { repoUUID } = useParams();

  const onClose = useOnCloseNavigate();

  const filterData = usePackageTableFilters();
  const { debouncedSearch } = filterData;

  const [isUploadRepository, isFetchRepoError] = useEnableDelete(repoUUID);

  const selection = usePackagesTableSelection();
  const { onSelect, selected } = selection;

  const paginationData = usePackageTablePagination({ perPageKey });
  const { page, perPage } = paginationData;

  const {
    isLoading,
    isFetching,
    isError,
    data = { data: [], meta: { count: 0, limit: 20, offset: 0 } },
  } = useGetPackagesQuery(repoUUID as string, page, perPage, debouncedSearch);

  useEffect(() => {
    if (isError || isFetchRepoError) {
      onClose();
    }
  }, [isError, isFetchRepoError]);

  const {
    data: packagesList = [],
    meta: { count = 0 },
  } = data;

  const paginationProps = {
    itemCount: count,
    ...paginationData,
  };

  // required for outlet to confirm delete packages
  const clearSelectedPackages = useCallback(() => onSelect(false), [onSelect]);

  const selectedPackages = useMemo(() => {
    const ids = selected.map((s) => s.id);
    return packagesList.filter((p) => ids.includes(p.uuid));
  }, [selected, packagesList]);

  const outletData = { clearSelectedPackages, deletionContext: { selectedPackages } };

  return (
    <>
      <Outlet context={outletData} />
      <Modal
        key={repoUUID}
        position='top'
        ouiaId='rpm_package_modal'
        variant={ModalVariant.medium}
        isOpen
        onClose={onClose}
        aria-labelledby='rpm-package-modal-title'
        aria-describedby='rpm-package-modal-description'
      >
        <ModalHeader
          title='Packages'
          labelId='rpm-package-modal-title'
          description='View list of packages'
          descriptorId='rpm-package-modal-description'
        />
        <InnerScrollContainer>
          <div className={spacing.pSm}>
            <PackagesTableWithToolbars
              packagesList={packagesList}
              paginationProps={paginationProps}
              isFetching={isFetching}
              isLoading={isLoading}
              count={count}
              filterProps={{ ...filterData }}
              selection={selection}
              enabledBulkDelete={isUploadRepository}
              enabledRowActions={isUploadRepository}
            />
          </div>
        </InnerScrollContainer>
        <ModalFooter>
          <Button key='close' variant='secondary' onClick={onClose}>
            Close
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
}

export const usePackageModalOutletContext = () =>
  useOutletContext<{
    clearSelectedPackages: () => void;
    deletionContext: {
      selectedPackages: PackageItemWithUUID[];
    };
  }>();
