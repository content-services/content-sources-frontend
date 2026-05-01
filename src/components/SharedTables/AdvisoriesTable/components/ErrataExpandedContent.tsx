import { Content, Flex, FlexItem, Grid, Stack } from '@patternfly/react-core';
import { ExpandableRowContent } from '@patternfly/react-table';
import text from '@patternfly/react-styles/css/utilities/Text/text';
import { formatDateDDMMMYYYY, formatDescription } from 'helpers';
import UrlWithExternalIcon from 'components/UrlWithLinkIcon/UrlWithLinkIcon';
import RebootStatus from './RebootStatus';

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
      <Stack hasGutter>
        <Flex direction={{ default: 'row' }}>
          <FlexItem>
            <span className={text.fontWeightBold}>Updated date</span>
            <Content component='p'>
              {updatedDate ? formatDateDDMMMYYYY(updatedDate) : 'N/A'}
            </Content>
          </FlexItem>
        </Flex>

        <Grid>
          <span className={text.fontWeightBold}>Description</span>
          <Content component='p' style={{ whiteSpace: 'pre-line' }}>
            {formatDescription(description)}
          </Content>
        </Grid>

        <Grid>
          <span className={text.fontWeightBold}>Reboot</span>
          <RebootStatus rebootSuggested={rebootSuggested} />
        </Grid>

        {errataId.startsWith('RH') ? (
          <UrlWithExternalIcon
            href={`https://access.redhat.com/errata/${errataId}`}
            customText='View packages and errata at access.redhat.com'
          />
        ) : null}
      </Stack>
    </ExpandableRowContent>
  );
}
