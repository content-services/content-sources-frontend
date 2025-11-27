import { AllowedArchitecture, AllowedOSVersion } from '../../../core/types';
import { RepositoryVersionsLists, SelectedRepositoryVersion } from './types';
import { RepositoryOnServer } from '../../shared/types.server';

// ============
// input ports

export type SelectArchitecture = (architecture: AllowedArchitecture) => void;

export type SelectOSVersion = (version: AllowedOSVersion) => void;

export type ChooseHardcodedRepositories = (version: SelectedRepositoryVersion) => Promise<void>;

// ============
// output ports

export type FetchHardcodedRepositories = (
  version: SelectedRepositoryVersion,
) => Promise<RepositoryOnServer[]>;

// ============
// both input / output (react query)

export type GetRepositoryVersionsLists = () => RepositoryVersionsLists;
