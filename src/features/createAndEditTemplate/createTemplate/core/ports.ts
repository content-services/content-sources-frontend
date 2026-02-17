import { TemplateRequestToSend } from 'features/createAndEditTemplate/shared/types/types.compound';
import { FullTemplate } from 'features/createAndEditTemplate/shared/types/types.template.full';

// input ports
export type CreateNewTemplate = () => Promise<FullTemplate>;

// output ports
export type MutateTemplateRequest = (request: TemplateRequestToSend) => Promise<FullTemplate>;
// read from top store - templateRequest
