import { TemplateUUID } from 'features/createAndEditTemplate/shared/types/types';
import { EditTemplateToSend } from 'features/createAndEditTemplate/shared/types/types.compound';
import { FullRepository } from 'features/createAndEditTemplate/shared/types/types.repository';
import { FullTemplate } from 'features/createAndEditTemplate/shared/types/types.template.full';

// input ports
export type ConfirmEditTemplate = () => Promise<FullTemplate>;
export type InitializeTemplate = (template: FullTemplate) => void;

// output ports
export type GetTemplate = () => { template: FullTemplate | undefined; uuid: TemplateUUID };

export type MutateEditTemplate = (request: EditTemplateToSend) => Promise<FullTemplate>;

export type FetchTemplateRepositories = (uuids: TemplateUUID[]) => Promise<FullRepository[]>;

// read from top store - templateRequest
// set all top store state
