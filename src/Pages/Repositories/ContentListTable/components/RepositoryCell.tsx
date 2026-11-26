import { memo } from 'react';
import { Flex, FlexItem } from '@patternfly/react-core';
import dayjs from 'dayjs';
import { ContentItem, ContentOrigin } from 'services/Content/ContentApi';
import Hide from 'components/Hide/Hide';
import UrlWithExternalIcon from 'components/UrlWithLinkIcon/UrlWithLinkIcon';
import ChangedArrows from './SnapshotListModal/components/ChangedArrows';
import MarkAsPartneredInProgressLabel from 'components/RepositoryLabels/MarkPartnerInProgressLabel';
import PartneredLabel from 'components/RepositoryLabels/PartneredLabel';
import { PublishLabels } from 'components/RepositoryLabels/PublishLabels';

interface Props {
  rowData: Pick<
    ContentItem,
    'name' | 'url' | 'last_snapshot' | 'origin' | 'partner' | 'snapshot_publish_state'
  >;
  snapshotsAccessible: boolean;
  isRepoBeingMarkedAsPartner: boolean;
  isPartnerAdmin: boolean;
}

const RepositoryCell = memo(
  ({ rowData, snapshotsAccessible, isRepoBeingMarkedAsPartner, isPartnerAdmin }: Props) => {
    const { name, url, last_snapshot, origin, partner, snapshot_publish_state } = rowData;

    const showPartnerAdminLabels = origin === ContentOrigin.UPLOAD && isPartnerAdmin;

    return (
      <Flex direction={{ default: 'column' }}>
        <Flex gap={{ default: 'gapSm' }} alignItems={{ default: 'alignItemsCenter' }}>
          <FlexItem>{name}</FlexItem>
          {showPartnerAdminLabels ? (
            <Flex gap={{ default: 'gapXs' }} alignItems={{ default: 'alignItemsCenter' }}>
              {isRepoBeingMarkedAsPartner && <MarkAsPartneredInProgressLabel />}
              {partner && <PartneredLabel />}
              <PublishLabels publishState={snapshot_publish_state} />
            </Flex>
          ) : null}
        </Flex>

        <Hide hide={origin === ContentOrigin.UPLOAD || partner === true}>
          <UrlWithExternalIcon href={url} />
        </Hide>

        <Hide hide={!snapshotsAccessible}>
          <Flex gap={{ default: 'gapMd' }}>
            <FlexItem>
              {last_snapshot
                ? `Last snapshot ${dayjs(last_snapshot?.created_at).fromNow()}`
                : 'No snapshot yet'}
            </FlexItem>
            <Hide hide={!last_snapshot}>
              <Flex gap={{ default: 'gapXs' }}>
                <FlexItem>Changes:</FlexItem>
                <FlexItem>
                  <ChangedArrows
                    addedCount={last_snapshot?.added_counts?.['rpm.package'] || 0}
                    removedCount={last_snapshot?.removed_counts?.['rpm.package'] || 0}
                  />
                </FlexItem>
              </Flex>
            </Hide>
          </Flex>
        </Hide>
      </Flex>
    );
  },
);

RepositoryCell.displayName = 'RepositoryCell';

export default RepositoryCell;
