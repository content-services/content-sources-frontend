import {
  ClipboardCopy,
  ClipboardCopyVariant,
  Content,
  Flex,
  FlexItem,
  Popover,
  Tab,
  TabContent,
  Tabs,
  TabTitleText,
} from '@patternfly/react-core';
import { createRef, ReactElement, useMemo, useState } from 'react';

import { ContentItem } from 'services/Content/ContentApi';

import { ConnectSnippetTab, getConnectSnippetTabs } from './connectSnippets';
import spacing from '@patternfly/react-styles/css/utilities/Spacing/spacing';

type ConnectRepositoryPopoverProps = {
  repository: Pick<ContentItem, 'name' | 'published_distribution_url' | 'content_type' | 'uuid'>;
  children: ReactElement;
};

const ConnectRepositoryPopover = ({ repository, children }: ConnectRepositoryPopoverProps) => {
  const tabs = useMemo(() => getConnectSnippetTabs(repository), [repository]);
  const [activeTabKey, setActiveTabKey] = useState(tabs[0]?.eventKey ?? '');
  const firstTabKey = tabs[0]?.eventKey ?? '';

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
    <Flex direction={{ default: 'column' }} gap={{ default: 'gapMd' }}>
      {tab.snippets.map((snippet) => (
        <FlexItem key={snippet.label}>
          <Content component='small' style={{ textAlign: 'left' }}>
            {snippet.label}
          </Content>
          <ClipboardCopy
            isReadOnly
            isCode
            hoverTip='Copy'
            clickTip=''
            variant={snippet.urlOnly ? ClipboardCopyVariant.inline : ClipboardCopyVariant.expansion}
            isExpanded={!snippet.urlOnly}
          >
            {snippet.code}
          </ClipboardCopy>
          {snippet.description && (
            <Content component='small' className={spacing.mtSm} style={{ textAlign: 'left' }}>
              {snippet.description}
            </Content>
          )}
        </FlexItem>
      ))}
    </Flex>
  );

  const bodyContent = (
    <div>
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
      position='right-start'
      flipBehavior={['right-start', 'left-start']}
      onShow={() => setActiveTabKey(firstTabKey)}
      minWidth='600px'
    >
      {children}
    </Popover>
  );
};

export default ConnectRepositoryPopover;
