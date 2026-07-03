import {
  ClipboardCopy,
  ClipboardCopyVariant,
  Content,
  Popover,
  Stack,
  StackItem,
  Tab,
  TabContent,
  Tabs,
  TabTitleText,
} from '@patternfly/react-core';
import { createRef, ReactElement, useMemo, useState } from 'react';
import { createUseStyles } from 'react-jss';

import { ContentItem } from 'services/Content/ContentApi';

import { ConnectSnippetTab, getConnectSnippetTabs } from './connectSnippets';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';

const useStyles = createUseStyles({
  popoverBody: {
    minWidth: '32rem',
    maxWidth: '40rem',
    '& .pf-v6-c-clipboard-copy__expandable-content': {
      '--pf-v6-c-clipboard-copy__expandable-content--BorderColor':
        'var(--pf-t--global--border--color--control--default)',
    },
  },
});

type ConnectRepositoryPopoverProps = {
  repository: Pick<ContentItem, 'name' | 'published_distribution_url' | 'content_type' | 'uuid'>;
  children: ReactElement;
};

const ConnectRepositoryPopover = ({ repository, children }: ConnectRepositoryPopoverProps) => {
  const classes = useStyles();
  const tabs = useMemo(() => getConnectSnippetTabs(repository), [repository]);
  const [activeTabKey, setActiveTabKey] = useState(tabs[0]?.eventKey ?? '');

  const tabRefs = useMemo(
    () =>
      tabs.reduce(
        (refs, tab) => {
          refs[tab.eventKey] = createRef<HTMLElement>();
          return refs;
        },
        {} as Record<string, React.RefObject<HTMLElement>>,
      ),
    [tabs],
  );

  const renderTabPanel = (tab: ConnectSnippetTab) => (
    <Stack hasGutter>
      {tab.snippets.map((snippet) => (
        <StackItem key={snippet.label}>
          <Content component='small' style={{ textAlign: 'left' }}>
            {snippet.label}
          </Content>
          <ClipboardCopy
            isReadOnly
            isCode
            hoverTip='Copy'
            clickTip='Copied'
            variant={snippet.urlOnly ? ClipboardCopyVariant.inline : ClipboardCopyVariant.expansion}
          >
            {snippet.code}
          </ClipboardCopy>
          {snippet.description && (
            <Content component='small' className={spacing.mtSm} style={{ textAlign: 'left' }}>
              {snippet.description}
            </Content>
          )}
        </StackItem>
      ))}
    </Stack>
  );

  const bodyContent = (
    <div className={classes.popoverBody}>
      <Tabs
        activeKey={activeTabKey}
        onSelect={(_, eventKey) => setActiveTabKey(eventKey as string)}
        aria-label='Connect repository snippets'
        ouiaId='lightwell-connect-snippets-tabs'
      >
        {tabs.map((tab) => (
          <Tab
            key={tab.eventKey}
            eventKey={tab.eventKey}
            title={<TabTitleText>{tab.title}</TabTitleText>}
            tabContentRef={tabRefs[tab.eventKey]}
            ouiaId={`lightwell-connect-tab-${tab.eventKey}`}
          />
        ))}
      </Tabs>
      {tabs.map((tab, index) => (
        <TabContent
          key={tab.eventKey}
          eventKey={tab.eventKey}
          id={`lightwell-connect-panel-${tab.eventKey}`}
          aria-label={tab.title}
          ref={tabRefs[tab.eventKey]}
          hidden={index > 0}
          className={spacing.ptMd}
        >
          {renderTabPanel(tab)}
        </TabContent>
      ))}
    </div>
  );

  return (
    <Popover
      aria-label='Connect to this repository'
      headerContent='Connect to this repository'
      bodyContent={bodyContent}
      position='right'
      showClose={false}
      minWidth='32rem'
      maxWidth='40rem'
    >
      {children}
    </Popover>
  );
};

export default ConnectRepositoryPopover;
