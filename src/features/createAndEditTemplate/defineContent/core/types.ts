import {
  AllowedArchitecture,
  AllowedOSVersion,
} from 'features/createAndEditTemplate/shared/types/types';

export type SelectedSystemConfiguration = {
  architecture: AllowedArchitecture;
  osVersion: AllowedOSVersion;
};
