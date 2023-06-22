import {
  Bullseye,
  Button,
  Modal,
  ModalVariant,
  Popover,
  Spinner,
  Tab,
  TabContent,
  TabTitleText,
  Tabs,
} from '@patternfly/react-core';
import { OutlinedQuestionCircleIcon } from '@patternfly/react-icons';
import { createUseStyles } from 'react-jss';
import { createRef, useMemo, useState } from 'react';
import { AdminTask, SnapshotPayload } from '../../../../services/AdminTasks/AdminTaskApi';
import AdminTaskInfo from './components/AdminTaskInfo';
import ReactJson from 'react-json-view';
import Hide from '../../../../components/Hide/Hide';

const useStyles = createUseStyles({
  jsonView: {
    fontSize: '12px',
  },
});

export interface ViewPayloadProps {
  setClosed: () => void;
  open: boolean;
  isFetching: boolean;
  adminTask: AdminTask | null;
}

export interface TabData {
  title: string;
  data: object;
  contentRef: React.RefObject<HTMLElement>;
}

const ViewPayloadModal = ({ adminTask, open, isFetching, setClosed }: ViewPayloadProps) => {
  if (!open) return <></>;
  const classes = useStyles();

  const [activeTabKey, setActiveTabKey] = useState<string | number>(0);
  const detailRef = createRef<HTMLElement>();

  const handleTabClick = (_, tabIndex: string | number) => {
    setActiveTabKey(tabIndex);
  };

  const tabs = useMemo(() => {
    const tabs: TabData[] = [];

    if (!adminTask) {
      return tabs;
    }

    switch (adminTask.typename) {
      case 'snapshot': {
        const payload = adminTask.payload as SnapshotPayload;
        if (payload.sync) {
          tabs.push({
            title: 'Sync',
            data: payload.sync,
            contentRef: createRef<HTMLElement>(),
          });
        }
        if (payload.distribution) {
          tabs.push({
            title: 'Distribution',
            data: payload.distribution,
            contentRef: createRef<HTMLElement>(),
          });
        }
        if (payload.publication) {
          tabs.push({
            title: 'Publication',
            data: payload.publication,
            contentRef: createRef<HTMLElement>(),
          });
        }
        return tabs;
      }
      default:
        tabs.push({
          title: 'Payload',
          data: adminTask.payload,
          contentRef: createRef<HTMLElement>(),
        });
        return tabs;
    }
  }, [adminTask?.uuid]);

  const actionTakingPlace = isFetching;

  const isLoading = !adminTask || isFetching;

  return (
    <Modal
      position='top'
      variant={ModalVariant.medium}
      ouiaId='task_details'
      ouiaSafe={!actionTakingPlace}
      aria-label='Task details'
      help={
        <Popover
          headerContent={<div>Task Details</div>}
          bodyContent={<div>Use this to view the full details of a task.</div>}
        >
          <Button variant='plain' aria-label='Help'>
            <OutlinedQuestionCircleIcon />
          </Button>
        </Popover>
      }
      isOpen={open}
      onClose={setClosed}
      header={
        <Tabs
          activeKey={activeTabKey}
          onSelect={handleTabClick}
          aria-label='Task tabs'
          ouiaId='task-tabs'
        >
          <Tab
            title={<TabTitleText>Task details</TabTitleText>}
            aria-label='Task details'
            ouiaId='task-details'
            eventKey={0}
            tabContentRef={detailRef}
          />
          {tabs.map(({ title, contentRef }) => (
            <Tab
              key={title}
              eventKey={title}
              aria-label={title}
              ouiaId={title}
              tabContentRef={contentRef}
              title={<TabTitleText>{title}</TabTitleText>}
            />
          ))}
        </Tabs>
      }
    >
      <Hide hide={!isLoading}>
        <Bullseye>
          <Spinner />
        </Bullseye>
      </Hide>
      <Hide hide={isLoading}>
        <TabContent aria-label='Task details' eventKey={0} id='task-details' ref={detailRef}>
          {/* Hide "isLoading" checks if adminTask is not null */}
          <AdminTaskInfo adminTask={adminTask as AdminTask} />
        </TabContent>
        {tabs.map(({ title, data, contentRef }, index) => (
          <TabContent
            key={index}
            eventKey={title}
            aria-label={title}
            id={title}
            className={classes.jsonView}
            ref={contentRef}
            hidden
          >
            <ReactJson name={null} src={data} />
          </TabContent>
        ))}
      </Hide>
    </Modal>
  );
};

export default ViewPayloadModal;
