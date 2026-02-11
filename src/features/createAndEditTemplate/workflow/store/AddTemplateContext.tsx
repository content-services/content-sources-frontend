import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { TemplateRequest } from 'services/Templates/TemplateApi';
import { QueryClient, useQueryClient } from 'react-query';
import { isDateValid } from 'helpers';

export interface AddTemplateContextInterface {
  queryClient: QueryClient;
  templateRequest: Partial<TemplateRequest>;
  setTemplateRequest: (value: React.SetStateAction<Partial<TemplateRequest>>) => void;
  selectedRedhatRepos: Set<string>;
  setSelectedRedhatRepos: (uuidSet: Set<string>) => void;
  selectedCustomRepos: Set<string>;
  setSelectedCustomRepos: (uuidSet: Set<string>) => void;
  hardcodedRedhatRepositoryUUIDS: Set<string>;
  setHardcodeRepositoryUUIDS: (uuidSet: Set<string>) => void;
  checkIfCurrentStepValid: (index: number) => boolean;
}

export const AddTemplateContext = createContext({} as AddTemplateContextInterface);

export const AddTemplateContextProvider = ({ children }: { children: ReactNode }) => {
  const [templateRequest, setTemplateRequest] = useState<Partial<TemplateRequest>>({});
  const [selectedRedhatRepos, setSelectedRedhatRepos] = useState<Set<string>>(new Set());
  const [selectedCustomRepos, setSelectedCustomRepos] = useState<Set<string>>(new Set());
  const [hardcodedRedhatRepositoryUUIDS, setHardcodeRepositoryUUIDS] = useState<Set<string>>(
    new Set(),
  );

  const stepsValidArray = useMemo(() => {
    const { arch, date, name, version, use_latest } = templateRequest;

    return [
      true,
      arch && version,
      !!selectedRedhatRepos.size,
      true,
      use_latest || isDateValid(date ?? ''),
      !!name && name.length < 256,
    ] as boolean[];
  }, [templateRequest, selectedRedhatRepos.size]);

  const checkIfCurrentStepValid = useCallback(
    (stepIndex: number) => {
      const stepsToCheck = stepsValidArray.slice(0, stepIndex + 1);
      return !stepsToCheck.every((step) => step);
    },
    [selectedRedhatRepos.size, stepsValidArray],
  );

  const queryClient = useQueryClient();

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
        queryClient,
        templateRequest,
        setTemplateRequest,
        selectedRedhatRepos,
        setSelectedRedhatRepos,
        selectedCustomRepos,
        setSelectedCustomRepos,
        setHardcodeRepositoryUUIDS,
        hardcodedRedhatRepositoryUUIDS,
        checkIfCurrentStepValid,
      }}
    >
      {children}
    </AddTemplateContext.Provider>
  );
};

export const useAddTemplateContext = () => useContext(AddTemplateContext);
