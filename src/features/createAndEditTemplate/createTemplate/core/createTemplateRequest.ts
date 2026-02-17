import {
  TemplateRequestFinalized,
  TemplateRequestToSend,
  TemplateRequestWithDate,
  TemplateRequestWithLatestSnapshot,
} from 'features/createAndEditTemplate/shared/types/types.compound';
import { formatTemplateDate } from '../../shared/core/formatTemplateDate';

type CreateTemplate = (templateRequest: TemplateRequestFinalized) => TemplateRequestToSend;

export const createTemplateRequest: CreateTemplate = (templateRequest) => {
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

  const allUUIDs = [...hardcodedUUIDs, ...additionalUUIDs, ...otherUUIDs];

  if (isLatestSnapshot && !snapshotDate) {
    return {
      arch: selectedArchitecture,
      version: selectedOSVersion,
      repository_uuids: allUUIDs,
      date: null,
      use_latest: isLatestSnapshot,
      name: title,
      description: detail,
    } as TemplateRequestWithLatestSnapshot;
  } else {
    const formattedDate = formatTemplateDate(snapshotDate);

    const templateToSend = {
      arch: selectedArchitecture,
      version: selectedOSVersion,
      repository_uuids: allUUIDs,
      date: formattedDate,
      use_latest: isLatestSnapshot,
      name: title,
      description: detail,
    } as TemplateRequestWithDate;

    return templateToSend;
  }
};
