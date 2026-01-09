import { useHref } from 'react-router-dom';

import { Table, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';

import TdWithTooltip from 'components/TdWithTooltip/TdWithTooltip';
import PackageCount from 'components/PackageCount/PackageCount';
import StatusIcon from 'components/StatusIcon/StatusIcon';

import { isEPELUrl } from 'helpers';
import { ContentOrigin } from 'services/Content/ContentApi';

import { REPOSITORIES_ROUTE } from 'Routes/constants';
import { COLUMN_HEADERS } from '../../core/domain/constants';
import { FullRepository } from 'features/createTemplateWorkflow/shared/types.repository';

import {
  useOtherRepositoriesApi,
  useOtherRepositoriesState,
  useSort,
} from '../../store/OtherRepositoriesStore';
import { RepositoryName } from './OtherRepositoryName';

export const OtherRepositoriesTable = () => {
  const { repositoriesList } = useOtherRepositoriesState();

  return (
    <Table
      aria-label='custom repositories table'
      ouiaId='custom_repositories_table'
      variant='compact'
    >
      <OtherRepositoriesTableHeader />
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

const OtherRepositoriesTableHeader = () => {
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
  const { isInOtherUUIDs } = useOtherRepositoriesState();
  const { toggleCheckedOther } = useOtherRepositoriesApi();

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
        onSelect: () => toggleCheckedOther(rowData.uuid),
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
