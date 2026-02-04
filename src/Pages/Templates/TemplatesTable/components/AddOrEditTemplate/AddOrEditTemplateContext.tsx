import React, {
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
import { useContentListQuery, useRepositoryParams } from 'services/Content/ContentQueries';
import { ContentOrigin, NameLabel, DistributionMinorVersion } from 'services/Content/ContentApi';
import { getRedHatCoreRepoUrls, hasExtendedSupport } from '../templateHelpers';
import { useNavigate } from 'react-router-dom';
import { useFetchTemplate } from 'services/Templates/TemplateQueries';
import useRootPath from 'Hooks/useRootPath';
import { isDateValid } from 'helpers';
import useSafeUUIDParam from 'Hooks/useSafeUUIDParam';

export interface AddOrEditTemplateContextInterface {
  queryClient: QueryClient;
  distribution_arches: NameLabel[];
  distribution_versions: NameLabel[];
  extended_release_features: NameLabel[];
  distribution_minor_versions: DistributionMinorVersion[];
  useExtendedSupport: boolean;
  setUseExtendedSupport: (value: React.SetStateAction<boolean>) => void;
  templateRequest: Partial<TemplateRequest>;
  setTemplateRequest: (value: React.SetStateAction<Partial<TemplateRequest>>) => void;
  selectedRedHatRepos: Set<string>;
  setSelectedRedHatRepos: (uuidSet: Set<string>) => void;
  selectedCustomRepos: Set<string>;
  setSelectedCustomRepos: (uuidSet: Set<string>) => void;
  redHatCoreRepoUUIDS: Set<string>;
  hasInvalidSteps: (index: number) => boolean;
  isEdit?: boolean;
  editUUID?: string;
}

export const AddOrEditTemplateContext = createContext({} as AddOrEditTemplateContextInterface);

export const AddOrEditTemplateContextProvider = ({ children }: { children: ReactNode }) => {
  const uuid = useSafeUUIDParam('templateUUID');
  const { data: editTemplateData, isError } = useFetchTemplate(uuid, !!uuid);

  const navigate = useNavigate();
  const rootPath = useRootPath();
  if (isError) navigate(rootPath);

  const [templateRequest, setTemplateRequest] = useState<Partial<TemplateRequest>>({
    extended_release: '',
    extended_release_version: '',
  });

  const [useExtendedSupport, setUseExtendedSupport] = useState(false);
  const [selectedRedHatRepos, setSelectedRedHatRepos] = useState<Set<string>>(new Set());
  const [selectedCustomRepos, setSelectedCustomRepos] = useState<Set<string>>(new Set());
  const [redHatCoreRepos, setRedHatCoreRepos] = useState<string[]>([]);
  const [redHatCoreRepoUUIDS, setRedHatCoreRepoUUIDS] = useState<Set<string>>(new Set());

  const {
    data: {
      distribution_versions = [],
      distribution_arches = [],
      extended_release_features = [],
      distribution_minor_versions = [],
    } = {},
  } = useRepositoryParams();

  const stepValidationSequence = useMemo(() => {
    const { arch, date, name, version, use_latest, extended_release, extended_release_version } =
      templateRequest;

    // Valid if: feature is unavailable, unused, or all required fields filled with valid values
    const isVersioningStepValid =
      !hasExtendedSupport(extended_release_features) ||
      !useExtendedSupport ||
      (extended_release && extended_release_version);

    return [
      true, // [0] No step
      arch && version, // [1] "Define content" step
      isVersioningStepValid, // [2] "Content versioning" step
      !!selectedRedHatRepos.size, // [3] "Red Hat repositories" step
      true, // [4] "Other repositories" step - optional step
      use_latest || isDateValid(date ?? ''), // [5] "Setup date" step
      !!name && name.length < 256, // [6] "Detail" step
    ] as boolean[];
  }, [templateRequest, selectedRedHatRepos.size, useExtendedSupport, extended_release_features]);

  const hasInvalidSteps = useCallback(
    (stepIndex: number) => {
      const stepsToCheck = stepValidationSequence.slice(0, stepIndex + 1);
      return !stepsToCheck.every((step) => step);
    },
    [selectedRedHatRepos.size, stepValidationSequence],
  );

  const queryClient = useQueryClient();

  const { data } = useContentListQuery(
    1,
    10,
    { urls: redHatCoreRepos },
    '',
    [ContentOrigin.REDHAT],
    !!redHatCoreRepos.length,
  );

  const { data: existingRepositoryInformation, isLoading } = useContentListQuery(
    1,
    10,
    { uuids: editTemplateData?.repository_uuids },
    '',
    [ContentOrigin.ALL],
    !!uuid && !!editTemplateData?.repository_uuids.length,
  );

  useEffect(() => {
    if (!!templateRequest.arch && !!templateRequest.version) {
      const urls = getRedHatCoreRepoUrls(templateRequest.arch, templateRequest.version);
      if (urls) setRedHatCoreRepos(urls);
      if (!uuid) setSelectedCustomRepos(new Set());
    }
  }, [templateRequest.version, templateRequest.arch, uuid]);

  useEffect(() => {
    if (data?.data?.length) {
      const coreRepos = data?.data.map((repo) => repo.uuid);
      setRedHatCoreRepoUUIDS(new Set(coreRepos));
      setSelectedRedHatRepos(
        new Set(
          selectedRedHatRepos.has(coreRepos[0])
            ? [...selectedRedHatRepos, ...coreRepos]
            : coreRepos,
        ),
      );
    }
  }, [data?.data]);

  // If editing, we want to load in the current data
  useEffect(() => {
    if (uuid && !!editTemplateData && !isLoading && !!existingRepositoryInformation) {
      const startingState = {
        ...editTemplateData,
      };

      setTemplateRequest(startingState);
      const redHatReposToAdd: string[] = [];
      const customReposToAdd: string[] = [];

      existingRepositoryInformation?.data.forEach((item) => {
        if (item.org_id === '-1') {
          redHatReposToAdd.push(item.uuid);
        } else {
          customReposToAdd.push(item.uuid);
        }
      });

      if (redHatReposToAdd.length) {
        setSelectedRedHatRepos(new Set([...selectedRedHatRepos, ...redHatReposToAdd]));
      }

      if (customReposToAdd.length) {
        setSelectedCustomRepos(new Set(customReposToAdd));
      }
    }
  }, [editTemplateData, isLoading, existingRepositoryInformation]);

  const templateRequestDependencies = useMemo(
    () => [...selectedCustomRepos, ...selectedRedHatRepos],
    [selectedCustomRepos, selectedRedHatRepos],
  );

  useEffect(() => {
    setTemplateRequest((prev) => ({
      ...prev,
      repository_uuids: [...selectedRedHatRepos, ...selectedCustomRepos],
    }));
  }, [templateRequestDependencies]);

  return (
    <AddOrEditTemplateContext.Provider
      key={uuid}
      value={{
        queryClient,
        distribution_arches,
        distribution_versions,
        extended_release_features,
        distribution_minor_versions,
        templateRequest,
        setTemplateRequest,
        selectedRedHatRepos,
        setSelectedRedHatRepos,
        selectedCustomRepos,
        setSelectedCustomRepos,
        redHatCoreRepoUUIDS,
        hasInvalidSteps,
        isEdit: !!uuid,
        editUUID: uuid,
        useExtendedSupport,
        setUseExtendedSupport,
      }}
    >
      {children}
    </AddOrEditTemplateContext.Provider>
  );
};

export const useAddOrEditTemplateContext = () => useContext(AddOrEditTemplateContext);
