import { formatTemplateDate } from 'features/createAndEditTemplate/shared/core/formatTemplateDate';
import {
  EditTemplateToSend,
  EditTemplateWithDate,
  EditTemplateWithLatestSnapshot,
  TemplateRequestFinalizedWithUUID,
} from 'features/createAndEditTemplate/shared/types/types.compound';

type EditTemplate = (editTemplate: TemplateRequestFinalizedWithUUID) => EditTemplateToSend;

export const editTemplateToSend: EditTemplate = (editTemplate) => {
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
    uuid,
  } = editTemplate;

  const allUUIDs = [...hardcodedUUIDs, ...additionalUUIDs, ...otherUUIDs];

  if (isLatestSnapshot && !snapshotDate) {
    return {
      uuid: uuid,
      arch: selectedArchitecture,
      version: selectedOSVersion,
      repository_uuids: allUUIDs,
      date: null,
      use_latest: isLatestSnapshot,
      name: title,
      description: detail,
    } as EditTemplateWithLatestSnapshot;
  } else {
    const formattedDate = formatTemplateDate(snapshotDate);

    const templateToSend = {
      uuid: uuid,
      arch: selectedArchitecture,
      version: selectedOSVersion,
      repository_uuids: allUUIDs,
      date: formattedDate,
      use_latest: isLatestSnapshot,
      name: title,
      description: detail,
    } as EditTemplateWithDate;

    return templateToSend;
  }
};
