import { Alert } from '@patternfly/react-core';

const RemediatedDataWarning = () => (
  <Alert
    variant='warning'
    isInline
    title='This data is sensitive. Do not share or capture screenshots.'
  />
);

export default RemediatedDataWarning;
