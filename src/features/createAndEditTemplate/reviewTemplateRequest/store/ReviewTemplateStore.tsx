import { useTemplateRequestState } from 'features/createAndEditTemplate/workflow/store/AddTemplateContext';
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

  const templateRequest = useTemplateRequestState();

  const reviewTemplate = useMemo(() => {
    const {
      selectedArchitecture,
      selectedOSVersion,
      hardcodedUUIDs,
      additionalUUIDs,
      otherUUIDs,
      snapshotDate,
      isLatestSnapshot,
      title,
      detail,
    } = templateRequest;

    const review = {
      Content: {
        Architecture: selectedArchitecture!,
        'OS version': selectedOSVersion!,
        'Pre-selected Red Hat repositories': hardcodedUUIDs!.length,
        'Additional Red Hat repositories': additionalUUIDs!.length,
        'Custom repositories': otherUUIDs!.length,
      },
      Date: {
        ...(isLatestSnapshot
          ? { 'Snapshot date': 'Use the latest content' }
          : { Date: formatDateDDMMMYYYY(snapshotDate!) }),
      },
      Details: {
        Name: title,
        Description: detail,
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
