import { Table, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import ConditionalTooltip from 'components/ConditionalTooltip/ConditionalTooltip';
import PackageCount from 'components/PackageCount/PackageCount';
import TdWithTooltip from 'components/TdWithTooltip/TdWithTooltip';
import UrlWithExternalIcon from 'components/UrlWithLinkIcon/UrlWithLinkIcon';
import { reduceStringToCharsWithEllipsis } from 'helpers';
import { REPOSITORIES_ROUTE } from 'Routes/constants';
import { ContentItem } from 'services/Content/ContentApi';
import { useRedhatRepositoriesApi } from '../../../../createAndEditTemplate/redhatRepositories/store/RedhatRepositoriesStore';
import { useHref } from 'react-router-dom';

export const RedhatRepositoriesTable = () => {
  const {
    columnHeaders,
    contentList,
    sortParams,
    toggleSelected,
    isInHardcodedUUIDs,
    isInRedhatUUIDs,
  } = useRedhatRepositoriesApi();

  const path = useHref('content');
  const pathname = path.split('content')[0] + 'content';

  return (
    <Table
      aria-label='Redhat repositories table'
      ouiaId='redhat_repositories_table'
      variant='compact'
    >
      <Thead>
        <Tr>
          <Th screenReaderText='empty' />
          {columnHeaders.map((columnHeader, index) => (
            <Th key={columnHeader + 'column'} sort={sortParams(index)}>
              {columnHeader}
            </Th>
          ))}
        </Tr>
      </Thead>
      <Tbody>
        {contentList.map((rowData: ContentItem, rowIndex) => {
          const { uuid, name, url } = rowData;
          const isHardcodedRedhatRepo = (rowData) =>
            !(rowData.snapshot && rowData.last_snapshot_uuid) || isInHardcodedUUIDs(rowData.uuid);
          return (
            <Tr key={uuid}>
              <TdWithTooltip
                show={isHardcodedRedhatRepo(rowData)}
                tooltipProps={{
                  content: isInHardcodedUUIDs(rowData.uuid)
                    ? 'This item is pre-selected for the chosen architecture and OS version.'
                    : 'A snapshot is not yet available for this repository.',
                }}
                select={{
                  rowIndex,
                  onSelect: () => toggleSelected(uuid),
                  isSelected: isInRedhatUUIDs(rowData.uuid),
                  isDisabled: isHardcodedRedhatRepo(rowData),
                }}
              />
              <Td>
                <ConditionalTooltip show={name.length > 60} content={name}>
                  <>{reduceStringToCharsWithEllipsis(name, 60)}</>
                </ConditionalTooltip>
                <ConditionalTooltip show={url.length > 50} content={url}>
                  <UrlWithExternalIcon
                    href={url}
                    customText={reduceStringToCharsWithEllipsis(url)}
                  />
                </ConditionalTooltip>
              </Td>
              {/* <Td>{rowData.label || '-'}</Td> */}
              <Td>{rowData.last_snapshot?.content_counts?.['rpm.advisory'] || '-'}</Td>
              <Td>
                <PackageCount
                  rowData={rowData}
                  href={pathname + '/' + REPOSITORIES_ROUTE + `/${rowData.uuid}/packages`}
                  opensNewTab
                />
              </Td>
            </Tr>
          );
        })}
      </Tbody>
    </Table>
  );
};
