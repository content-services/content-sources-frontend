import { TemplateRequestFinalized } from 'features/createAndEditTemplate/shared/types/types.compound';
import { AllowedOSVersion } from 'features/createAndEditTemplate/shared/types/types';
import { formatDateDDMMMYYYY } from 'helpers';
import { TemplateReview } from '../types';

type CreateTemplate = (templateRequest: TemplateRequestFinalized) => TemplateReview;

export const createTemplateReview: CreateTemplate = (templateRequest) => {
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

  const Content = {
    Architecture: selectedArchitecture,
    'OS version': `el${selectedOSVersion}` as `el${AllowedOSVersion}`,
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
  };

  return review;
};
