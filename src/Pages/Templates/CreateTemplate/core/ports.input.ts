import { IsStepDisabled, Step } from './types';
import { TemplateServer } from './types.server';

export type PostTemplateRequest = () => Promise<TemplateServer>;
export type CheckIfStepIsDisabled = (step: Step) => IsStepDisabled;
