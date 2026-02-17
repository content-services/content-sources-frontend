import { Content, ContentVariants, Title } from '@patternfly/react-core';

export const SnapshotPageHeading = () => (
  <>
    <Title ouiaId='set_up_date' headingLevel='h1'>
      Set up date
    </Title>
    <Content component={ContentVariants.p}>
      This will include snapshots up to a specific date. Content of the snapshots created after the
      selected date will be displayed as applicable, not installable.
    </Content>
    <Title headingLevel='h3'>Select date for snapshotted repositories</Title>
  </>
);
