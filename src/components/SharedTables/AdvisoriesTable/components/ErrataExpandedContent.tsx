import { Content, Flex, FlexItem } from '@patternfly/react-core';
import { ExpandableRowContent } from '@patternfly/react-table';
import text from '@patternfly/react-styles/css/utilities/Text/text';
import { formatDateDDMMMYYYY, formatDescription } from 'helpers';
import UrlWithExternalIcon from 'components/UrlWithLinkIcon/UrlWithLinkIcon';
import RebootStatus from './RebootStatus';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';

interface Props {
  errataId: string;
  description: string;
  updatedDate: string;
  rebootSuggested: boolean;
}

export default function ErrataExpandedContent({
  errataId,
  description,
  updatedDate,
  rebootSuggested,
}: Props) {
  return (
    <ExpandableRowContent>
      <Flex direction={{ default: 'column' }} gap={{ default: 'gapMd' }} className={spacing.pyLg}>
        <FlexItem>
          <span className={text.fontWeightBold}>Updated date</span>
          <Content component='p'>{updatedDate ? formatDateDDMMMYYYY(updatedDate) : 'N/A'}</Content>
        </FlexItem>

        <FlexItem>
          <span className={text.fontWeightBold}>Description</span>
          <Content component='p' style={{ whiteSpace: 'pre-line' }}>
            {formatDescription(description)}
          </Content>
        </FlexItem>

        <FlexItem>
          <RebootStatus rebootSuggested={rebootSuggested} />
        </FlexItem>

        {errataId.startsWith('RH') ? (
          <FlexItem>
            <UrlWithExternalIcon
              href={`https://access.redhat.com/errata/${errataId}`}
              customText='View packages and errata at access.redhat.com'
            />
          </FlexItem>
        ) : null}
      </Flex>
    </ExpandableRowContent>
  );
}
