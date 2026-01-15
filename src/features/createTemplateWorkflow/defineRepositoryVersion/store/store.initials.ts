export const initialVersionsLists = {
  architectures: [],
  osVersions: [],
};

export const initialVersionsApi = {
  onSelectArchitecture: () => {},
  onSelectOSVersion: () => {},
  updateIsExpandedList: () => {},
  toggleIsExpandedList: () => {},
};

export const initalVersionsState = {
  selectedArchitecture: undefined,
  selectedOSVersion: undefined,
  isArchitectureItemSelected: () => false,
  isOSVersionItemSelected: () => false,
  isExpandedList: {
    architecture: false,
    osVersion: false,
  },
  selectedArchitectureItem: undefined,
  selectedOSVersionItem: undefined,
};
