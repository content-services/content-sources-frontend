import {
  AllowedArchitecture,
  AllowedOSVersion,
  Architecture,
  OSVersion,
} from 'features/createAndEditTemplate/shared/types/types';

export type SystemConfigurationsLists = {
  architectures: Architecture[];
  osVersions: OSVersion[];
};

export type SelectedSystemConfiguration = {
  architecture: AllowedArchitecture;
  osVersion: AllowedOSVersion;
};

export type VisibleListCategory = 'architecture' | 'osVersion';

export type SystemDescriptors = {
  name: string;
  label: string;
};

export type SystemConfigurationsResponse = {
  distribution_versions: Array<SystemDescriptors>;
  distribution_arches: Array<SystemDescriptors>;
};
