import { Content, ExpandableSection } from '@patternfly/react-core';

export const ContentPageExplanation = () => (
  <ExpandableSection
    toggleText='What does it mean?'
    aria-label='quickStart-expansion'
    data-ouia-component-id='quickstart_expand'
  >
    <Content>
      <Content component='ul'>
        <Content component='li'>
          Clients are configured to use date-based snapshots of Red Hat and custom repositories.
        </Content>
        <Content component='li'>Third-party tooling is used to update systems.</Content>
      </Content>
    </Content>
  </ExpandableSection>
);
