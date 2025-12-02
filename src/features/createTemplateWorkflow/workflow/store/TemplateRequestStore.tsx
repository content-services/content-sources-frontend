import { createContext, PropsWithChildren, useContext, useMemo, useState } from 'react';
import {
  AllReposSliceInProgress,
  DescriptionSliceInProgress,
  OtherRepositoriesSliceInProgress,
  RedhatReposSliceInProgress,
  RepositoryVersionsSliceInProgress,
  SnapshotsSliceInProgress,
  TemplateRequestApi,
} from '../../shared/ports.output';
import {
  initalTemplateApi,
  initialAllRepos,
  initialDescription,
  initialOther,
  initialRedhat,
  initialSnapshots,
  initialTemplateRequestState,
  initialVersions,
} from './store.initials';
import {
  AdditionalUuid,
  AllowedArchitecture,
  AllowedOSVersion,
  FirstEmpty,
  HardcodedUuid,
  OtherUuid,
  TemplateDetail,
  TemplateTitle,
  UseLatestSnapshot,
  UseSnapshotDate,
} from 'features/createTemplateWorkflow/shared/types.simple';
import { TemplateRequestInProgress } from 'features/createTemplateWorkflow/shared/types.compound';

const TemplateRequest = createContext<TemplateRequestApi>(initalTemplateApi);
export const useTemplateRequestApi = () => useContext(TemplateRequest);

const TemplateRequestState = createContext<TemplateRequestInProgress>(initialTemplateRequestState);
export const useTemplateRequestState = () => useContext(TemplateRequestState);

const RepositoryVersionsSlice = createContext<RepositoryVersionsSliceInProgress>(initialVersions);
export const useRepositoryVersionsSlice = () => useContext(RepositoryVersionsSlice);

const RedhatUuidsSlice = createContext<RedhatReposSliceInProgress>(initialRedhat);
export const useRedhatUuidsSlice = () => useContext(RedhatUuidsSlice);

const OtherRepositoriesSlice = createContext<OtherRepositoriesSliceInProgress>(initialOther);
export const useOtherRepositoriesSlice = () => useContext(OtherRepositoriesSlice);

const AllReposSlice = createContext<AllReposSliceInProgress>(initialAllRepos);
export const useAllReposSlice = () => useContext(AllReposSlice);

const SnapshotsSlice = createContext<SnapshotsSliceInProgress>(initialSnapshots);
export const useSnapshotsSlice = () => useContext(SnapshotsSlice);

const DescriptionSlice = createContext<DescriptionSliceInProgress>(initialDescription);
export const useDescriptionSlice = () => useContext(DescriptionSlice);

export const TemplateRequestStore = ({ children }: PropsWithChildren) => {
  const [selectedArchitecture, setArchitecture] =
    useState<FirstEmpty<AllowedArchitecture>>(undefined);
  const [selectedOSVersion, setOSVersion] = useState<FirstEmpty<AllowedOSVersion>>(undefined);
  const [hardcodedUUIDs, setHardcodedUUIDs] = useState<HardcodedUuid[]>([]);
  const [additionalUUIDs, setAdditionalUUIDs] = useState<AdditionalUuid[]>([]);
  const [otherUUIDs, setOtherUUIDs] = useState<OtherUuid[]>([]);
  const [snapshotDate, setSnapshotDate] = useState<UseSnapshotDate>('');
  const [isLatestSnapshot, setIsLatestSnapshot] = useState<UseLatestSnapshot>(false); // initially set to expect date
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
