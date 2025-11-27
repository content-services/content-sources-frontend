import { createContext, PropsWithChildren, useContext, useMemo, useState } from 'react';
import { TemplateRequestApi } from '../core/ports.output';
import {
  AdditionalUuid,
  AllowedArchitecture,
  AllowedOSVersion,
  HardcodedUuid,
  OtherUuid,
  SnapshotDate,
  TemplateDetail,
  TemplateRequestInProgress,
  TemplateTitle,
  UseSnapshot,
} from '../core/types';
import { FirstEmpty } from '../types';
import {
  AllReposSliceType,
  OtherRepositoriesSliceType,
  RedhatUuidsSliceType,
  RepositoryVersionsSliceType,
  SnapshotsSliceType,
  TemplateDescriptionSliceType,
} from './types.slices';

// ----
// TemplateRequestApi

const initalTemplateApi = {
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

const TemplateRequest = createContext<TemplateRequestApi>(initalTemplateApi);
export const useTemplateRequestApi = () => useContext(TemplateRequest);

// ---
// TemplateRequestState

const initialTemplateRequest = {
  selectedArchitecture: undefined,
  selectedOSVersion: undefined,
  hardcodedUUIDs: [],
  additionalUUIDs: [],
  otherUUIDs: [],
  snapshotDate: '',
  isLatestSnapshot: false,
  title: '',
  detail: '',
};

const TemplateRequestState = createContext<TemplateRequestInProgress>(initialTemplateRequest);
export const useTemplateRequestState = () => useContext(TemplateRequestState);

// ---
// RepositoryVersionsSlice

const initialVersions = {
  selectedArchitecture: undefined,
  selectedOSVersion: undefined,
};

const RepositoryVersionsSlice = createContext<RepositoryVersionsSliceType>(initialVersions);
export const useRepositoryVersionsSlice = () => useContext(RepositoryVersionsSlice);

// ---
// Redhat Uuids for Additional

const initialRedhat = {
  additionalUUIDs: [],
  hardcodedUUIDs: [],
};

const RedhatUuidsSlice = createContext<RedhatUuidsSliceType>(initialRedhat);
export const useRedhatUuidsSlice = () => useContext(RedhatUuidsSlice);

// ---
// Other Repos

const initialOther = {
  otherUUIDs: [],
  hardcodedUUIDs: [],
};

const OtherRepositoriesSlice = createContext<OtherRepositoriesSliceType>(initialOther);
export const useOtherRepositoriesSlice = () => useContext(OtherRepositoriesSlice);

// ---
// All Repos

const initialAllRepos = {
  otherUUIDs: [],
  additionalUUIDs: [],
  hardcodedUUIDs: [],
};

const AllReposSlice = createContext<AllReposSliceType>(initialAllRepos);
export const useAllReposSlice = () => useContext(AllReposSlice);

// ---
// Snapshots

const initialSnapshots = {
  snapshotDate: '',
  isLatestSnapshot: false,
};

const SnapshotsSlice = createContext<SnapshotsSliceType>(initialSnapshots);
export const useSnapshotsSlice = () => useContext(SnapshotsSlice);

// ---

const initialDescription = {
  title: '',
  detail: '',
};

const DescriptionSlice = createContext<TemplateDescriptionSliceType>(initialDescription);
export const useDescriptionSlice = () => useContext(DescriptionSlice);

export const TemplateRequestStore = ({ children }: PropsWithChildren) => {
  const [selectedArchitecture, setArchitecture] =
    useState<FirstEmpty<AllowedArchitecture>>(undefined);
  const [selectedOSVersion, setOSVersion] = useState<FirstEmpty<AllowedOSVersion>>(undefined);
  const [hardcodedUUIDs, setHardcodedUUIDs] = useState<HardcodedUuid[]>([]);
  const [additionalUUIDs, setAdditionalUUIDs] = useState<AdditionalUuid[]>([]);
  const [otherUUIDs, setOtherUUIDs] = useState<OtherUuid[]>([]);
  const [snapshotDate, setSnapshotDate] = useState<SnapshotDate>('');
  const [isLatestSnapshot, setIsLatestSnapshot] = useState<UseSnapshot>(false);
  const [title, setTitle] = useState<TemplateTitle>('');
  const [detail, setDetail] = useState<TemplateDetail>('');

  const templateRequestApi = useMemo(() => {
    const resetTemplateRequestContent = () => {
      setHardcodedUUIDs([]);
      setAdditionalUUIDs([]);
      setOtherUUIDs([]);
      setSnapshotDate('');
      setIsLatestSnapshot(false);
    };
    const api = {
      setArchitecture,
      setOSVersion,
      setHardcodedUUIDs,
      setAdditionalUUIDs,
      setOtherUUIDs,
      setSnapshotDate,
      setIsLatestSnapshot,
      setTitle,
      setDetail,
      resetTemplateRequestContent,
    };
    return api;
  }, []);

  const templateRequestState = useMemo(() => {
    const templateRequestState = {
      selectedArchitecture,
      selectedOSVersion,
      hardcodedUUIDs,
      additionalUUIDs,
      otherUUIDs,
      snapshotDate,
      isLatestSnapshot,
      title,
      detail,
    };
    return templateRequestState;
  }, [
    selectedArchitecture,
    selectedOSVersion,
    hardcodedUUIDs,
    additionalUUIDs,
    otherUUIDs,
    snapshotDate,
    isLatestSnapshot,
    title,
    detail,
  ]);

  // repository versions
  const repositoryVersionsSlice = useMemo(
    () => ({ selectedArchitecture, selectedOSVersion }),
    [selectedArchitecture, selectedOSVersion],
  );

  // additional repos
  const additionalReposSlice = useMemo(
    () => ({
      additionalUUIDs,
      hardcodedUUIDs,
    }),
    [additionalUUIDs, hardcodedUUIDs],
  );

  // other repos
  const otherReposSlice = useMemo(
    () => ({ otherUUIDs, hardcodedUUIDs }),
    [otherUUIDs, hardcodedUUIDs],
  );

  // snapshots
  const snapshotsSlice = useMemo(
    () => ({ snapshotDate, isLatestSnapshot }),
    [snapshotDate, isLatestSnapshot],
  );

  // all uuids
  const allUUIDs = useMemo(
    () => ({ hardcodedUUIDs, additionalUUIDs, otherUUIDs }),
    [hardcodedUUIDs, additionalUUIDs, otherUUIDs],
  );

  const description = useMemo(() => ({ title, detail }), [title, detail]);

  return (
    <TemplateRequest.Provider value={templateRequestApi}>
      <TemplateRequestState.Provider value={templateRequestState}>
        <RepositoryVersionsSlice.Provider value={repositoryVersionsSlice}>
          <RedhatUuidsSlice.Provider value={additionalReposSlice}>
            <OtherRepositoriesSlice.Provider value={otherReposSlice}>
              <SnapshotsSlice.Provider value={snapshotsSlice}>
                <DescriptionSlice.Provider value={description}>
                  <AllReposSlice.Provider value={allUUIDs}>{children}</AllReposSlice.Provider>
                </DescriptionSlice.Provider>
              </SnapshotsSlice.Provider>
            </OtherRepositoriesSlice.Provider>
          </RedhatUuidsSlice.Provider>
        </RepositoryVersionsSlice.Provider>
      </TemplateRequestState.Provider>
    </TemplateRequest.Provider>
  );
};
