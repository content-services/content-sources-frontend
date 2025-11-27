import { formatDateDDMMMYYYY } from 'helpers';
import { createContext, PropsWithChildren, useContext, useMemo } from 'react';
import { useTemplateRequestState } from '../../../store/TemplateRequestStore';

const ReviewTemplateState = createContext(null);
export const useReviewTemplateState = () => useContext(ReviewTemplateState);

export const ReviewTemplateStore = ({ children }: PropsWithChildren) => {
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
  } = useTemplateRequestState();

  const templateReview = useMemo(() => {
    const createTemplateReview = () => {
      const Content = {
        Architecture: selectedArchitecture,
        'OS version': `el${selectedOSVersion}`,
        'Number of Pre-selected Red Hat repositories': hardcodedUUIDs.length,
        'Number of Additional Red Hat repositories': additionalUUIDs.length,
        'Number of Custom or EPEL repositories': otherUUIDs.length,
      };
      const SnapshotLatest = { Snapshots: 'Using the latest ones always' };
      const SnapshotWithDate = {
        'Snapshots from': formatDateDDMMMYYYY(snapshotDate),
      };
      const version = isLatestSnapshot ? SnapshotLatest : SnapshotWithDate;
      const description = {
        Title: title,
        Detail: detail ?? '-',
      };

      const review = {
        Content,
        'Repository Version': version,
        'Template Description': description,
      } as Record<string, { [key: string]: string | number | undefined }>;

      return review;
    };
    const templateReview = createTemplateReview();

    return { templateReview };
  }, [
    selectedArchitecture,
    selectedOSVersion,
    hardcodedUUIDs,
    additionalUUIDs,
    otherUUIDs,
    isLatestSnapshot,
    snapshotDate,
    title,
    detail,
  ]);

  return (
    <ReviewTemplateState.Provider value={templateReview}>{children}</ReviewTemplateState.Provider>
  );
};
