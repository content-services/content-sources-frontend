import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import { TemplateRequest } from 'services/Templates/TemplateApi';

export interface AddTemplateContextInterface {
  templateRequest: Partial<TemplateRequest>;
  setTemplateRequest: (value: React.SetStateAction<Partial<TemplateRequest>>) => void;
  selectedRedhatRepos: Set<string>;
  setSelectedRedhatRepos: (uuidSet: Set<string>) => void;
  selectedCustomRepos: Set<string>;
  setSelectedCustomRepos: (uuidSet: Set<string>) => void;
  hardcodedRedhatRepositoryUUIDS: Set<string>;
  setHardcodeRepositoryUUIDS: (uuidSet: Set<string>) => void;
}

export const AddTemplateContext = createContext({} as AddTemplateContextInterface);

export const AddTemplateContextProvider = ({ children }: { children: ReactNode }) => {
  const [templateRequest, setTemplateRequest] = useState<Partial<TemplateRequest>>({});
  const [selectedRedhatRepos, setSelectedRedhatRepos] = useState<Set<string>>(new Set());
  const [selectedCustomRepos, setSelectedCustomRepos] = useState<Set<string>>(new Set());
  const [hardcodedRedhatRepositoryUUIDS, setHardcodeRepositoryUUIDS] = useState<Set<string>>(
    new Set(),
  );

  const templateRequestDependencies = useMemo(
    () => [...selectedCustomRepos, ...selectedRedhatRepos],
    [selectedCustomRepos, selectedRedhatRepos],
  );

  useEffect(() => {
    setTemplateRequest((prev) => ({
      ...prev,
      repository_uuids: [...selectedRedhatRepos, ...selectedCustomRepos],
    }));
  }, [templateRequestDependencies]);

  return (
    <AddTemplateContext.Provider
      value={{
        templateRequest,
        setTemplateRequest,
        selectedRedhatRepos,
        setSelectedRedhatRepos,
        selectedCustomRepos,
        setSelectedCustomRepos,
        setHardcodeRepositoryUUIDS,
        hardcodedRedhatRepositoryUUIDS,
      }}
    >
      {children}
    </AddTemplateContext.Provider>
  );
};

export const useAddTemplateContext = () => useContext(AddTemplateContext);
