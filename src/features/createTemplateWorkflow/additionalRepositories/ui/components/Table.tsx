import { useHref } from 'react-router-dom';

import { Table, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';

import ConditionalTooltip from 'components/ConditionalTooltip/ConditionalTooltip';
import TdWithTooltip from 'components/TdWithTooltip/TdWithTooltip';
import UrlWithExternalIcon from 'components/UrlWithLinkIcon/UrlWithLinkIcon';
import PackageCount from 'components/PackageCount/PackageCount';

import { reduceStringToCharsWithEllipsis } from 'helpers';
import { REPOSITORIES_ROUTE } from 'Routes/constants';
import { COLUMN_HEADERS } from '../../core/domain/constants';

import {
  useAdditionalRepositoriesApi,
  useAdditionalRepositoriesState,
  useDerivedState,
  useSort,
} from '../../store/AdditionalRepositoriesStore';
import { FullRepository } from 'features/createTemplateWorkflow/shared/types.repository';

export const RedhatRepositoriesTable = () => {
  const { repositoriesList } = useAdditionalRepositoriesState();
  return (
    <Table
      aria-label='Redhat repositories table'
      ouiaId='redhat_repositories_table'
      variant='compact'
    >
      <RedhatRepositoriesTableHeader />
      <Tbody>
        {repositoriesList.map((repository, rowIndex) => (
          <Tr key={repository.uuid}>
            <Checkbox rowData={repository} rowIndex={rowIndex} />
            <RepositoryName rowData={repository} />
            <Advisories rowData={repository} />
            <Packages rowData={repository} />
          </Tr>
        ))}
      </Tbody>
    </Table>
  );
};

const RedhatRepositoriesTableHeader = () => {
  const { setSortProps } = useSort();

  return (
    <Thead>
      <Tr>
        <Th screenReaderText='empty' />
        {COLUMN_HEADERS.map((header, index) => (
          <Th key={header + 'column'} sort={setSortProps(index)}>
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
  const { isInRedhatUUIDs, isInHardcodedUUIDs } = useDerivedState();
  const { toggleCheckedAdditional } = useAdditionalRepositoriesApi();

  const isHardcodedRedhatRepo = (rowData) =>
    !(rowData.snapshot && rowData.last_snapshot_uuid) || isInHardcodedUUIDs(rowData.uuid);

  return (
    <TdWithTooltip
      show={isHardcodedRedhatRepo(rowData)}
      tooltipProps={{
        content: isInHardcodedUUIDs(rowData.uuid)
          ? 'This item is pre-selected for the chosen architecture and OS version.'
          : 'A snapshot is not yet available for this repository.',
      }}
      select={{
        rowIndex,
        onSelect: () => toggleCheckedAdditional(rowData.uuid),
        isSelected: isInRedhatUUIDs(rowData.uuid),
        isDisabled: isHardcodedRedhatRepo(rowData),
      }}
    />
  );
};

type RepositoryNameProps = {
  rowData: FullRepository;
};

const RepositoryName = ({ rowData }: RepositoryNameProps) => {
  const { name, url } = rowData;
  return (
    <Td>
      <ConditionalTooltip show={name.length > 60} content={name}>
        <>{reduceStringToCharsWithEllipsis(name, 60)}</>
      </ConditionalTooltip>
      <ConditionalTooltip show={url.length > 50} content={url}>
        <UrlWithExternalIcon href={url} customText={reduceStringToCharsWithEllipsis(url)} />
      </ConditionalTooltip>
    </Td>
  );
};

type AdvisoriesProps = {
  rowData: FullRepository;
};

const Advisories = ({ rowData }: AdvisoriesProps) => (
  <Td>{rowData.last_snapshot?.content_counts?.['rpm.advisory'] || '-'}</Td>
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
