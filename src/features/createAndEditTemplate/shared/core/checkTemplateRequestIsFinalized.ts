import {
  TemplateRequestFinalized,
  TemplateRequestInProgress,
} from 'features/createAndEditTemplate/shared/types/types.compound';

type AssertTemplateRequestFinalized =
  | {
      isFinalized: true;
      template: TemplateRequestFinalized;
    }
  | {
      isFinalized: false;
      template: TemplateRequestInProgress;
    };

type CheckCompleteTemplateRequest = (
  template: TemplateRequestInProgress,
) => AssertTemplateRequestFinalized;

export const checkTemplateRequestIsFinalized: CheckCompleteTemplateRequest = (template) => {
  if (isTemplateFinalized(template)) {
    return { isFinalized: true, template: template as TemplateRequestFinalized };
  } else {
    return { isFinalized: false, template: template as TemplateRequestInProgress };
  }
};

// ----
type IsTemplateFinalized = (template: TemplateRequestInProgress) => boolean;

const isTemplateFinalized: IsTemplateFinalized = (template) => {
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
  } = template;

  if (
    !selectedArchitecture ||
    !selectedOSVersion ||
    !title ||
    detail === undefined ||
    snapshotDate === undefined
  ) {
    return false;
  }
  if (!hardcodedUUIDs || !additionalUUIDs || !otherUUIDs) {
    return false;
  }
  if (hardcodedUUIDs.length === 0) {
    return false;
  }
  const useLatestSnapshot = isLatestSnapshot === true && snapshotDate === '';
  const useSnapshotDate = isLatestSnapshot === false && snapshotDate !== '';
  if (useLatestSnapshot) {
    return true;
  }
  if (useSnapshotDate) {
    return true;
  }
  return false;
};
