export interface SnapshotActionState {
  isDisabled: boolean;
  text?: string;
  textPrimary?: string;
}

// // Single gate for "may this user modify this repository's snapshots at all":
// // requires repoWrite RBAC AND the repo's snapshots must not be read-only.
// export const canModifySnapshots = ({
//   snapshotsReadOnly,
//   rbacWrite,
// }: {
//   snapshotsReadOnly: boolean;
//   rbacWrite: boolean;
// }): boolean => !snapshotsReadOnly && rbacWrite;

// // Disabled once deleting the item(s) would remove every remaining snapshot.
// export const getDeleteActionState = ({ canModify, minCount, totalCount }): SnapshotActionState => {
//   if (!canModify) return { isDisabled: true, tooltip: NO_PERMISSION_TOOLTIP };
//   if (minCount >= totalCount) return { isDisabled: true, tooltip: LAST_SNAPSHOT_TOOLTIP };
//   return { isDisabled: false };
// };

// Permissions
export const NO_PERMISSION = 'You do not have the required permissions to perform this action.';
export const WRONG_REPO_TYPE = `Redhat and Community repos can't be modified`;

// Delete
export const PUBLISHED_SNAPSHOT = "You can't delete a published snapshot. Unpublish it first.";
export const LAST_SNAPSHOT = "You can't delete the last snapshot in a repository";
export const ALL_SNAPSHOTS = "Can't delete all snapshots";
export const IN_PROGRESS_TASK = 'A task for this snapshot is in progress. Wait until it finishes.';

// Publish
export const PARTNER_REPO = 'Repository must be a partner repository to publish its snapshot.';
export const ZERO_PACKAGES = 'Cannot publish snapshot with 0 packages';
export const ONE_SNAPSHOT_ONLY = 'Can publish only one snapshot at a time';

export const getSharedState = ({ rbacWrite, isRepositoryReadOnly, hasInProgressTask }) => {
  if (!rbacWrite) return { isDisabled: true, text: NO_PERMISSION };
  if (!isRepositoryReadOnly) return { isDisabled: true, text: WRONG_REPO_TYPE };
  if (hasInProgressTask) return { isDisabled: true, text: IN_PROGRESS_TASK };
};

export const getDeleteActionState = ({ count, selectedRows, hasPublishedSnapshot }) => {
  if (count === 1) return { isDisabled: true, text: LAST_SNAPSHOT };
  if (selectedRows.length === count) return { isDisabled: true, text: ALL_SNAPSHOTS };
  if (hasPublishedSnapshot) return { isDisabled: true, text: PUBLISHED_SNAPSHOT };
  // primary button base text
  // when nothing is selected base text is shaded
  // when isDisabled, rule text replaces base text
  // Delete selected snapshots

  // kebab base
  // tooltip appears and base text isDisabled?
  // Delete
  return { isDisabled: false, textPrimary: 'Delete selected snapshots', text: 'Delete' };
};

export const getPublishActionState = ({ isPartnerRepo, packageCount, selectedRows }) => {
  if (!isPartnerRepo) return { isDisabled: true, text: PARTNER_REPO };
  if (selectedRows.length > 1) return { isDisabled: true, text: ONE_SNAPSHOT_ONLY };
  if (packageCount === 0) return { isDisabled: true, text: ZERO_PACKAGES };
  // primary button
  // Publish 1 snapshot

  // kebab base
  // Publish

  return { isDisabled: false, textPrimary: 'Publish 1 snapshot', text: 'Publish' };
};
