import { FullRepository } from 'features/createAndEditTemplate/shared/types/types.repository';
import {
  SystemConfigurationsLists,
  SelectedSystemConfiguration,
  SystemConfigurationsResponse,
} from './types';
import {
  AllowedArchitecture,
  AllowedOSVersion,
} from 'features/createAndEditTemplate/shared/types/types';
import { UseQueryResult } from 'react-query';

// input ports
export type GetRepositoryVersionsLists = () => SystemConfigurationsLists;
export type SelectArchitecture = (architecture: AllowedArchitecture) => void;
export type SelectOSVersion = (version: AllowedOSVersion) => void;
export type ChooseHardcodedUUIDs = (version: SelectedSystemConfiguration) => Promise<void>;

// output ports
export type FetchSystemConfigurations = () => UseQueryResult<SystemConfigurationsResponse>;
export type FetchHardcodedRepositories = (
  version: SelectedSystemConfiguration,
) => Promise<FullRepository[]>;
// read from top level store - selectedArchitecture, selectedOSVersion
// set data in top level store - setArchitecture, setOSVersion, resetTemplateRequestContent
