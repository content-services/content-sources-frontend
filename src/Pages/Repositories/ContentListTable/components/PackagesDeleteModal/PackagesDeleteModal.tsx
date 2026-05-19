import {
  Button,
  Content,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  ModalVariant,
} from '@patternfly/react-core';
import useRootPath from 'Hooks/useRootPath';
import { useNavigate, useParams } from 'react-router-dom';
import { PACKAGES_ROUTE, REPOSITORIES_ROUTE } from 'Routes/constants';
import { usePackageModalOutletContext } from '../PackageModal/PackageModal';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useBulkRemoveRepositoryRpmsMutate } from 'services/Content/ContentQueries';
import EmptyTableDataView from 'components/EmptyTableDataView/EmptyTableDataView';
import { SkeletonTableBody } from '@patternfly/react-component-groups';
import { DataView } from '@patternfly/react-data-view/dist/dynamic/DataView';
import {
  DataViewTable,
  DataViewTh,
  DataViewTrObject,
} from '@patternfly/react-data-view/dist/dynamic/DataViewTable';
import {
  ContentOrigin,
  hasPackageUUID,
  PackageItem,
  PackageItemWithUUID,
} from 'services/Content/ContentApi';
import { useAppContext } from 'middleware/AppContext';

const useNavigateToPackagesModal = () => {
  const navigate = useNavigate();
  const rootPath = useRootPath();
  const { repoUUID = '' } = useParams();

  return () => navigate(`${rootPath}/${REPOSITORIES_ROUTE}/${repoUUID}/${PACKAGES_ROUTE}`);
};

const useOnCloseNavigate = () => {
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

const PackagesDeleteModal = () => {
  const queryClient = useQueryClient();
  const onClose = useNavigateToPackagesModal();
  const onCloseConfirm = useOnCloseNavigate();
  const { repoUUID = '' } = useParams();

  const {
    clearSelectedPackages,
    deletionContext: { selectedPackages },
  } = usePackageModalOutletContext();

  const { mutateAsync: removeRpms, isPending } = useBulkRemoveRepositoryRpmsMutate(
    queryClient,
    repoUUID,
  );

  useEffect(() => {
    if (!selectedPackages.length) {
      onClose();
    }
  }, [selectedPackages, onClose]);

  const onConfirm = async () => {
    const uuids = selectedPackages.map((p) => p.uuid);
    await removeRpms(uuids);
    clearSelectedPackages();
    onCloseConfirm();
  };

  return (
    <Modal
      onClose={onClose}
      position='top'
      variant={ModalVariant.large}
      ouiaId='delete_packages'
      aria-labelledby='delete-packages-modal'
      isOpen
    >
      <ModalHeader
        title='Delete packages?'
        labelId='delete-packages-modal'
        titleIconVariant='warning'
      />
      <ModalBody>
        <Content component='p'>
          {selectedPackages.length === 1
            ? 'Are you sure you want to delete this package? A new snapshot will be created without this package.'
            : `Are you sure you want to delete these ${selectedPackages.length} packages? A new snapshot will be created without these packages.`}
        </Content>
        <PackagesBasicTable items={selectedPackages} />
      </ModalBody>
      <ModalFooter>
        <Button
          key='confirm'
          ouiaId='delete_packages_confirm'
          variant='danger'
          isLoading={isPending}
          isDisabled={isPending || !selectedPackages.length}
          onClick={onConfirm}
        >
          Delete
        </Button>
        <Button key='cancel' variant='link' onClick={onClose} isDisabled={isPending}>
          Cancel
        </Button>
      </ModalFooter>
    </Modal>
  );
};

type BasicTable = {
  items: PackageItem[] | PackageItemWithUUID[];
};

const PackagesBasicTable = ({ items = [] }: BasicTable) => {
  // rows and columns
  const columns = [{ name: 'Name' }, { name: 'Architecture' }];
  const dataViewColumns: DataViewTh[] = columns.map(({ name }) => ({ cell: name }));
  const dataViewRows: DataViewTrObject[] = items.map((packageRpm) => {
    const { name, arch } = packageRpm;
    const cells = [{ cell: name }, { cell: arch }];

    if (hasPackageUUID(packageRpm)) {
      return {
        id: packageRpm.uuid,
        row: cells,
      };
    }
    return {
      id: `${name}-${arch}`,
      row: cells,
    };
  });

  // table states
  const ouiaId = 'confirm_delete_packages_table';
  const emptyStateTable = (
    <EmptyTableDataView
      ouiaId={ouiaId}
      variant='zero'
      itemName='packages'
      zeroBody='You may need to add packages to delete.'
      colSpan={columns.length}
    />
  );
  const loadingStateTable = (
    <SkeletonTableBody rowsCount={items.length} columnsCount={columns.length} />
  );
  return (
    <DataView data-ouia-component-id='packages_for_deletion_table'>
      <DataViewTable
        aria-label='Confirm Delete Packages Table'
        ouiaId={ouiaId}
        variant='compact'
        columns={dataViewColumns}
        rows={dataViewRows}
        bodyStates={{ empty: emptyStateTable, loading: loadingStateTable }}
      />
    </DataView>
  );
};

export default PackagesDeleteModal;
