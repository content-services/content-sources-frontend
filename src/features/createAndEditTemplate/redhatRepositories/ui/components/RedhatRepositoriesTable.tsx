import { Table, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import ConditionalTooltip from 'components/ConditionalTooltip/ConditionalTooltip';
import PackageCount from 'components/PackageCount/PackageCount';
import TdWithTooltip from 'components/TdWithTooltip/TdWithTooltip';
import UrlWithExternalIcon from 'components/UrlWithLinkIcon/UrlWithLinkIcon';
import { reduceStringToCharsWithEllipsis } from 'helpers';
import { REPOSITORIES_ROUTE } from 'Routes/constants';
import {
  useDerivedState,
  useRedhatRepositoriesApi,
  useRedhatRepositoriesState,
  useSort,
} from '../../store/RedhatRepositoriesStore';
import { useHref } from 'react-router-dom';
import { COLUMN_HEADERS } from '../../core/domain/constants';
import { FullRepository } from 'features/createAndEditTemplate/shared/types/types.repository';

export const RedhatRepositoriesTable = () => {
  const { repositoriesList } = useRedhatRepositoriesState();
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
  const { toggleSelected } = useRedhatRepositoriesApi();

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
        onSelect: () => toggleSelected(rowData.uuid),
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
  const formattedName = reduceStringToCharsWithEllipsis(name, 60);
  const formattedUrl = reduceStringToCharsWithEllipsis(url);
  return (
    <Td>
      <ConditionalTooltip show={name.length > 60} content={name}>
        <>{formattedName}</>
      </ConditionalTooltip>
      <ConditionalTooltip show={url.length > 50} content={url}>
        <UrlWithExternalIcon href={url} customText={formattedUrl} />
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
