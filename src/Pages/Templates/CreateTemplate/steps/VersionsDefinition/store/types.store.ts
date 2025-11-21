import { AllowedArchitecture, AllowedOSVersion } from '../../../core/types';
import { SelectArchitecture, SelectOSVersion } from '../core/ports';
import { IsListExpanded, VisibleListCategory } from '../core/types';

export type VersionsApiType = {
  onSelectArchitecture: SelectArchitecture;
  onSelectOSVersion: SelectOSVersion;
  updateIsExpandedList: (list: Partial<IsListExpanded>) => void;
  toggleIsExpandedList: (type: VisibleListCategory) => void;
};

export type VersionsStateType = {
  selectedArchitecture: AllowedArchitecture;
  selectedOSVersion: AllowedOSVersion;
  isArchitectureItemSelected: (item: AllowedArchitecture) => boolean;
  isOSVersionItemSelected: (item: AllowedOSVersion) => boolean;
  isExpandedList: IsListExpanded;
};
