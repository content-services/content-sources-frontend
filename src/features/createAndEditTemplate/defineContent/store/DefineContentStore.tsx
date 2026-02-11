import { useAddTemplateContext } from 'features/createAndEditTemplate/workflow/store/AddTemplateContext';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { ContentOrigin, NameLabel } from 'services/Content/ContentApi';
import { useContentListQuery, useRepositoryParams } from 'services/Content/ContentQueries';
import { TemplateRequest } from 'services/Templates/TemplateApi';
import { hardcodeRedHatReposByArchAndVersion } from '../core/templateHelpers';
import { useEditTemplateState } from 'features/createAndEditTemplate/editTemplate/store/EditTemplateStore';

type DefineContentApiType = {
  distribution_versions: NameLabel[];
  distribution_arches: NameLabel[];
  templateRequest: Partial<TemplateRequest>;
  archOpen: boolean;
  versionOpen: boolean;
  archesDisplay: (arch?: string) => string;
  versionDisplay: (version?: string) => string;
  setVersionOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setArchOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setTemplateRequest: React.Dispatch<React.SetStateAction<Partial<TemplateRequest>>>;
};

const initialData = {
  templateRequest: {},
  distribution_versions: [],
  distribution_arches: [],
  archOpen: false,
  versionOpen: false,
  archesDisplay: () => 'Select architecture',
  versionDisplay: () => 'Select OS version',
  setVersionOpen: () => {},
  setArchOpen: () => {},
  setTemplateRequest: () => {},
};

const DefineContentApi = createContext<DefineContentApiType>(initialData);
export const useDefineContentApi = () => useContext(DefineContentApi);

type DefineContentStoreType = {
  children: ReactNode;
};

export const DefineContentStore = ({ children }: DefineContentStoreType) => {
  const [archOpen, setArchOpen] = useState(false);
  const [versionOpen, setVersionOpen] = useState(false);
  const [hardcodedRedhatRepositories, setHardcodeRepositories] = useState<string[]>([]);

  const {
    templateRequest,
    setTemplateRequest,
    selectedRedhatRepos,
    setSelectedCustomRepos,
    setSelectedRedhatRepos,
    setHardcodeRepositoryUUIDS,
  } = useAddTemplateContext();

  const { uuid } = useEditTemplateState();

  // >>>>>>>>
  // get archs and versions to populate dropdowns
  const {
    data: { distribution_versions, distribution_arches } = {
      distribution_versions: [],
      distribution_arches: [],
    },
  } = useRepositoryParams();
  // <<<<<<<<

  // >>>>>>>>
  // 2. fetch those hardcoded repositories
  const { data } = useContentListQuery(
    1,
    10,
    { urls: hardcodedRedhatRepositories },
    '',
    [ContentOrigin.REDHAT],
    !!hardcodedRedhatRepositories.length,
  );

  // 1. when a user selects arch and os
  // get urls of harcoded repos
  useEffect(() => {
    if (!!templateRequest.arch && !!templateRequest.version) {
      const result = hardcodeRedHatReposByArchAndVersion(
        templateRequest.arch,
        templateRequest.version,
      );
      if (result) {
        setHardcodeRepositories(result);
      }
      if (!uuid) setSelectedCustomRepos(new Set());
    }
  }, [templateRequest.version, templateRequest.arch, uuid]);

  // 3. filter out hardcoded uuids
  useEffect(() => {
    if (data?.data?.length) {
      const hardcodedItems = data?.data.map((item) => item.uuid);

      setHardcodeRepositoryUUIDS(new Set(hardcodedItems));
      setSelectedRedhatRepos(
        new Set(
          selectedRedhatRepos.has(hardcodedItems[0])
            ? [...selectedRedhatRepos, ...hardcodedItems]
            : hardcodedItems,
        ),
      );
    }
  }, [data?.data]);
  // <<<<<<<<

  const archesDisplay = (arch?: string) =>
    distribution_arches.find(({ label }) => arch === label)?.name || 'Select architecture';

  const versionDisplay = (version?: string): string =>
    // arm64 aarch64
    distribution_versions.find(({ label }) => version === label)?.name || 'Select OS version';

  const api = {
    distribution_versions,
    distribution_arches,
    templateRequest,
    setTemplateRequest,
    setArchOpen,
    archOpen,
    archesDisplay,
    setVersionOpen,
    versionDisplay,
    versionOpen,
  };

  return <DefineContentApi.Provider value={api}>{children}</DefineContentApi.Provider>;
};
