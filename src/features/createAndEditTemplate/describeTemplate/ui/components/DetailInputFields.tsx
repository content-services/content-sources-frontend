import { Form } from '@patternfly/react-core';
import { TemplateTitle } from './TemplateTitle';
import { TemplateDetail } from './TemplateDetail';

export const DetailInputFields = () => (
  <Form>
    <TemplateTitle />
    <TemplateDetail />
  </Form>
);
