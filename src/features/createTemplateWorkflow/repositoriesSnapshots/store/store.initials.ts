export const initialSnapshotsApi = {
  toggleLatestSnapshot: () => {},
  chooseSnapshotDate: () => {},
  saveNotification: () => {},
  saveRepositoryNames: () => {},
};

export const initialSnapshots = {
  snapshotDate: '',
  isLatestSnapshot: false,
};

export const initialNotifications = {
  repositoryNames: [],
  isHidden: true,
  isNoIssues: false,
  isFetching: false,
  isAlert: false,
};
