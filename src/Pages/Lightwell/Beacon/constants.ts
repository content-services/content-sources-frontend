import { lightwellConfig } from 'kit/lightwell.config';
import type { Severity, Status } from './types';

/**
 * Pipeline stages shown in the stepper and filter panel.
 * Derived from `lightwellConfig.beaconWorkflow.pipelineStages` — the subset of
 * all statuses that the Lightwell team actively manages in the UI.
 */
export const STATUSES: Status[] = [...lightwellConfig.beaconWorkflow.pipelineStages];

export const UNREMEDIATED_STATUS: Status = lightwellConfig.beaconWorkflow.unremediated;
export const NO_REMEDIATION_LABEL = 'No remediation';

export const ON_HOLD_STATUS: Status = lightwellConfig.beaconWorkflow.onHold;

/** All filter-panel statuses: pipeline stages + the on-hold and unremediated terminal states. */
export const FILTER_STATUSES: Status[] = [...STATUSES, ON_HOLD_STATUS, UNREMEDIATED_STATUS];

export function statusLabel(status: Status): string {
  return status === UNREMEDIATED_STATUS ? NO_REMEDIATION_LABEL : status;
}

export const STATUS_DESCRIPTIONS: Record<Status, string> = {
  Submitted: 'Vulnerability submitted, undergoing initial review to identify a fix target.',
  Classified: 'Fix target identified.',
  'Fix in Progress': 'A fix is currently under development.',
  Validation: 'The fix is being validated within the Red Hat pipeline.',
  'Lightwell Network': 'The fix is available in the Lightwell Repository.',
  'On Hold': 'The vulnerability is on hold.',
  Upstreaming: 'The fix is being shared with the upstream community.',
  Published: 'The fix is available in upstream repos.',
  Unremediated: 'The vulnerability was closed without a shipped fix.',
};

/** Severity levels ordered most to least severe — derived from `lightwellConfig.vulnerabilitySeverity.scale`. */
export const SEVERITIES: Severity[] = [...lightwellConfig.vulnerabilitySeverity.scale];
