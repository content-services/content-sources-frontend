import { useHref } from 'react-router-dom';

import { Table, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';

import Hide from 'components/Hide/Hide';

import ConditionalTooltip from 'components/ConditionalTooltip/ConditionalTooltip';
import CommunityRepositoryLabel from 'components/RepositoryLabels/CommunityRepositoryLabel';
import CustomEpelWarning from 'components/RepositoryLabels/CustomEpelWarning';
import UploadRepositoryLabel from 'components/RepositoryLabels/UploadRepositoryLabel';
import TdWithTooltip from 'components/TdWithTooltip/TdWithTooltip';
import UrlWithExternalIcon from 'components/UrlWithLinkIcon/UrlWithLinkIcon';
import PackageCount from 'Pages/Repositories/ContentListTable/components/PackageCount';
import StatusIcon from 'Pages/Repositories/ContentListTable/components/StatusIcon';

import { useAppContext } from 'middleware/AppContext';
import { isEPELUrl, reduceStringToCharsWithEllipsis } from 'helpers';
import { ContentItem, ContentOrigin } from 'services/Content/ContentApi';

import { REPOSITORIES_ROUTE } from 'Routes/constants';
import { COLUMN_HEADERS } from '../../core/constants';

import {
  useOtherRepositoriesApi,
  useOtherRepositoriesState,
  useSort,
} from '../../store/OtherRepositoriesStore';

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
        {repositoriesList.map((repository: ContentItem, rowIndex) => (
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

const Checkbox = ({ rowData, rowIndex }) => {
  const { isInOtherUUIDs } = useOtherRepositoriesState();
  const { toggleChecked } = useOtherRepositoriesApi();

  const isEPELRepository = (repo: ContentItem): boolean => {
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
        onSelect: () => toggleChecked(rowData.uuid),
        isSelected: isInOtherUUIDs(rowData.uuid),
        isDisabled: noSnapshotAvailable || shouldDisableOtherEPEL,
      }}
    />
  );
};

const RepositoryName = ({ rowData }) => {
  const { name, url, origin } = rowData;
  const { features } = useAppContext();

  return (
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
          <UrlWithExternalIcon href={url} customText={reduceStringToCharsWithEllipsis(url)} />
        </ConditionalTooltip>
      </Hide>
    </Td>
  );
};

const Status = ({ rowData }) => (
  <Td>
    <StatusIcon rowData={rowData} />
  </Td>
);

const Packages = ({ rowData }) => {
  const path = useHref('content');
  const pathname = path.split('content')[0] + 'content';
  const href = pathname + '/' + REPOSITORIES_ROUTE + `/${rowData.uuid}/packages`;

  return (
    <Td>
      <PackageCount rowData={rowData} href={href} opensNewTab />
    </Td>
  );
};
