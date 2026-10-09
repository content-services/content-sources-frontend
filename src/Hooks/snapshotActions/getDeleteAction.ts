import { DELETE_ROUTE } from 'Routes/constants';
import { SnapshotItem } from 'services/Content/ContentApi';
import {
  hasInProgressTask,
  IN_PROGRESS_TASK,
  isSnapshotEffectivelyPublished,
  NO_PERMISSION,
} from './sharedActionChecks';

export type PublishRule = { reason: string; isDisabled: boolean };

const NONE_SELECTED = 'Select one or more snapshots to delete';

const LAST_SNAPSHOT = "You can't delete the last snapshot of a repository";
const PUBLISHED_SNAPSHOT = "You can't delete a published snapshot";

const DELETE_PASS = 'Delete';

const getDeleteRuleOnSnapshot = (selectedSnapshot: SnapshotItem) => {
  if (isSnapshotEffectivelyPublished(selectedSnapshot))
    return { isDisabled: true, reason: 'already-published' };
  if (hasInProgressTask(selectedSnapshot)) return { isDisabled: true, reason: 'task-in-progress' };
  return { isDisabled: false, reason: 'passed-all-checks' };
};

const getDeleteRuleOnSnapshots = (
  selectedSnapshots: SnapshotItem[],
  canModify: boolean,
  totalCount: number,
): PublishRule => {
  // label: Delete
  if (!canModify) return { isDisabled: true, reason: 'no-permission' };
  if (selectedSnapshots.length === 0) return { isDisabled: true, reason: 'none-selected' };
  if (selectedSnapshots.length === totalCount) return { isDisabled: true, reason: 'last-snapshot' };

  const actionChecks = selectedSnapshots.reduce((acc, current) => {
    const action = getDeleteRuleOnSnapshot(current);
    return [...acc, action];
  }, [] as PublishRule[]);

  if (actionChecks.some((check) => check.isDisabled))
    // return the first non-passing rule, there will always be at least one here
    return actionChecks.find((check) => check.isDisabled) as PublishRule;

  return { isDisabled: false, reason: 'passed-all-checks' };
};

const getDeleteTooltip = (reason: string): string => {
  switch (reason) {
    case 'no-permission':
      return NO_PERMISSION;
    case 'none-selected':
      return NONE_SELECTED;
    case 'last-snapshot':
      return LAST_SNAPSHOT;
    case 'already-published':
      return PUBLISHED_SNAPSHOT;
    case 'task-in-progress':
      return IN_PROGRESS_TASK;
    default:
      return DELETE_PASS;
  }
};

const getDeleteNavigate = (snapshots) => {
  if (snapshots.length === 0) return undefined;
  if (snapshots.length === 1) return `${DELETE_ROUTE}?snapshotUUID=${snapshots[0].uuid}`;
  return DELETE_ROUTE;
};
// const getDeleteLabelForPrimaryButton = (reason, ) => {
//   switch (reason) {
//     case 'none-selected':
//     case 'no-permission':
//       return 'Delete selected snapshots';
//     case 'would-remove-last-snapshot':
//       return targetCount === 1 ? "Can't delete last snapshot" : "Can't delete all snapshots";
//     default:
//       return `Delete ${targetCount} ${targetCount === 1 ? 'snapshot' : 'snapshots'}`;
//   }

//   if (!selectedRows.length || !rbac?.repoWrite) return 'Delete selected snapshots';
//   if (selectedRows.length === count && count === 1) return "Can't delete last snapshot";
//   if (selectedRows.length === count && count >= 1) return "Can't delete all snapshots";
//   return `Delete ${selectedRows.length} ${selectedRows.length === 1 ? 'snapshot' : 'snapshots'}`;
// };

const createForKebab = (rule, tooltip, navigate) => ({
  isDisabled: rule.isDisabled,
  tooltip,
  rule: rule.reason,
  navigate,
  label: 'Delete',
});

const createForPrimary = (rule, tooltip, navigate) => ({
  isDisabled: rule.isDisabled,
  tooltip,
  rule: rule.reason,
  navigate,
  label: tooltip,
});

export function getDeleteAction(
  snapshotsList: SnapshotItem[],
  selectedRows: {
    id: string;
  }[],
  canModify: boolean,
  totalCount: number,
) {
  const selectedSnapshots = snapshotsList.filter((snapshot) =>
    selectedRows.find((row) => row.id === snapshot.uuid),
  );
  const rule = getDeleteRuleOnSnapshots(selectedSnapshots, canModify, totalCount);
  console.log('rule', rule);

  const tooltip = getDeleteTooltip(rule.reason);
  const navigate = getDeleteNavigate(selectedSnapshots);
  const kebab = createForKebab(rule, tooltip, navigate);
  const primary = createForPrimary(rule, tooltip, navigate);

  return { kebab, primary };
}
