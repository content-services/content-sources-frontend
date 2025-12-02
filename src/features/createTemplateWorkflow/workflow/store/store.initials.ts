export const initalTemplateApi = {
  setArchitecture: () => {},
  setOSVersion: () => {},
  setHardcodedUUIDs: () => {},
  setAdditionalUUIDs: () => {},
  setOtherUUIDs: () => {},
  setSnapshotDate: () => {},
  setIsLatestSnapshot: () => {},
  setTitle: () => {},
  setDetail: () => {},
  resetTemplateRequestContent: () => {},
};

export const initialTemplateRequestState = {
  selectedArchitecture: undefined,
  selectedOSVersion: undefined,
  hardcodedUUIDs: [],
  additionalUUIDs: [],
  otherUUIDs: [],
  snapshotDate: '',
  isLatestSnapshot: true,
  title: '',
  detail: '',
};

export const initialVersions = {
  selectedArchitecture: undefined,
  selectedOSVersion: undefined,
};

export const initialRedhat = {
  additionalUUIDs: [],
  hardcodedUUIDs: [],
};

export const initialOther = {
  otherUUIDs: [],
  hardcodedUUIDs: [],
};

export const initialAllRepos = {
  otherUUIDs: [],
  additionalUUIDs: [],
  hardcodedUUIDs: [],
};

export const initialSnapshots = {
  snapshotDate: '',
  isLatestSnapshot: false,
};

export const initialDescription = {
  title: '',
  detail: '',
};
