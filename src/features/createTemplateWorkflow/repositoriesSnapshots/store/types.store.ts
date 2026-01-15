import {
  UseLatestSnapshot,
  UseSnapshotDate,
} from 'features/createTemplateWorkflow/shared/types.simple';
import {
  ChooseSnapshotDate,
  SaveRepositoryNames,
  SaveSnapshotNotification,
  ToggleUseLatestSnapshot,
} from '../core/ports';
import { RepositoryName } from 'features/createTemplateWorkflow/shared/types.repository';

export type SnapshotApiType = {
  toggleLatestSnapshot: ToggleUseLatestSnapshot;
  chooseSnapshotDate: ChooseSnapshotDate;
  saveNotification: SaveSnapshotNotification;
  saveRepositoryNames: SaveRepositoryNames;
};

export type SnapshotStateType = {
  snapshotDate: UseSnapshotDate;
  isLatestSnapshot: UseLatestSnapshot;
};

export type NotficationStateType = {
  repositoryNames: RepositoryName[];
  isNoIssues: boolean;
  isFetching: boolean;
  isHidden: boolean;
  isAlert: boolean;
};
