import { Table, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import ConditionalTooltip from 'components/ConditionalTooltip/ConditionalTooltip';
import Hide from 'components/Hide/Hide';
import PackageCount from 'components/PackageCount/PackageCount';
import CommunityRepositoryLabel from 'components/RepositoryLabels/CommunityRepositoryLabel';
import CustomEpelWarning from 'components/RepositoryLabels/CustomEpelWarning';
import UploadRepositoryLabel from 'components/RepositoryLabels/UploadRepositoryLabel';
import StatusIcon from 'components/StatusIcon/StatusIcon';
import TdWithTooltip from 'components/TdWithTooltip/TdWithTooltip';
import UrlWithExternalIcon from 'components/UrlWithLinkIcon/UrlWithLinkIcon';
import { isEPELUrl, reduceStringToCharsWithEllipsis } from 'helpers';
import { useAppContext } from 'middleware/AppContext';
import { REPOSITORIES_ROUTE } from 'Routes/constants';
import { ContentItem, ContentOrigin } from 'services/Content/ContentApi';
import { useCustomRepositoriesApi } from '../../../../createAndEditTemplate/otherRepositories/store/CustomRepositoriesStore';

export const CustomRepositoriesTable = () => {
  const { columnHeaders, contentList, sortParams, isInOtherUUIDs, pathname, toggleSelected } =
    useCustomRepositoriesApi();

  const { features } = useAppContext();

  const isEPELRepository = (repo: ContentItem): boolean => {
    if (repo.origin === ContentOrigin.COMMUNITY) {
      return true;
    }

    return isEPELUrl(repo.url);
  };

  return (
    <Table
      aria-label='custom repositories table'
      ouiaId='custom_repositories_table'
      variant='compact'
    >
      <Thead>
        <Tr>
          <Th screenReaderText='empty' />
          {columnHeaders.map((columnHeader, index) => (
            <Th
              width={index === 0 ? 50 : undefined}
              key={columnHeader + 'column'}
              sort={sortParams(index)}
            >
              {columnHeader}
            </Th>
          ))}
        </Tr>
      </Thead>
      <Tbody>
        {contentList.map((rowData: ContentItem, rowIndex) => {
          const { uuid, name, url, origin } = rowData;

          const isAnyEPELRepoSelected = isInOtherUUIDs(uuid) && isEPELRepository(rowData);
          const shouldDisableOtherEPEL =
            isEPELRepository(rowData) && isAnyEPELRepoSelected && !isInOtherUUIDs(rowData.uuid);
          const noSnapshotAvailable = !(rowData.snapshot && rowData.last_snapshot_uuid);

          return (
            <Tr key={uuid}>
              <TdWithTooltip
                show={!(rowData.snapshot && rowData.last_snapshot_uuid)}
                tooltipProps={{
                  content: 'Snapshot not yet available for this repository',
                }}
                select={{
                  rowIndex,
                  onSelect: () => toggleSelected(uuid),
                  isSelected: isInOtherUUIDs(uuid),
                  isDisabled: noSnapshotAvailable || shouldDisableOtherEPEL,
                }}
              />
              <Td>
                <ConditionalTooltip show={name.length > 60} content={name}>
                  <>
                    {reduceStringToCharsWithEllipsis(name, 60)}
                    <Hide hide={origin !== ContentOrigin.UPLOAD}>
                      <UploadRepositoryLabel />
                    </Hide>
                    <Hide hide={origin !== ContentOrigin.COMMUNITY}>
                      <CommunityRepositoryLabel />
                    </Hide>
                    <Hide
                      hide={
                        !(origin == ContentOrigin.EXTERNAL && isEPELUrl(url)) ||
                        !features?.communityrepos?.enabled
                      }
                    >
                      <CustomEpelWarning />
                    </Hide>
                  </>
                </ConditionalTooltip>
                <Hide hide={origin === ContentOrigin.UPLOAD}>
                  <ConditionalTooltip show={url.length > 50} content={url}>
                    <UrlWithExternalIcon
                      href={url}
                      customText={reduceStringToCharsWithEllipsis(url)}
                    />
                  </ConditionalTooltip>
                </Hide>
              </Td>
              <Td>
                <StatusIcon rowData={rowData} />
              </Td>
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
