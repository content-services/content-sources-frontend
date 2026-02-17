import { useAddTemplateContext } from 'features/createAndEditTemplate/workflow/store/AddTemplateContext';
import { createContext, ReactNode, useContext, useState } from 'react';
import { NameLabel } from 'services/Content/ContentApi';
import { TemplateRequest } from 'services/Templates/TemplateApi';

type DefineContentApiType = {
  distribution_versions: NameLabel[];
  distribution_arches: NameLabel[];
  templateRequest: Partial<TemplateRequest>;
  isEdit?: boolean;
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
  isEdit: undefined,
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

  // TODO: move here the code from AddTemplateContext
  // which is dealing only with this step

  const {
    isEdit,
    templateRequest,
    setTemplateRequest,
    distribution_versions,
    distribution_arches,
  } = useAddTemplateContext();

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
    isEdit,
    archOpen,
    archesDisplay,
    setVersionOpen,
    versionDisplay,
    versionOpen,
  };

  return <DefineContentApi.Provider value={api}>{children}</DefineContentApi.Provider>;
};
