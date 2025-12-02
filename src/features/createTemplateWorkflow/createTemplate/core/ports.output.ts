import { FullTemplate } from 'features/createTemplateWorkflow/shared/types.template.full';
import { TemplateRequestToSend } from '../../shared/types.compound';

// Network
export type MutateTemplateRequest = (request: TemplateRequestToSend) => Promise<FullTemplate>;
