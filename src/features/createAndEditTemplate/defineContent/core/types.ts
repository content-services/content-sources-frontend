import {
  AllowedArchitecture,
  AllowedOSVersion,
  Architecture,
  OSVersion,
} from 'features/createAndEditTemplate/shared/types/types';

export type RepositoryVersionsLists = {
  architectures: Architecture[];
  osVersions: OSVersion[];
};

export type SelectedRepositoryVersion = {
  architecture: AllowedArchitecture;
  osVersion: AllowedOSVersion;
};

export type VisibleListCategory = 'architecture' | 'osVersion';

export type VersionDescriptors = {
  name: string;
  label: string;
};

export type RepositoryVersionResponse = {
  distribution_versions: Array<VersionDescriptors>;
  distribution_arches: Array<VersionDescriptors>;
};
