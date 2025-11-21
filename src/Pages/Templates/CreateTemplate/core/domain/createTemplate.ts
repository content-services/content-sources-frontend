import { formatTemplateDate } from 'helpers';
import { TemplateRequestInProgress, TemplateRequestToSend } from '../types';

type CreateTemplate = (templateRequest: TemplateRequestInProgress) => TemplateRequestToSend;

export const createTemplate: CreateTemplate = (templateRequest) => {
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

  if (isLatestSnapshot) {
    return {
      arch: selectedArchitecture,
      version: selectedOSVersion,
      repository_uuids: allUUIDs,
      date: null,
      use_latest: isLatestSnapshot,
      name: title,
      description: detail,
    } as TemplateRequestToSend;
  }

  const formattedDate = formatTemplateDate(snapshotDate);

  const templateToSend = {
    arch: selectedArchitecture,
    version: selectedOSVersion,
    repository_uuids: allUUIDs,
    date: formattedDate,
    use_latest: isLatestSnapshot,
    name: title,
    description: detail,
  };

  return templateToSend;
};
