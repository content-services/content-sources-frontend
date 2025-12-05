import {
  AllowedArchitecture,
  AllowedOSVersion,
  Architecture,
  FirstEmpty,
  OSVersion,
} from 'features/createTemplateWorkflow/shared/types.simple';
import { SelectArchitecture, SelectOSVersion } from '../core/ports';
import { VisibleListCategory } from '../core/types';

export type IsListExpanded = {
  architecture: boolean;
  osVersion: boolean;
};

export type VersionsApiType = {
  onSelectArchitecture: SelectArchitecture;
  onSelectOSVersion: SelectOSVersion;
  updateIsExpandedList: (list: Partial<IsListExpanded>) => void;
  toggleIsExpandedList: (type: VisibleListCategory) => void;
};

export type VersionsStateType = {
  selectedArchitecture: FirstEmpty<AllowedArchitecture>;
  selectedOSVersion: FirstEmpty<AllowedOSVersion>;
  isArchitectureItemSelected: (item: AllowedArchitecture) => boolean;
  isOSVersionItemSelected: (item: AllowedOSVersion) => boolean;
  isExpandedList: IsListExpanded;
  selectedArchitectureItem: FirstEmpty<Architecture>;
  selectedOSVersionItem: FirstEmpty<OSVersion>;
};
