import { RepositoryVersionsLists, SelectedRepositoryVersion } from './types';
import { FullRepository } from '../../shared/types.repository';
import {
  AllowedArchitecture,
  AllowedOSVersion,
} from 'features/createTemplateWorkflow/shared/types.simple';

// ============
// input ports

export type SelectArchitecture = (architecture: AllowedArchitecture) => void;
export type SelectOSVersion = (version: AllowedOSVersion) => void;
export type ChooseHardcodedUUIDs = (version: SelectedRepositoryVersion) => Promise<void>;

// ============
// output ports

// network
export type FetchHardcodedRepositories = (
  version: SelectedRepositoryVersion,
) => Promise<FullRepository[]>;

// ============
// both input / output (react query)

export type VersionDescriptors = {
  name: string;
  label: string;
};

export type RepositoryVersionResponse = {
  distribution_versions: Array<VersionDescriptors>;
  distribution_arches: Array<VersionDescriptors>;
};

export type GetRepositoryVersionsLists = () => RepositoryVersionsLists;
