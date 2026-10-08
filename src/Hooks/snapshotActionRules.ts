export interface SnapshotActionState {
  isDisabled: boolean;
  tooltip?: string;
}

export const NO_PERMISSION_TOOLTIP =
  'You do not have the required permissions to perform this action.';
export const LAST_SNAPSHOT_TOOLTIP = "You can't delete the last snapshot in a repository";
export const PUBLISHED_SNAPSHOT_TOOLTIP =
  "You can't delete a published snapshot. Unpublish it first.";
export const IN_PROGRESS_TASK_TOOLTIP =
  'A publish or unpublish task is already in progress for this snapshot.';
export const ZERO_PACKAGES_TOOLTIP = 'Cannot publish snapshot with 0 packages';

// ---------------------------------------------------------------------------
// Feature switch: Unpublish is temporarily disabled pending further product
// decisions. This is the ONLY line that needs to change to bring Unpublish
// back - every caller goes through `isPublishActionVisible`/
// `getPublishActionState`, so flipping this to `true` is sufficient and no
// other code needs to change.
// ---------------------------------------------------------------------------
export const UNPUBLISH_ENABLED = false;

export const UNPUBLISH_DISABLED_TOOLTIP = 'Unpublishing is temporarily unavailable.';

// Single gate for "may this user modify this repository's snapshots at all":
// requires repoWrite RBAC AND the repo's snapshots must not be read-only.
// NOTE: snapshotsReadOnly visibility (hiding the whole kebab/button) is handled
// separately and earlier by callers; this is only the disabled+tooltip layer.
export const canModifySnapshots = ({
  snapshotsReadOnly,
  rbacWrite,
}: {
  snapshotsReadOnly: boolean;
  rbacWrite: boolean;
}): boolean => !snapshotsReadOnly && rbacWrite;

// SINGLE source of truth for whether a snapshot should be treated as published
// for action purposes. A snapshot's `published` flag reflects the *target*
// state of the most recent publish/unpublish attempt, which is only trustworthy
// once that attempt actually succeeded. If the most recent publish_task failed
// or was canceled, the target state was never reached, so the snapshot must be
// treated as NOT published (i.e. show "Publish", not "Unpublish") regardless of
// the raw flag. Every caller that currently reads `snapshot.published` directly
// to decide Publish-vs-Unpublish (or to feed `isPublished` into the two
// functions below) must go through this helper instead.
export const isSnapshotEffectivelyPublished = ({
  published,
  taskStatus,
}: {
  published?: boolean;
  taskStatus?: 'pending' | 'running' | 'failed' | 'canceled' | 'completed';
}): boolean => {
  if (taskStatus === 'failed' || taskStatus === 'canceled') return false;
  return !!published;
};

// SINGLE source of truth for whether the Publish/Unpublish action should be
// shown at all (B8/U1). "Publish" (not yet published) is always offered;
// "Unpublish" is only offered while the UNPUBLISH_ENABLED switch is on. Every
// caller that decides whether to render the action - the row kebab's
// `rowActions` and the primary button's `usePublishSnapshotApi` - must check
// this instead of only checking `canPublish`.
export const isPublishActionVisible = ({ isPublished }: { isPublished: boolean }): boolean =>
  UNPUBLISH_ENABLED || !isPublished;

// SINGLE source of truth for Delete, used by both the row kebab (targetCount=1,
// single snapshot's own isPublished/hasInProgressTask) and the bulk primary
// button (targetCount=selectedRows.length, isPublished/hasInProgressTask = true
// if ANY selected snapshot matches, since the whole batch is blocked together).
export const getDeleteActionState = ({
  canModify,
  isPublished,
  hasInProgressTask,
  targetCount,
  totalCount,
}: {
  canModify: boolean;
  isPublished: boolean;
  hasInProgressTask: boolean;
  targetCount: number;
  totalCount: number;
}): SnapshotActionState => {
  if (!canModify) return { isDisabled: true, tooltip: NO_PERMISSION_TOOLTIP };
  if (isPublished) return { isDisabled: true, tooltip: PUBLISHED_SNAPSHOT_TOOLTIP };
  if (hasInProgressTask) return { isDisabled: true, tooltip: IN_PROGRESS_TASK_TOOLTIP };
  if (targetCount >= totalCount) return { isDisabled: true, tooltip: LAST_SNAPSHOT_TOOLTIP };
  return { isDisabled: false };
};

// SINGLE source of truth for Publish/Unpublish (one function, parameterized by
// isPublished, since the two are really one toggle action in the UI). Package
// count only matters when attempting to Publish (isPublished === false); an
// already-published snapshot can always be unpublished regardless of its
// current package count.
export const getPublishActionState = ({
  canModify,
  isPublished,
  packageCount,
  hasInProgressTask,
}: {
  canModify: boolean;
  isPublished: boolean;
  packageCount: number;
  hasInProgressTask: boolean;
}): SnapshotActionState => {
  if (!canModify) return { isDisabled: true, tooltip: NO_PERMISSION_TOOLTIP };
  // Defense-in-depth for B8: callers are expected to hide this action entirely
  // via `isPublishActionVisible` rather than render it disabled, but if one
  // doesn't, it must never be clickable while the switch is off.
  if (isPublished && !UNPUBLISH_ENABLED) {
    return { isDisabled: true, tooltip: UNPUBLISH_DISABLED_TOOLTIP };
  }
  if (hasInProgressTask) return { isDisabled: true, tooltip: IN_PROGRESS_TASK_TOOLTIP };
  if (!isPublished && packageCount === 0) {
    return { isDisabled: true, tooltip: ZERO_PACKAGES_TOOLTIP };
  }
  return { isDisabled: false };
};

// business rules
// user has to have rbacWrite `You do not have the required permissions to perform this action.`
// !repository.upload - 'Redhat and Community repos can't be modified'

// publish
// !repository.partner - 'Repository must be a partner repository to publish'
// packageCount === 0 - 'Cannot publish snapshot with 0 packages'
// In-progress publish / delete task blocks publish

// Failed/canceled task means "not published"
// publish enabled

// delete
// last snapshot - Can't delete the last snapshot
// In-progress publish / delete task blocks delete
// "Can't delete all snapshots"

// ui rules
// publish
// selectedRows.length > 1 - 'Can publish one snapshot at a time'

// delete
// disabled, shaded, no row selected - delete selected snapshots

// actions button
// - delete action
// - publish action (no unpublish - disabled)

// kebab button
// - delete action
// - publish action (no unpublish)

// confluence
