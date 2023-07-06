import {
  Bullseye,
  Modal,
  ModalVariant,
  Spinner,
  Tab,
  TabContent,
  TabTitleText,
  Tabs,
} from '@patternfly/react-core';
import { createUseStyles } from 'react-jss';
import { createRef, useMemo, useState } from 'react';
import { AdminTask } from '../../../../services/AdminTasks/AdminTaskApi';
import AdminTaskInfo from './components/AdminTaskInfo';
import ReactJson from 'react-json-view';
import Hide from '../../../../components/Hide/Hide';
import { useFetchAdminTaskQuery } from '../../../../services/AdminTasks/AdminTaskQueries';

const useStyles = createUseStyles({
  jsonView: {
    fontSize: '12px',
  },
});

export interface ViewPayloadProps {
  setClosed: () => void;
  open: boolean;
  uuid?: string;
  status?: AdminTask['status'];
}

export interface TabData {
  title: string;
  data: object;
  contentRef: React.RefObject<HTMLElement>;
}

const ViewPayloadModal = ({ uuid, status, open, setClosed }: ViewPayloadProps) => {
  const classes = useStyles();

  const [activeTabKey, setActiveTabKey] = useState<string | number>(0);
  const detailRef = createRef<HTMLElement>();

  const { isLoading, isFetching, data: adminTask } = useFetchAdminTaskQuery(uuid, status);

  const handleTabClick = (_, tabIndex: string | number) => {
    setActiveTabKey(tabIndex);
  };

  const tabs = useMemo(() => {
    const tabs: TabData[] = [];

    if (!adminTask) {
      return tabs;
    }

    if (adminTask.payload) {
      tabs.push({
        title: 'Payload',
        data: adminTask.payload,
        contentRef: createRef<HTMLElement>(),
      });
    }

    switch (adminTask.typename) {
      case 'snapshot': {
        const pulp = adminTask.pulp;
        if (pulp) {
          if (pulp.sync) {
            tabs.push({
              title: 'Sync',
              data: pulp.sync,
              contentRef: createRef<HTMLElement>(),
            });
          }
          if (pulp.distribution) {
            tabs.push({
              title: 'Distribution',
              data: pulp.distribution,
              contentRef: createRef<HTMLElement>(),
            });
          }
          if (pulp.publication) {
            tabs.push({
              title: 'Publication',
              data: pulp.publication,
              contentRef: createRef<HTMLElement>(),
            });
          }
        }
        break;
      }
    }
    return tabs;
  }, [adminTask?.uuid, isFetching]);

  const actionTakingPlace = isFetching;

  if (!open) return <></>;

  return (
    <Modal
      position='top'
      variant={ModalVariant.medium}
      ouiaId='task_details'
      ouiaSafe={!actionTakingPlace}
      aria-label='Task details'
      isOpen={open}
      onClose={() => {
        setActiveTabKey(0);
        setClosed();
      }}
      header={
        <Hide hide={isLoading}>
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
        </Hide>
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
            <ReactJson
              name={null}
              src={data}
              enableClipboard={(copy) => {
                navigator.clipboard.writeText(JSON.stringify(copy.src, null, '\t'));
              }}
            />
          </TabContent>
        ))}
      </Hide>
    </Modal>
  );
};

export default ViewPayloadModal;
