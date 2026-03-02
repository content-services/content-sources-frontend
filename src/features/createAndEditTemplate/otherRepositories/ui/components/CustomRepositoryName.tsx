import { Td } from '@patternfly/react-table';

import ConditionalTooltip from 'components/ConditionalTooltip/ConditionalTooltip';
import CustomEpelWarning from 'components/RepositoryLabels/CustomEpelWarning';
import UploadRepositoryLabel from 'components/RepositoryLabels/UploadRepositoryLabel';
import UrlWithExternalIcon from 'components/UrlWithLinkIcon/UrlWithLinkIcon';
import CommunityRepositoryLabel from 'components/RepositoryLabels/CommunityRepositoryLabel';

import { isEPELUrl, reduceStringToCharsWithEllipsis } from 'helpers';
import { ContentOrigin } from 'services/Content/ContentApi';
import { useAppContext } from 'middleware/AppContext';

import { FullRepository } from 'features/createAndEditTemplate/shared/types/types.repository';

type RepositoryNameProps = {
  rowData: FullRepository;
};

export const RepositoryName = ({ rowData }: RepositoryNameProps) => {
  const { name, url, origin } = rowData;

  const formattedName = reduceStringToCharsWithEllipsis(name, 60);

  const isUploadOrigin = origin === ContentOrigin.UPLOAD;
  const isCommunityOrigin = origin === ContentOrigin.COMMUNITY;

  if (isUploadOrigin) {
    return (
      <Td>
        <ConditionalTooltip show={name.length > 60} content={name}>
          <>
            {formattedName}
            <UploadRepositoryLabel />
            <EpelWarning origin={origin} url={url} />
          </>
        </ConditionalTooltip>
      </Td>
    );
  }

  if (isCommunityOrigin) {
    return (
      <Td>
        <ConditionalTooltip show={name.length > 60} content={name}>
          <>
            {formattedName}
            <CommunityRepositoryLabel />
            <EpelWarning origin={origin} url={url} />
          </>
        </ConditionalTooltip>
        <UrlWithTooltip url={url} />
      </Td>
    );
  }

  return (
    <Td>
      <ConditionalTooltip show={name.length > 60} content={name}>
        <>
          {formattedName}
          <EpelWarning origin={origin} url={url} />
        </>
      </ConditionalTooltip>
      <UrlWithTooltip url={url} />
    </Td>
  );
};

type EpelWarningPros = {
  url: string;
  origin: ContentOrigin | undefined;
};

const EpelWarning = ({ url, origin }: EpelWarningPros) => {
  const { features } = useAppContext();

  const isCommunityReposEnabled = features?.communityrepos?.enabled;
  const isExternalEpel = origin == ContentOrigin.EXTERNAL && isEPELUrl(url);
  const isCommunityEpel = !(isExternalEpel && isCommunityReposEnabled);

  if (!isCommunityEpel) {
    return <CustomEpelWarning />;
  }

  return null;
};

type UrlWithTooltipPros = {
  url: string;
};

const UrlWithTooltip = ({ url }: UrlWithTooltipPros) => {
  const formattedUrl = reduceStringToCharsWithEllipsis(url);
  return (
    <ConditionalTooltip show={url.length > 50} content={url}>
      <UrlWithExternalIcon href={url} customText={formattedUrl} />
    </ConditionalTooltip>
  );
};
