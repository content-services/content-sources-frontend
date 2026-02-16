import { Table, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import PackageCount from 'components/PackageCount/PackageCount';
import StatusIcon from 'components/StatusIcon/StatusIcon';
import TdWithTooltip from 'components/TdWithTooltip/TdWithTooltip';
import { isEPELUrl } from 'helpers';
import { REPOSITORIES_ROUTE } from 'Routes/constants';
import { ContentOrigin } from 'services/Content/ContentApi';
import {
  useCustomRepositoriesApi,
  useCustomRepositoriesState,
  useDerivedState,
  useSort,
} from '../../store/CustomRepositoriesStore';
import { COLUMN_HEADERS } from '../../core/domain/constants';
import { FullRepository } from 'features/createAndEditTemplate/shared/types/types.repository';
import { useHref } from 'react-router-dom';
import { RepositoryName } from './CustomRepositoryName';

export const CustomRepositoriesTable = () => {
  const { repositoriesList } = useCustomRepositoriesState();

  return (
    <Table
      aria-label='custom repositories table'
      ouiaId='custom_repositories_table'
      variant='compact'
    >
      <CustomRepositoriesTableHeader />
      <Tbody>
        {repositoriesList.map((repository: FullRepository, rowIndex) => (
          <Tr key={repository.uuid}>
            <Checkbox rowData={repository} rowIndex={rowIndex} />
            <RepositoryName rowData={repository} />
            <Status rowData={repository} />
            <Packages rowData={repository} />
          </Tr>
        ))}
      </Tbody>
    </Table>
  );
};

const CustomRepositoriesTableHeader = () => {
  const { setSortProps } = useSort();

  return (
    <Thead>
      <Tr>
        <Th screenReaderText='empty' />
        {COLUMN_HEADERS.map((header, index) => (
          <Th
            width={index === 0 ? 50 : undefined}
            key={header + 'column'}
            sort={setSortProps(index)}
          >
            {header}
          </Th>
        ))}
      </Tr>
    </Thead>
  );
};

type CheckboxProps = {
  rowData: FullRepository;
  rowIndex: number;
};

const Checkbox = ({ rowData, rowIndex }: CheckboxProps) => {
  const { toggleSelected } = useCustomRepositoriesApi();
  const { isInOtherUUIDs } = useDerivedState();

  const isEPELRepository = (repo: FullRepository): boolean => {
    if (repo.origin === ContentOrigin.COMMUNITY) {
      return true;
    }
    return isEPELUrl(repo.url);
  };
  const isAnyEPELRepoSelected = isInOtherUUIDs(rowData.uuid) && isEPELRepository(rowData);
  const shouldDisableOtherEPEL =
    isEPELRepository(rowData) && isAnyEPELRepoSelected && !isInOtherUUIDs(rowData.uuid);
  const noSnapshotAvailable = !(rowData.snapshot && rowData.last_snapshot_uuid);

  return (
    <TdWithTooltip
      show={noSnapshotAvailable}
      tooltipProps={{
        content: 'Snapshot not yet available for this repository',
      }}
      select={{
        rowIndex,
        onSelect: () => toggleSelected(rowData.uuid),
        isSelected: isInOtherUUIDs(rowData.uuid),
        isDisabled: noSnapshotAvailable || shouldDisableOtherEPEL,
      }}
    />
  );
};

type StatusProps = {
  rowData: FullRepository;
};

const Status = ({ rowData }: StatusProps) => (
  <Td>
    <StatusIcon rowData={rowData} />
  </Td>
);

type PackagesProps = {
  rowData: FullRepository;
};

const Packages = ({ rowData }: PackagesProps) => {
  const path = useHref('content');
  const pathname = path.split('content')[0] + 'content';
  const href = pathname + '/' + REPOSITORIES_ROUTE + `/${rowData.uuid}/packages`;

  return (
    <Td>
      <PackageCount rowData={rowData} href={href} opensNewTab />
    </Td>
  );
};
