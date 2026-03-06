import {
  AllowedArchitecture,
  AllowedOSVersion,
  FilledTemplateTitle,
  SnapshotDate,
  TemplateDetail,
  TemplateUUID,
  UseLatestSnapshot,
} from './types';
import { FullSnapshot } from './types.snapshot';

type TaskUUID = string;
type OrganizationId = string;

// -----------------------------
// template returned from server

export type FullTemplate = {
  uuid: TemplateUUID;
  name: FilledTemplateTitle;
  description: TemplateDetail;
  org_id: OrganizationId;
  repository_uuids: string[];
  snapshots: FullSnapshot[];
  to_be_deleted_snapshots: FullSnapshot[];
  arch: AllowedArchitecture;
  version: AllowedOSVersion;
  date: SnapshotDate;
  use_latest: UseLatestSnapshot;
  created_at: string;
  updated_at: string;
  created_by: string;
  last_updated_by: string;
  last_update_task_uuid?: TaskUUID;
  last_update_task?: AdminTask;
  last_update_snapshot_error: string;
  rhsm_environment_created: boolean;
};

export type AdminTask = {
  uuid: string;
  account_id?: string;
  org_id: string;
  typename: string;
  status: 'running' | 'failed' | 'completed' | 'canceled' | 'pending';
  queued_at: string;
  started_at: string;
  finished_at: string;
  error: string;
  payload?: Record<string, unknown>;
  pulp?: PulpData;
};

type PulpData = {
  sync?: Record<string, unknown>;
  publication?: Record<string, unknown>;
  distribution?: Record<string, unknown>;
};
