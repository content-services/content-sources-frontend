import {
  AllowedArchitecture,
  AllowedOSVersion,
  Architecture,
  OSVersion,
} from '../../../core/types';

export type RepositoryVersionsLists = {
  architectures: Architecture[];
  osVersions: OSVersion[];
};

type ArchitectureVersionCode = `${AllowedArchitecture}-${AllowedOSVersion}`;

export type UrlsForArchitectureAndVersion = Record<
  ArchitectureVersionCode,
  HardcodedRepositoryUrls
>;

export type SelectedRepositoryVersion = {
  architecture: AllowedArchitecture;
  osVersion: AllowedOSVersion;
};

export type Url = string;
export type HardcodedRepositoryUrls = [Url, Url];

export type VisibleListCategory = 'architecture' | 'osVersion';

export type IsListExpanded = {
  architecture: boolean;
  osVersion: boolean;
};
