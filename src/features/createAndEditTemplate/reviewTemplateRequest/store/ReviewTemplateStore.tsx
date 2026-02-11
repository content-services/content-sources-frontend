import { useDefineContentApi } from 'features/createAndEditTemplate/defineContent/store/DefineContentStore';
import { useAddTemplateContext } from 'features/createAndEditTemplate/workflow/store/AddTemplateContext';
import { formatDateDDMMMYYYY } from 'helpers';
import { createContext, ReactNode, useContext, useMemo, useState } from 'react';

type ReviewTemplateApiType = {
  reviewTemplate: Record<string, { [key: string]: string | number | undefined }>;
  setToggle: React.Dispatch<number>;
  expanded: Set<number>;
};
const initialData = {
  reviewTemplate: {},
  setToggle: () => {},
  expanded: new Set([0]),
};

const ReviewTemplateApi = createContext<ReviewTemplateApiType>(initialData);
export const useReviewTemplateApi = () => useContext(ReviewTemplateApi);

type ReviewTemplateStoreType = {
  children: ReactNode;
};

export const ReviewTemplateStore = ({ children }: ReviewTemplateStoreType) => {
  const [expanded, setExpanded] = useState(new Set([0]));
  const {
    templateRequest,
    selectedRedhatRepos,
    hardcodedRedhatRepositoryUUIDS,
    selectedCustomRepos,
  } = useAddTemplateContext();

  // TODO: temporary reading from defineContent step
  // change it to read already selected arch and version from the top level context
  const { distribution_arches, distribution_versions } = useDefineContentApi();

  const archesDisplay = (arch?: string) =>
    distribution_arches.find(({ label }) => arch === label)?.name || 'Select architecture';

  const versionDisplay = (version?: string): string =>
    // arm64 aarch64
    distribution_versions.find(({ label }) => version === label)?.name || 'Select version';

  const reviewTemplate = useMemo(() => {
    const { arch, version, date, name, description } = templateRequest;
    const review = {
      Content: {
        Architecture: archesDisplay(arch),
        'OS version': versionDisplay(version),
        'Pre-selected Red Hat repositories': hardcodedRedhatRepositoryUUIDS.size,
        'Additional Red Hat repositories':
          selectedRedhatRepos.size - hardcodedRedhatRepositoryUUIDS.size,
        'Custom repositories': selectedCustomRepos.size,
      },
      Date: {
        ...(templateRequest.use_latest
          ? { 'Snapshot date': 'Use the latest content' }
          : { Date: formatDateDDMMMYYYY(date || '') }),
      },
      Details: {
        Name: name,
        Description: description,
      },
    } as Record<string, { [key: string]: string | number | undefined }>;

    return review;
  }, [templateRequest]);

  const setToggle = (index: number) => {
    if (expanded.has(index)) {
      expanded.delete(index);
    } else {
      expanded.add(index);
    }
    setExpanded(new Set(expanded));
  };

  const api = { reviewTemplate, setToggle, expanded };

  return <ReviewTemplateApi.Provider value={api}>{children}</ReviewTemplateApi.Provider>;
};
