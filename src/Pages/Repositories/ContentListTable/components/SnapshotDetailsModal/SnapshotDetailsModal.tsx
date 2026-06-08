import {
  Button,
  Modal,
  ModalFooter,
  ModalHeader,
  ModalVariant,
  Stack,
  StackItem,
  Tab,
  Tabs,
  TabTitleText,
} from '@patternfly/react-core';
import { InnerScrollContainer } from '@patternfly/react-table';
import { useParams, useSearchParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { SnapshotPackagesTab } from './Tabs/SnapshotPackagesTab';
import { createUseStyles } from 'react-jss';
import { SnapshotSelector } from './SnapshotSelector';
import { SnapshotErrataTab } from './Tabs/SnapshotErrataTab';
import { modalTableSurfaceStyles } from 'helpers';
import { useNavigateTo } from 'Hooks/navigation/useNavigateTo';

const useStyles = createUseStyles({
  modalTableScope: modalTableSurfaceStyles,
  modalBody: {
    padding: '24px 24px 0 24px',
  },
  topContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '16px',
    '& button': { maxHeight: '37px', marginTop: 'auto' },
  },
});

export enum SnapshotDetailTab {
  PACKAGES = 'packages',
  ERRATA = 'errata',
}

export default function SnapshotDetailsModal() {
  const classes = useStyles();
  const { snapshotUUID } = useParams();
  const [urlSearchParams, setUrlSearchParams] = useSearchParams();
  const [activeTabKey, setActiveTabKey] = useState<string | number>(0);

  useEffect(() => {
    if (urlSearchParams.get('tab') === SnapshotDetailTab.ERRATA) {
      setActiveTabKey(1);
    }
  }, []);

  const handleTabClick = (
    _: React.MouseEvent<HTMLElement, MouseEvent>,
    tabIndex: string | number,
  ) => {
    setUrlSearchParams(tabIndex ? { tab: SnapshotDetailTab.ERRATA } : {});
    setActiveTabKey(tabIndex);
  };

  const onClose = useNavigateTo('repositories');
  const onBackClick = useNavigateTo('repositorySnapshots');

  return (
    <Modal
      key={snapshotUUID}
      position='top'
      ouiaId='snapshot_details_modal'
      variant={ModalVariant.large}
      isOpen
      onClose={onClose}
      aria-labelledby='snapshot-details-modal-title'
    >
      <ModalHeader title='Snapshot detail' labelId='snapshot-details-modal-title' />
      <InnerScrollContainer>
        <Stack className={`${classes.modalTableScope} ${classes.modalBody}`}>
          <StackItem className={classes.topContainer}>
            <SnapshotSelector />
            <Button variant='secondary' onClick={onBackClick}>
              View all snapshots
            </Button>
          </StackItem>
          <StackItem>
            <Tabs
              activeKey={activeTabKey}
              onSelect={handleTabClick}
              aria-label='Snapshot detail tabs'
            >
              <Tab
                eventKey={0}
                ouiaId='packages_tab'
                title={<TabTitleText>Packages</TabTitleText>}
                aria-label='Snapshot package detail tab'
              >
                <SnapshotPackagesTab />
              </Tab>
              <Tab
                eventKey={1}
                ouiaId='advisories_tab'
                title={<TabTitleText>Advisories</TabTitleText>}
                aria-label='Snapshot errata detail tab'
              >
                <SnapshotErrataTab />
              </Tab>
            </Tabs>
          </StackItem>
        </Stack>
      </InnerScrollContainer>
      <ModalFooter>
        <Button
          key='close'
          variant='secondary'
          onClick={onClose}
          aria-label='Close snapshot detail'
        >
          Close
        </Button>
      </ModalFooter>
    </Modal>
  );
}
